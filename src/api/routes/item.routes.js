// src/api/routes/item.routes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// This route is protected and restricted to admins
router.post('/', protect, restrictTo('admin'), itemController.addItem);
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', protect, restrictTo('admin'), itemController.updateItem);
router.delete('/:id', protect, restrictTo('admin'), itemController.deleteItem);

module.exports = router;