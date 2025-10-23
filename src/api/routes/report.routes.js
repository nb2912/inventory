// src/api/routes/report.routes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All report routes are protected and restricted to admin users
router.get('/value', protect, restrictTo('admin'), reportController.getInventoryValueReport);
router.get('/movement', protect, restrictTo('admin'), reportController.getInventoryMovementReport);
router.get('/categories', protect, restrictTo('admin'), reportController.getCategoryDistributionReport);
router.get('/export', protect, restrictTo('admin'), reportController.exportInventoryData);

module.exports = router;