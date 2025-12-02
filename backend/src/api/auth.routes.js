const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/login
 * 로그인 API 엔드포인트
 * 
 * 요청 본문 (req.body):
 *   - email: string (필수) - 사용자 이메일 주소
 *   - password: string (필수) - 사용자 비밀번호 (평문)
 * 
 */

router.post('/login', async (req, res) => {
  try {

    // 1. 요청 본문에서 이메일과 비밀번호 추출
    const { email, password } = req.body;
    
    // 2. 필수 입력값 검증
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required.' 
      });
    }
    
    // 3. 서비스 계층의 login 함수 호출
    const result = await authService.login(email, password);
    
    // 4. 성공 응답 반환 (200 OK)
    res.status(200).json({ success: true, data: result });
    
  } catch (error) {
    // 5. 에러 처리
    res.status(401).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auth/signup
 * 회원가입 API 엔드포인트
 */
router.post('/signup', async (req, res) => {
  try {

    // 1. 요청 본문에서 회원가입 정보 추출
    const { username, email, password } = req.body;
    
    // 2. 필수 입력값 검증
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and password are required.' 
      });
    }
    
    // 3. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format.' 
      });
    }
    
    // 4. 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long.' 
      });
    }
    
    // 5. 서비스 계층의 signup 함수 호출
    // - 이메일 중복 확인
    // - 비밀번호 암호화 (bcrypt)
    // - 데이터베이스에 새 사용자 생성
    const newUser = await authService.signup(username, email, password);
    
    // 6. 성공 응답 반환 (201 Created)
    res.status(201).json({ success: true, data: newUser });
    
  } catch (error) {
    // 7. 에러 처리
    // - 이메일 중복
    // - 사용자명 중복
    // - 데이터베이스 오류
    // 위 경우 400 Bad Request 반환
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/auth/kakao
 * 카카오 로그인/회원가입 API 엔드포인트
 * 
 * 요청 본문:
 *   - accessToken: string (필수) - 카카오 액세스 토큰
 */
router.post('/kakao', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: '카카오 액세스 토큰이 필요합니다.'
      });
    }

    const result = await authService.kakaoLogin(accessToken);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('카카오 로그인 에러:', error);
    res.status(401).json({
      success: false,
      message: error.message || '카카오 로그인에 실패했습니다.'
    });
  }
});

/**
 * POST /api/auth/send-verification-email
 * 이메일 인증 코드 발송 API
 * 
 * 요청 본문:
 *   - email: string (필수) - 인증할 이메일 주소
 */
router.post('/send-verification-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: '이메일 주소가 필요합니다.'
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }

    // 이메일 중복 확인
    const memberRepository = require('../repositories/member.repository');
    const existingUser = await memberRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 인증 코드 발송
    await emailService.sendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: '인증 코드가 발송되었습니다.'
    });
  } catch (error) {
    console.error('이메일 발송 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '이메일 발송에 실패했습니다.'
    });
  }
});

/**
 * POST /api/auth/verify-email
 * 이메일 인증 코드 검증 API
 * 
 * 요청 본문:
 *   - email: string (필수) - 이메일 주소
 *   - code: string (필수) - 인증 코드
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code, purpose } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: '이메일과 인증 코드가 필요합니다.'
      });
    }

    const verifyPurpose = purpose || 'signup';
    const result = emailService.verifyCode(email, code, verifyPurpose);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('이메일 인증 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '이메일 인증에 실패했습니다.'
    });
  }
});

/**
 * PUT /api/auth/profile
 * 프로필 정보 수정 (로그인 필요)
 * 
 * 요청 본문:
 *   - username: string (선택) - 사용자명
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username } = req.body;
    const memberId = req.user.memberId;

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: '사용자명을 입력해주세요.'
      });
    }

    const updatedUser = await authService.updateProfile(memberId, username.trim());

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: '프로필이 수정되었습니다.'
    });
  } catch (error) {
    console.error('프로필 수정 에러:', error);
    res.status(400).json({
      success: false,
      message: error.message || '프로필 수정에 실패했습니다.'
    });
  }
});

/**
 * POST /api/auth/send-password-change-email
 * 비밀번호 변경용 이메일 인증 코드 발송 (로그인 필요)
 */
router.post('/send-password-change-email', verifyToken, async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const memberRepository = require('../repositories/member.repository');
    const user = await memberRepository.findById(memberId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 사용자의 이메일로 인증 코드 발송
    await emailService.sendVerificationEmail(user.email, 'password-change');

    res.status(200).json({
      success: true,
      message: '인증 코드가 발송되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 이메일 발송 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '이메일 발송에 실패했습니다.'
    });
  }
});

/**
 * PUT /api/auth/change-password
 * 비밀번호 변경 (로그인 필요, 이메일 인증 필요)
 * 
 * 요청 본문:
 *   - currentPassword: string (필수) - 현재 비밀번호
 *   - newPassword: string (필수) - 새 비밀번호
 *   - verificationCode: string (필수) - 이메일 인증 코드
 */
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, verificationCode } = req.body;
    const memberId = req.user.memberId;

    if (!currentPassword || !newPassword || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: '현재 비밀번호, 새 비밀번호, 인증 코드를 모두 입력해주세요.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '새 비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 사용자 이메일 조회
    const memberRepository = require('../repositories/member.repository');
    const user = await memberRepository.findById(memberId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 이메일 인증 코드 검증
    const verificationResult = emailService.verifyCode(user.email, verificationCode, 'password-change');
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || '이메일 인증에 실패했습니다.'
      });
    }

    // 비밀번호 변경
    await authService.changePassword(memberId, currentPassword, newPassword);

    // 인증 코드 삭제
    emailService.deleteVerificationCode(user.email, 'password-change');

    res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다.'
    });
  } catch (error) {
    console.error('비밀번호 변경 에러:', error);
    res.status(400).json({
      success: false,
      message: error.message || '비밀번호 변경에 실패했습니다.'
    });
  }
});

// 라우터를 모듈로 내보내기 (app.js에서 사용)
module.exports = router;
