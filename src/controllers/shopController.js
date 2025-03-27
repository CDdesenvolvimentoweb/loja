const prisma = require('../config/db');

// Página inicial da loja
const getHomePage = async (req, res) => {
  try {
    // Buscar configurações da loja
    const storeConfig = await prisma.storeConfig.findFirst();
    
    // Buscar categorias
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Buscar produtos em destaque (os mais recentes)
    const featuredProducts = await prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        category: true
      }
    });
    
    res.render('shop/home', { 
      storeConfig: storeConfig || { storeName: 'Minha Loja' },
      categories,
      featuredProducts
    });
  } catch (error) {
    console.error('Erro ao buscar dados da loja:', error);
    res.status(500).render('shop/error', { message: 'Erro ao carregar a página inicial' });
  }
};

// Página de produtos por categoria
const getCategoryPage = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar configurações da loja
    const storeConfig = await prisma.storeConfig.findFirst();
    
    // Buscar categorias
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Buscar categoria atual
    const category = await prisma.category.findUnique({
      where: { id: Number(id) }
    });
    
    if (!category) {
      return res.redirect('/');
    }
    
    // Buscar produtos da categoria
    const products = await prisma.product.findMany({
      where: { categoryId: Number(id) },
      include: {
        images: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.render('shop/category/index', { 
      storeConfig: storeConfig || { storeName: 'Minha Loja' },
      categories,
      category,
      products
    });
  } catch (error) {
    console.error('Erro ao buscar dados da categoria:', error);
    res.status(500).render('shop/error', { message: 'Erro ao carregar a página de categoria' });
  }
};

// Página de detalhes do produto
const getProductPage = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar configurações da loja
    const storeConfig = await prisma.storeConfig.findFirst();
    
    // Buscar categorias
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Buscar produto
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        category: true,
        sizes: true
      }
    });
    
    if (!product) {
      return res.redirect('/');
    }
    
    // Buscar produtos relacionados (mesma categoria)
    const relatedProducts = await prisma.product.findMany({
      where: { 
        categoryId: product.categoryId,
        id: { not: product.id }
      },
      take: 4,
      include: {
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.render('shop/product', { 
      storeConfig: storeConfig || { storeName: 'Minha Loja' },
      categories,
      product,
      relatedProducts
    });
  } catch (error) {
    console.error('Erro ao buscar dados do produto:', error);
    res.status(500).render('shop/error', { message: 'Erro ao carregar a página do produto' });
  }
};

// Página de pesquisa
const getSearchPage = async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.redirect('/');
  }
  
  try {
    // Buscar configurações da loja
    const storeConfig = await prisma.storeConfig.findFirst();
    
    // Buscar categorias
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Buscar produtos que correspondem à pesquisa
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      },
      include: {
        images: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.render('shop/search', { 
      storeConfig: storeConfig || { storeName: 'Minha Loja' },
      categories,
      searchQuery: q,
      products
    });
  } catch (error) {
    console.error('Erro ao buscar resultados da pesquisa:', error);
    res.status(500).render('shop/error', { message: 'Erro ao carregar os resultados da pesquisa' });
  }
};

// Página do carrinho
const getCartPage = async (req, res) => {
  try {
    // Buscar configurações da loja
    const storeConfig = await prisma.storeConfig.findFirst();
    
    // Buscar categorias
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.render('shop/cart', { 
      storeConfig: storeConfig || { storeName: 'Minha Loja' },
      categories
    });
  } catch (error) {
    console.error('Erro ao carregar página do carrinho:', error);
    res.status(500).render('shop/error', { message: 'Erro ao carregar a página do carrinho' });
  }
};

module.exports = {
  getHomePage,
  getCategoryPage,
  getProductPage,
  getSearchPage,
  getCartPage
}; 