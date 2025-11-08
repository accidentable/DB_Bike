const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

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
        message: '이메일과 비밀번호를 모두 입력해주세요.' 
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
        message: '사용자명, 이메일, 비밀번호는 필수 입력 항목입니다.' 
      });
    }
    
    // 3. 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: '올바른 이메일 형식이 아닙니다.' 
      });
    }
    
    // 4. 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: '비밀번호는 최소 6자 이상이어야 합니다.' 
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

// 라우터를 모듈로 내보내기 (app.js에서 사용)
module.exports = router;
