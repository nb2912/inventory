// src/api/routes/barcode.routes.js
const express = require('express');
const router = express.Router();
const barcodeController = require('../controllers/barcode.controller');
const { protect } = require('../middleware/auth.middleware');

// All barcode routes are protected - require authentication
router.get('/:barcode', protect, barcodeController.findByBarcode);
router.patch('/:barcode/quantity', protect, barcodeController.updateQuantityByBarcode);

module.exports = router;