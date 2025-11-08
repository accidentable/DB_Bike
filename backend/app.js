// app.js
//  Express �� ����, �̵����/����� �ε�

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. ���� �̵���� ���� ---
app.use(cors()); // CORS ���
app.use(express.json({ charset: 'utf-8' })); // Request Body�� JSON �Ľ� (UTF-8)
app.use(express.urlencoded({ extended: true, charset: 'utf-8' })); // URL-encoded �Ľ� (UTF-8)

// --- 2. ����� �ҷ����� ---
const authRoutes = require('./src/api/auth.routes');
const postRoutes = require('./src/api/post.routes');
const rentalRoutes = require('./src/api/rental.routes');
const stationRoutes = require('./src/api/station.routes');
const adminRoutes = require('./src/api/admin.routes');
// ... (ticket.routes.js, support.routes.js ��) ...

// --- 3. �̵���� �ҷ����� ---
const { verifyToken, isAdmin } = require('./src/middleware/auth.middleware');

// --- 4. API ��������Ʈ ���� ---
// /api/auth ��δ� ��ū ������ �ʿ� ���� ���� ���
app.use('/api/auth', authRoutes);

// /api/rentals, /api/stations 경로는 로그인이 필요
// (예시)
app.use('/api/rentals', verifyToken, rentalRoutes);
app.use('/api/stations', verifyToken, stationRoutes);

// /api/admin 경로는 관리자 권한(isAdmin)까지 필요
app.use('/api/admin', verifyToken, isAdmin, adminRoutes);


// --- 5. ���� ���� Ȯ�� ---
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send('Ddareungi Backend Server is running!');
});

module.exports = app; // server.js���� ����ϱ� ���� ��������
