const db = require('../config/db');

const Attendance = {
  async log({ user_id, scan_date, scan_time, ip_address }) {
    const [result] = await db.execute(
      `INSERT INTO attendance_logs (user_id, scan_date, scan_time, ip_address)
       VALUES (?, ?, ?, ?)`,
      [user_id, scan_date, scan_time, ip_address || null]
    );
    return result.insertId;
  },

  async existsToday(user_id, scan_date) {
    const [[{ total }]] = await db.execute(
      'SELECT COUNT(*) AS total FROM attendance_logs WHERE user_id = ? AND scan_date = ?',
      [user_id, scan_date]
    );
    return total > 0;
  },

  async getAll({ date = null, search = '', limit = 100, offset = 0 } = {}) {
    const like = `%${search}%`;
    const params = [like, like, like];
    let dateFilter = '';
    if (date) {
      dateFilter = 'AND al.scan_date = ?';
      params.push(date);
    }
    params.push(limit, offset);

    const [rows] = await db.execute(
      `SELECT al.id, al.scan_date, al.scan_time, al.ip_address, al.created_at,
              u.uuid, u.full_name, u.email, u.mobile
       FROM attendance_logs al
       JOIN users u ON u.id = al.user_id
       WHERE (u.full_name LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)
       ${dateFilter}
       ORDER BY al.scan_date DESC, al.scan_time DESC
       LIMIT ? OFFSET ?`,
      params
    );
    return rows;
  },

  async count({ date = null, search = '' } = {}) {
    const like = `%${search}%`;
    const params = [like, like, like];
    let dateFilter = '';
    if (date) {
      dateFilter = 'AND al.scan_date = ?';
      params.push(date);
    }
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM attendance_logs al
       JOIN users u ON u.id = al.user_id
       WHERE (u.full_name LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)
       ${dateFilter}`,
      params
    );
    return total;
  },

  async getStats() {
    const [[{ today }]] = await db.execute(
      `SELECT COUNT(*) AS today FROM attendance_logs WHERE scan_date = CURDATE()`
    );
    const [[{ thisWeek }]] = await db.execute(
      `SELECT COUNT(*) AS thisWeek FROM attendance_logs
       WHERE scan_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    const [[{ thisMonth }]] = await db.execute(
      `SELECT COUNT(*) AS thisMonth FROM attendance_logs
       WHERE MONTH(scan_date) = MONTH(CURDATE()) AND YEAR(scan_date) = YEAR(CURDATE())`
    );
    // Last 7 days daily counts
    const [daily] = await db.execute(
      `SELECT scan_date, COUNT(*) AS count
       FROM attendance_logs
       WHERE scan_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY scan_date
       ORDER BY scan_date ASC`
    );
    return { today, thisWeek, thisMonth, daily };
  },
};

module.exports = Attendance;
