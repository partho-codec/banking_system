-- ==========================================================
-- Digital Banking System - Database Schema (MySQL)
-- Academic Project (Waterfall SDLC)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS banking_system;
USE banking_system;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  nid VARCHAR(50) NULL,
  phone VARCHAR(20) NULL,
  address TEXT NULL,
  kyc_status ENUM('unverified', 'pending', 'verified') DEFAULT 'unverified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_number VARCHAR(20) NOT NULL UNIQUE,
  account_type ENUM('savings', 'checking') DEFAULT 'savings',
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  status ENUM('active', 'frozen', 'closed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  type ENUM('deposit', 'withdraw', 'transfer_in', 'transfer_out') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reference_account_id INT NULL,
  description VARCHAR(255) NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (reference_account_id) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Loan Requests Table
CREATE TABLE IF NOT EXISTS loan_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
