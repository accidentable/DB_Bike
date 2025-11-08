// src/repositories/rental.repository.js
// (DAO - DB SQL 실행, 트랜잭션 처리)

const pool = require('../config/db.config');

const rentalRepository = {
  /**
   * 대여 트랜잭션
   * PDF [cite: 94-102]와 init.sql 스키마를 기반으로 재구성
   */
  rentBikeTransaction: async (memberId, bikeId, startStationId) => {
    // 1. DB 풀에서 클라이언트 1개를 임대 (이 클라이언트로 모든 쿼리 실행)
    const client = await pool.connect();

    try {
      // --- 트랜잭션 시작 ---
      await client.query('BEGIN');

      // 1. (PDF [cite: 96]) 사용자가 이용권이 있는지 확인 (init.sql 스키마)
      const userCheck = await client.query(
        'SELECT has_subscription FROM members WHERE member_id = $1',
        [memberId]
      );
      if (!userCheck.rows[0] || !userCheck.rows[0].has_subscription) {
        throw new Error('이용권이 없습니다. 먼저 이용권을 구매해주세요.');
      }

      // 2. (PDF [cite: 97]) 자전거 상태 변경 (init.sql 스키마 반영)
      // lock_status를 'IN_USE'로, station_id를 NULL로 변경
      const bikeUpdate = await client.query(
        `UPDATE bikes 
         SET lock_status = 'IN_USE', station_id = NULL 
         WHERE bike_id = $1 AND status = '정상' AND lock_status = 'LOCKED'`,
        [bikeId]
      );
      // bikeUpdate.rowCount가 0이면, 자전거가 대여 가능한 상태가 아님
      if (bikeUpdate.rowCount === 0) {
        throw new Error('대여할 수 없는 자전거이거나 이미 사용 중입니다.');
      }

      // 3. (PDF [cite: 99]) 대여소 자전거 재고 1 감소
      const stationUpdate = await client.query(
        'UPDATE stations SET bike_count = bike_count - 1 WHERE station_id = $1 AND bike_count > 0',
        [startStationId]
      );
      if (stationUpdate.rowCount === 0) {
        throw new Error('대여소 재고 정보에 오류가 발생했습니다.');
      }

      // 4. (PDF [cite: 100]) 대여 기록(rentals) 생성
      await client.query(
        `INSERT INTO rentals (member_id, bike_id, start_station_id, start_time) 
         VALUES ($1, $2, $3, NOW())`,
        [memberId, bikeId, startStationId]
      );
      
      // 5. (PDF [cite: 101]) 사용자의 마지막 이용 자전거 기록
      await client.query(
        'UPDATE members SET last_bike_id = $1 WHERE member_id = $2',
        [bikeId, memberId]
      );

      // --- 모든 쿼리 성공: 트랜잭션 커밋 ---
      await client.query('COMMIT');
      return { success: true, message: '대여가 완료되었습니다.' };

    } catch (error) {
      // --- 오류 발생: 트랜잭션 롤백 ---
      await client.query('ROLLBACK');
      console.error('Rental transaction failed:', error.message);
      // 서비스 레이어로 에러 전달
      throw new Error(error.message || '대여 처리 중 오류가 발생했습니다.');
    } finally {
      // --- 사용한 클라이언트 반납 ---
      client.release();
    }
  },

  /**
   * 반납 트랜잭션
   * PDF [cite: 103-112]와 init.sql 스키마를 기반으로 재구성
   */
  returnBikeTransaction: async (memberId, endStationId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. (PDF [cite: 105-106]) 반납할 대여 기록 찾기 (아직 반납 안 된)
      //    반납 처리하며 RETURNING으로 bike_id를 가져옴
      const rentalUpdate = await client.query(
        `UPDATE rentals 
         SET end_time = NOW(), end_station_id = $1 
         WHERE member_id = $2 AND end_time IS NULL 
         RETURNING bike_id, start_time`,
        [endStationId, memberId]
      );
      if (rentalUpdate.rowCount === 0) {
        throw new Error('반납할 대여 기록이 없습니다.');
      }
      const { bike_id, start_time } = rentalUpdate.rows[0];
      
      // (TODO: PDF [cite: 116] '이벤트 대여소' 확인 로직이 이곳에 들어갈 수 있음)

      // 2. (PDF [cite: 107-108]) 자전거 상태 복원 (init.sql 스키마 반영)
      //    lock_status를 'LOCKED'로, station_id를 반납 위치로 변경
      await client.query(
        `UPDATE bikes 
         SET lock_status = 'LOCKED', station_id = $1 
         WHERE bike_id = $2`,
        [endStationId, bike_id]
      );

      // 3. (PDF [cite: 109]) 대여소 자전거 재고 1 증가
      await client.query(
        'UPDATE stations SET bike_count = bike_count + 1 WHERE station_id = $1',
        [endStationId]
      );

      await client.query('COMMIT');
      
      // 프론트엔드에 보여줄 이용 시간 등 계산
      const duration = new Date() - new Date(start_time);
      const durationMinutes = Math.round(duration / 60000);
      
      return { success: true, message: '반납이 완료되었습니다.', durationMinutes };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Return transaction failed:', error.message);
      throw new Error(error.message || '반납 처리 중 오류가 발생했습니다.');
    } finally {
      client.release();
    }
  },

  /**
   * (PDF [cite: 71]) 현재 대여 중인 정보 조회
   */
  findCurrentRentalByMemberId: async (memberId) => {
    const sql = `
      SELECT 
        r.rental_id, r.start_time,
        s.name AS start_station_name,
        b.bike_id
      FROM rentals r
      JOIN stations s ON r.start_station_id = s.station_id
      JOIN bikes b ON r.bike_id = b.bike_id
      WHERE r.member_id = $1 AND r.end_time IS NULL;
    `;
    const { rows } = await pool.query(sql, [memberId]);
    return rows[0]; // 없으면 undefined
  },

  /**
   * (PDF [cite: 113]) 대여 이력 조회
   */
  findRentalHistoryByMemberId: async (memberId) => {
    // PDF 요구사항(JOIN) [cite: 113-114]과 init.sql 스키마 반영
    const sql = `
      SELECT 
        r.rental_id, r.start_time, r.end_time,
        s_start.name AS start_station_name,
        s_end.name AS end_station_name,
        r.bike_id
      FROM rentals r
      JOIN stations s_start ON r.start_station_id = s_start.station_id
      LEFT JOIN stations s_end ON r.end_station_id = s_end.station_id
      WHERE r.member_id = $1 AND r.end_time IS NOT NULL
      ORDER BY r.start_time DESC
      LIMIT 20;
    `;
    const { rows } = await pool.query(sql, [memberId]);
    return rows;
  }
};

module.exports = rentalRepository;