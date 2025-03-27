const prisma = require('../config/db');

// Listar todos os pedidos para o painel admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.render('admin/orders/index', { 
      orders,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ message: 'Erro ao buscar pedidos' });
  }
};

// Visualizar detalhes de um pedido
const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.redirect('/admin/orders');
    }

    res.render('admin/orders/view', { 
      order,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ message: 'Erro ao buscar pedido' });
  }
};

// Atualizar status do pedido
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.redirect(`/admin/orders/${id}`);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do pedido' });
  }
};

// API para criar pedido
const apiCreateOrder = async (req, res) => {
  const { customerName, customerPhone, customerEmail, items, totalAmount, notes } = req.body;

  try {
    // Validar itens
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'O pedido deve conter pelo menos um item' });
    }

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        totalAmount: parseFloat(totalAmount),
        notes,
        orderItems: {
          create: items.map(item => ({
            quantity: item.quantity,
            price: parseFloat(item.price),
            size: item.size,
            productId: Number(item.productId)
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({ success: true, orderId: order.id, order });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar pedido' });
  }
};

module.exports = {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  apiCreateOrder
}; 