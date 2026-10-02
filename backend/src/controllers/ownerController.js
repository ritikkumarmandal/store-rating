const pool = require('../config/db');
const { buildSort } = require('../utils/query');

exports.dashboard = async (req, res, next) => {
  try {
    const store = await pool.query(
      `SELECT s.id,s.name,s.address,COALESCE(ROUND(AVG(r.rating),2),0)::float AS "averageRating", COUNT(r.id)::int AS "totalRatings"
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id WHERE s.owner_id=$1 GROUP BY s.id`, [req.user.id]);
    if (!store.rows[0]) return res.json({ store: null, raters: [] });
    const sort = buildSort(req, { name: 'u.name', email: 'u.email', rating: 'r.rating' }, 'name');
    const raters = await pool.query(
      `SELECT u.id,u.name,u.email,r.rating,r.updated_at AS "ratedAt"
       FROM ratings r JOIN users u ON u.id=r.user_id WHERE r.store_id=$1 ORDER BY ${sort}`, [store.rows[0].id]);
    res.json({ store: store.rows[0], raters: raters.rows });
  } catch (e) { next(e); }
};
