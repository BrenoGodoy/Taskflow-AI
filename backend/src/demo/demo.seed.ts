import { TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Popula um workspace de demonstração isolado com dados iniciais:
 * 2 projetos cobrindo status (TODO/DOING/DONE) e prioridades (LOW/MEDIUM/HIGH).
 * Todos os registros ficam vinculados à `demoSessionId` informada.
 */
export async function seedDemoWorkspace(
  prisma: PrismaService,
  demoSessionId: string,
): Promise<void> {
  await prisma.project.create({
    data: {
      name: 'Website Institucional',
      description: 'Novo site da empresa com blog e área de contato.',
      demoSessionId,
      tasks: {
        create: [
          {
            title: 'Definir identidade visual',
            description: 'Criar paleta de cores, tipografia e logo.',
            status: TaskStatus.DONE,
            priority: TaskPriority.HIGH,
            deadline: daysFromNow(-5),
            demoSessionId,
          },
          {
            title: 'Desenvolver página inicial',
            description: 'Implementar hero, seções e responsividade.',
            status: TaskStatus.DOING,
            priority: TaskPriority.HIGH,
            deadline: daysFromNow(2),
            demoSessionId,
          },
          {
            title: 'Configurar formulário de contato',
            description: 'Integração com serviço de e-mail.',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            deadline: daysFromNow(7),
            demoSessionId,
          },
          {
            title: 'Escrever artigos do blog',
            description: 'Produzir 3 artigos iniciais.',
            status: TaskStatus.TODO,
            priority: TaskPriority.LOW,
            deadline: daysFromNow(14),
            demoSessionId,
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: 'App Mobile TaskFlow',
      description: 'Aplicativo móvel para gestão de tarefas em campo.',
      demoSessionId,
      tasks: {
        create: [
          {
            title: 'Corrigir bug crítico de login',
            description: 'Usuários não conseguem autenticar no iOS.',
            status: TaskStatus.DOING,
            priority: TaskPriority.HIGH,
            deadline: daysFromNow(-1),
            demoSessionId,
          },
          {
            title: 'Implementar modo offline',
            description: 'Sincronização local com fila de envio.',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            deadline: daysFromNow(10),
            demoSessionId,
          },
          {
            title: 'Publicar na loja',
            description: 'Submeter build para App Store e Play Store.',
            status: TaskStatus.DONE,
            priority: TaskPriority.LOW,
            deadline: daysFromNow(-3),
            demoSessionId,
          },
        ],
      },
    },
  });
}
