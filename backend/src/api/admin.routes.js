/**
 * src/api/admin.routes.js
 * 관리자 관련 API 라우터
 * 
 * 주요 엔드포인트 (모두 관리자 권한 필요):
 * - GET    /api/admin/stats                     - 대시보드 통계 조회
 * - GET    /api/admin/users                     - 모든 사용자 목록 조회
 * - PUT    /api/admin/users/:userId             - 특정 사용자 정보 업데이트
 * - DELETE /api/admin/users/:userId             - 특정 사용자 삭제
 * - GET    /api/admin/rentals                   - 모든 대여 기록 조회
 * - GET    /api/admin/activity-logs             - Activity Log 조회
 * - GET    /api/admin/district-stats            - 지역구별 대여소 현황 조회
 * - GET    /api/admin/station-rental-rates      - 대여소별 대여율 조회
 * - GET    /api/admin/users/:userId/point-history - 특정 사용자의 포인트 내역 조회
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const adminService = require('../services/admin.service');

// 관리자 비밀번호 (환경변수로 관리하는 것이 좋음)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'dev-secret-key';

// 비밀번호로 토큰 발급 (인증 없이 접근 가능)
router.post('/auth-password', async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: '비밀번호가 올바르지 않습니다.'
      });
    }
    
    // JWT 토큰 발급 (관리자 권한으로)
    const token = jwt.sign(
      { id: 'admin-temp', role: 'admin', type: 'password-auth' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    res.json({
      success: true,
      message: '관리자 인증 성공',
      token
    });
  } catch (error) {
    next(error);
  }
});

// 모든 관리자 API는 토큰 검증 및 관리자 권한 확인이 필요합니다.
router.use(verifyToken, isAdmin);

// 대시보드 통계
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// 모든 사용자 목록
router.get('/users', async (req, res, next) => {
  try {
    const users = await adminService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// 특정 사용자 정보 업데이트
router.put('/users/:userId', async (req, res, next) => {
  try {
    const updatedUser = await adminService.updateUser(req.params.userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// 특정 사용자 삭제
router.delete('/users/:userId', async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 모든 대여 기록
router.get('/rentals', async (req, res, next) => {
    try {
        const rentals = await adminService.getRentals();
        res.json(rentals);
    } catch (error) {
        next(error);
    }
});

// Activity Log 조회
router.get('/activity-logs', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await adminService.getActivityLogs(limit);
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// 지역구별 대여소 현황
router.get('/district-stats', async (req, res, next) => {
  try {
    const stats = await adminService.getDistrictStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// 대여소별 대여율
router.get('/station-rental-rates', async (req, res, next) => {
  try {
    const rates = await adminService.getStationRentalRates();
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

// 모든 자전거 목록
router.get('/bikes', async (req, res, next) => {
  try {
    const bikes = await adminService.getBikes();
    res.json(bikes);
  } catch (error) {
    next(error);
  }
});

// 새 자전거 추가
router.post('/bikes', async (req, res, next) => {
  try {
    const { bike_number, status, station_id } = req.body;
    const bikeService = require('../services/bike.service');
    const newBike = await bikeService.createBike({ bike_number, status, station_id });
    res.status(201).json(newBike);
  } catch (error) {
    next(error);
  }
});

// 자전거 삭제
router.delete('/bikes/:bikeId', async (req, res, next) => {
  try {
    const bikeService = require('../services/bike.service');
    await bikeService.deleteBike(req.params.bikeId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 관리자가 이용권 부여
router.post('/users/:userId/tickets', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const { ticketTypeId, expiryTime } = req.body;
    
    if (!ticketTypeId) {
      return res.status(400).json({
        success: false,
        message: '이용권 종류를 선택해주세요.'
      });
    }

    const ticketService = require('../services/ticket.service');
    const result = await ticketService.grantTicketByAdmin(userId, ticketTypeId, expiryTime);
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.ticket
    });
  } catch (error) {
    next(error);
  }
});

// 특정 사용자의 포인트 내역 조회 (관리자용)
router.get('/users/:userId/point-history', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit, 10) || 50;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      });
    }

    const history = await adminService.getUserPointHistory(userId, limit);
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;