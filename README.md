# QR Code Attendance System

A production-ready QR Code-based attendance tracking application built with React, Node.js/Express, and MySQL.

---

## ✨ Features

- 🔐 User registration → unique QR code generation
- 📱 QR scan logs attendance (once per day per user)
- 🔄 Lost QR? Regenerate in seconds
- 🛡️ Admin dashboard with JWT auth
- 📊 Attendance analytics chart (last 7 days)
- 📥 CSV export of attendance records
- 🔒 Rate limiting, token validation, duplicate prevention
- 🌐 Optional URL redirect after scan

---

## 🗂️ Project Structure

```
qr-attendance-system/
├── schema.sql                 ← MySQL database schema
├── backend/
│   ├── server.js              ← Express entry point
│   ├── .env.example
│   ├── config/
│   │   └── db.js              ← MySQL pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── scanController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            ← JWT middleware
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── QrCode.js
│   │   └── Attendance.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── qr.js
│       └── admin.js
└── frontend/
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Navbar.jsx
        │   ├── QrDisplay.jsx
        │   └── UI.jsx
        ├── pages/
        │   ├── RegisterPage.jsx
        │   ├── RegeneratePage.jsx
        │   ├── ScanResultPage.jsx
        │   ├── AdminLoginPage.jsx
        │   └── AdminDashboard.jsx
        └── services/
            ├── api.js
            └── auth.jsx
```

---

## ⚙️ Prerequisites

| Tool    | Version  |
|---------|----------|
| Node.js | ≥ 18.x   |
| MySQL   | ≥ 8.0    |
| npm     | ≥ 9.x    |

---

## 🚀 Installation Guide

### 1. Clone / download the project

```bash
git clone https://github.com/yourname/qr-attendance-system.git
cd qr-attendance-system
```

### 2. Set up the MySQL database

```bash
mysql -u root -p < schema.sql
```

This creates the `qr_attendance` database with all tables and a default admin account.

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` — the critical fields:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=qr_attendance

JWT_SECRET=some_very_long_random_string_here

# The public URL your backend is accessible at (used in QR code links)
BASE_URL=http://localhost:5000

# Frontend origin for CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Install backend dependencies & start

```bash
cd backend
npm install
npm run dev        # Development (nodemon)
# npm start        # Production
```

The API will be live at `http://localhost:5000`.

### 5. Install frontend dependencies & start

```bash
cd frontend
npm install
npm run dev
```

The frontend will be live at `http://localhost:5173`.

---

## 🔑 Default Admin Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@qrattend.local   |
| Password | password 

> ⚠️ **Change this immediately** in production! Update the password hash in MySQL:
> ```sql
> UPDATE users SET password = '$2b$10$<new_bcrypt_hash>' WHERE email = 'admin@qrattend.local';
> ```

---

## 📡 API Reference

### Authentication

#### `POST /api/login`
Admin login.

**Request body:**
```json
{ "email": "admin@qrattend.local", "password": "Admin@1234" }
```
**Response:**
```json
{
  "success": true,
  "token": "<JWT>",
  "user": { "id": 1, "uuid": "...", "full_name": "System Admin", "role": "admin" }
}
```

---

### Users

#### `POST /api/users/register`
Register a new user and get a QR code.

**Request body:**
```json
{
  "full_name": "Juan dela Cruz",
  "email": "juan@example.com",
  "mobile": "+63 912 345 6789"
}
```
*(At least one of `email` or `mobile` required)*

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "uuid": "a1b2c3...",
    "full_name": "Juan dela Cruz",
    "qr_code_url": "data:image/png;base64,...",
    "scan_url": "http://localhost:5000/scan/a1b2c3.../abc123..."
  }
}
```

#### `POST /api/users/regenerate-qr`
Regenerate QR code for existing user.

**Request body:**
```json
{ "contact": "juan@example.com" }
```

#### `GET /api/users/:uuid`
Get user profile + current QR code.

---

### QR / Scan

#### `GET /api/qrcode/:uuid`
Returns the QR code data URL for a user.

#### `GET /scan/:uuid/:token[?redirect=URL]`
Triggered when QR is scanned.

**Response statuses:**
| `status` field       | Meaning                                |
|----------------------|----------------------------------------|
| `checked_in`         | Attendance recorded successfully       |
| `already_checked_in` | Already scanned today                  |
| `invalid`            | Token doesn't match user               |
| `expired`            | QR code past expiry date               |
| `error`              | Server error                           |

---

### Admin (JWT required: `Authorization: Bearer <token>`)

#### `GET /api/admin/users?search=&limit=50&offset=0`
List all registered users.

#### `GET /api/admin/attendance?search=&date=YYYY-MM-DD&limit=100&offset=0`
List attendance logs with filters.

#### `GET /api/admin/export?date=YYYY-MM-DD&search=`
Download attendance as CSV file.

#### `GET /api/admin/stats`
Returns today / this week / this month counts + 7-day chart data.

---

## 🖥️ Frontend Pages

| Route                  | Description                                      |
|------------------------|--------------------------------------------------|
| `/`                    | User registration + QR code display              |
| `/regenerate`          | Recover lost QR code by email/mobile             |
| `/scan/:uuid/:token`   | Scan result page (redirect-capable)              |
| `/admin/login`         | Admin sign-in                                    |
| `/admin`               | Dashboard: stats, attendance table, user list    |

---

## 🔐 Security Features

| Feature                | Implementation                              |
|------------------------|---------------------------------------------|
| Token validation       | 64-char random hex token per user           |
| JWT auth               | Admin routes protected, 8h expiry           |
| Rate limiting          | 100 req/15min general, 10 req/15min auth    |
| Input validation       | express-validator on all POST routes        |
| Duplicate prevention   | UNIQUE constraint on (user_id, scan_date)   |
| SQL injection          | Parameterized queries (mysql2)              |
| CORS                   | Whitelist frontend origin only              |
| QR expiry (optional)   | `QR_EXPIRES_DAYS` in `.env`                 |

---

## 🌍 Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Set `BASE_URL` to your public domain (e.g., `https://attend.myorg.com`)
3. Set `FRONTEND_URL` to your frontend domain
4. Build frontend: `npm run build` → serve `dist/` via nginx/Caddy
5. Use PM2 to run the backend: `pm2 start server.js --name qr-api`
6. Use HTTPS — QR codes containing `http://` won't scan on iOS camera app

---

## 🎁 Bonus Features Implemented

- [x] QR download as PNG
- [x] Scan success/warning/error animations
- [x] Mobile-friendly responsive UI
- [x] Attendance analytics bar chart (7 days)
- [x] QR expiration option (`QR_EXPIRES_DAYS`)
- [x] Auto-redirect after scan (`?redirect=URL`)
- [x] Copy scan URL to clipboard
