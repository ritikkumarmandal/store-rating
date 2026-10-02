require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');
(async () => {
  const hash = await bcrypt.hash('Admin@123', 10);
  await pool.query(
    `INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,'ADMIN') ON CONFLICT (email) DO NOTHING`,
    ['System Administrator Account', 'admin@example.com', hash, 'Head Office']
  );
  console.log('Seeded admin: admin@example.com / Admin@123');
  await pool.end();
})();
