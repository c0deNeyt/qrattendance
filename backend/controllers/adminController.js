const { Parser } = require('json2csv');
const User       = require('../models/User');
const Attendance = require('../models/Attendance');

// ─────────────────────────────────────────────────────────────
//  GET /api/admin/users
// ─────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const limit  = Math.min(parseInt(req.query.limit  || '50'), 200);
    const offset = parseInt(req.query.offset || '0');

    const [users, total] = await Promise.all([
      User.getAll({ search, limit, offset }),
      User.count(search),
    ]);

    return res.json({ success: true, data: users, total, limit, offset });
  } catch (err) {
    console.error('[admin.getUsers]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/admin/attendance
// ─────────────────────────────────────────────────────────────
exports.getAttendance = async (req, res) => {
  try {
    const { search = '', date = null } = req.query;
    const limit  = Math.min(parseInt(req.query.limit  || '100'), 500);
    const offset = parseInt(req.query.offset || '0');

    const [records, total, stats] = await Promise.all([
      Attendance.getAll({ date, search, limit, offset }),
      Attendance.count({ date, search }),
      Attendance.getStats(),
    ]);

    return res.json({ success: true, data: records, total, limit, offset, stats });
  } catch (err) {
    console.error('[admin.getAttendance]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/admin/export
// ─────────────────────────────────────────────────────────────
exports.exportAttendance = async (req, res) => {
  try {
    const { date = null, search = '' } = req.query;

    const records = await Attendance.getAll({ date, search, limit: 100000, offset: 0 });

    const fields = [
      { label: 'Full Name',     value: 'full_name'  },
      { label: 'Email',         value: 'email'      },
      { label: 'Mobile',        value: 'mobile'     },
      { label: 'Date',          value: 'scan_date'  },
      { label: 'Time',          value: 'scan_time'  },
      { label: 'IP Address',    value: 'ip_address' },
    ];

    const parser = new Parser({ fields });
    const csv    = parser.parse(records);

    const filename = `attendance_${date || 'all'}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csv);
  } catch (err) {
    console.error('[admin.exportAttendance]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET /api/admin/stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const stats = await Attendance.getStats();
    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('[admin.getStats]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
