// src/api/rental.routes.js
// (대여, 반납)

const express = require('express');
const router = express.Router();
const rentalService = require('../services/rental.service');
const { verifyToken } = require('../middleware/auth.middleware');

// 이 라우터의 모든 경로는 'verifyToken' 미들웨어를 통과해야 함
router.use(verifyToken);

/**
 * GET /api/rentals/current
 * (로그인 필요) 현재 대여 중인 내역 조회
 */
router.get('/current', async (req, res) => {
  try {
    // verifyToken에서 req.user.memberId를 주입해 줌
    const memberId = req.user.memberId;
    const currentRental = await rentalService.getCurrentRental(memberId);
    res.status(200).json({ success: true, data: currentRental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/rentals/history
 * (로그인 필요) 내 대여 이력 조회
 */
router.get('/history', async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const history = await rentalService.getRentalHistory(memberId);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/rentals/rent
 * (로그인 필요) 자전거 대여
 */
router.post('/rent', async (req, res) => {
  try {
    const memberId = req.user.memberId;
    // 프론트엔드가 대여할 '자전거 ID'와 '대여소 ID'를 body에 줘야 함
    const { bikeId, startStationId } = req.body;

    if (!bikeId || !startStationId) {
      return res.status(400).json({ success: false, message: '자전거와 대여소 ID가 필요합니다.' });
    }

    const result = await rentalService.rentBike(memberId, bikeId, startStationId);
    res.status(200).json(result);
  } catch (error) {
    // 서비스나 리포지토리에서 발생한 오류(예: '이용권 없음')
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/rentals/return
 * (로그인 필요) 자전거 반납
 */
router.post('/return', async (req, res) => {
  try {
    const memberId = req.user.memberId;
    // 프론트엔드가 '반납할 대여소 ID'를 body에 줘야 함
    const { endStationId } = req.body;

    if (!endStationId) {
      return res.status(400).json({ success: false, message: '반납할 대여소 ID가 필요합니다.' });
    }

    const result = await rentalService.returnBike(memberId, endStationId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;