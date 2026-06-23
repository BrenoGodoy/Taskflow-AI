import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Retorna uma data relativa a hoje (offset em dias).
 */
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpa dados existentes (ordem importa por causa da FK)
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  // ===== Projeto 1: Website =====
  const website = await prisma.project.create({
    data: {
      name: 'Website Institucional',
      description: 'Novo site da empresa com blog e área de contato.',
      tasks: {
        create: [
          {
            title: 'Definir identidade visual',
            description: 'Criar paleta de cores, tipografia e logo.',
            status: TaskStatus.DONE,
            priority: TaskPriority.HIGH,
            deadline: daysFromNow(-5),
          },
          {
            title: 'Desenvolver página inicial',
            description: 'Implementar hero, seções e responsividade.',
            status: TaskStatus.DOING,
            priority: TaskPriority.HIGH,
            deadline: daysFromNow(2),
          },
          {
            title: 'Configurar formulário de contato',
            description: 'Integração com serviço de e-mail.',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            deadline: daysFromNow(7),
          },
          {
            title: 'Escrever artigos do blog',
            description: 'Produzir 3 artigos iniciais.',
            status: TaskStatus.TODO,
            priority: TaskPriority.LOW,
            deadline: daysFromNow(14),
          },
        ],
      },
    },
  });

  // ===== Projeto 2: App Mobile =====
  const app = await prisma.project.create({
    data: {
      name: 'App Mobile TaskFlow',
      description: 'Aplicativo móvel para gestão de tarefas em campo.',
      tasks: {
        create: [
          {
            title: 'Corrigir bug crítico de login',
            description: 'Usuários não conseguem autenticar no iOS.',
            status: TaskStatus.DOING,
            priority: TaskPriority.HIGH,
            deadline: daysFromNow(-1),
          },
          {
            title: 'Implementar modo offline',
            description: 'Sincronização local com fila de envio.',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            deadline: daysFromNow(10),
          },
          {
            title: 'Publicar na loja',
            description: 'Submeter build para App Store e Play Store.',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            deadline: daysFromNow(21),
          },
        ],
      },
    },
  });

  // ===== Projeto 3: Infraestrutura =====
  await prisma.project.create({
    data: {
      name: 'Infraestrutura & DevOps',
      description: 'Melhorias de CI/CD, monitoramento e segurança.',
      tasks: {
        create: [
          {
            title: 'Configurar pipeline de CI',
            description: 'Build, testes e lint automáticos.',
            status: TaskStatus.DONE,
            priority: TaskPriority.MEDIUM,
            deadline: daysFromNow(-10),
          },
          {
            title: 'Adicionar monitoramento',
            description: 'Dashboards e alertas de uptime.',
            status: TaskStatus.TODO,
            priority: TaskPriority.LOW,
            deadline: daysFromNow(30),
          },
        ],
      },
    },
  });

  console.log(`✅ Seed concluído!`);
  console.log(`   Projetos criados: ${website.name}, ${app.name}, e mais 1.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
