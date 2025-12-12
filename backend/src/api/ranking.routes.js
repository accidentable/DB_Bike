/**
 * src/api/ranking.routes.js
 * 랭킹 관련 API 라우터
 * 
 * 주요 엔드포인트:
 * - GET    /api/rankings/weekly                 - 주별 거리 랭킹 조회 (공개)
 * - GET    /api/rankings/total                  - 전체 기간 누적 랭킹 조회 (공개, type: 'distance' | 'rides')
 */

const express = require('express');
const router = express.Router();
const rankingService = require('../services/ranking.service');
const rankingRepository = require('../repositories/ranking.repository');

/**
 * GET /api/rankings/weekly
 * 주별 거리 랭킹 조회 (공개)
 */
router.get('/weekly', async (req, res) => {
  try {
    const { week } = req.query; // YYYY-MM-DD 형식 (선택)
    
    let ranking;
    if (week) {
      ranking = await rankingService.getWeeklyRanking(week);
    } else {
      ranking = await rankingService.getCurrentWeekRanking();
    }

    res.status(200).json({ success: true, data: ranking });
  } catch (error) {
    console.error('랭킹 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '랭킹 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/rankings/total
 * 전체 기간 누적 거리 랭킹 조회 (공개)
 */
router.get('/total', async (req, res) => {
    try {
      const memberId = req.query.memberId ? Number(req.query.memberId) : null;
      const type = req.query.type || 'distance'; // 'distance' or 'rides'
      
      let result;
      if (type === 'rides') {
        result = await rankingService.getTotalRideRanking(memberId);
      } else {
        result = await rankingService.getTotalDistanceRanking(memberId);
      }
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('전체 랭킹 조회 에러:', error);
      res.status(500).json({
        success: false,
        message: error.message || '랭킹 조회 중 오류가 발생했습니다.'
      });
    }
  });

module.exports = router;