const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

// Mostrar formulário de configurações da loja
const showStoreConfigForm = async (req, res) => {
  try {
    let storeConfig = await prisma.storeConfig.findFirst();
    
    if (!storeConfig) {
      storeConfig = {
        storeName: '',
        whatsapp: '',
        email: '',
        phone: '',
        address: '',
        logoUrl: ''
      };
    }
    
    res.render('admin/settings/index', { 
      settings: storeConfig,
      user: req.user
    });
  } catch (error) {
    console.error('Erro ao buscar configurações da loja:', error);
    res.status(500).json({ message: 'Erro ao buscar configurações da loja' });
  }
};

// Atualizar configurações da loja
const updateStoreConfig = async (req, res) => {
  const { 
    storeName, 
    storeDescription, 
    storePhone, 
    storeEmail, 
    storeAddress, 
    socialInstagram, 
    socialFacebook,
    primaryColor,
    secondaryColor
  } = req.body;
  const file = req.file;

  try {
    let storeConfig = await prisma.storeConfig.findFirst();
    
    if (storeConfig) {
      // Se houver novo logo, excluir o antigo arquivo
      if (file && storeConfig.logoUrl) {
        const oldLogoPath = path.join(__dirname, '../../public', storeConfig.logoUrl);
        
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // Atualizar configurações
      await prisma.storeConfig.update({
        where: { id: storeConfig.id },
        data: {
          storeName,
          storeDescription,
          storePhone,
          storeEmail,
          storeAddress,
          socialInstagram,
          socialFacebook,
          primaryColor,
          secondaryColor,
          logoUrl: file ? `/images/store/${file.filename}` : storeConfig.logoUrl
        }
      });
    } else {
      // Criar novas configurações
      await prisma.storeConfig.create({
        data: {
          storeName,
          storeDescription,
          storePhone,
          storeEmail,
          storeAddress,
          socialInstagram,
          socialFacebook,
          primaryColor,
          secondaryColor,
          logoUrl: file ? `/images/store/${file.filename}` : null
        }
      });
    }

    res.redirect('/admin/store-config');
  } catch (error) {
    console.error('Erro ao atualizar configurações da loja:', error);
    res.status(500).json({ message: 'Erro ao atualizar configurações da loja' });
  }
};

// API para obter configurações da loja
const apiGetStoreConfig = async (req, res) => {
  try {
    const storeConfig = await prisma.storeConfig.findFirst();
    
    if (!storeConfig) {
      return res.json({
        storeName: 'Minha Loja',
        storeDescription: '',
        storePhone: '',
        storeEmail: '',
        storeAddress: '',
        socialInstagram: '',
        socialFacebook: '',
        primaryColor: '#0d6efd',
        secondaryColor: '#6c757d',
        logoUrl: ''
      });
    }
    
    res.json(storeConfig);
  } catch (error) {
    console.error('Erro ao buscar configurações da loja:', error);
    res.status(500).json({ message: 'Erro ao buscar configurações da loja' });
  }
};

module.exports = {
  showStoreConfigForm,
  updateStoreConfig,
  apiGetStoreConfig
}; 