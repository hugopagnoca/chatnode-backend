const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('\n📋 Usuários cadastrados no banco:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Criado em: ${user.createdAt.toLocaleString('pt-BR')}\n`);
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado.\n');
    }
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
