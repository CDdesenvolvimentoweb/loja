const prisma = require('../config/db');

// Middleware para injetar as configurações da loja em todas as páginas admin
const injectStoreConfig = async (req, res, next) => {
  try {
    // Adicionar as configurações da loja na resposta
    const storeConfig = await prisma.storeConfig.findFirst();
    
    // Adicionar o storeConfig ao res.locals para acessar em qualquer view
    res.locals.settings = storeConfig || {};
    
    next();
  } catch (error) {
    console.error('Erro ao injetar configurações da loja:', error);
    // Continuar mesmo com erro
    next();
  }
};

module.exports = {
  injectStoreConfig
}; 