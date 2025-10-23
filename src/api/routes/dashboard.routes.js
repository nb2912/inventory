// src/api/routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

// All dashboard routes are protected - require authentication
router.get('/stats', protect, dashboardController.getDashboardStats);
router.get('/activity', protect, dashboardController.getInventoryActivity);

module.exports = router;