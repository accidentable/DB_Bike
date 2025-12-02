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

/**
 * POST /api/achievements/:achievementId/claim
 * 업적 포인트 수령 (로그인 필요)
 */
router.post('/:achievementId/claim', verifyToken, async (req, res) => {
  try {
    const memberId = req.user?.memberId;
    const achievementId = parseInt(req.params.achievementId);

    if (!memberId) {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }

    // 업적 달성 여부 확인
    const hasAchievement = await achievementService.hasAchievement(memberId, achievementId);
    if (!hasAchievement) {
      return res.status(400).json({ success: false, message: '달성하지 않은 업적입니다.' });
    }

    // 이미 포인트를 받았는지 확인
    const memberAchievements = await achievementService.getMemberAchievements(memberId);
    const achievement = memberAchievements.find(a => a.achievement_id === achievementId);
    
    if (!achievement) {
      return res.status(404).json({ success: false, message: '업적을 찾을 수 없습니다.' });
    }

    if (achievement.points_awarded) {
      return res.status(400).json({ success: false, message: '이미 포인트를 받은 업적입니다.' });
    }

    // 포인트 지급
    const pointService = require('../services/point.service');
    await pointService.addPoints(
      memberId,
      500,
      `업적 달성: ${achievement.name}`
    );

    // 포인트 지급 완료 표시
    const achievementRepository = require('../repositories/achievement.repository');
    await achievementRepository.markPointsAwarded(memberId, achievementId);

    res.status(200).json({ 
      success: true, 
      message: '500포인트가 지급되었습니다.',
      data: { points: 500 }
    });
  } catch (error) {
    console.error('업적 포인트 수령 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '포인트 수령 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;