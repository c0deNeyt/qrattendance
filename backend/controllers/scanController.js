const User       = require('../models/User');
const QrCodeModel= require('../models/QrCode');
const Attendance = require('../models/Attendance');

/**
 * GET /scan/:uuid/:token[?redirect=URL]
 *
 * Flow:
 *  1. Validate UUID + token
 *  2. Check expiry
 *  3. Check duplicate today
 *  4. Log attendance
 *  5. Return JSON result (frontend handles display)
 */
exports.scan = async (req, res) => {
  const { uuid, token } = req.params;
  const redirectUrl     = req.query.redirect || null;
  const ip              = req.ip || req.connection?.remoteAddress || null;

  try {
    // 1. Find user
    const user = await User.findByUuid(uuid);
    if (!user) {
      return res.status(404).json({ success: false, status: 'invalid', message: 'Unknown QR code' });
    }

    // 2. Validate token
    const qr = await QrCodeModel.findByToken(token);
    if (!qr || qr.user_id !== user.id) {
      return res.status(401).json({ success: false, status: 'invalid', message: 'Invalid QR token' });
    }

    // 3. Check expiry
    if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
      return res.status(401).json({ success: false, status: 'expired', message: 'QR code has expired' });
    }

    // 4. Build today's date (UTC)
    const now      = new Date();
    const scanDate = now.toISOString().slice(0, 10);          // YYYY-MM-DD
    const scanTime = now.toISOString().slice(11, 19);         // HH:MM:SS

    // 5. Duplicate check
    const alreadyIn = await Attendance.existsToday(user.id, scanDate);
    if (alreadyIn) {
      return res.json({
        success: true,
        status: 'already_checked_in',
        message: 'Already checked in today',
        data: {
          full_name: user.full_name,
          scan_date: scanDate,
          redirect: redirectUrl,
        },
      });
    }

    // 6. Record attendance
    await Attendance.log({ user_id: user.id, scan_date: scanDate, scan_time: scanTime, ip_address: ip });

    return res.json({
      success: true,
      status: 'checked_in',
      message: 'Attendance recorded successfully',
      data: {
        full_name: user.full_name,
        scan_date: scanDate,
        scan_time: scanTime,
        redirect: redirectUrl,
      },
    });
  } catch (err) {
    console.error('[scan]', err);
    return res.status(500).json({ success: false, status: 'error', message: 'Server error' });
  }
};
