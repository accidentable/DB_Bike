// app.js
//  Express 앱 설정, 미들웨어/라우터 로드

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 모든 JSON 응답을 UTF-8로 인코딩하도록 설정
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json({ charset: 'utf-8' })); 
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));

// --- 1. 전역 미들웨어 설정 ---
app.use(cors()); // CORS 허용
app.use(express.json({ charset: 'utf-8' })); // Request Body의 JSON 파싱 (UTF-8)
app.use(express.urlencoded({ extended: true, charset: 'utf-8' })); // URL-encoded 파싱 (UTF-8)

// --- 2. 라우터 불러오기 ---
const authRoutes = require('./src/api/auth.routes');
const postRoutes = require('./src/api/post.routes');
const rentalRoutes = require('./src/api/rental.routes');
const stationRoutes = require('./src/api/station.routes');
const adminRoutes = require('./src/api/admin.routes');
// ... (ticket.routes.js, support.routes.js 등) ...

// --- 3. 미들웨어 불러오기 ---
const { verifyToken, isAdmin } = require('./src/middleware/auth.middleware');

// --- 4. API 엔드포인트 매핑 ---
// /api/auth 경로는 토큰 검증이 필요 없는 공개 경로
app.use('/api/auth', authRoutes);

// /api/posts 경로는 게시글 관련 (목록/상세는 공개, 작성/수정/삭제는 인증 필요)
app.use('/api/posts', postRoutes);

// /api/rentals, /api/stations 경로는 로그인이 필요
// (예시)
app.use('/api/rentals', verifyToken, rentalRoutes);
app.use('/api/stations', verifyToken, stationRoutes);

// /api/admin 경로는 관리자 권한(isAdmin)이 필요
app.use('/api/admin', verifyToken, isAdmin, adminRoutes);


// --- 5. 서버 상태 확인 ---
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('Ddareungi Backend Server is running!');
});
app.get('/ping', (req, res) => {
  res.json({ message: 'pong from Ddareungi server' });
});


module.exports = app; // server.js에서 사용하기 위해 내보내기
