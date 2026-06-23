import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export const DEMO_SESSION_HEADER = 'x-demo-session-id';

/**
 * Garante que toda requisição traga um `X-Demo-Session-Id` válido e não expirado.
 * O id da sessão é anexado em `request.demoSessionId` para uso nos controllers.
 */
@Injectable()
export class DemoSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const headerValue = request.headers[DEMO_SESSION_HEADER];
    const sessionId = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!sessionId) {
      throw new UnauthorizedException(
        'Sessão demo ausente. Crie uma sessão em POST /api/demo/session.',
      );
    }

    const session = await this.prisma.demoSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Sessão demo inválida.');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Sessão demo expirada.');
    }

    (request as Request & { demoSessionId?: string }).demoSessionId =
      session.id;
    return true;
  }
}
