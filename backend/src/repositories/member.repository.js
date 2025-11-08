/**
 * src/repositories/member.repository.js
 * 회원(Member) 데이터베이스 접근 계층 (Repository/DAO)
 * 
 * 역할: 데이터베이스와 직접 통신하는 계층입.
 * - SQL 쿼리 실행
 * - 데이터베이스 결과를 JavaScript 객체로 변환
 * - 에러 처리 및 로깅
 * 
 * 아키텍처:
 *   - 계층형 아키텍처의 Repository 패턴을 따흠.
 *   - Service 계층에서 이 Repository를 호출.
 *   - 데이터베이스 구현 세부사항을 Service 계층으로부터 숨김.
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
   * 새 사용자 생성 (회원가입)
   * 
   * @param {string} username - 사용자명 (UNIQUE 제약조건)
   * @param {string} email - 이메일 주소 (UNIQUE 제약조건)
   * @param {string} hashedPassword - bcrypt로 암호화된 비밀번호
   * @returns {Promise<Object>} - 생성된 사용자 정보 (비밀번호 제외)
   *   
   * 사용 시나리오:
   *   - 회원가입 시 새 사용자 생성
   * 
   * SQL 쿼리:
   *   INSERT INTO members (username, email, password, role)
   *   VALUES ($1, $2, $3, 'user')
   *   RETURNING member_id, email, username, role;
   *   
   *   - RETURNING 절을 사용하여 INSERT 후 생성된 레코드의 특정 컬럼만 반환
   *   - 비밀번호는 보안상 반환하지 않음
   *   - role은 기본값 'user'로 설정
   */
  createUser: async (username, email, hashedPassword) => {
    try {
      // SQL 쿼리 작성
      // INSERT 문을 사용하여 새 레코드를 삽입.
      // RETURNING 절을 사용하여 삽입된 레코드의 특정 컬럼만 반환.
      const query = `
        INSERT INTO members (username, email, password, role)
        VALUES ($1, $2, $3, 'user')
        RETURNING member_id, email, username, role;
      `;
      
      // 쿼리 파라미터 배열
      // 순서대로 $1, $2, $3에 바인딩.
      const values = [username, email, hashedPassword];
      
      // 쿼리 실행
      const { rows } = await pool.query(query, values);
      
      // RETURNING 절로 인해 삽입된 레코드의 정보가 반환.
      // rows[0]에는 member_id, email, username, role이 포함.
      // password는 보안상 반환하지 않는다.
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

  // 향후 추가될 수 있는 함수들:
  // - updateUser: 사용자 정보 수정
  // - updatePassword: 비밀번호 변경
  // - deleteUser: 사용자 삭제
  // - findById: ID로 사용자 조회
  // - findAll: 모든 사용자 조회 (관리자용)
};

// Repository 객체를 모듈로 내보내기 (services에서 사용)
module.exports = memberRepository;
