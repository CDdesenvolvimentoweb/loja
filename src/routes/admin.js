const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { uploadProduct, uploadLogo } = require('../middleware/upload');
const { injectStoreConfig } = require('../middleware/storeConfig');

const dashboardController = require('../controllers/dashboardController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const storeConfigController = require('../controllers/storeConfigController');
const orderController = require('../controllers/orderController');

// Middleware para todas as rotas do admin
router.use(isAuthenticated, isAdmin);

// Middleware para injetar as configurações da loja em todas as rotas admin
router.use(injectStoreConfig);

// Dashboard
router.get('/dashboard', dashboardController.getDashboard);

// Rotas de Categorias
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/create', categoryController.showCreateCategoryForm);
router.post('/categories', categoryController.createCategory);
router.get('/categories/edit/:id', categoryController.showEditCategoryForm);
router.post('/categories/edit/:id', categoryController.updateCategory);
router.post('/categories/delete/:id', categoryController.deleteCategory);

// Rotas de Produtos
router.get('/products', productController.getAllProducts);
router.get('/products/create', productController.showCreateProductForm);
router.post('/products', uploadProduct.array('images', 5), productController.createProduct);
router.get('/products/edit/:id', productController.showEditProductForm);
router.post('/products/edit/:id', uploadProduct.array('images', 5), productController.updateProduct);
router.post('/products/delete/:id', productController.deleteProduct);
router.post('/products/delete-image/:id', productController.deleteImage);

// Rotas de Configurações da Loja
router.get('/store-config', storeConfigController.showStoreConfigForm);
router.post('/store-config', uploadLogo.single('storeLogo'), storeConfigController.updateStoreConfig);

// Rotas de Pedidos
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderDetails);
router.post('/orders/:id/status', orderController.updateOrderStatus);

module.exports = router; 