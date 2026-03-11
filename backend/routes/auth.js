// ── routes/auth.js ───────────────────────────────────────────
const express = require('express');
const { body } = require('express-validator');
const { login } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/login',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  login
);

module.exports = router;
