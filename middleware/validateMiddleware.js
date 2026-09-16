/**
 * Request Validation Middleware
 * Validates and sanitizes incoming user inputs across forms.
 */

/**
 * Validate registration request body
 */
function validateRegistration(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (role && !['customer', 'admin'].includes(role)) {
    errors.push('Invalid account role specified.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
}

/**
 * Validate login request body
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

/**
 * Validate KYC submission
 */
function validateKYC(req, res, next) {
  const { name, nid, phone, address } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full legal name is required.');
  }

  if (!nid || typeof nid !== 'string' || nid.trim().length < 5) {
    errors.push('National Identification Number (NID) must be at least 5 characters.');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    errors.push('Valid phone number is required.');
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    errors.push('Valid residential address is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  req.body.name = name.trim();
  req.body.nid = nid.trim();
  req.body.phone = phone.trim();
  req.body.address = address.trim();
  next();
}

/**
 * Validate Password Reset
 */
function validatePasswordReset(req, res, next) {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('Current password is required.');
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long.');
  }

  if (currentPassword === newPassword) {
    errors.push('New password must be different from current password.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateKYC,
  validatePasswordReset
};
