/**
 * Database Connection Pool Configuration
 * Supports both local development (localhost) and cloud MySQL providers (e.g. TiDB, Aiven, Render).
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const isCloud = process.env.DB_HOST && 
  process.env.DB_HOST !== 'localhost' && 
  process.env.DB_HOST !== '127.0.0.1';

const dbConfig = {
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
};

// Enable SSL automatically for cloud MySQL (TiDB Cloud / Aiven) or when explicitly configured
if (process.env.DB_SSL === 'true' || isCloud) {
  dbConfig.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;