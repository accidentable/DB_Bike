/**
 * src/api/point.routes.js
 * 포인트 관련 API 라우터
 *
 * 엔드포인트:
 * POST   /api/points/charge       - 포인트 충전 (로그인 필요)
 */

const express = require('express');
const router = express.Router();
const pointService = require('../services/point.service');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * POST /api/points/charge
 * (로그인 필요) 포인트 충전
 *
 * 요청 본문:
 * {
 *   "amount": 1000
 * }
 *
 * 응답:
 * {
 *   "success": true,
 *   "message": "1000 포인트가 충전되었습니다.",
 *   "data": {
 *     "member_id": 1,
 *     "new_balance": 5000
 *   }
 * }
 */
router.post('/charge', verifyToken, async (req, res) => {
  try {
    const memberId = req.user?.memberId || req.user?.member_id || req.user?.id;
    if (!memberId) {
      return res.status(401).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.'
      });
    }

    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '충전할 금액을 정확히 입력해주세요.'
      });
    }

    const numericMemberId = parseInt(memberId, 10);
    if (isNaN(numericMemberId)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 사용자 ID입니다.'
      });
    }

    const result = await pointService.chargePoints(numericMemberId, amount);

    res.status(200).json({
      success: true,
      message: `${amount} 포인트가 충전되었습니다.`,
      data: result
    });
  } catch (error) {
    console.error('포인트 충전 에러:', error);
    res.status(500).json({
      success: false,
      message: error.message || '포인트 충전 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
