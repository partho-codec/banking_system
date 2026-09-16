# Apex Digital Banking System (Academic Project)

A complete, production-grade Core Digital Banking Web Application built using **HTML5, Modern Vanilla CSS, Vanilla JavaScript**, **Node.js + Express**, and **MySQL**.

Engineered following the **Waterfall Software Development Life Cycle (SDLC)**.

---

## 🏛️ Project Architecture

```
banking_system/
├── config/
│   └── db.js                 # MySQL Connection Pool (mysql2/promise)
├── controllers/
│   ├── authController.js     # Register, Login, KYC, Profile, Password Reset
│   ├── accountController.js  # Account lookups & balance queries
│   └── adminController.js    # Administrator account management
├── models/
│   ├── User.js               # SQL queries for users and authentication
│   └── Account.js            # SQL queries for bank accounts
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── accountRoutes.js      # /api/accounts endpoints
│   └── adminRoutes.js        # /api/admin endpoints
├── middleware/
│   ├── authMiddleware.js     # JWT verification & RBAC (customer/admin)
│   └── validateMiddleware.js # Form input sanitization and validation
├── database/
│   ├── schema.sql            # Table definitions (users, accounts, transactions, loan_requests)
│   ├── seed.sql              # Seed SQL script
│   └── initDb.js             # Automated DB creation and seeder runner
├── public/                   # Glassmorphic Dark-Fintech Web UI
│   ├── index.html            # Landing / Gateway with Quick Demo login
│   ├── login.html            # Auth portal with Customer/Admin tabs
│   ├── dashboard.html        # Customer Banking Portal (KYC, Profile, Balance)
│   ├── admin.html            # Administrator Console (Accounts, KYC status, Freeze)
│   ├── css/
│   │   └── style.css         # Modern typography, glassmorphism, responsive grid
│   └── js/
│       ├── api.js            # Central API client, JWT storage, toast alerts
│       ├── auth.js           # Auth form validation and session logic
│       ├── dashboard.js      # Customer dashboard controller
│       └── admin.js          # Admin console controller
├── tests/
│   └── auth.test.js          # Unit tests for Module 1
├── .env                      # Active environment configuration
├── .env.example              # Environment variables template
├── server.js                 # Express server entry point
└── package.json              # Project metadata & scripts
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Open your terminal in this directory and execute:
```bash
npm install
```

### 2. Configure Environment & MySQL
Ensure your MySQL server is running (e.g. via XAMPP, WAMP, or standalone service).
Review `.env` (defaults connect to `localhost:3306` with user `root` and empty password):
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=banking_system
DB_PORT=3306
JWT_SECRET=super_secure_academic_banking_jwt_secret_key_2026
```

### 3. Initialize the Database & Seed Accounts
Run the automated migration and seed script:
```bash
npm run db:init
```
*This will automatically create the `banking_system` database if needed, generate all 4 relational tables, and seed the default accounts.*

### 4. Start the Application
```bash
npm start
```
Or with automatic reload:
```bash
npm run dev
```

Visit the application at:
- 🌐 **Landing Page:** [http://localhost:3000](http://localhost:3000)
- 🔑 **Login / Register:** [http://localhost:3000/login.html](http://localhost:3000/login.html)
- 📊 **Customer Dashboard:** [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)
- 🛡️ **Admin Console:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🔑 Default Test Credentials

| Role | Email | Password | Starting Balance | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | `customer@bank.com` | `Customer@123` | $5,000.00 | Savings Account #1001589234, KYC Verified, Profile Edit, Security |
| **Admin** | `admin@bank.com` | `Admin@123` | N/A | Full oversight, view all users, freeze/unfreeze accounts |

*You can also click **"Open Account"** on the login page to register your own custom customer or administrator account with automated 10-digit account generation.*

---

## 🧪 Running Unit Tests
```bash
npm test
```

---

## 📋 SDLC Roadmap & Status
- [x] **Phase 1: Module 1 (Authentication & Account Module)** - *Completed & Ready for Review*
- [ ] **Phase 2: Module 2 (Transaction Module)** - *Pending Review Approval*
- [ ] **Phase 3: Module 3 (Admin Module & Loan Approvals)** - *Pending Review Approval*
- [ ] **Phase 4: Academic Deliverables (ERD, DFD Level 0 & 1, SRS, Test Cases)** - *Final Stage*
