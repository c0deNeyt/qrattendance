const { v4: uuidv4 } = require('uuid');
const crypto         = require('crypto');
const QRCode         = require('qrcode');
const { validationResult } = require('express-validator');
const User           = require('../models/User');
const QrCodeModel    = require('../models/QrCode');

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
const generateToken = () => crypto.randomBytes(32).toString('hex');

const buildScanUrl = (userId, token) => {
  const base = process.env.BASE_URL || 'http://localhost:5000';
  return `${base}/scan/${userId}/${token}`;
};

const makeQRDataUrl = (scanUrl) =>
  QRCode.toDataURL(scanUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });

const expiresAt = () => {
  const days = parseInt(process.env.QR_EXPIRES_DAYS || '0');
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

// ─────────────────────────────────────────────────────────────
//  POST /api/users/register
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { full_name, email, mobile } = req.body;
  if (!email && !mobile) {
    return res.status(422).json({ success: false, message: 'Email or mobile is required' });
  }

  try {
    // Duplicate check
    if (email) {
      const existing = await User.findByEmail(email);
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    if (mobile) {
      const existing = await User.findByMobile(mobile);
      if (existing) return res.status(409).json({ success: false, message: 'Mobile already registered' });
    }

    const uuid   = uuidv4();
    const userId = await User.create({ uuid, full_name, email, mobile });

    // Generate QR
    const token   = generateToken();
    const scanUrl = buildScanUrl(uuid, token);
    const qrData  = await makeQRDataUrl(scanUrl);

    await QrCodeModel.create({ user_id: userId, token, qr_code_url: qrData, expires_at: expiresAt() });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: userId, uuid, full_name, email, mobile, qr_code_url: qrData, scan_url: scanUrl },
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/users/regenerate-qr
// ─────────────────────────────────────────────────────────────
exports.regenerateQr = async (req, res) => {
  const { contact } = req.body;
  if (!contact) {
    return res.status(422).json({ success: false, message: 'Email or mobile required' });
  }

  try {
    const user = await User.findByContact(contact);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete old QR tokens
    await QrCodeModel.deleteByUserId(user.id);

    const token   = generateToken();
    const scanUrl = buildScanUrl(user.uuid, token);
    const qrData  = await makeQRDataUrl(scanUrl);

    await QrCodeModel.create({ user_id: user.id, token, qr_code_url: qrData, expires_at: expiresAt() });

    return res.json({
      success: true,
      message: 'QR code regenerated',
      data: { uuid: user.uuid, full_name: user.full_name, qr_code_url: qrData, scan_url: scanUrl },
    });
  } catch (err) {
    console.error('[regenerateQr]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/users/:uuid
// ─────────────────────────────────────────────────────────────
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByUuid(req.params.uuid);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const qr = await QrCodeModel.findByUserId(user.id);

    return res.json({
      success: true,
      data: {
        id: user.id, uuid: user.uuid, full_name: user.full_name,
        email: user.email, mobile: user.mobile, created_at: user.created_at,
        qr_code_url: qr?.qr_code_url || null,
      },
    });
  } catch (err) {
    console.error('[getUser]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/qrcode/:uuid
// ─────────────────────────────────────────────────────────────
exports.getQrCode = async (req, res) => {
  try {
    const user = await User.findByUuid(req.params.uuid);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const qr = await QrCodeModel.findByUserId(user.id);
    if (!qr) return res.status(404).json({ success: false, message: 'QR code not found' });

    return res.json({ success: true, data: { qr_code_url: qr.qr_code_url } });
  } catch (err) {
    console.error('[getQrCode]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
