const { Pool } = require('pg');
require('dotenv').config();

const getPassword = () => {
  const pwd = process.env.PGPASSWORD || process.env.DB_PASSWORD || '';
  return pwd === '' ? null : pwd;
};

const pass = getPassword();
const poolConfig = {
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  database: process.env.PGDATABASE || process.env.DB_NAME || 'ddareung',
};
if (pass !== null) poolConfig.password = pass;
const pool = new Pool(poolConfig);

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};


