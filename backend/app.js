// app.js
// Express 앱 설정, 미들웨어/라우터 로드

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
const postRoutes = require('./src/api/post.routes'); // post.routes도 추가된 것을 확인
const rentalRoutes = require('./src/api/rental.routes');
const stationRoutes = require('./src/api/station.routes');
const adminRoutes = require('./src/api/admin.routes');
const ticketRoutes = require('./src/api/ticket.routes'); // 이용권 API
// ... (support.routes.js 등) ...

// --- 3. 미들웨어 불러오기 ---
const { verifyToken, isAdmin } = require('./src/middleware/auth.middleware');

// --- 4. API 엔드포인트 매핑 ---
// /api/auth 경로는 토큰 검증이 필요 없는 공개 경로
app.use('/api/auth', authRoutes);

// /api/rentals 경로는 로그인이 필요
app.use('/api/rentals', verifyToken, rentalRoutes);

// (수정) /api/stations 경로는 공개 API로 변경 (이전 대화 내용 반영)
app.use('/api/stations', stationRoutes);

// (신규) /api/posts (커뮤니티) 경로는 로그인이 필요
app.use('/api/posts', verifyToken, postRoutes);

// /api/admin 경로는 관리자 권한(isAdmin)까지 필요
app.use('/api/admin', verifyToken, isAdmin, adminRoutes);

// (신규) /api/tickets (이용권) 경로
// - /api/tickets/types는 공개 (누구나 조회 가능)
// - /api/tickets/purchase, /api/tickets/my-tickets, /api/tickets/history는 로그인 필요
app.use('/api/tickets', ticketRoutes);


// --- 5. 서버 헬스 체크 ---
app.get('/', (req, res) => {
  // 한글 응답을 위해 Content-Type 설정
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('따릉이 백엔드 서버가 실행 중입니다!');
});

module.exports = app; // server.js에서 사용하기 위해 내보내기