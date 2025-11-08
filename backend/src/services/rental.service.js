// src/services/rental.service.js
// (비즈니스 로직)

const rentalRepository = require('../repositories/rental.repository');
const ticketService = require('./ticket.service');

const rentalService = {
  /**
   * 자전거 대여
   */
  rentBike: async (memberId, bikeId, startStationId) => {
    console.log('🚴 === 자전거 대여 시작 ===');
    console.log('회원 ID:', memberId, '타입:', typeof memberId);
    console.log('자전거 ID:', bikeId);
    console.log('대여소 ID:', startStationId);
    
    // 1. 이용권 확인
    const hasTicket = await ticketService.hasValidTicket(memberId);
    console.log('✅ 이용권 확인 결과:', hasTicket, '타입:', typeof hasTicket);
    
    if (!hasTicket) {
      console.log('❌ 이용권이 없습니다!');
      throw new Error('이용권이 없습니다. 이용권을 구매해주세요.');
    }
    
    console.log('✅ 이용권 확인 통과!');
    
    // 2. 대여 전, 이미 대여한 자전거가 있는지 확인
    const currentRental = await rentalRepository.findCurrentRentalByMemberId(memberId);
    console.log('현재 대여 중인 자전거:', currentRental);
    
    if (currentRental) {
      console.log('❌ 이미 대여 중입니다!');
      throw new Error('이미 대여 중인 자전거가 있습니다. 반납 후 이용해주세요.');
    }
    
    console.log('✅ 중복 대여 확인 통과!');
    
    // 3. Repository의 트랜잭션 호출
    console.log('🔄 대여 트랜잭션 시작...');
    const result = await rentalRepository.rentBikeTransaction(memberId, bikeId, startStationId);
    console.log('✅ 대여 성공!', result);
    console.log('🚴 === 자전거 대여 완료 ===');
    
    return result;
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