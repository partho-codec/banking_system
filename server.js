/**
 * Digital Banking System - Main Express Server
 * Academic Project (Waterfall SDLC)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'Digital Banking System',
    timestamp: new Date().toISOString(),
    version: '1.0.0 (Module 1)'
  });
});

// Fallback to index.html for undefined frontend routes (if not an API call)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API route not found.' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`
=====================================================
  🏦  DIGITAL BANKING SYSTEM - SERVER RUNNING
=====================================================
  🌐 Web App:    http://localhost:${PORT}
  🔑 Login/Auth: http://localhost:${PORT}/login.html
  📊 Dashboard:  http://localhost:${PORT}/dashboard.html
  🩺 Health:     http://localhost:${PORT}/api/health
=====================================================
  👉 Module 1 active: Auth, KYC, Accounts & Profiles
=====================================================
  `);
});

module.exports = app;
