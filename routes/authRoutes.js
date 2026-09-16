/**
 * Authentication Routes
 * Endpoints for user registration, login, profile management, KYC, and password changes.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  validateRegistration,
  validateLogin,
  validateKYC,
  validatePasswordReset
} = require('../middleware/validateMiddleware');

// Public endpoints
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected endpoints (JWT required)
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/kyc', verifyToken, validateKYC, authController.submitKYC);
router.post('/reset-password', verifyToken, validatePasswordReset, authController.resetPassword);

module.exports = router;
