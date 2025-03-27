const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const storeConfigController = require('../controllers/storeConfigController');
const orderController = require('../controllers/orderController');

// API de Categorias
router.get('/categories', categoryController.apiGetAllCategories);

// API de Produtos
router.get('/products', productController.apiGetAllProducts);
router.get('/products/category/:categoryId', productController.apiGetProductsByCategory);
router.get('/products/search', productController.apiSearchProducts);
router.get('/products/:id', productController.apiGetProductDetails);

// API de Configurações da Loja
router.get('/store-config', storeConfigController.apiGetStoreConfig);

// API de Pedidos
router.post('/orders', orderController.apiCreateOrder);

module.exports = router; 