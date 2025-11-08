// src/services/rental.service.js
// (비즈니스 로직)

const rentalRepository = require('../repositories/rental.repository');

const rentalService = {
  /**
   * 자전거 대여
   */
  rentBike: async (memberId, bikeId, startStationId) => {
    // 1. 대여 전, 이미 대여한 자전거가 있는지 확인 (PDF [cite: 71])
    const currentRental = await rentalRepository.findCurrentRentalByMemberId(memberId);
    if (currentRental) {
      throw new Error('이미 대여 중인 자전거가 있습니다. 반납 후 이용해주세요.');
    }
    
    // 2. Repository의 트랜잭션 호출
    return await rentalRepository.rentBikeTransaction(memberId, bikeId, startStationId);
  },

  /**
   * 자전거 반납
   */
  returnBike: async (memberId, endStationId) => {
    // Repository의 트랜잭션 호출
    // (반납은 findCurrentRental을 굳이 호출 안 해도,
    //  repository 내부의 UPDATE문에서 0 row aFfected로 알아서 걸러짐)
    return await rentalRepository.returnBikeTransaction(memberId, endStationId);
  },

  /**
   * 현재 대여 상태 조회
   */
  getCurrentRental: async (memberId) => {
    const rental = await rentalRepository.findCurrentRentalByMemberId(memberId);
    // 프론트엔드에서 null을 쉽게 처리하도록
    return rental || null;
  },

  /**
   * 대여 이력 조회
   */
  getRentalHistory: async (memberId) => {
    return await rentalRepository.findRentalHistoryByMemberId(memberId);
  }
};

module.exports = rentalService;