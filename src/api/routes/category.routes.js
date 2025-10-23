// src/api/routes/category.routes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect } = require('../middleware/auth.middleware');

// All category routes are protected - require authentication
router.get('/', protect, categoryController.getAllCategories);
router.get('/:category/items', protect, categoryController.getItemsByCategory);

module.exports = router;