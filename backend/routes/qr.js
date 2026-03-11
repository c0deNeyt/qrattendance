const express = require('express');
const { getQrCode } = require('../controllers/userController');
const { scan }      = require('../controllers/scanController');
const { scanLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// QR code data for a user
router.get('/qrcode/:uuid', getQrCode);

// Scan endpoint — called when QR is scanned
router.get('/scan/:uuid/:token', scanLimiter, scan);

module.exports = router;
