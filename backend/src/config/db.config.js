// src/config/db.config.js

const { Pool } = require('pg');
// .env 파일을 읽어오도록 수정
require('dotenv').config(); 

const pool = new Pool({
  // 하드코딩 대신 process.env 변수를 읽도록 수정
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;