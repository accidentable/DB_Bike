/**
 * src/api/ticket.routes.js
 * 이용권 관련 API 라우터
 * 
 * 엔드포인트:
 * GET    /api/tickets/types          - 이용권 종류 목록 조회 (공개)
 * POST   /api/tickets/purchase       - 이용권 구매 (로그인 필요)
 * GET    /api/tickets/my-tickets     - 내 활성 이용권 조회 (로그인 필요)
 * GET    /api/tickets/history        - 내 이용권 구매 이력 (로그인 필요)
 */

const express = require('express');
const router = express.Router();
const ticketService = require('../services/ticket.service');
const { verifyToken } = require('../middleware/auth.middleware');

/**
 * GET /api/tickets/types
 * (공개) 모든 이용권 종류 조회
 * 
 * 응답:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "ticket_type_id": 1,
 *       "name": "1시간권",
 *       "duration_hours": 1,
 *       "price": 1000,
 *       "description": "1시간 동안 이용 가능...",
 *       "ride_limit_minutes": null
 *     }
 *   ]
 * }
 */
router.get('/types', async (req, res) => {
  try {
    const ticketTypes = await ticketService.getAllTicketTypes();
    
    res.status(200).json({
      success: true,
      data: ticketTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '이용권 목록을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/tickets/purchase
 * (로그인 필요) 이용권 구매
 * 
 * 요청 본문:
 * {
 *   "ticketTypeId": 1
 * }
 * 
 * 응답:
 * {
 *   "success": true,
 *   "message": "1시간권 구매가 완료되었습니다.",
 *   "data": {
 *     "member_ticket_id": 1,
 *     "member_id": 1,
 *     "ticket_type_id": 1,
 *     "ticket_name": "1시간권",
 *     "purchase_time": "2025-11-08T10:00:00Z",
 *     "expiry_time": "2025-11-08T11:00:00Z",
 *     "status": "active"
 *   }
 * }
 */
router.post('/purchase', verifyToken, async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const { ticketTypeId } = req.body;

    // 입력값 검증
    if (!ticketTypeId) {
      return res.status(400).json({
        success: false,
        message: '이용권 종류를 선택해주세요.'
      });
    }

    // 이용권 구매 처리
    const result = await ticketService.purchaseTicket(memberId, ticketTypeId);

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.ticket
    });
  } catch (error) {
    const statusCode = error.message.includes('존재하지 않는') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || '이용권 구매 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/tickets/my-tickets
 * (로그인 필요) 내 활성 이용권 조회
 * 
 * 응답:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "member_ticket_id": 1,
 *       "ticket_name": "1일권",
 *       "purchase_time": "2025-11-08T10:00:00Z",
 *       "expiry_time": "2025-11-09T10:00:00Z",
 *       "status": "active"
 *     }
 *   ]
 * }
 */
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const tickets = await ticketService.getMyActiveTickets(memberId);

    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '활성 이용권을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/tickets/history
 * (로그인 필요) 내 이용권 구매 이력 (활성 + 만료)
 * 
 * 응답:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "member_ticket_id": 1,
 *       "ticket_name": "1일권",
 *       "purchase_time": "2025-11-07T10:00:00Z",
 *       "expiry_time": "2025-11-08T10:00:00Z",
 *       "status": "expired"
 *     },
 *     {
 *       "member_ticket_id": 2,
 *       "ticket_name": "1시간권",
 *       "purchase_time": "2025-11-08T10:00:00Z",
 *       "expiry_time": "2025-11-08T11:00:00Z",
 *       "status": "active"
 *     }
 *   ]
 * }
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const memberId = req.user.memberId;
    const tickets = await ticketService.getMyTicketHistory(memberId);

    res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '이용권 이력을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;

