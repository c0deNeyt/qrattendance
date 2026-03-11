require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes  = require('./routes/auth');
const userRoutes  = require('./routes/users');
const qrRoutes    = require('./routes/qr');
const adminRoutes = require('./routes/admin');

// Bootstrap DB connection
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.set('trust proxy', 1);

app.use(cors({
  origin:      [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api',            authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api',            qrRoutes);
app.use('/api/admin',      adminRoutes);

// Scan shorthand: /scan/:uuid/:token
app.get('/scan/:uuid/:token', require('./controllers/scanController').scan);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Unhandled]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀  QR Attendance API running on http://localhost:${PORT}`);
  console.log(`    Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`    Base URL    : ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});
