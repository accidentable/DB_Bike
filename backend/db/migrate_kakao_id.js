// db/migrate_kakao_id.js
// kakao_id 컬럼 추가 마이그레이션 스크립트

const pool = require('../src/config/db.config');
const fs = require('fs');
const path = require('path');

const migrateKakaoId = async () => {
  try {
    console.log('kakao_id 컬럼 추가 마이그레이션 시작...');
    
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, 'add_kakao_id.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // SQL 실행
    await pool.query(sql);
    
    console.log('✅ kakao_id 컬럼이 성공적으로 추가되었습니다.');
  } catch (error) {
    if (error.code === '42701') {
      // 컬럼이 이미 존재하는 경우
      console.log('ℹ️  kakao_id 컬럼이 이미 존재합니다.');
    } else {
      console.error('❌ 마이그레이션 에러:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }
};

migrateKakaoId();

