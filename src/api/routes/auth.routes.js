const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware'); // 1. Import the protect middleware

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout); // 2. Add the new logout route

// GET /api/auth/profile - This is a protected route
// The 'protect' middleware will run first. If the user is not logged in,
// it will send an error. If they are, it will proceed to authController.getProfile.
router.get('/profile', protect, authController.getProfile); // 3. Add the protected profile route

module.exports = router;