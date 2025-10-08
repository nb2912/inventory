const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// This route is now protected.
// 1. 'protect' middleware runs to ensure a user is logged in via session.
// 2. 'restrictTo('admin')' middleware runs to ensure the logged-in user has the 'admin' role.
// 3. If both pass, it proceeds to userController.getAllUsers.
router.get('/', protect, restrictTo('admin'), userController.getAllUsers);

module.exports = router;

