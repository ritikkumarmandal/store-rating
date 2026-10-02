const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const sign = (u) => jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

exports.signup = async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const exists = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (exists.rowCount) return res.status(409).json({ message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,'USER') RETURNING id,name,email,role`,
      [name, email, hash, address || null]);
    res.status(201).json({ token: sign(rows[0]), user: rows[0] });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password, u.password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (e) { next(e); }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { rows } = await pool.query('SELECT password FROM users WHERE id=$1', [req.user.id]);
    if (!(await bcrypt.compare(currentPassword, rows[0].password))) return res.status(400).json({ message: 'Current password is incorrect' });
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [await bcrypt.hash(newPassword, 10), req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { next(e); }
};
