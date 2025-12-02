/**
 * src/repositories/activityLog.repository.js
 * Activity Log 관련 데이터베이스 접근 계층
 */

const pool = require('../config/db.config');

const activityLogRepository = {
  /**
   * 자전거 대여 로그 조회
   */
  getRentalLogs: async (limit) => {
    try {
      const query = `
        SELECT 
          r.start_time as timestamp,
          m.email as user_email,
          CONCAT('자전거 대여 (', r.bike_id, '번)') as action,
          'success' as status
        FROM rentals r
        JOIN members m ON r.member_id = m.member_id
        WHERE r.start_time IS NOT NULL
        ORDER BY r.start_time DESC
        LIMIT $1
      `;
      const { rows } = await pool.query(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting rental logs:', error);
      throw error;
    }
  },

  /**
   * 자전거 반납 로그 조회
   */
  getReturnLogs: async (limit) => {
    try {
      const query = `
        SELECT 
          r.end_time as timestamp,
          m.email as user_email,
          CONCAT('자전거 반납 (', r.bike_id, '번)') as action,
          'success' as status
        FROM rentals r
        JOIN members m ON r.member_id = m.member_id
        WHERE r.end_time IS NOT NULL
        ORDER BY r.end_time DESC
        LIMIT $1
      `;
      const { rows } = await pool.query(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting return logs:', error);
      throw error;
    }
  },

  /**
   * 포인트 트랜잭션 로그 조회 (이용권 구매, 업적 달성, 랭킹 보상 등)
   */
  getPointTransactionLogs: async (limit) => {
    try {
      const query = `
        SELECT 
          pt.created_at as timestamp,
          m.email as user_email,
          CASE 
            WHEN pt.description LIKE '%이용권%' OR pt.description LIKE '%구매%' 
              THEN CONCAT('이용권 구매 (', pt.description, ')')
            WHEN pt.description LIKE '%업적%' 
              THEN CONCAT('업적 달성: ', pt.description)
            WHEN pt.description LIKE '%랭킹%' 
              THEN CONCAT('랭킹 보상: ', pt.description)
            WHEN pt.description LIKE '%충전%'
              THEN CONCAT('포인트 충전: ', pt.description)
            ELSE CONCAT('포인트 ', pt.type, ': ', pt.description)
          END as action,
          CASE 
            WHEN pt.amount > 0 THEN 'success'
            ELSE 'info'
          END as status
        FROM point_transactions pt
        JOIN members m ON pt.member_id = m.member_id
        WHERE pt.type = 'CHARGE'
        ORDER BY pt.created_at DESC
        LIMIT $1
      `;
      const { rows } = await pool.query(query, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting point transaction logs:', error);
      throw error;
    }
  }
};

module.exports = activityLogRepository;