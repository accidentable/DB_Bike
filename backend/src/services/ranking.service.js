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
   * 주별 랭킹 계산 및 Top 3 포인트 지급
   */
  calculateAndAwardWeeklyRanking: async (weekStartDate) => {
    try {
      // 랭킹 계산
      await rankingRepository.calculateWeeklyRanking(weekStartDate);

      // Top 3 조회
      const top3 = await rankingRepository.getTop3Members(weekStartDate);

      // 각 회원에게 1000포인트 지급
      for (const member of top3) {
        await pointService.addPoints(
          member.member_id,
          1000,
          `주별 거리 랭킹 ${member.rank_position}위 보상`
        );

        // 포인트 지급 완료 표시
        await rankingRepository.markPointsAwarded(weekStartDate, member.member_id);
      }

      return {
        weekStartDate,
        top3Count: top3.length,
        members: top3
      };
    } catch (error) {
      console.error('Error calculating and awarding weekly ranking:', error);
      throw error;
    }
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