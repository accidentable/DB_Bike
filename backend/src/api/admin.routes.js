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
 */

const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const adminService = require('../services/admin.service');

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

module.exports = router;