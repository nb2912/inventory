// src/api/routes/supplier.routes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// All supplier routes are protected and restricted to admins
router
  .route('/')
  .get(protect, restrictTo('admin'), supplierController.getAllSuppliers)
  .post(protect, restrictTo('admin'), supplierController.createSupplier);

router
  .route('/:id')
  .get(protect, restrictTo('admin'), supplierController.getSupplierById)
  .put(protect, restrictTo('admin'), supplierController.updateSupplier)
  .delete(protect, restrictTo('admin'), supplierController.deleteSupplier);

module.exports = router;