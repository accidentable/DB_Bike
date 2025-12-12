/**
 * src/api/station.routes.js
 * 대여소 관련 API 라우터
 * 
 * 주요 엔드포인트:
 * - GET    /api/stations                        - 대여소 목록 조회 (공개, query, lat, lon 파라미터 지원, LIMIT 20)
 * - GET    /api/stations/all                    - 모든 대여소 목록 조회 (관리자 전용, LIMIT 없음)
 * - GET    /api/stations/favorites/me          - 내 즐겨찾기 대여소 목록 조회 (로그인 필요)
 * - POST   /api/stations/:stationId/favorite    - 대여소 즐겨찾기 추가 (로그인 필요)
 * - DELETE /api/stations/:stationId/favorite    - 대여소 즐겨찾기 제거 (로그인 필요)
 * - GET    /api/stations/:stationId/bikes       - 특정 대여소의 자전거 목록 조회 (공개)
 * - POST   /api/stations                        - 대여소 추가 (관리자 전용)
 * - PUT    /api/stations/:stationId              - 대여소 수정 (관리자 전용)
 * - DELETE /api/stations/:stationId              - 대여소 삭제 (관리자 전용)
 */

const express = require('express');
const router = express.Router();
const stationService = require('../services/station.service');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');


router.get('/', async (req, res) => {
  try {
    const { query, lat, lon } = req.query;
    const searchParams = {
      query: query,
      lat: parseFloat(lat),
      lon: parseFloat(lon)
    };

    const stations = await stationService.getStations(searchParams);
    res.status(200).json({ success: true, data: stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stations/all
 * 모든 대여소 목록 조회 (관리자 전용, LIMIT 없음)
 * 
 * 쿼리 파라미터:
 * - query: string (선택) - 검색어
 */
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    const stations = await stationService.getAllStations(query || null);
    res.status(200).json({ success: true, data: stations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stations/favorites/me
 * ? ???? ?? ?? (??? ??)
 */
router.get('/favorites/me', verifyToken, async (req, res) => {
  try {
    const memberId = req.user?.memberId;
    const favorites = await stationService.listFavorites(memberId);
    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/stations/:stationId/favorite
 * ???? ?? (??? ??)
 */
router.post('/:stationId/favorite', verifyToken, async (req, res) => {
  try {
    const stationId = Number(req.params.stationId);
    const memberId = req.user?.memberId;
    const result = await stationService.addFavorite(memberId, stationId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/stations/:stationId/favorite
 * ???? ?? (??? ??)
 */
router.delete('/:stationId/favorite', verifyToken, async (req, res) => {
  try {
    const stationId = Number(req.params.stationId);
    const memberId = req.user?.memberId;
    const result = await stationService.removeFavorite(memberId, stationId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/stations/:stationId/bikes
 * 특정 대여소의 자전거 목록 조회 (공개)
 */
router.get('/:stationId/bikes', async (req, res) => { 
  try {
    const stationId = Number(req.params.stationId);
    const bikes = await stationService.getAvailableBikes(stationId);
    res.status(200).json({ success: true, data: bikes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/stations
 * 대여소 추가 (관리자 전용)
 * 
 * 요청 본문:
 * {
 *   "name": "대여소 이름",
 *   "latitude": 37.5665,
 *   "longitude": 126.9780,
 *   "status": "정상" (선택)
 * }
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, latitude, longitude, status } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: '대여소 이름, 위도, 경도는 필수입니다.'
      });
    }

    const station = await stationService.createStation(name, latitude, longitude, status || '정상');
    res.status(201).json({ success: true, data: station });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/stations/:stationId
 * 대여소 수정 (관리자 전용)
 * 
 * 요청 본문:
 * {
 *   "name": "대여소 이름",
 *   "latitude": 37.5665,
 *   "longitude": 126.9780,
 *   "status": "정상" (선택)
 * }
 */
router.put('/:stationId', verifyToken, isAdmin, async (req, res) => {
  try {
    const stationId = Number(req.params.stationId);
    const { name, latitude, longitude, status } = req.body;

    if (isNaN(stationId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 대여소 ID가 아닙니다.'
      });
    }

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: '대여소 이름, 위도, 경도는 필수입니다.'
      });
    }

    const station = await stationService.updateStation(stationId, name, latitude, longitude, status || '정상');
    res.status(200).json({ success: true, data: station });
  } catch (error) {
    const statusCode = error.message.includes('찾을 수 없습니다') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/stations/:stationId
 * 대여소 삭제 (관리자 전용)
 */
router.delete('/:stationId', verifyToken, isAdmin, async (req, res) => {
  try {
    const stationId = Number(req.params.stationId);

    if (isNaN(stationId)) {
      return res.status(400).json({
        success: false,
        message: '올바른 대여소 ID가 아닙니다.'
      });
    }

    await stationService.deleteStation(stationId);
    res.status(200).json({ success: true, message: '대여소가 삭제되었습니다.' });
  } catch (error) {
    const statusCode = error.message.includes('찾을 수 없습니다') ? 404 : 400;
    res.status(statusCode).json({ success: false, message: error.message });
  }
});

module.exports = router;
