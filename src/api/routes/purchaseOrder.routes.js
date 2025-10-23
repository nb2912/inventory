// src/api/routes/purchaseOrder.routes.js
const express = require('express');
const router = express.Router();
const poController = require('../controllers/purchaseOrder.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes are admin-only
router.use(protect, restrictTo('admin'));

router
  .route('/')
  .post(poController.createPurchaseOrder)
  .get(poController.getAllPurchaseOrders);

router.route('/:id').get(poController.getPurchaseOrderById);

router.route('/:id/status').patch(poController.updateOrderStatus);

module.exports = router;