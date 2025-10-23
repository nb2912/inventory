// src/api/routes/alert.routes.js
const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { protect } = require('../middleware/auth.middleware');

// All alert routes are protected - require authentication
router.get('/low-stock', protect, alertController.getLowStockAlerts);
router.get('/custom', protect, alertController.getCustomAlerts);
router.patch('/threshold/:itemId', protect, alertController.setAlertThreshold);

module.exports = router;