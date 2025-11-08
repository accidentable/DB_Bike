// src/middleware/auth.middleware.js
//  (JWT 토큰 검증 미들웨어)

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * JWT 토큰을 검증하는 미들웨어
 */
const verifyToken = (req, res, next) => {
  // Authorization 헤더에서 토큰 추출 (형식: "Bearer <TOKEN>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: '토큰이 필요합니다.' });
  }

  try {
    // .env의 비밀키로 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // 검증된 사용자 정보를 req 객체에 저장하여 다음 핸들러(라우터)로 전달
    req.user = decoded; // (예: req.user.memberId, req.user.role)
    
  } catch (err) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }

  // 다음 미들웨어 또는 라우터 핸들러로 이동
  return next();
};

/**
 * 관리자 권한을 검증하는 미들웨어
 */
const isAdmin = (req, res, next) => {
  // verifyToken 미들웨어가 먼저 실행되어 req.user가 있어야 함
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
};


module.exports = {
  verifyToken,
  isAdmin
};