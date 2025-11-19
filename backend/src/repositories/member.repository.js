/**
 * src/repositories/member.repository.js
 * 회원(Member) 데이터베이스 접근 계층 (Repository/DAO)
 * 
 * 역할: 데이터베이스와 직접 통신하는 계층입니다.
 * - SQL 쿼리 실행
 * - 데이터베이스 결과를 JavaScript 객체로 변환
 * - 에러 처리 및 로깅
 * 
 * 아키텍처:
 *   - 계층형 아키텍처의 Repository 패턴을 따릅니다.
 *   - Service 계층에서 이 Repository를 호출합니다.
 *   - 데이터베이스 구현 세부사항을 Service 계층으로부터 숨깁니다.
 * 
 * 의존성:
 *   - db.config: PostgreSQL 연결 풀 (Pool 객체)
 */

const pool = require('../config/db.config'); // PostgreSQL 연결 풀 가져오기

const memberRepository = {
  /**
   * 이메일로 사용자 조회
   * 
   * @param {string} email - 조회할 사용자의 이메일 주소
   * @returns {Promise<Object|undefined>} - 사용자 정보 객체 또는 undefined
   * 
   * 사용 시나리오:
   *   - 로그인 시 이메일로 사용자 확인
   *   - 회원가입 시 이메일 중복 확인
   * 
   * SQL 쿼리:
   *   SELECT * FROM members WHERE email = $1
   *   - $1은 PostgreSQL의 파라미터화된 쿼리 (SQL 인젝션 방지)
   */

  findByEmail: async (email) => {
    try {
      // SQL 쿼리 작성
      // $1은 파라미터화된 쿼리로, SQL 인젝션 공격을 방지합니다.
      const query = 'SELECT * FROM members WHERE email = $1';
      
      // pool.query를 사용하여 쿼리 실행
      // 첫 번째 인자: SQL 쿼리 문자열
      // 두 번째 인자: 쿼리 파라미터 배열 [$1, $2, ...]
      const { rows } = await pool.query(query, [email]);
      
      // rows는 결과 배열입니다.
      // 이메일은 UNIQUE 제약조건이 있으므로 0개 또는 1개의 결과만 반환됩니다.
      // rows[0]은 첫 번째 결과 객체이거나, 결과가 없으면 undefined입니다.
      return rows[0];
      
    } catch (error) {
      // 에러 발생 시 콘솔에 로그 출력
      // 실제 운영 환경에서는 더 정교한 로깅 시스템을 사용하는 것이 좋습니다.
      console.error('Error finding user by email:', error);
      
      // 에러를 다시 throw하여 Service 계층에서 처리할 수 있도록 합니다.
      throw error;
    }
  },

  /**
   * 사용자명으로 사용자 조회
   * 
   * @param {string} username - 조회할 사용자의 이름
   * @returns {Promise<Object|undefined>} - 사용자 정보 객체 또는 undefined
   */
  findByUsername: async (username) => {
    try {
      const query = 'SELECT * FROM members WHERE username = $1';
      const { rows } = await pool.query(query, [username]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  },

  /**
   * 카카오 ID로 사용자 조회
   * 
   * @param {number} kakaoId - 카카오 사용자 ID
   * @returns {Promise<Object|undefined>} - 사용자 정보 객체 또는 undefined
   */
  findByKakaoId: async (kakaoId) => {
    try {
      const query = 'SELECT * FROM members WHERE kakao_id = $1';
      const { rows } = await pool.query(query, [kakaoId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by kakao_id:', error);
      throw error;
    }
  },

  /**
   * 새 사용자 생성 (회원가입)
   * 
   * @param {string} username - 사용자명 (UNIQUE 제약조건)
   * @param {string} email - 이메일 주소 (UNIQUE 제약조건)
   * @param {string} hashedPassword - bcrypt로 암호화된 비밀번호
   * @param {string} role - 사용자 역할 (기본값: 'user')
   * @param {number} kakaoId - 카카오 사용자 ID (선택)
   * @returns {Promise<Object>} - 생성된 사용자 정보 (비밀번호 제외)
   *   
   * 사용 시나리오:
   *   - 회원가입 시 새 사용자 생성
   * 
   * SQL 쿼리:
   *   INSERT INTO members (username, email, password, role, point_balance, kakao_id)
   *   VALUES ($1, $2, $3, $4, 5000, $5)
   *   RETURNING member_id, email, username, role, point_balance;
   *   
   *   - RETURNING 절을 사용하여 INSERT 후 생성된 레코드의 특정 컬럼만 반환
   *   - 비밀번호는 보안상 반환하지 않음
   *   - role은 기본값 'user'로 설정
   */
  createUser: async (username, email, hashedPassword, role = 'user', kakaoId = null) => {
    try {
      // SQL 쿼리 작성
      // INSERT 문을 사용하여 새 레코드를 삽입합니다.
      // RETURNING 절을 사용하여 삽입된 레코드의 특정 컬럼만 반환합니다.
      const query = `
        INSERT INTO members (username, email, password, role, point_balance, kakao_id)
        VALUES ($1, $2, $3, $4, 5000, $5)
        RETURNING member_id, email, username, role, point_balance;
      `;
      
      // 쿼리 파라미터 배열
      // 순서대로 $1, $2, $3, $4, $5에 바인딩합니다.
      const values = [username, email, hashedPassword, role, kakaoId];
      
      // 쿼리 실행
      const { rows } = await pool.query(query, values);
      
      // RETURNING 절로 인해 삽입된 레코드의 정보가 반환됩니다.
      // rows[0]에는 member_id, email, username, role이 포함됩니다.
      // password는 보안상 반환하지 않습니다.
      return rows[0];
      
    } catch (error) {
      // 에러 발생 시 로그 출력
      // 가능한 에러:
      //   - UNIQUE 제약조건 위반 (username 또는 email 중복)
      //   - 데이터베이스 연결 오류
      //   - 기타 SQL 오류
      console.error('Error creating user:', error);
      
      // 에러를 다시 throw하여 Service 계층에서 처리할 수 있도록 합니다.
      throw error;
    }
  },

  /**
   * 사용자 역할 업데이트
   *
   * @param {number} memberId - 사용자 ID
   * @param {string} role - 변경할 역할
   * @returns {Promise<Object>} - 업데이트된 사용자 정보
   */
  updateRole: async (memberId, role) => {
    try {
      const query = `
        UPDATE members
        SET role = $1
        WHERE member_id = $2
        RETURNING member_id, email, username, role, point_balance;
      `;
      const { rows } = await pool.query(query, [role, memberId]);
      return rows[0];
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  /**
   * 모든 사용자 조회 (관리자용)
   * 
   * @returns {Promise<Array>} - 모든 사용자 배열
   */
  findAll: async () => {
    try {
      const query = `
        SELECT 
          member_id, 
          username, 
          email, 
          role, 
          point_balance,
          created_at,
          last_bike_id
        FROM members 
        ORDER BY created_at DESC
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  },

  /**
   * ID로 사용자 조회
   * 
   * @param {number} memberId - 사용자 ID
   * @returns {Promise<Object|undefined>} - 사용자 정보 객체 또는 undefined
   */
  findById: async (memberId) => {
    try {
      const query = 'SELECT * FROM members WHERE member_id = $1';
      const { rows } = await pool.query(query, [memberId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  /**
   * 사용자 정보 업데이트
   * 
   * @param {number} memberId - 사용자 ID
   * @param {Object} userData - 업데이트할 데이터
   * @returns {Promise<Object>} - 업데이트된 사용자 정보
   */
  update: async (memberId, userData) => {
    try {
      const { username, email, role, point_balance } = userData;
      const query = `
        UPDATE members
        SET 
          username = COALESCE($1, username),
          email = COALESCE($2, email),
          role = COALESCE($3, role),
          point_balance = COALESCE($4, point_balance)
        WHERE member_id = $5
        RETURNING member_id, username, email, role, point_balance, created_at;
      `;
      const values = [username, email, role, point_balance, memberId];
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * 사용자 삭제
   * 
   * @param {number} memberId - 삭제할 사용자 ID
   * @returns {Promise<void>}
   */
  delete: async (memberId) => {
    try {
      const query = 'DELETE FROM members WHERE member_id = $1';
      await pool.query(query, [memberId]);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * 카카오 ID 업데이트
   * 
   * @param {number} memberId - 사용자 ID
   * @param {number} kakaoId - 카카오 사용자 ID
   * @returns {Promise<Object>} - 업데이트된 사용자 정보
   */
  updateKakaoId: async (memberId, kakaoId) => {
    try {
      const query = `
        UPDATE members
        SET kakao_id = $1
        WHERE member_id = $2
        RETURNING member_id, email, username, role, point_balance;
      `;
      const { rows } = await pool.query(query, [kakaoId, memberId]);
      return rows[0];
    } catch (error) {
      console.error('Error updating kakao_id:', error);
      throw error;
    }
  }

  // 향후 추가될 수 있는 함수들:
  // - updatePassword: 비밀번호 변경
};

// Repository 객체를 모듈로 내보내기 (services에서 사용)
module.exports = memberRepository;
