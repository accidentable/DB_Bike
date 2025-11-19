/**
 * src/repositories/point.repository.js
 * 포인트 관련 데이터베이스 접근 계층 (Repository/DAO)
 */

const pool = require('../config/db.config');

const pointRepository = {
  /**
   * 포인트 추가 (충전 또는 적립)
   * @param {number} memberId - 사용자 ID
   * @param {number} amount - 추가할 포인트 양
   * @param {string} description - 포인트 추가 사유
   * @returns {Promise<number>} - 업데이트된 포인트 잔액
   */
  addPoints: async (memberId, amount, description = '포인트 충전') => {
    try {
      // 트랜잭션 시작
      await pool.query('BEGIN');

      // 1. 현재 포인트 잔액 조회
      const balanceQuery = 'SELECT point_balance FROM members WHERE member_id = $1';
      const { rows: balanceRows } = await pool.query(balanceQuery, [memberId]);
      
      if (balanceRows.length === 0) {
        await pool.query('ROLLBACK');
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const currentBalance = balanceRows[0].point_balance;
      const newBalance = currentBalance + amount;

      // 2. 포인트 잔액 업데이트
      const updateQuery = `
        UPDATE members 
        SET point_balance = $1 
        WHERE member_id = $2
        RETURNING point_balance;
      `;
      const { rows: updateRows } = await pool.query(updateQuery, [newBalance, memberId]);

      // 3. 포인트 트랜잭션 기록
      const transactionQuery = `
        INSERT INTO point_transactions (member_id, amount, type, description, balance_after)
        VALUES ($1, $2, 'CHARGE', $3, $4)
        RETURNING transaction_id;
      `;
      await pool.query(transactionQuery, [memberId, amount, description, newBalance]);

      // 트랜잭션 커밋
      await pool.query('COMMIT');

      return newBalance;
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error adding points:', error);
      throw error;
    }
  },

  /**
   * 포인트 차감 (사용)
   * @param {number} memberId - 사용자 ID
   * @param {number} amount - 차감할 포인트 양
   * @param {string} description - 포인트 차감 사유
   * @returns {Promise<number>} - 업데이트된 포인트 잔액
   */
  deductPoints: async (memberId, amount, description = '포인트 사용') => {
    try {
      // 트랜잭션 시작
      await pool.query('BEGIN');

      // 1. 현재 포인트 잔액 조회
      const balanceQuery = 'SELECT point_balance FROM members WHERE member_id = $1';
      const { rows: balanceRows } = await pool.query(balanceQuery, [memberId]);
      
      if (balanceRows.length === 0) {
        await pool.query('ROLLBACK');
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const currentBalance = balanceRows[0].point_balance;
      
      if (currentBalance < amount) {
        await pool.query('ROLLBACK');
        throw new Error('포인트 잔액이 부족합니다.');
      }

      const newBalance = currentBalance - amount;

      // 2. 포인트 잔액 업데이트
      const updateQuery = `
        UPDATE members 
        SET point_balance = $1 
        WHERE member_id = $2
        RETURNING point_balance;
      `;
      const { rows: updateRows } = await pool.query(updateQuery, [newBalance, memberId]);

      // 3. 포인트 트랜잭션 기록 (음수로 저장)
      const transactionQuery = `
        INSERT INTO point_transactions (member_id, amount, type, description, balance_after)
        VALUES ($1, $2, 'USE', $3, $4)
        RETURNING transaction_id;
      `;
      await pool.query(transactionQuery, [memberId, -amount, description, newBalance]);

      // 트랜잭션 커밋
      await pool.query('COMMIT');

      return newBalance;
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error deducting points:', error);
      throw error;
    }
  },

  /**
   * 포인트 사용 내역 조회
   * @param {number} memberId - 사용자 ID
   * @param {number} limit - 조회할 최대 개수 (기본값: 50)
   * @returns {Promise<Array>} - 포인트 트랜잭션 배열
   */
  getHistory: async (memberId, limit = 50) => {
    try {
      const query = `
        SELECT 
          transaction_id,
          member_id,
          amount,
          type,
          description,
          balance_after,
          created_at
        FROM point_transactions
        WHERE member_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
      `;
      const { rows } = await pool.query(query, [memberId, limit]);
      return rows;
    } catch (error) {
      console.error('Error getting point history:', error);
      throw error;
    }
  }
};

module.exports = pointRepository;

