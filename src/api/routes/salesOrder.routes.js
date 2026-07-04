// src/api/routes/salesOrder.routes.js
const express = require('express');
const router = express.Router();
const soController = require('../controllers/salesOrder.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All routes are admin-only
router.use(protect, restrictTo('admin'));

router
  .route('/')
  .post(soController.createSalesOrder)
  .get(soController.getAllSalesOrders);

router.route('/:id')
  .get(soController.getSalesOrderById)
  .delete(soController.deleteSalesOrder);

router.route('/:id/status')
  .patch(soController.updateOrderStatus);

module.exports = router;
