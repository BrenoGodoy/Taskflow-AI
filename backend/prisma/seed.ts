import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * A partir do modo demo isolado, NÃO existe mais seed global: cada visitante
 * recebe seu próprio workspace (projetos + tarefas) ao criar uma sessão demo
 * via `POST /api/demo/session`. Este script apenas valida a conexão e reporta
 * o estado atual, mantendo o comando `prisma db seed` funcional.
 */
async function main() {
  console.log('ℹ️  TaskFlow AI usa dados isolados por sessão demo.');
  console.log(
    '   Não há seed global — cada visitante recebe seu próprio workspace ao acessar o app.',
  );

  const sessions = await prisma.demoSession.count();
  console.log(`   Sessões demo no banco: ${sessions}.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
