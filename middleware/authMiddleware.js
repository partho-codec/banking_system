/**
 * Authentication & Authorization Middleware
 * Verifies JWT access tokens and enforces role-based access control (RBAC).
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token from Authorization header
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format. Expected: Bearer <token>'
    });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secure_academic_banking_jwt_secret_key_2026');
    req.user = decoded; // { userId, role, email }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid or malformed token.'
    });
  }
}

/**
 * Enforce Admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Administrator privileges required.'
    });
  }
  next();
}

/**
 * Enforce Customer role
 */
function requireCustomer(req, res, next) {
  if (!req.user || req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted: Customer privileges required.'
    });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireCustomer
};
