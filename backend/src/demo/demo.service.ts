import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedDemoWorkspace } from './demo.seed';

const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 horas

@Injectable()
export class DemoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DemoService.name);
  private readonly ttlHours = Number(process.env.DEMO_SESSION_TTL_HOURS ?? 24);
  private cleanupTimer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    // Limpeza imediata + periódica de sessões expiradas (sem dependências extras).
    void this.cleanupExpired().catch((err) =>
      this.logger.error('Falha na limpeza inicial de sessões demo', err),
    );
    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpired().catch((err) =>
        this.logger.error('Falha na limpeza periódica de sessões demo', err),
      );
    }, CLEANUP_INTERVAL_MS);
    // Não impede o processo de encerrar.
    this.cleanupTimer.unref?.();
  }

  onModuleDestroy() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  private nextExpiry(): Date {
    return new Date(Date.now() + this.ttlHours * 60 * 60 * 1000);
  }

  /** Cria uma nova sessão demo isolada e popula os dados iniciais. */
  async createSession() {
    // Aproveita para remover sessões expiradas de forma oportunista.
    await this.cleanupExpired().catch(() => undefined);

    const session = await this.prisma.demoSession.create({
      data: { expiresAt: this.nextExpiry() },
    });
    await seedDemoWorkspace(this.prisma, session.id);

    this.logger.log(`Sessão demo criada: ${session.id}`);
    return { sessionId: session.id, expiresAt: session.expiresAt };
  }

  /** Retorna metadados da sessão atual. */
  async getSessionInfo(sessionId: string) {
    const session = await this.prisma.demoSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Sessão demo não encontrada.');
    }
    return { sessionId: session.id, expiresAt: session.expiresAt };
  }

  /** Reseta apenas os dados da sessão atual e renova a expiração. */
  async resetSession(sessionId: string) {
    const session = await this.prisma.demoSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Sessão demo não encontrada.');
    }

    // Cascade via demoSessionId remove projetos e tarefas da sessão.
    await this.prisma.task.deleteMany({ where: { demoSessionId: sessionId } });
    await this.prisma.project.deleteMany({
      where: { demoSessionId: sessionId },
    });
    const updated = await this.prisma.demoSession.update({
      where: { id: sessionId },
      data: { expiresAt: this.nextExpiry() },
    });
    await seedDemoWorkspace(this.prisma, sessionId);

    this.logger.log(`Sessão demo resetada: ${sessionId}`);
    return { sessionId, reset: true, expiresAt: updated.expiresAt };
  }

  /** Remove todas as sessões expiradas (cascade apaga seus dados). */
  async cleanupExpired() {
    const result = await this.prisma.demoSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (result.count > 0) {
      this.logger.log(`Sessões demo expiradas removidas: ${result.count}`);
    }
    return { removed: result.count };
  }
}
