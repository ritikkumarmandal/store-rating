const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { buildSort, addFilters } = require('../utils/query');

exports.dashboard = async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT
      (SELECT COUNT(*) FROM users)::int AS "totalUsers",
      (SELECT COUNT(*) FROM stores)::int AS "totalStores",
      (SELECT COUNT(*) FROM ratings)::int AS "totalRatings"`);
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,address,role',
      [name, email, hash, address || null, role]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Email already exists' });
    next(e);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const params = [];
    const cols = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' };
    const where = addFilters(req, cols, params);
    const sort = buildSort(req, cols, 'name');
    const { rows } = await pool.query(
      `SELECT u.id,u.name,u.email,u.address,u.role FROM users u ${where ? 'WHERE ' + where : ''} ORDER BY ${sort}`, params);
    res.json(rows);
  } catch (e) { next(e); }
};

exports.getUser = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id,u.name,u.email,u.address,u.role,
        CASE WHEN u.role='OWNER' THEN (SELECT ROUND(AVG(r.rating),2)::float FROM ratings r JOIN stores s ON s.id=r.store_id WHERE s.owner_id=u.id) END AS rating
       FROM users u WHERE u.id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

exports.createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;
    if (ownerId) {
      const o = await pool.query("SELECT 1 FROM users WHERE id=$1 AND role='OWNER'", [ownerId]);
      if (!o.rowCount) return res.status(400).json({ message: 'ownerId must belong to a Store Owner user' });
    }
    const { rows } = await pool.query(
      'INSERT INTO stores (name,email,address,owner_id) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, address, ownerId || null]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ message: 'Store email already exists' });
    next(e);
  }
};

exports.listStores = async (req, res, next) => {
  try {
    const params = [];
    const where = addFilters(req, { name: 's.name', email: 's.email', address: 's.address' }, params);
    const sort = buildSort(req, { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' }, 'name');
    const { rows } = await pool.query(
      `SELECT s.id,s.name,s.email,s.address,s.owner_id AS "ownerId",
        COALESCE(ROUND(AVG(r.rating),2),0)::float AS rating
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       ${where ? 'WHERE ' + where : ''} GROUP BY s.id ORDER BY ${sort}`, params);
    res.json(rows);
  } catch (e) { next(e); }
};
