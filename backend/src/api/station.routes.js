/**
 * src/api/station.routes.js
 * 대여소 관련 API 라우터
 * 
 * 주요 엔드포인트:
 * - GET    /api/stations                        - 대여소 목록 조회 (공개, query, lat, lon 파라미터 지원)
 * - GET    /api/stations/favorites/me          - 내 즐겨찾기 대여소 목록 조회 (로그인 필요)
 * - POST   /api/stations/:stationId/favorite    - 대여소 즐겨찾기 추가 (로그인 필요)
 * - DELETE /api/stations/:stationId/favorite    - 대여소 즐겨찾기 제거 (로그인 필요)
 * - GET    /api/stations/:stationId/bikes       - 특정 대여소의 자전거 목록 조회 (공개)
 */

const express = require('express');
const router = express.Router();
const stationService = require('../services/station.service');
const { verifyToken } = require('../middleware/auth.middleware');


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
 * (??) ?? ???? ?? ??? ??? ?? ??
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

module.exports = router;
