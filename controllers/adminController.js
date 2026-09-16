/**
 * Admin Controller (Initial Setup for Module 1 & Module 3)
 * Handles administration view of registered users and bank accounts.
 */

const User = require('../models/User');
const Account = require('../models/Account');

/**
 * List all registered users and their accounts (Protected: Admin only)
 */
async function getAllUsers(req, res) {
  try {
    const users = await User.getAllUsersWithAccounts();
    return res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.'
    });
  }
}

/**
 * Freeze or unfreeze an account (Stubbed / Preview for Module 3)
 */
async function updateAccountStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'frozen', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await Account.updateStatus(id, status);

    return res.json({
      success: true,
      message: `Account status updated to ${status}.`
    });
  } catch (error) {
    console.error('Admin status update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update account status.'
    });
  }
}

module.exports = {
  getAllUsers,
  updateAccountStatus
};
