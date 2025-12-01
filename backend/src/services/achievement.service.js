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
   * 회원의 업적 조회 (달성 여부 포함)
   */
  getMemberAchievements: async (memberId) => {
    const allAchievements = await achievementRepository.getAllAchievements();
    const memberAchievements = await achievementRepository.getMemberAchievements(memberId);
    
    const memberAchievementIds = new Set(
      memberAchievements.map(ma => ma.achievement_id)
    );

    return allAchievements.map(achievement => {
      const memberAchievement = memberAchievements.find(
        ma => ma.achievement_id === achievement.achievement_id
      );
      return {
        ...achievement,
        earned: memberAchievement !== undefined,
        earned_at: memberAchievement?.earned_at || null,
        points_awarded: memberAchievement?.points_awarded || false
      };
    });
  },

  /**
   * 업적 달성 체크 및 포인트 지급
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
          // 업적 달성 기록
          const awarded = await achievementRepository.awardAchievement(
            memberId,
            achievement.achievement_id
          );

          if (awarded) {
            // 포인트 지급
            await pointService.addPoints(
              memberId,
              1000,
              `업적 달성: ${achievement.name}`
            );

            // 포인트 지급 완료 표시
            await achievementRepository.markPointsAwarded(
              memberId,
              achievement.achievement_id
            );

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