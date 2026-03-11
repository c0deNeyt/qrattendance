const db = require('../config/db');

const User = {
  async create({ uuid, full_name, email, mobile, password = null, role = 'user' }) {
    const [result] = await db.execute(
      `INSERT INTO users (uuid, full_name, email, mobile, password, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuid, full_name, email || null, mobile || null, password, role]
    );
    return result.insertId;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByUuid(uuid) {
    const [rows] = await db.execute('SELECT * FROM users WHERE uuid = ?', [uuid]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByMobile(mobile) {
    const [rows] = await db.execute('SELECT * FROM users WHERE mobile = ?', [mobile]);
    return rows[0] || null;
  },

  async findByContact(contact) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? OR mobile = ?',
      [contact, contact]
    );
    return rows[0] || null;
  },

  async getAll({ search = '', limit = 50, offset = 0 } = {}) {
    const like = `%${search}%`;
    const [rows] = await db.execute(
      `SELECT id, uuid, full_name, email, mobile, role, created_at
       FROM users
       WHERE full_name LIKE ? OR email LIKE ? OR mobile LIKE ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [like, like, like, limit, offset]
    );
    return rows;
  },

  async count(search = '') {
    const like = `%${search}%`;
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM users
       WHERE full_name LIKE ? OR email LIKE ? OR mobile LIKE ?`,
      [like, like, like]
    );
    return total;
  },
};

module.exports = User;
