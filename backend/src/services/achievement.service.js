/**
 * src/services/achievement.service.js
 * 업적 관련 비즈니스 로직
 */

const achievementRepository = require('../repositories/achievement.repository');
const pointService = require('./point.service');

const achievementService = {
  /**
   * 모든 업적 조회
   */
  getAllAchievements: async () => {
    return await achievementRepository.getAllAchievements();
  },

  /**
   * 회원의 업적 조회 (달성 여부 및 진행도 포함)
   */
  getMemberAchievements: async (memberId) => {
    const allAchievements = await achievementRepository.getAllAchievements();
    const memberAchievements = await achievementRepository.getMemberAchievements(memberId);
    const stats = await achievementRepository.getMemberStats(memberId);
    
    const memberAchievementIds = new Set(
      memberAchievements.map(ma => ma.achievement_id)
    );

    return allAchievements.map(achievement => {
      const memberAchievement = memberAchievements.find(
        ma => ma.achievement_id === achievement.achievement_id
      );
      
      const earned = memberAchievement !== undefined;
      
      // 진행도 계산
      let progress = null;
      let total = null;
      
      if (!earned) {
        switch (achievement.condition_type) {
          case 'FIRST_RIDE':
            progress = stats.has_first_ride ? 1 : 0;
            total = 1;
            break;
          case 'TOTAL_RIDES':
            progress = Math.min(stats.total_rides || 0, achievement.condition_value);
            total = achievement.condition_value;
            break;
          case 'TOTAL_DISTANCE':
            progress = Math.min(Math.round(stats.total_distance || 0), achievement.condition_value);
            total = achievement.condition_value;
            break;
          case 'TOTAL_STATIONS':
            progress = Math.min(stats.total_stations || 0, achievement.condition_value);
            total = achievement.condition_value;
            break;
          case 'CONSECUTIVE_DAYS':
            progress = Math.min(stats.consecutive_days || 0, achievement.condition_value);
            total = achievement.condition_value;
            break;
        }
      }
      
      return {
        ...achievement,
        earned,
        earned_at: memberAchievement?.earned_at || null,
        points_awarded: memberAchievement?.points_awarded || false,
        progress,
        total
      };
    });
  },

  /**
   * 업적 달성 여부 확인
   */
  hasAchievement: async (memberId, achievementId) => {
    return await achievementRepository.hasAchievement(memberId, achievementId);
  },

  /**
   * 업적 달성 체크 (포인트는 수동으로 받도록 변경)
   */
  checkAchievements: async (memberId) => {
    try {
      const stats = await achievementRepository.getMemberStats(memberId);
      const allAchievements = await achievementRepository.getAllAchievements();
      const newlyEarned = [];

      for (const achievement of allAchievements) {
        // 이미 달성한 업적은 스킵
        const hasAchieved = await achievementRepository.hasAchievement(
          memberId,
          achievement.achievement_id
        );
        if (hasAchieved) continue;

        let conditionMet = false;

        switch (achievement.condition_type) {
          case 'FIRST_RIDE':
            conditionMet = stats.has_first_ride;
            break;
          case 'TOTAL_RIDES':
            conditionMet = stats.total_rides >= achievement.condition_value;
            break;
          case 'TOTAL_DISTANCE':
            conditionMet = stats.total_distance >= achievement.condition_value;
            break;
          case 'TOTAL_STATIONS':
            conditionMet = stats.total_stations >= achievement.condition_value;
            break;
          case 'CONSECUTIVE_DAYS':
            conditionMet = stats.consecutive_days >= achievement.condition_value;
            break;
        }

        if (conditionMet) {
          // 업적 달성 기록 (포인트는 수동으로 받도록 변경)
          const awarded = await achievementRepository.awardAchievement(
            memberId,
            achievement.achievement_id
          );

          if (awarded) {
            // 포인트는 사용자가 수동으로 받도록 변경 (자동 지급 제거)
            newlyEarned.push(achievement);
          }
        }
      }

      return newlyEarned;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }
};

module.exports = achievementService;