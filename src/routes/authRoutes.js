const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/AuthController');
const { verifyJWT, requireAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required')
], authController.registerAdmin);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.loginAdmin);

router.post('/verify-token', verifyJWT, authController.verifyToken);

// Protected routes
router.get('/profile', verifyJWT, requireAdmin, authController.getProfile);
router.post('/logout', verifyJWT, authController.logoutAdmin);

module.exports = router;
