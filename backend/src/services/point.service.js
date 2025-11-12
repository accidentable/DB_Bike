/**
 * src/services/point.service.js
 * 포인트 관련 비즈니스 로직
 */

const pointRepository = require('../repositories/point.repository');
const memberRepository = require('../repositories/member.repository');

const pointService = {
  /**
   * 사용자의 현재 포인트 잔액 조회
   * @param {number} memberId - 사용자 ID
   * @returns {Promise<number>} - 현재 포인트 잔액
   */
  getPointBalance: async (memberId) => {
    const member = await memberRepository.findById(memberId);
    if (!member) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    return member.point_balance;
  },

  /**
   * 사용자에게 포인트 추가
   * @param {number} memberId - 사용자 ID
   * @param {number} amount - 추가할 포인트 양
   * @param {string} description - 포인트 추가 사유
   * @returns {Promise<number>} - 업데이트된 포인트 잔액
   */
  addPoints: async (memberId, amount, description) => {
    if (amount <= 0) {
      throw new Error('0보다 큰 금액을 입력해주세요.');
    }

    const newBalance = await pointRepository.addPoints(memberId, amount, description);
    return newBalance;
  },

  /**
   * 사용자 포인트 차감
   * @param {number} memberId - 사용자 ID
   * @param {number} amount - 차감할 포인트 양
   * @param {string} description - 포인트 차감 사유
   * @returns {Promise<number>} - 업데이트된 포인트 잔액
   */
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

  /**
   * 사용자의 포인트 사용/적립 내역 조회