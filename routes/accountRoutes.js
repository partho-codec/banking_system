/**
 * Account Routes
 * Endpoints for retrieving user bank account data and searching accounts.
 */

const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protected account routes
router.get('/my-account', verifyToken, accountController.getMyAccount);
router.get('/lookup/:accountNumber', verifyToken, accountController.lookupAccount);

module.exports = router;
