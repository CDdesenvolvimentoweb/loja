const express = require('express');
const router = express.Router();
const { injectStoreConfig } = require('../middleware/storeConfig');
const shopController = require('../controllers/shopController');

// Middleware para injetar as configurações da loja em todas as rotas da loja
router.use(injectStoreConfig);

// Página inicial
router.get('/', shopController.getHomePage);

// Página de categoria
router.get('/category/:id', shopController.getCategoryPage);

// Página de produto
router.get('/product/:id', shopController.getProductPage);

// Página de pesquisa
router.get('/search', shopController.getSearchPage);

// Página de carrinho
router.get('/cart', shopController.getCartPage);

module.exports = router; 