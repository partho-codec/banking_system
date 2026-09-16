/**
 * Account Model
 * Handles database operations for bank accounts (creation, balance lookup, status updates).
 */

const db = require('../config/db');

class Account {
  /**
   * Helper to generate a unique 10-digit bank account number
   * Format: 1001XXXXXX
   * @returns {string}
   */
  static generateAccountNumber() {
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    return `1001${randomSixDigits}`;
  }

  /**
   * Create a new bank account for a registered user
   * @param {number} userId
   * @param {string} accountType - 'savings' or 'checking'
   * @param {number} initialBalance
   * @returns {Promise<object>} - Created account record
   */
  static async createAccount(userId, accountType = 'savings', initialBalance = 0.00) {
    let accountNumber;
    let isUnique = false;

    // Ensure generated account number is unique
    while (!isUnique) {
      accountNumber = this.generateAccountNumber();
      const [existing] = await db.query('SELECT id FROM accounts WHERE account_number = ?', [accountNumber]);
      if (existing.length === 0) {
        isUnique = true;
      }
    }

    const [result] = await db.query(
      'INSERT INTO accounts (user_id, account_number, account_type, balance, status) VALUES (?, ?, ?, ?, "active")',
      [userId, accountNumber, accountType, initialBalance]
    );

    return {
      id: result.insertId,
      userId,
      accountNumber,
      accountType,
      balance: initialBalance,
      status: 'active'
    };
  }

  /**
   * Find bank account by associated User ID
   * @param {number} userId
   * @returns {Promise<object|null>}
   */
  static async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT id, user_id, account_number, account_type, balance, status, created_at FROM accounts WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Find bank account by its unique account number
   * @param {string} accountNumber
   * @returns {Promise<object|null>}
   */
  static async findByAccountNumber(accountNumber) {
    const [rows] = await db.query(
      'SELECT a.*, u.name AS owner_name, u.email AS owner_email FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.account_number = ? LIMIT 1',
      [accountNumber]
    );
    return rows[0] || null;
  }

  /**
   * Find bank account by ID
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT a.*, u.name AS owner_name FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Update account balance
   * @param {number} id
   * @param {number} newBalance
   * @param {object} [connection] - Optional MySQL transaction connection
   * @returns {Promise<boolean>}
   */
  static async updateBalance(id, newBalance, connection = null) {
    const executor = connection || db;
    const [result] = await executor.query(
      'UPDATE accounts SET balance = ? WHERE id = ?',
      [newBalance, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update account status (e.g. 'active', 'frozen', 'closed')
   * @param {number} id
   * @param {string} status
   * @returns {Promise<boolean>}
   */
  static async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE accounts SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Retrieve all accounts (for Admin analytics and user listing)
   * @returns {Promise<Array>}
   */
  static async getAllAccounts() {
    const [rows] = await db.query(`
      SELECT a.*, u.name AS owner_name, u.email AS owner_email, u.kyc_status
      FROM accounts a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    return rows;
  }
}

module.exports = Account;
