const express = require('express');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');

const checkSchema = require('../middleware/validate');
const imageUploader = require('../middleware/upload');
const ProductStore = require('../config/productsStore');

const router = express.Router();

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().positive().required(),
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other').required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).allow('', null)
});

const putProductSchema = createProductSchema;

const patchProductSchema = createProductSchema.fork(
  ['name', 'price', 'category'],
  (field) => field.optional()
).min(1);

const querySchema = Joi.object({
  category: Joi.string().valid('electronics', 'clothing', 'food', 'other'),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10)
});

const applyFilters = (items, filters) => {
  let result = [...items];
  if (filters.category) result = result.filter(i => i.category === filters.category);
  if (filters.minPrice !== undefined) result = result.filter(i => i.price >= filters.minPrice);
  if (filters.maxPrice !== undefined) result = result.filter(i => i.price <= filters.maxPrice);
  return result;
};

router.get('/', checkSchema(querySchema), (req, res) => {
  const { page, limit } = req.query;
  const filtered = applyFilters(ProductStore.getAll(), req.query);
  const total = filtered.length;
  const offset = (page - 1) * limit;
  const data = filtered.slice(offset, offset + limit);
  res.json({ data, total, page, limit });
});

router.get('/:id', (req, res) => {
  const item = ProductStore.getById(req.params.id);
  if (!item) return res.status(404).json({ details: ['Товар не найден'] });
  res.json(item);
});

router.post('/', checkSchema(createProductSchema), (req, res) => {
  const created = ProductStore.create(req.body);
  res.status(201).json(created);
});

router.put('/:id', checkSchema(putProductSchema), (req, res) => {
  const replaced = ProductStore.replace(req.params.id, req.body);
  if (!replaced) return res.status(404).json({ details: ['Товар не найден'] });
  res.json(replaced);
});

router.patch('/:id', checkSchema(patchProductSchema), (req, res) => {
  const updated = ProductStore.updatePartial(req.params.id, req.body);
  if (!updated) return res.status(404).json({ details: ['Товар не найден'] });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const product = ProductStore.getById(req.params.id);
  if (!product) return res.status(404).json({ details: ['Товар не найден'] });
  if (product.imageUrl) {
    const filePath = path.resolve(__dirname, '../..', product.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  ProductStore.delete(req.params.id);
  res.status(204).send();
});

router.post('/:id/image', imageUploader.single('image'), (req, res) => {
  const product = ProductStore.getById(req.params.id);
  if (!product) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ details: ['Товар не найден'] });
  }
  if (!req.file) return res.status(400).json({ details: ['Файл не передан'] });
  const publicUrl = `/uploads/products/${req.file.filename}`;
  const updated = ProductStore.setImage(req.params.id, publicUrl);
  res.json({ message: 'OK', imageUrl: publicUrl, product: updated });
});

module.exports = router;