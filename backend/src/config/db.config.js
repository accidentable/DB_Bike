// src/config/db.config.js
// PostgreSQL Pool 연결 설정

const { Pool } = require('pg');
require('dotenv').config(); // .env 파일의 변수 로드

// .env 파일의 정보를 기반으로 DB 연결 풀 생성
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log('DB ENV:', process.env.DB_USER, process.env.DB_NAME, process.env.DB_HOST, process.env.DB_PORT);


// 다른 파일(주로 repositories)에서 이 pool을 가져다 쓸 수 있도록 내보내기
module.exports = pool;

pool.connect()
  .then(() => console.log('✅ PostgreSQL 연결 성공'))
  .catch(err => console.error('❌ PostgreSQL 연결 실패:', err.message));
