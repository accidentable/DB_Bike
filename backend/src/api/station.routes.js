// src/api/station.routes.js
// (수정) 'verifyToken' 미들웨어를 제거하여 공개 API로 변경

const express = require('express');
const router = express.Router();
const stationService = require('../services/station.service');
// 로그인 안해도 대여소 찾기 가능함
// const { verifyToken } = require('../middleware/auth.middleware'); // <-- 이 줄 제거

/**
 * GET /api/stations
 * (공개) 대여소 목록을 조회합니다.
 * 쿼리 파라미터: ?query=강남&lat=37.123&lon=127.123
 */
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
 * GET /api/stations/:id/bikes
 * (공개) 특정 대여소의 대여 가능한 자전거 목록을 조회합니다.
 */
router.get('/:stationId/bikes', async (req, res) => { 
  try {
    const { stationId } = req.params;
    const bikes = await stationService.getAvailableBikes(stationId);
    res.status(200).json({ success: true, data: bikes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;