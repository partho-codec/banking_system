/**
 * Database Connection Pool Configuration
 * Manages MySQL connection pool using mysql2/promise.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'banking_system',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true
});

// Test connection on module load
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`📡 Connected to MySQL database [${process.env.DB_NAME || 'banking_system'}] successfully.`);
    connection.release();
  } catch (error) {
    console.warn(`⚠️  Warning: MySQL connection failed (${error.message}).`);
    console.warn('👉 If MySQL is not running yet, please start your MySQL service (e.g. XAMPP) and run `npm run db:init`.');
  }
})();

module.exports = pool;
