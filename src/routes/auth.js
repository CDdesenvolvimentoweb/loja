const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Inicializar usuário admin (chamado ao iniciar o app)
authController.initAdmin();

// Rota para página de login
router.get('/login', authController.showLoginPage);

// Rota para processar login
router.post('/login', authController.login);

// Rota para logout
router.get('/logout', authController.logout);

module.exports = router; 