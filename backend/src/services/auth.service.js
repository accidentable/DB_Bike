/**
 * 
 * 의존성:
 *   - memberRepository: 데이터베이스 접근을 위한 Repository
 *   - bcrypt: 비밀번호 암호화/검증 라이브러리
 *   - jsonwebtoken: JWT 토큰 생성/검증 라이브러리
 */

const memberRepository = require('../repositories/member.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authService = {
  /**
   * 로그인 비즈니스 로직
   * 
   * @param {string} email - 사용자 이메일 주소
   * @param {string} password - 사용자가 입력한 평문 비밀번호
   * @returns {Promise<Object>} - 토큰과 사용자 정보를 포함한 객체
   *   {
   *     token: string,        // JWT 인증 토큰
   *     user: {
   *       email: string,       // 사용자 이메일
   *       username: string,    // 사용자명
   *       role: string        // 사용자 역할
   *     }
   *   }
   * @throws {Error} - 사용자를 찾을 수 없거나 비밀번호가 일치하지 않을 때
   * 
   */
  login: async (email, password) => {
 
    // 1단계: 이메일로 사용자 조회
    const user = await memberRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('User not found.');
    }

    // 2단계: 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // 비밀번호가 일치하지 않으면 에러 발생
    if (!isPasswordValid) {
      throw new Error('Invalid password.');
    }

    // 3단계: JWT 토큰 생성
    const token = jwt.sign(
      { 
        memberId: user.member_id,  // 사용자 고유 ID
        email: user.email,          // 사용자 이메일
        role: user.role             // 사용자 역할 (user/admin)
      },
      process.env.JWT_SECRET_KEY,   // .env 파일의 시크릿 키
      { expiresIn: '1h' }           // 토큰 유효기간: 1시간
    );

    // 4단계: 결과 반환
    return { 
      token,  // 클라이언트가 이후 요청에 사용할 인증 토큰
      user: { 
        member_id: user.member_id, // 사용자 ID (추가!)
        email: user.email,      // 사용자 이메일
        username: user.username, // 사용자명
        role: user.role          // 사용자 역할
      } 
    };
  },

  /**
   * 회원가입 비즈니스 로직
   * 
   * @param {string} username - 사용자명 (고유값)
   * @param {string} email - 이메일 주소 (고유값)
   * @param {string} password - 평문 비밀번호 (최소 6자 이상)
   * @returns {Promise<Object>} - 생성된 사용자 정보
   *   {
   *     member_id: number,    // 생성된 사용자 ID
   *     email: string,        // 사용자 이메일
   *     username: string,     // 사용자명
   *     role: string         // 기본값: 'user'
   *   }
   * @throws {Error} - 이메일이 이미 사용 중일 때
   */
  signup: async (username, email, password) => {
 
    // 1단계: 이메일 중복 확인
    const existingUser = await memberRepository.findByEmail(email);
    
    // 이미 사용 중인 이메일이면 에러 발생
    if (existingUser) {
      throw new Error('Email already in use.');
    }

    // 2단계: 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3단계: Repository를 통해 사용자 생성
    // role은 기본값 'user'로 설정
    const newUser = await memberRepository.createUser(
      username,        // 사용자명
      email,           // 이메일
      hashedPassword   // 암호화된 비밀번호
    );
    
    // 4단계: 생성된 사용자 정보 반환
    return newUser;
  },
};

// 서비스 객체를 모듈로 내보내기 (routes에서 사용)
module.exports = authService;
