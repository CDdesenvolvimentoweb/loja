const prisma = require('../config/db');

// Listar todas as categorias para o painel admin
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.render('admin/categories/index', { 
      categories,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
};

// Mostrar formulário para criar categoria
const showCreateCategoryForm = (req, res) => {
  res.render('admin/categories/create', { 
    user: req.user
  });
};

// Criar nova categoria
const createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    await prisma.category.create({
      data: { name }
    });

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro ao criar categoria' });
  }
};

// Mostrar formulário para editar categoria
const showEditCategoryForm = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) }
    });

    if (!category) {
      return res.redirect('/admin/categories');
    }

    res.render('admin/categories/edit', { 
      category,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ message: 'Erro ao buscar categoria' });
  }
};

// Atualizar categoria
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await prisma.category.update({
      where: { id: Number(id) },
      data: { name }
    });

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
};

// Excluir categoria
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar se existem produtos associados
    const productsCount = await prisma.product.count({
      where: { categoryId: Number(id) }
    });

    if (productsCount > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir uma categoria que possui produtos associados' 
      });
    }

    await prisma.category.delete({
      where: { id: Number(id) }
    });

    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ message: 'Erro ao excluir categoria' });
  }
};

// API para obter todas as categorias
const apiGetAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ message: 'Erro ao buscar categorias' });
  }
};

module.exports = {
  getAllCategories,
  showCreateCategoryForm,
  createCategory,
  showEditCategoryForm,
  updateCategory,
  deleteCategory,
  apiGetAllCategories
}; 