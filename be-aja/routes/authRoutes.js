// be-aja/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginAdmin, getProfile, logout } = require('../controllers/authController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', loginAdmin);

// GET /api/auth/profile
router.get('/profile', authMiddleware, adminOnly, getProfile);

// POST /api/auth/logout
router.post('/logout', authMiddleware, logout);

module.exports = router;
