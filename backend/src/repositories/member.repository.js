// src/repositories/member.repository.js
// [cite: 280] Repository (DAO - DB SQL 실행)

const pool = require('../config/db.config'); // 1번에서 만든 DB 풀 가져오기

const memberRepository = {
  /**
   * 이메일로 사용자 찾기 (로그인 시 사용)
   */
  findByEmail: async (email) => {
    try {
      const query = 'SELECT * FROM members WHERE email = $1';
      const { rows } = await pool.query(query, [email]);
      return rows[0]; // 찾은 사용자 반환 (없으면 undefined)
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  /**
   * 새 사용자 생성 (회원가입 시 사용)
   */
  createUser: async (username, email, hashedPassword, phone, studentId) => {
    try {
      // PDF의 마이그레이션 요구사항 [cite: 43]
      const query = `
        INSERT INTO members (username, email, password, phone, student_id, role)
        VALUES ($1, $2, $3, $4, $5, 'user')
        RETURNING member_id, email, username, role;
      `;
      const values = [username, email, hashedPassword, phone, studentId];
      const { rows } = await pool.query(query, values);
      return rows[0]; // 생성된 사용자 정보 반환
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // ... (프로필 수정, 비밀번호 변경 등 members 테이블 관련 모든 SQL 함수들) ...
};

module.exports = memberRepository;