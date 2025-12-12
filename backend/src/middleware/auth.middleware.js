/**
 * src/middleware/auth.middleware.js
 * 인증 미들웨어
 * 
 * 주요 함수:
 * - verifyToken: JWT 토큰 검증 (필수)
 * - optionalVerifyToken: JWT 토큰 선택적 검증
 * - isAdmin: 관리자 권한 확인
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'dev-secret-key';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token is required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    console.warn("Optional token verification failed:", err.message);
  }
  
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin permission required.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  optionalVerifyToken
};