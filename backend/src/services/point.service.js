/**
 * src/services/point.service.js
 * 포인트 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - getPointBalance: 포인트 잔액 조회
 * - addPoints: 포인트 추가
 * - deductPoints: 포인트 차감
 * - chargePoints: 포인트 충전
 * - getPointHistory: 포인트 사용/적립 내역 조회
 */

const pointRepository = require('../repositories/point.repository');
const memberRepository = require('../repositories/member.repository');

const pointService = {
  // 포인트 잔액 조회
  getPointBalance: async (memberId) => {
    const member = await memberRepository.findById(memberId);
    if (!member) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    return member.point_balance;
  },

  // 포인트 추가
  addPoints: async (memberId, amount, description) => {
    if (amount <= 0) {
      throw new Error('0보다 큰 금액을 입력해주세요.');
    }

    const newBalance = await pointRepository.addPoints(memberId, amount, description);
    return newBalance;
  },

  // 포인트 차감
  deductPoints: async (memberId, amount, description) => {
    if (amount <= 0) {
      throw new Error('0보다 큰 금액을 입력해주세요.');
    }

    const currentBalance = await pointService.getPointBalance(memberId);
    if (currentBalance < amount) {
      throw new Error('포인트 잔액이 부족합니다.');
    }

    const newBalance = await pointRepository.deductPoints(memberId, amount, description);
    return newBalance;
  },

  // 포인트 충전
  chargePoints: async (memberId, amount) => {
    if (amount <= 0) {
      throw new Error('0보다 큰 금액을 입력해주세요.');
    }

    const newBalance = await pointRepository.addPoints(memberId, amount, '포인트 충전');
    
    return {
      member_id: memberId,
      new_balance: newBalance
    };
  },

  // 포인트 사용/적립 내역 조회
  getPointHistory: async (memberId, limit = 50) => {
    return await pointRepository.getHistory(memberId, limit);
  }
};

module.exports = pointService;