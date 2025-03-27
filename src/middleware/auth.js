const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

// Middleware para verificar se o usuário é administrador
const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.redirect('/auth/login');
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return res.status(500).json({ message: 'Erro ao verificar permissões' });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin
}; 