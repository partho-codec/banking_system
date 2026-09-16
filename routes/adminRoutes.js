/**
 * Admin Routes
 * Endpoints restricted to administrators for managing system accounts and users.
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// All routes in this router require a valid JWT with role === 'admin'
router.use(verifyToken, requireAdmin);

// User & Account Management
router.get('/users', adminController.getAllUsers);
router.put('/accounts/:id/status', adminController.updateAccountStatus);

module.exports = router;
