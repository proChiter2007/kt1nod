const handleErrors = (err, req, res, next) => {
  console.error(`[Error Handler] ${err.message}`);
  if (err instanceof require('multer').MulterError) {
    return res.status(400).json({ details: [`Ошибка загрузки: ${err.message}`] });
  }
  if (err.message.includes('JPEG') || err.message.includes('PNG')) {
    return res.status(400).json({ details: [err.message] });
  }
  res.status(err.statusCode || 500).json({
    details: [err.message || 'Внутренняя ошибка сервера']
  });
};

module.exports = handleErrors;