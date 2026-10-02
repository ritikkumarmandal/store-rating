const pool = require('../config/db');
const { buildSort, addFilters } = require('../utils/query');

exports.listStores = async (req, res, next) => {
  try {
    const params = [req.user.id];
    const where = addFilters(req, { name: 's.name', address: 's.address' }, params);
    const sort = buildSort(req, { name: 's.name', address: 's.address', rating: 'rating' }, 'name');
    const { rows } = await pool.query(
      `SELECT s.id,s.name,s.address,
        COALESCE(ROUND(AVG(r.rating),2),0)::float AS rating,
        MAX(CASE WHEN r.user_id=$1 THEN r.rating END) AS "myRating"
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       ${where ? 'WHERE ' + where : ''} GROUP BY s.id ORDER BY ${sort}`, params);
    res.json(rows);
  } catch (e) { next(e); }
};

// Upsert: submit a new rating or modify the existing one.
exports.rateStore = async (req, res, next) => {
  try {
    const store = await pool.query('SELECT 1 FROM stores WHERE id=$1', [req.params.storeId]);
    if (!store.rowCount) return res.status(404).json({ message: 'Store not found' });
    const { rows } = await pool.query(
      `INSERT INTO ratings (user_id,store_id,rating) VALUES ($1,$2,$3)
       ON CONFLICT (user_id,store_id) DO UPDATE SET rating=EXCLUDED.rating, updated_at=now() RETURNING *`,
      [req.user.id, req.params.storeId, req.body.rating]);
    res.json(rows[0]);
  } catch (e) { next(e); }
};
