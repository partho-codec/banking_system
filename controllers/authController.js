/**
 * Authentication Controller
 * Handles user registration, login, profile retrieval, KYC submissions, and password updates.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');

/**
 * Generate signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'super_secure_academic_banking_jwt_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

/**
 * Register a new user and auto-generate their bank account
 */
async function register(req, res) {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Check if email is already registered
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user record
    const userId = await User.create({
      name,
      email,
      passwordHash,
      role
    });

    let account = null;
    // If role is customer, automatically open a savings account
    if (role === 'customer') {
      account = await Account.createAccount(userId, 'savings', 0.00);
    }

    const newUser = { id: userId, name, email, role };
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Account created.',
      token,
      user: {
        id: userId,
        name,
        email,
        role,
        kyc_status: 'unverified'
      },
      account
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
}

/**
 * Log in an existing user and return JWT authentication token
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Verify user existence
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Fetch user account if role is customer
    let account = null;
    if (user.role === 'customer') {
      account = await Account.findByUserId(user.id);
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        nid: user.nid,
        phone: user.phone,
        address: user.address,
        kyc_status: user.kyc_status
      },
      account
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
}

/**
 * Get current authenticated user profile
 */
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const account = await Account.findByUserId(user.id);

    return res.json({
      success: true,
      user,
      account
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * Update user basic profile information (name, phone, address)
 */
async function updateProfile(req, res) {
  try {
    const { name, phone, address } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    await User.updateProfile(req.user.userId, { name: name.trim(), phone, address });
    const updatedUser = await User.findById(req.user.userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

/**
 * Submit KYC details (name, NID, address, phone)
 */
async function submitKYC(req, res) {
  try {
    const { name, nid, phone, address } = req.body;

    await User.updateKYC(req.user.userId, { name, nid, phone, address });
    const updatedUser = await User.findById(req.user.userId);

    return res.json({
      success: true,
      message: 'KYC verified successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process KYC verification.' });
  }
}

/**
 * Reset / change user password
 */
async function resetPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByIdWithPassword(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    await User.updatePassword(req.user.userId, newPasswordHash);

    return res.json({
      success: true,
      message: 'Password has been updated successfully.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  submitKYC,
  resetPassword
};
