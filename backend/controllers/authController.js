const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User     = require('../models/User');

/**
 * POST /api/login
 * Admin login with email + password.
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, uuid: user.uuid, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, uuid: user.uuid, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
