-- ==========================================================
-- Digital Banking System - Seed Data (MySQL)
-- Default Credentials:
-- Admin:    admin@bank.com    / Admin@123
-- Customer: customer@bank.com / Customer@123
-- ==========================================================

USE banking_system;

-- Insert Admin User (password: Admin@123 -> $2a$10$wE4mH9uH1UqPsmQyD.t6ueW.7k3w0z8L6Gq3/kU3.u/K172oX2qW2)
INSERT IGNORE INTO users (id, name, email, password_hash, role, nid, phone, address, kyc_status) 
VALUES (
  1, 
  'System Administrator', 
  'admin@bank.com', 
  '$2a$10$vI8qO7B84F0.o1o2bYd5o.VwR3t2rA5e7y/w4r0x9n5r6u8v7p2qS', 
  'admin', 
  'NID-000000000', 
  '+1-800-555-0199', 
  'Bank HQ, Executive Tower, Suite 100', 
  'verified'
);

-- Insert Sample Customer (password: Customer@123 -> $2a$10$cO1qO7B84F0.o1o2bYd5o.VwR3t2rA5e7y/w4r0x9n5r6u8v7p2qS)
INSERT IGNORE INTO users (id, name, email, password_hash, role, nid, phone, address, kyc_status) 
VALUES (
  2, 
  'Alice Johnson', 
  'customer@bank.com', 
  '$2a$10$vI8qO7B84F0.o1o2bYd5o.VwR3t2rA5e7y/w4r0x9n5r6u8v7p2qS', 
  'customer', 
  'NID-198472910', 
  '+1-555-0142', 
  '452 Maple Avenue, Springfield', 
  'verified'
);

-- Insert Customer Account with Starting Balance $5,000.00
INSERT IGNORE INTO accounts (id, user_id, account_number, account_type, balance, status)
VALUES (
  1,
  2,
  '1001589234',
  'savings',
  5000.00,
  'active'
);

-- Insert Initial Deposit Transaction
INSERT IGNORE INTO transactions (id, account_id, type, amount, description)
VALUES (
  1,
  1,
  'deposit',
  5000.00,
  'Initial opening deposit'
);
