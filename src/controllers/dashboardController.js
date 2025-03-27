const prisma = require('../config/db');

// Dashboard do administrador
const getDashboard = async (req, res) => {
  try {
    // Contagem total de produtos
    const totalProducts = await prisma.product.count();
    
    // Contagem total de categorias
    const totalCategories = await prisma.category.count();
    
    // Total de pedidos
    const totalOrders = await prisma.order.count();
    
    // Pedidos pendentes
    const pendingOrders = await prisma.order.count({
      where: { status: 'pending' }
    });
    
    // Pedidos recentes
    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Produtos recentes
    const recentProducts = await prisma.product.findMany({
      take: 5,
      include: {
        category: true,
        images: {
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.render('admin/dashboard', {
      user: req.user,
      totalProducts,
      totalCategories,
      totalOrders,
      pendingOrders,
      recentOrders,
      recentProducts
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).json({ message: 'Erro ao carregar dashboard' });
  }
};

module.exports = {
  getDashboard
}; 