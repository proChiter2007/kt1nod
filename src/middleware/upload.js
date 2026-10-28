const multer = require('multer');
const path = require('path');
const fs = require('fs');

const targetDir = path.resolve(__dirname, '../../uploads/products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: (req, file, callback) => callback(null, targetDir),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${file.fieldname}_${Date.now()}_${Math.floor(Math.random() * 10000)}${extension}`;
    callback(null, fileName);
  }
});

const validateMimeType = (req, file, callback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Допускаются только файлы формата JPEG и PNG'), false);
  }
};

const imageUploader = multer({
  storage: storageConfig,
  fileFilter: validateMimeType,
  limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = imageUploader;