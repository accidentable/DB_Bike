/**
 * 의존성:
 *   - jsonwebtoken: JWT 토큰 검증 라이브러리
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * 
 * @param {Object} req - Express 요청 객체
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어로 넘어가는 함수
 * 
 */
const verifyToken = (req, res, next) => {
  // 1단계: Authorization 헤더에서 토큰 추출
  const authHeader = req.headers['authorization'];
  
  // 2단계: 토큰 파싱
  const token = authHeader && authHeader.split(' ')[1];

  // 3단계: 토큰 존재 여부 확인
  if (!token) {
    return res.status(403).json({ 
      message: '토큰이 필요합니다.' 
    });
  }

  try {
    // 4단계: JWT 토큰 검증 및 디코딩
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // 5단계: 검증된 사용자 정보를 req 객체에 저장
    req.user = decoded;
    
  } catch (err) {
    // 6단계: 토큰 검증 실패 처리
    return res.status(401).json({ 
      message: '유효하지 않은 토큰입니다.' 
    });
  }

  // 7단계: 다음 미들웨어 또는 라우터로 요청 전달
  return next();
};

/**
 * 관리자 권한을 확인하는 미들웨어
 * 
 * @param {Object} req - Express 요청 객체 (req.user가 설정되어 있어야 함)
 * @param {Object} res - Express 응답 객체
 * @param {Function} next - 다음 미들웨어로 넘어가는 함수
 */
const isAdmin = (req, res, next) => {

  // req.user가 존재하고 역할이 'admin'인지 확인
  if (req.user && req.user.role === 'admin') {
    // 관리자 권한이 있으면 다음 미들웨어/라우터로 진행
    next();
  } else {
    // 관리자 권한이 없으면 403 Forbidden 반환
    res.status(403).json({ 
      message: '관리자 권한이 필요합니다.' 
    });
  }
};

// 미들웨어 함수들을 모듈로 내보내기
// app.js나 라우터에서 사용할 수 있도록 export
module.exports = {
  verifyToken,  // JWT 토큰 검증 미들웨어
  isAdmin       // 관리자 권한 확인 미들웨어
};
