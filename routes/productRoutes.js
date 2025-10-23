// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { ValidationError, NotFoundError } = require('../utils/customErrors');
const validateProduct = require('../middleware/validation');

let products = [
  { id: '1', name: 'Laptop', description: 'High-performance laptop', price: 1200, category: 'electronics', inStock: true },
  { id: '2', name: 'Smartphone', description: '128GB storage smartphone', price: 800, category: 'electronics', inStock: true },
  { id: '3', name: 'Coffee Maker', description: 'Programmable coffee maker', price: 50, category: 'kitchen', inStock: false }
];

// GET all products with filtering, pagination, and search
router.get('/', (req, res) => {
  const { category, search, page = 1, limit = 5 } = req.query;
  let filtered = [...products];

  if (category) filtered = filtered.filter(p => p.category === category);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));

  res.json({ total: filtered.length, page: parseInt(page), data: paginated });
});

// GET single product
router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
});

// POST create product
router.post('/', validateProduct, (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    const newProduct = { id: uuidv4(), name, description, price, category, inStock };
    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    next(new ValidationError('Invalid product data'));
  }
});

// PUT update product
router.put('/:id', validateProduct, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));

  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// DELETE product
router.delete('/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));

  const deleted = products.splice(index, 1);
  res.json({ message: 'Product deleted', product: deleted[0] });
});

// GET product stats
router.get('/stats/all', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
});

module.exports = router;
