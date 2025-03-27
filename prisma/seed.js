const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar se já existe um usuário admin
    const adminCount = await prisma.user.count({
      where: { role: 'admin' }
    });

    // Criar usuário admin se não existir
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@loja.com',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Usuário administrador criado com sucesso!');
      console.log('Email: admin@loja.com');
      console.log('Senha: admin123');
    } else {
      console.log('Usuário administrador já existe, pulando criação.');
    }

    // Criar categorias de exemplo se não existirem
    const categoryCount = await prisma.category.count();
    
    if (categoryCount === 0) {
      const categories = [
        { name: 'Camisetas' },
        { name: 'Calças' },
        { name: 'Vestidos' },
        { name: 'Acessórios' },
        { name: 'Calçados' }
      ];
      
      await prisma.category.createMany({
        data: categories
      });
      
      console.log('Categorias de exemplo criadas com sucesso!');
    } else {
      console.log('Categorias já existem, pulando criação.');
    }

    // Configurações iniciais da loja
    const storeConfigCount = await prisma.storeConfig.count();
    
    if (storeConfigCount === 0) {
      await prisma.storeConfig.create({
        data: {
          storeName: 'Minha Loja',
          storeDescription: 'Loja de roupas e acessórios online',
          storePhone: '5511999999999',
          storeEmail: 'contato@minhaloja.com',
          storeAddress: 'Rua Exemplo, 123 - São Paulo, SP',
          primaryColor: '#0d6efd',
          secondaryColor: '#6c757d'
        }
      });
      
      console.log('Configurações da loja criadas com sucesso!');
    } else {
      console.log('Configurações da loja já existem, pulando criação.');
    }

    console.log('Seed executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 