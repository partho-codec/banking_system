/**
 * User Model
 * Handles database operations for user accounts, credentials, and KYC profiles.
 */

const db = require('../config/db');

class User {
  /**
   * Find a user by their unique email address
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  /**
   * Find a user by their primary key ID (excluding sensitive password hash)
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, nid, phone, address, kyc_status, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Find a user with password hash by ID (for password reset verification)
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  static async findByIdWithPassword(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  /**
   * Create a new user record in the database
   * @param {object} userData - { name, email, passwordHash, role }
   * @returns {Promise<number>} - Inserted user ID
   */
  static async create({ name, email, passwordHash, role = 'customer' }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    return result.insertId;
  }

  /**
   * Update general user profile details
   * @param {number} id
   * @param {object} data - { name, phone, address }
   * @returns {Promise<boolean>}
   */
  static async updateProfile(id, { name, phone, address }) {
    const [result] = await db.query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || null, address || null, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update KYC information and mark status as verified/pending
   * @param {number} id
   * @param {object} data - { name, nid, phone, address }
   * @returns {Promise<boolean>}
   */
  static async updateKYC(id, { name, nid, phone, address }) {
    const [result] = await db.query(
      'UPDATE users SET name = ?, nid = ?, phone = ?, address = ?, kyc_status = "verified" WHERE id = ?',
      [name, nid, phone, address, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update user's hashed password
   * @param {number} id
   * @param {string} newPasswordHash
   * @returns {Promise<boolean>}
   */
  static async updatePassword(id, newPasswordHash) {
    const [result] = await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Retrieve all users along with their primary account information (for Admin view)
   * @returns {Promise<Array>}
   */
  static async getAllUsersWithAccounts() {
    const query = `
      SELECT 
        u.id, u.name, u.email, u.role, u.nid, u.phone, u.address, u.kyc_status, u.created_at,
        a.id AS account_id, a.account_number, a.account_type, a.balance, a.status AS account_status
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id
      ORDER BY u.created_at DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  }
}

module.exports = User;
