/**
 * src/services/ranking.service.js
 * 랭킹 관련 비즈니스 로직
 */

const rankingRepository = require('../repositories/ranking.repository');
const pointService = require('./point.service');

const rankingService = {
  /**
   * 현재 주 랭킹 조회
   */
  getCurrentWeekRanking: async () => {
    return await rankingRepository.getCurrentWeekRanking();
  },

  /**
   * 특정 주 랭킹 조회
   */
  getWeeklyRanking: async (weekStartDate) => {
    return await rankingRepository.getWeeklyRanking(weekStartDate);
  },

  /**
   * 전체 기간 누적 거리 랭킹 조회
   */
  getTotalDistanceRanking: async (memberId) => {
    return await rankingRepository.getTotalDistanceRanking(memberId);
  },

  /**
   * 주별 거리 랭킹 계산 및 Top 3 포인트 지급
   */
  calculateAndAwardWeeklyDistanceRanking: async (weekStartDate) => {
    try {
      // 랭킹 계산
      await rankingRepository.calculateWeeklyRanking(weekStartDate);

      // Top 3 조회
      const top3 = await rankingRepository.getTop3Members(weekStartDate);

      // 각 회원에게 3000포인트 지급
      for (const member of top3) {
        await pointService.addPoints(
          member.member_id,
          3000,
          `주별 거리 랭킹 ${member.rank_position}위 보상`
        );

        // 포인트 지급 완료 표시
        await rankingRepository.markPointsAwarded(weekStartDate, member.member_id);
      }

      return {
        weekStartDate,
        type: 'distance',
        top3Count: top3.length,
        members: top3
      };
    } catch (error) {
      console.error('Error calculating and awarding weekly distance ranking:', error);
      throw error;
    }
  },

  /**
   * 주별 이용 횟수 랭킹 계산 및 Top 3 포인트 지급
   */
  calculateAndAwardWeeklyRideRanking: async (weekStartDate) => {
    try {
      // Top 3 조회 (이용 횟수 기준)
      const top3 = await rankingRepository.getTop3RideMembers(weekStartDate);

      // 각 회원에게 3000포인트 지급
      for (const member of top3) {
        await pointService.addPoints(
          member.member_id,
          3000,
          `주별 이용 횟수 랭킹 ${member.rank_position}위 보상`
        );
      }

      return {
        weekStartDate,
        type: 'rides',
        top3Count: top3.length,
        members: top3
      };
    } catch (error) {
      console.error('Error calculating and awarding weekly ride ranking:', error);
      throw error;
    }
  },

  /**
   * 주별 랭킹 계산 및 Top 3 포인트 지급 (거리 + 이용 횟수)
   */
  calculateAndAwardWeeklyRanking: async (weekStartDate) => {
    try {
      // 거리 랭킹 보상 지급
      const distanceResult = await rankingService.calculateAndAwardWeeklyDistanceRanking(weekStartDate);
      
      // 이용 횟수 랭킹 보상 지급
      const rideResult = await rankingService.calculateAndAwardWeeklyRideRanking(weekStartDate);

      return {
        weekStartDate,
        distance: distanceResult,
        rides: rideResult
      };
    } catch (error) {
      console.error('Error calculating and awarding weekly ranking:', error);
      throw error;
    }
  },

  /**
   * 전체 기간 이용 횟수 랭킹 조회
   */
  getTotalRideRanking: async (memberId) => {
    return await rankingRepository.getTotalRideRanking(memberId);
  },

  /**
   * 지난 주 랭킹 계산 및 보상 지급 (스케줄러용)
   */
  processLastWeekRanking: async () => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 7 - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    lastWeekStart.setHours(0, 0, 0, 0);

    const weekStartDate = lastWeekStart.toISOString().split('T')[0];
    return await rankingService.calculateAndAwardWeeklyRanking(weekStartDate);
  }
};

module.exports = rankingService;