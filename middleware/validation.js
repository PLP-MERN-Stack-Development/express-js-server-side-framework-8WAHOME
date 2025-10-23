// middleware/validation.js

const { ValidationError } = require('../utils/customErrors');

module.exports = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || !description || price === undefined || !category || typeof inStock !== 'boolean') {
    return next(new ValidationError('Missing or invalid product fields'));
  }
  next();
};
