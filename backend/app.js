// app.js
//  Express 앱 설정, 미들웨어/라우터 로드

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. 전역 미들웨어 설정 ---
app.use(cors()); // CORS 허용
app.use(express.json()); // Request Body의 JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// --- 2. 라우터 불러오기 ---
const authRoutes = require('./src/api/auth.routes');
const rentalRoutes = require('./src/api/rental.routes');
const stationRoutes = require('./src/api/station.routes');
const adminRoutes = require('./src/api/admin.routes');
// ... (ticket.routes.js, support.routes.js 등) ...

// --- 3. 미들웨어 불러오기 ---
const { verifyToken, isAdmin } = require('./src/middleware/auth.middleware');

// --- 4. API 엔드포인트 매핑 ---
// /api/auth 경로는 토큰 검증이 필요 없는 공개 경로
app.use('/api/auth', authRoutes);

// /api/stations, 대여소 조회는 토큰이 필요없음
app.use('/api/stations', stationRoutes);

// /api/rentals 경로는 내부 미들웨어(verifyToken)로 자동 보호됨
app.use('/api/rentals', rentalRoutes);

// --- 5. 서버 헬스 체크 ---
app.get('/', (req, res) => {
  res.send('Ddareungi Backend Server is running!');
});

module.exports = app; // server.js에서 사용하기 위해 내보내기