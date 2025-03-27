const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração de armazenamento para imagens de produtos
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productDir = path.join(__dirname, '../../public/images/products');
    
    // Criar diretório se não existir
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }
    
    cb(null, productDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Configuração de armazenamento para logo da loja
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const logoDir = path.join(__dirname, '../../public/images/store');
    
    // Criar diretório se não existir
    if (!fs.existsSync(logoDir)) {
      fs.mkdirSync(logoDir, { recursive: true });
    }
    
    cb(null, logoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

// Filtro para tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  
  cb(new Error('Apenas imagens são permitidas!'));
};

// Configuração do Multer para upload de produtos
const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Configuração do Multer para upload de logo
const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter
});

module.exports = {
  uploadProduct,
  uploadLogo
}; 