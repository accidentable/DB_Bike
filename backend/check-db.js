
// check-db.js
const pool = require('./src/config/db.config');

async function checkConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ 데이터베이스에 성공적으로 연결되었습니다.');
    
    // 간단한 쿼리 테스트
    const res = await client.query('SELECT NOW()');
    console.log('🕒 현재 시간:', res.rows[0].now);

  } catch (err) {
    console.error('❌ 데이터베이스 연결 오류:', err.stack);
  } finally {
    if (client) {
      client.release();
      console.log('ℹ️ 클라이언트 연결이 해제되었습니다.');
    }
    pool.end(); // 테스트 후 풀 종료
    console.log('ℹ️ 데이터베이스 풀이 종료되었습니다.');
  }
}

checkConnection();
