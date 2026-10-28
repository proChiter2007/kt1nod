const express = require('express');
const path = require('path');
const config = require('./config');
const logRequests = require('./middleware/logger');
const handleErrors = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');

const app = express();

app.use(express.json());
app.use(logRequests);
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ details: ['Маршрут не найден'] });
});

app.use(handleErrors);

app.listen(config.port, () => {
  console.log(`[Server] Запщен на порту ${config.port}`);
});