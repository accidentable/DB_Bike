/**
 * src/api/achievement.routes.js
 * 업적 관련 API 라우터
 */

const express = require('express');
const router = express.Router();
const achievementService = require('../services/achievement.service');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * GET /api/achievements
 * (로그인 필요) 내 업적 목록 조회
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const memberId = req.user?.memberId;
    if (!memberId) {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }

    const achievements = await achievementService.getMemberAchievements(memberId);
    res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    console.error('업적 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '업적 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/achievements/all
 * 모든 업적 목록 조회 (공개)
 */
router.get('/all', async (req, res) => {
  try {
    const achievements = await achievementService.getAllAchievements();
    res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    console.error('전체 업적 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '업적 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;