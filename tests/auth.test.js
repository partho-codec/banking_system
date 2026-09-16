/**
 * Unit Tests for Module 1: Authentication & Account Validation
 * Run with: node tests/auth.test.js
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
  }
}

async function runTests() {
  console.log('\n🧪 Running Unit Tests for Module 1 (Auth, JWT & Validation)...\n');

  // Test 1: Password Hashing and Comparison
  console.log('--- Test Suite 1: Password Cryptography ---');
  const plainPassword = 'SuperSecurePassword@2026';
  const salt = 10;
  const hash = await bcrypt.hash(plainPassword, salt);

  assert(typeof hash === 'string' && hash.startsWith('$2a$'), 'Bcrypt should generate a valid salted hash');
  const isValidMatch = await bcrypt.compare(plainPassword, hash);
  assert(isValidMatch === true, 'Bcrypt compare must return true for correct password');
  const isInvalidMatch = await bcrypt.compare('WrongPassword', hash);
  assert(isInvalidMatch === false, 'Bcrypt compare must return false for incorrect password');

  // Test 2: JWT Issuance and Verification
  console.log('\n--- Test Suite 2: JWT Token Operations ---');
  const secret = 'test_secret_key_12345';
  const payload = { userId: 42, email: 'tester@bank.com', role: 'customer' };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token should have 3 dot-separated segments');
  const decoded = jwt.verify(token, secret);
  assert(decoded.userId === 42 && decoded.role === 'customer', 'Decoded token should preserve userId and role');

  // Test 3: Account Number Generation Format
  console.log('\n--- Test Suite 3: Account Generation Logic ---');
  const Account = require('../models/Account');
  const accNumber = Account.generateAccountNumber();
  assert(accNumber.startsWith('1001') && accNumber.length === 10, 'Generated account number must be 10 digits starting with 1001');

  // Summary
  console.log('\n=============================================');
  console.log(`📊 Test Results: ${passedTests}/${totalTests} Passed`);
  console.log('=============================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
