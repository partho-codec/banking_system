/**
 * Account Controller
 * Manages bank account data retrieval, balance queries, and recipient account verification.
 */

const Account = require('../models/Account');

/**
 * Get account details of current authenticated user
 */
async function getMyAccount(req, res) {
  try {
    const account = await Account.findByUserId(req.user.userId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'No bank account found associated with this user.'
      });
    }

    return res.json({
      success: true,
      account
    });
  } catch (error) {
    console.error('Get my account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve account details.'
    });
  }
}

/**
 * Lookup recipient account info by account number (for transfers)
 */
async function lookupAccount(req, res) {
  try {
    const { accountNumber } = req.params;
    const account = await Account.findByAccountNumber(accountNumber);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account number not found.'
      });
    }

    // Return safe public details for confirmation
    return res.json({
      success: true,
      account: {
        accountNumber: account.account_number,
        ownerName: account.owner_name,
        status: account.status
      }
    });
  } catch (error) {
    console.error('Lookup account error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to lookup account.'
    });
  }
}

module.exports = {
  getMyAccount,
  lookupAccount
};
