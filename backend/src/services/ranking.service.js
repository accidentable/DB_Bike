/**
 * src/services/ranking.service.js
 * 랭킹 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - getCurrentWeekRanking: 현재 주 랭킹 조회
 * - getWeeklyRanking: 특정 주 랭킹 조회
 * - getTotalDistanceRanking, getTotalRideRanking: 전체 기간 랭킹 조회
 * - calculateAndAwardWeeklyDistanceRanking: 주별 거리 랭킹 계산 및 Top 3 포인트 지급
 * - calculateAndAwardWeeklyRideRanking: 주별 이용 횟수 랭킹 계산 및 Top 3 포인트 지급
 * - calculateAndAwardWeeklyRanking: 주별 랭킹 계산 및 보상 지급 (거리 + 이용 횟수)
 * - processLastWeekRanking: 지난 주 랭킹 계산 및 보상 지급 (스케줄러용)
 */

const rankingRepository = require('../repositories/ranking.repository');
const pointService = require('./point.service');

const rankingService = {
  // 현재 주 랭킹 조회
  getCurrentWeekRanking: async () => {
    return await rankingRepository.getCurrentWeekRanking();
  },

  // 특정 주 랭킹 조회
  getWeeklyRanking: async (weekStartDate) => {
    return await rankingRepository.getWeeklyRanking(weekStartDate);
  },

  // 전체 기간 누적 거리 랭킹 조회
  getTotalDistanceRanking: async (memberId) => {
    return await rankingRepository.getTotalDistanceRanking(memberId);
  },

  // 주별 거리 랭킹 계산 및 Top 3 포인트 지급
  calculateAndAwardWeeklyDistanceRanking: async (weekStartDate) => {
    try {
      await rankingRepository.calculateWeeklyRanking(weekStartDate);
      const top3 = await rankingRepository.getTop3Members(weekStartDate);

      for (const member of top3) {
        await pointService.addPoints(
          member.member_id,
          3000,
          `주별 거리 랭킹 ${member.rank_position}위 보상`
        );

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

  // 주별 이용 횟수 랭킹 계산 및 Top 3 포인트 지급
  calculateAndAwardWeeklyRideRanking: async (weekStartDate) => {
    try {
      const top3 = await rankingRepository.getTop3RideMembers(weekStartDate);

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

  // 주별 랭킹 계산 및 보상 지급 (거리 + 이용 횟수)
  calculateAndAwardWeeklyRanking: async (weekStartDate) => {
    try {
      const distanceResult = await rankingService.calculateAndAwardWeeklyDistanceRanking(weekStartDate);
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

  // 전체 기간 이용 횟수 랭킹 조회
  getTotalRideRanking: async (memberId) => {
    return await rankingRepository.getTotalRideRanking(memberId);
  },

  // 지난 주 랭킹 계산 및 보상 지급
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