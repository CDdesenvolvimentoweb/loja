const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

// Listar todos os produtos para o painel admin
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        sizes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.render('admin/products/index', { 
      products,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
};

// Mostrar formulário para criar produto
const showCreateProductForm = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.render('admin/products/create', { 
      categories,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
};

// Criar novo produto
const createProduct = async (req, res) => {
  const { name, description, price, categoryId, sizes, active, featured } = req.body;
  const files = req.files;

  try {
    // Criar produto
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: Number(categoryId),
        active: active === 'on' ? true : false,
        featured: featured === 'on' ? true : false
      }
    });

    // Adicionar tamanhos
    const sizesArray = typeof sizes === 'string' ? [sizes] : sizes;
    if (sizesArray && sizesArray.length > 0) {
      const sizesData = sizesArray.map(size => ({
        name: size,
        productId: product.id
      }));

      await prisma.size.createMany({
        data: sizesData
      });
    }

    // Adicionar imagens
    if (files && files.length > 0) {
      const imagesData = files.map(file => ({
        url: `/images/products/${file.filename}`,
        productId: product.id
      }));

      await prisma.image.createMany({
        data: imagesData
      });
    }

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

// Mostrar formulário para editar produto
const showEditProductForm = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        sizes: true
      }
    });

    if (!product) {
      return res.redirect('/admin/products');
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });

    res.render('admin/products/edit', { 
      product,
      categories,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};

// Atualizar produto
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, categoryId, sizes, active, featured } = req.body;
  const files = req.files;

  try {
    // Atualizar produto
    await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        category: {
          connect: { id: Number(categoryId) }
        },
        active: active === 'on' ? true : false,
        featured: featured === 'on' ? true : false
      }
    });

    // Atualizar tamanhos
    await prisma.size.deleteMany({
      where: { productId: Number(id) }
    });

    const sizesArray = typeof sizes === 'string' ? [sizes] : sizes;
    if (sizesArray && sizesArray.length > 0) {
      const sizesData = sizesArray.map(size => ({
        name: size,
        productId: Number(id)
      }));

      await prisma.size.createMany({
        data: sizesData
      });
    }

    // Adicionar novas imagens
    if (files && files.length > 0) {
      const imagesData = files.map(file => ({
        url: `/images/products/${file.filename}`,
        productId: Number(id)
      }));

      await prisma.image.createMany({
        data: imagesData
      });
    }

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};

// Excluir produto
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar imagens para excluir os arquivos
    const images = await prisma.image.findMany({
      where: { productId: Number(id) }
    });

    // Excluir produto (as relações serão excluídas por CASCADE)
    await prisma.product.delete({
      where: { id: Number(id) }
    });

    // Excluir arquivos de imagem
    for (const image of images) {
      const imagePath = path.join(__dirname, '../../public', image.url);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ message: 'Erro ao excluir produto' });
  }
};

// Excluir uma imagem específica
const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar a imagem
    const image = await prisma.image.findUnique({
      where: { id: Number(id) }
    });

    if (!image) {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }

    // Excluir a imagem do banco de dados
    await prisma.image.delete({
      where: { id: Number(id) }
    });

    // Excluir o arquivo
    const imagePath = path.join(__dirname, '../../public', image.url);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    res.status(500).json({ message: 'Erro ao excluir imagem' });
  }
};

// API para obter todos os produtos
const apiGetAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        sizes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
};

// API para obter produtos por categoria
const apiGetProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await prisma.product.findMany({
      where: { categoryId: Number(categoryId) },
      include: {
        category: true,
        images: true,
        sizes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
};

// API para buscar produtos
const apiSearchProducts = async (req, res) => {
  const { query } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        images: true,
        sizes: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
};

// API para obter detalhes de um produto
const apiGetProductDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        images: true,
        sizes: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
};

module.exports = {
  getAllProducts,
  showCreateProductForm,
  createProduct,
  showEditProductForm,
  updateProduct,
  deleteProduct,
  deleteImage,
  apiGetAllProducts,
  apiGetProductsByCategory,
  apiSearchProducts,
  apiGetProductDetails
}; 