const db = require('../config/db');

const QrCode = {
  async create({ user_id, token, qr_code_url, expires_at = null }) {
    const [result] = await db.execute(
      `INSERT INTO qr_codes (user_id, token, qr_code_url, expires_at)
       VALUES (?, ?, ?, ?)`,
      [user_id, token, qr_code_url, expires_at]
    );
    return result.insertId;
  },

  async findByUserId(user_id) {
    const [rows] = await db.execute(
      'SELECT * FROM qr_codes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [user_id]
    );
    return rows[0] || null;
  },

  async findByToken(token) {
    const [rows] = await db.execute(
      'SELECT * FROM qr_codes WHERE token = ?',
      [token]
    );
    return rows[0] || null;
  },

  async deleteByUserId(user_id) {
    await db.execute('DELETE FROM qr_codes WHERE user_id = ?', [user_id]);
  },
};

module.exports = QrCode;
