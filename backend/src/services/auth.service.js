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
const emailService = require('./email.service');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'dev-secret-key';

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

    // 2-1단계: 이메일 규칙 기반 관리자 역할 부여
    const isAdminEmail = email.toLowerCase().startsWith('admin');
    if (isAdminEmail && user.role !== 'admin') {
      const updatedUser = await memberRepository.updateRole(user.member_id, 'admin');
      if (updatedUser) {
        user.role = updatedUser.role;
      } else {
        user.role = 'admin';
      }
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
      JWT_SECRET,   // .env 파일의 시크릿 키
      { expiresIn: '1h' }           // 토큰 유효기간: 1시간
    );

    // 4단계: 결과 반환 - 응답 구조 통일
    return {
      token: token,  // 클라이언트가 이후 요청에 사용할 인증 토큰
      user: {
        member_id: user.member_id,
        email: user.email,
        username: user.username,
        role: user.role,
        point_balance: typeof user.point_balance === 'number' ? user.point_balance : 0,
        isAdmin: user.role === 'admin' // isAdmin 플래그 추가
      }
    };
  },

  /**
   * 회원가입 비즈니스 로직
   * 
   * @param {string} username - 사용자명 (고유값)
   * @param {string} email - 이메일 주소 (고유값)
   * @param {string} password - 평문 비밀번호 (최소 6자 이상)
   * @param {boolean} skipEmailVerification - 이메일 인증 건너뛰기 (카카오 로그인 등)
   * @returns {Promise<Object>} - 생성된 사용자 정보
   *   {
   *     member_id: number,    // 생성된 사용자 ID
   *     email: string,        // 사용자 이메일
   *     username: string,     // 사용자명
   *     role: string         // 기본값: 'user'
   *   }
   * @throws {Error} - 이메일이 이미 사용 중일 때, 이메일 인증이 완료되지 않았을 때
   */
  signup: async (username, email, password, skipEmailVerification = false) => {
 
    // 1단계: 이메일 중복 확인
    const existingUserByEmail = await memberRepository.findByEmail(email);
    
    // 이미 사용 중인 이메일이면 에러 발생
    if (existingUserByEmail) {
      throw new Error('Email already in use.');
    }

    // 2단계: 사용자명 중복 확인
    const existingUserByUsername = await memberRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('Username already in use.');
    }

    // 3단계: 이메일 인증 확인 (skipEmailVerification이 false인 경우)
    if (!skipEmailVerification && !emailService.isEmailVerified(email)) {
      throw new Error('Email verification is required.');
    }

    // 4단계: 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdminEmail = email.toLowerCase().startsWith('admin');
    const role = isAdminEmail ? 'admin' : 'user';

    // 5단계: Repository를 통해 사용자 생성
    // role은 기본값 'user'로 설정
    const newUser = await memberRepository.createUser(
      username,        // 사용자명
      email,           // 이메일
      hashedPassword,  // 암호화된 비밀번호
      role
    );
    
    // 6단계: 회원가입 완료 후 인증 코드 삭제
    emailService.deleteVerificationCode(email);
    
    // 7단계: 생성된 사용자 정보 반환
    return newUser;
  },

  /**
   * 카카오 로그인/회원가입
   * 
   * @param {string} accessToken - 카카오 액세스 토큰
   * @returns {Promise<Object>} - 토큰과 사용자 정보를 포함한 객체
   */
  kakaoLogin: async (accessToken) => {
    try {
      // 1단계: 카카오 API로 사용자 정보 가져오기
      const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      });

      if (!kakaoResponse.ok) {
        throw new Error('카카오 인증에 실패했습니다.');
      }

      const kakaoUser = await kakaoResponse.json();
      const kakaoId = kakaoUser.id;
      const kakaoEmail = kakaoUser.kakao_account?.email;
      const kakaoNickname = kakaoUser.kakao_account?.profile?.nickname || `카카오${kakaoId}`;

      // 2단계: 카카오 ID로 기존 사용자 찾기
      let user = await memberRepository.findByKakaoId(kakaoId);

      if (!user) {
        // 3단계: 기존 사용자가 없으면 회원가입
        // 이메일이 있으면 이메일로도 확인
        if (kakaoEmail) {
          const existingUser = await memberRepository.findByEmail(kakaoEmail);
          if (existingUser) {
            // 기존 사용자가 있으면 카카오 ID 연결
            await memberRepository.updateKakaoId(existingUser.member_id, kakaoId);
            user = await memberRepository.findByKakaoId(kakaoId);
          }
        }

        // 여전히 사용자가 없으면 새로 생성
        if (!user) {
          // 카카오 로그인은 비밀번호가 없으므로 랜덤 비밀번호 생성
          const randomPassword = require('crypto').randomBytes(32).toString('hex');
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          const newUser = await memberRepository.createUser(
            kakaoNickname,
            kakaoEmail || `kakao_${kakaoId}@kakao.com`,
            hashedPassword,
            'user',
            kakaoId
          );
          user = await memberRepository.findByKakaoId(kakaoId);
        }
      }

      // 4단계: JWT 토큰 생성
      const token = jwt.sign(
        {
          memberId: user.member_id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // 5단계: 결과 반환
      return {
        token: token,
        user: {
          member_id: user.member_id,
          email: user.email,
          username: user.username,
          role: user.role,
          point_balance: typeof user.point_balance === 'number' ? user.point_balance : 0,
          isAdmin: user.role === 'admin'
        }
      };
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      throw new Error(error.message || '카카오 로그인에 실패했습니다.');
    }
  },

  /**
   * 프로필 정보 수정
   * 
   * @param {number} memberId - 사용자 ID
   * @param {string} username - 새 사용자명
   * @returns {Promise<Object>} - 수정된 사용자 정보
   */
  updateProfile: async (memberId, username) => {
    // 사용자명 중복 확인
    const existingUser = await memberRepository.findByUsername(username);
    if (existingUser && existingUser.member_id !== memberId) {
      throw new Error('이미 사용 중인 사용자명입니다.');
    }

    // 사용자 정보 업데이트
    const updatedUser = await memberRepository.update(memberId, { username });

    return {
      member_id: updatedUser.member_id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    };
  },

  /**
   * 비밀번호 변경
   * 
   * @param {number} memberId - 사용자 ID
   * @param {string} currentPassword - 현재 비밀번호
   * @param {string} newPassword - 새 비밀번호
   * @returns {Promise<void>}
   */
  changePassword: async (memberId, currentPassword, newPassword) => {
    // 사용자 조회
    const user = await memberRepository.findById(memberId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 비밀번호 업데이트
    await memberRepository.updatePassword(memberId, hashedPassword);
  },
};

// 서비스 객체를 모듈로 내보내기 (routes에서 사용)
module.exports = authService;

