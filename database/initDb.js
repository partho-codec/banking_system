/**
 * Database Initialization and Migration Script
 * Connects to MySQL server, creates the banking_system database,
 * executes schema tables, and populates initial admin & customer seed data.
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🔄 Initializing Digital Banking System Database...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true
  };

  let connection;
  try {
    // 1. Connect without selecting database
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL server at ${dbConfig.host}:${dbConfig.port}`);

    const dbName = process.env.DB_NAME || 'banking_system';

    // 2. Create database if it does not exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' verified/created.`);

    // 3. Switch to the database
    await connection.query(`USE \`${dbName}\`;`);

    // 4. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Tables created: users, accounts, transactions, loan_requests');

    // 5. Seed initial admin and demo customer with secure bcrypt hashes
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

    // Check if admin exists
    const [adminRows] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@bank.com']);
    if (adminRows.length === 0) {
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role, nid, phone, address, kyc_status)
         VALUES (?, ?, ?, 'admin', 'NID-ADMIN-001', '+1-800-555-0199', 'Bank Headquarters, Floor 12', 'verified')`,
        ['System Administrator', 'admin@bank.com', adminPasswordHash]
      );
      console.log('✅ Seeded default Admin user: admin@bank.com (Password: Admin@123)');
    }

    // Check if demo customer exists
    const [custRows] = await connection.query('SELECT id FROM users WHERE email = ?', ['customer@bank.com']);
    let customerId;
    if (custRows.length === 0) {
      const [result] = await connection.query(
        `INSERT INTO users (name, email, password_hash, role, nid, phone, address, kyc_status)
         VALUES (?, ?, ?, 'customer', 'NID-78491023', '+1-555-0142', '742 Evergreen Terrace, Springfield', 'verified')`,
        ['Alice Johnson', 'customer@bank.com', customerPasswordHash]
      );
      customerId = result.insertId;
      console.log('✅ Seeded demo Customer user: customer@bank.com (Password: Customer@123)');

      // Create initial savings account for customer
      const [accResult] = await connection.query(
        `INSERT INTO accounts (user_id, account_number, account_type, balance, status)
         VALUES (?, '1001589234', 'savings', 5000.00, 'active')`,
        [customerId]
      );
      console.log('✅ Seeded demo Customer Account #1001589234 with starting balance $5,000.00');

      // Record initial deposit transaction
      await connection.query(
        `INSERT INTO transactions (account_id, type, amount, description)
         VALUES (?, 'deposit', 5000.00, 'Initial opening deposit')`,
        [accResult.insertId]
      );
      console.log('✅ Recorded initial deposit transaction of $5,000.00');
    }

    console.log('\n🎉 Database initialization finished successfully!');
    console.log('----------------------------------------------------');
    console.log('Default Credentials:');
    console.log('  Admin:    admin@bank.com    / Admin@123');
    console.log('  Customer: customer@bank.com / Customer@123');
    console.log('----------------------------------------------------\n');

  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Could not connect to MySQL server.');
      console.error('Please make sure your MySQL server is running (via XAMPP, WAMP, or standalone service) and check your .env settings.\n');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
