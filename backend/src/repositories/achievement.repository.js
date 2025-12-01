/**
 * src/repositories/achievement.repository.js
 * 업적 관련 데이터베이스 접근 계층
 */

const pool = require('../config/db.config');

const achievementRepository = {
  /**
   * 모든 업적 조회
   */
  getAllAchievements: async () => {
    try {
      const query = 'SELECT * FROM achievements ORDER BY achievement_id';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error getting all achievements:', error);
      throw error;
    }
  },

  /**
   * 회원의 달성한 업적 조회
   */
  getMemberAchievements: async (memberId) => {
    try {
      const query = `
        SELECT 
          a.achievement_id,
          a.name,
          a.description,
          a.icon,
          a.condition_type,
          a.condition_value,
          ma.earned_at,
          ma.points_awarded
        FROM member_achievements ma
        JOIN achievements a ON ma.achievement_id = a.achievement_id
        WHERE ma.member_id = $1
        ORDER BY ma.earned_at DESC
      `;
      const { rows } = await pool.query(query, [memberId]);
      return rows;
    } catch (error) {
      console.error('Error getting member achievements:', error);
      throw error;
    }
  },

  /**
   * 특정 업적 달성 여부 확인
   */
  hasAchievement: async (memberId, achievementId) => {
    try {
      const query = `
        SELECT 1 FROM member_achievements
        WHERE member_id = $1 AND achievement_id = $2
      `;
      const { rows } = await pool.query(query, [memberId, achievementId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking achievement:', error);
      throw error;
    }
  },

  /**
   * 업적 달성 기록
   */
  awardAchievement: async (memberId, achievementId) => {
    try {
      const query = `
        INSERT INTO member_achievements (member_id, achievement_id, points_awarded)
        VALUES ($1, $2, FALSE)
        ON CONFLICT (member_id, achievement_id) DO NOTHING
        RETURNING member_achievement_id
      `;
      const { rows } = await pool.query(query, [memberId, achievementId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  },

  /**
   * 업적 포인트 지급 완료 표시
   */
  markPointsAwarded: async (memberId, achievementId) => {
    try {
      const query = `
        UPDATE member_achievements
        SET points_awarded = TRUE
        WHERE member_id = $1 AND achievement_id = $2
      `;
      await pool.query(query, [memberId, achievementId]);
    } catch (error) {
      console.error('Error marking points awarded:', error);
      throw error;
    }
  },

  /**
   * 회원 통계 조회 (업적 체크용)
   */
  getMemberStats: async (memberId) => {
    try {
      const query = `
        SELECT 
          -- 총 이용 횟수
          (SELECT COUNT(*) FROM rentals WHERE member_id = $1 AND end_time IS NOT NULL) as total_rides,
          
          -- 총 거리 (km)
          (SELECT COALESCE(SUM(distance_km), 0) FROM rentals WHERE member_id = $1 AND distance_km IS NOT NULL) as total_distance,
          
          -- 이용한 대여소 수
          (SELECT COUNT(DISTINCT start_station_id) + COUNT(DISTINCT end_station_id) 
           FROM rentals 
           WHERE member_id = $1 AND end_time IS NOT NULL) as total_stations,
          
          -- 첫 이용 여부
          (SELECT COUNT(*) FROM rentals WHERE member_id = $1 AND end_time IS NOT NULL) > 0 as has_first_ride,
          
          -- 연속 이용일수 (최근 30일 기준)
          (
            WITH daily_rides AS (
              SELECT DISTINCT DATE(start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') as ride_date
              FROM rentals
              WHERE member_id = $1 
                AND end_time IS NOT NULL
                AND start_time >= NOW() - INTERVAL '30 days'
              ORDER BY ride_date DESC
            ),
            consecutive_days AS (
              SELECT 
                ride_date,
                ride_date - ROW_NUMBER() OVER (ORDER BY ride_date DESC)::INTEGER as grp
              FROM daily_rides
            )
            SELECT COUNT(DISTINCT grp)
            FROM consecutive_days
            WHERE grp = (SELECT grp FROM consecutive_days ORDER BY ride_date DESC LIMIT 1)
          ) as consecutive_days
      `;
      const { rows } = await pool.query(query, [memberId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting member stats:', error);
      throw error;
    }
  }
};

module.exports = achievementRepository;