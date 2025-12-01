/**
 * src/repositories/ranking.repository.js
 * 랭킹 관련 데이터베이스 접근 계층
 */

const pool = require('../config/db.config');

const rankingRepository = {
  /**
   * 주의 시작일 계산 (월요일 기준)
   */
  getWeekStartDate: (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0]; // YYYY-MM-DD 형식
  },

  /**
   * 주별 거리 랭킹 조회
   */
  getWeeklyRanking: async (weekStartDate) => {
    try {
      const query = `
        SELECT 
          wr.rank_position,
          wr.member_id,
          m.username,
          wr.total_distance_km,
          wr.points_awarded
        FROM weekly_rankings wr
        JOIN members m ON wr.member_id = m.member_id
        WHERE wr.week_start_date = $1
        ORDER BY wr.rank_position ASC
        LIMIT 10
      `;
      const { rows } = await pool.query(query, [weekStartDate]);
      return rows;
    } catch (error) {
      console.error('Error getting weekly ranking:', error);
      throw error;
    }
  },

  /**
   * 주별 랭킹 계산 및 저장
   */
  calculateWeeklyRanking: async (weekStartDate) => {
    try {
      await pool.query('BEGIN');

      // 해당 주의 거리 합계 계산
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      weekEndDate.setHours(23, 59, 59, 999);

      const calculateQuery = `
        INSERT INTO weekly_rankings (week_start_date, member_id, total_distance_km, rank_position)
        SELECT 
          $1 as week_start_date,
          member_id,
          COALESCE(SUM(distance_km), 0) as total_distance_km,
          NULL as rank_position
        FROM rentals
        WHERE end_time IS NOT NULL
          AND distance_km IS NOT NULL
          AND start_time >= $1::TIMESTAMP
          AND start_time < $2::TIMESTAMP
        GROUP BY member_id
        ON CONFLICT (week_start_date, member_id) 
        DO UPDATE SET 
          total_distance_km = EXCLUDED.total_distance_km,
          rank_position = NULL
      `;
      await pool.query(calculateQuery, [weekStartDate, weekEndDate.toISOString()]);

      // 랭킹 순위 업데이트
      const rankQuery = `
        WITH ranked AS (
          SELECT 
            ranking_id,
            ROW_NUMBER() OVER (ORDER BY total_distance_km DESC) as rank_pos
          FROM weekly_rankings
          WHERE week_start_date = $1
        )
        UPDATE weekly_rankings wr
        SET rank_position = r.rank_pos
        FROM ranked r
        WHERE wr.ranking_id = r.ranking_id
      `;
      await pool.query(rankQuery, [weekStartDate]);

      await pool.query('COMMIT');
      return true;
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error calculating weekly ranking:', error);
      throw error;
    }
  },

  

  /**
   * Top 3 회원 조회
   */
  getTop3Members: async (weekStartDate) => {
    try {
      const query = `
        SELECT 
          member_id,
          total_distance_km,
          rank_position
        FROM weekly_rankings
        WHERE week_start_date = $1
          AND rank_position <= 3
          AND points_awarded = FALSE
        ORDER BY rank_position ASC
      `;
      const { rows } = await pool.query(query, [weekStartDate]);
      return rows;
    } catch (error) {
      console.error('Error getting top 3 members:', error);
      throw error;
    }
  },

  /**
   * 랭킹 포인트 지급 완료 표시
   */
  markPointsAwarded: async (weekStartDate, memberId) => {
    try {
      const query = `
        UPDATE weekly_rankings
        SET points_awarded = TRUE
        WHERE week_start_date = $1 AND member_id = $2
      `;
      await pool.query(query, [weekStartDate, memberId]);
    } catch (error) {
      console.error('Error marking ranking points awarded:', error);
      throw error;
    }
  },

  /**
 * 전체 기간 누적 거리 랭킹 조회
 */
getTotalDistanceRanking: async (memberId = null) => {
    try {
      const query = `
        SELECT 
          m.member_id,
          m.username,
          COALESCE(SUM(r.distance_km), 0) as total_distance_km,
          COUNT(r.rental_id) as total_rides,
          ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(r.distance_km), 0) DESC) as rank_position
        FROM members m
        LEFT JOIN rentals r ON m.member_id = r.member_id
          AND r.end_time IS NOT NULL
          AND r.distance_km IS NOT NULL
        GROUP BY m.member_id, m.username
        HAVING COALESCE(SUM(r.distance_km), 0) > 0
        ORDER BY total_distance_km DESC
        LIMIT 100
      `;
      const { rows } = await pool.query(query);
      
      // 현재 사용자의 랭킹 정보 추가
      if (memberId) {
        const userRank = rows.findIndex(row => row.member_id === memberId);
        if (userRank === -1) {
          // 랭킹 100위 밖인 경우 별도 조회
          const userQuery = `
            SELECT 
              m.member_id,
              m.username,
              COALESCE(SUM(r.distance_km), 0) as total_distance_km,
              COUNT(r.rental_id) as total_rides,
              (SELECT COUNT(*) + 1 
               FROM (
                 SELECT m2.member_id
                 FROM members m2
                 LEFT JOIN rentals r2 ON m2.member_id = r2.member_id
                   AND r2.end_time IS NOT NULL
                   AND r2.distance_km IS NOT NULL
                 GROUP BY m2.member_id
                 HAVING COALESCE(SUM(r2.distance_km), 0) > COALESCE(SUM(r.distance_km), 0)
               ) sub
              ) as rank_position
            FROM members m
            LEFT JOIN rentals r ON m.member_id = r.member_id
              AND r.end_time IS NOT NULL
              AND r.distance_km IS NOT NULL
            WHERE m.member_id = $1
            GROUP BY m.member_id, m.username
          `;
          const { rows: userRows } = await pool.query(userQuery, [memberId]);
          if (userRows.length > 0) {
            return {
              ranking: rows,
              currentUser: userRows[0]
            };
          }
        } else {
          return {
            ranking: rows,
            currentUser: rows[userRank]
          };
        }
      }
      
      return {
        ranking: rows,
        currentUser: null
      };
    } catch (error) {
      console.error('Error getting total distance ranking:', error);
      throw error;
    }
  },

  /**
   * 현재 주 랭킹 조회 (실시간 계산)
   */
  getCurrentWeekRanking: async () => {
    try {
      const weekStart = rankingRepository.getWeekStartDate();
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const query = `
        SELECT 
          m.member_id,
          m.username,
          COALESCE(SUM(r.distance_km), 0) as total_distance_km,
          ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(r.distance_km), 0) DESC) as rank_position
        FROM members m
        LEFT JOIN rentals r ON m.member_id = r.member_id
          AND r.end_time IS NOT NULL
          AND r.distance_km IS NOT NULL
          AND r.start_time >= $1::TIMESTAMP
          AND r.start_time < $2::TIMESTAMP
        GROUP BY m.member_id, m.username
        HAVING COALESCE(SUM(r.distance_km), 0) > 0
        ORDER BY total_distance_km DESC
        LIMIT 10
      `;
      const { rows } = await pool.query(query, [weekStart, weekEnd.toISOString()]);
      return rows;
    } catch (error) {
      console.error('Error getting current week ranking:', error);
      throw error;
    }
  }
};

module.exports = rankingRepository;