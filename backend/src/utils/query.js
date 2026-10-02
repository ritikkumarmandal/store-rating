// Sort columns are whitelisted to prevent SQL injection; filter values are parameterised.
exports.buildSort = (req, allowed, fallback) => {
  const col = allowed[req.query.sortBy] || allowed[fallback];
  const dir = String(req.query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return `${col} ${dir}`;
};
exports.addFilters = (req, map, params) => {
  const clauses = [];
  for (const [key, expr] of Object.entries(map)) {
    const v = req.query[key];
    if (!v) continue;
    if (key === 'role') { params.push(v); clauses.push(`${expr} = $${params.length}::user_role`); }
    else { params.push(`%${v}%`); clauses.push(`${expr} ILIKE $${params.length}`); }
  }
  return clauses.join(' AND ');
};
