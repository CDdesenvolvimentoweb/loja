const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mostrar página de login
const showLoginPage = (req, res) => {
  res.render('auth/login', { error: null });
};

// Processar login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.render('auth/login', { error: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.render('auth/login', { error: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Salvar token em cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    });

    // Redirecionar para o painel
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.render('auth/login', { error: 'Ocorreu um erro ao fazer login' });
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};

// Verificar se já existe um usuário admin, se não, criar
const initAdmin = async () => {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'admin' }
    });

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
    }
  } catch (error) {
    console.error('Erro ao inicializar o administrador:', error);
  }
};

module.exports = {
  showLoginPage,
  login,
  logout,
  initAdmin
}; 