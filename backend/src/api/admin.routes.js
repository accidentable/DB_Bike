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

// 자전거 관리
router.get('/bikes', async (req, res, next) => {
  try {
    const bikes = await adminService.getBikes();
    res.json(bikes);
  } catch (error) {
    next(error);
  }
});

router.get('/bikes/:bikeId', async (req, res, next) => {
  try {
    const bike = await adminService.getBikeById(req.params.bikeId);
    if (!bike) {
      return res.status(404).json({ message: '자전거를 찾을 수 없습니다.' });
    }
    res.json(bike);
  } catch (error) {
    next(error);
  }
});

router.post('/bikes', async (req, res, next) => {
  try {
    const bike = await adminService.createBike(req.body);
    res.status(201).json(bike);
  } catch (error) {
    next(error);
  }
});

router.put('/bikes/:bikeId', async (req, res, next) => {
  try {
    const bike = await adminService.updateBike(req.params.bikeId, req.body);
    res.json(bike);
  } catch (error) {
    next(error);
  }
});

router.delete('/bikes/:bikeId', async (req, res, next) => {
  try {
    await adminService.deleteBike(req.params.bikeId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// 대여소 관리
router.get('/stations', async (req, res, next) => {
  try {
    const stations = await adminService.getStations();
    res.json(stations);
  } catch (error) {
    next(error);
  }
});

router.get('/stations/:stationId', async (req, res, next) => {
  try {
    const station = await adminService.getStationById(req.params.stationId);
    if (!station) {
      return res.status(404).json({ message: '대여소를 찾을 수 없습니다.' });
    }
    res.json(station);
  } catch (error) {
    next(error);
  }
});

router.post('/stations', async (req, res, next) => {
  try {
    const station = await adminService.createStation(req.body);
    res.status(201).json(station);
  } catch (error) {
    next(error);
  }
});

router.put('/stations/:stationId', async (req, res, next) => {
  try {
    const station = await adminService.updateStation(req.params.stationId, req.body);
    res.json(station);
  } catch (error) {
    next(error);
  }
});

router.delete('/stations/:stationId', async (req, res, next) => {
  try {
    await adminService.deleteStation(req.params.stationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.patch('/stations/:stationId/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: '상태 값이 필요합니다.' });
    }
    const station = await adminService.updateStationStatus(req.params.stationId, status);
    res.json(station);
  } catch (error) {
    next(error);
  }
});

module.exports = router;