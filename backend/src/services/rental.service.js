/**
 * src/services/rental.service.js
 * 자전거 대여/반납 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - rentBike: 자전거 대여 (이용권 확인, 중복 대여 체크)
 * - returnBike: 자전거 반납 (거리 계산, 업적 체크)
 * - getCurrentRental: 현재 대여 상태 조회
 * - getRentalHistory: 대여 이력 조회
 */

const rentalRepository = require('../repositories/rental.repository');
const ticketService = require('./ticket.service');
const achievementService = require('./achievement.service');

const rentalService = {
  // 자전거 대여
  rentBike: async (memberId, bikeId, startStationId) => {
    const hasTicket = await ticketService.hasValidTicket(memberId);
    
    if (!hasTicket) {
      throw new Error('이용권이 없습니다. 이용권을 구매해주세요.');
    }
    
    const currentRental = await rentalRepository.findCurrentRentalByMemberId(memberId);
    
    if (currentRental) {
      throw new Error('이미 대여 중인 자전거가 있습니다. 반납 후 이용해주세요.');
    }
    
    const result = await rentalRepository.rentBikeTransaction(memberId, bikeId, startStationId);
    return result;
  },

  // 자전거 반납
  returnBike: async (memberId, endStationId) => {
    try {
      const result = await rentalRepository.returnBikeTransaction(memberId, endStationId);
      
      try {
        await achievementService.checkAchievements(memberId);
      } catch (achievementError) {
        console.error('업적 체크 중 오류 (반납은 성공):', achievementError);
      }
      
      return result;
    } catch (error) {
      console.error('반납 오류:', error);
      throw error;
    }
  },

  // 현재 대여 상태 조회
  getCurrentRental: async (memberId) => {
    const rental = await rentalRepository.findCurrentRentalByMemberId(memberId);
    return rental || null;
  },

  // 대여 이력 조회
  getRentalHistory: async (memberId) => {
    return await rentalRepository.findRentalHistoryByMemberId(memberId);
  }
};

module.exports = rentalService;