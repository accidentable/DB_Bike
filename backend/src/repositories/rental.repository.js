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

      // 1. (PDF [cite: 97]) 자전거 상태 변경 (init.sql 스키마 반영)
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

      // 2. (PDF [cite: 99]) 대여소 자전거 재고 1 감소
      const stationUpdate = await client.query(
        'UPDATE stations SET bike_count = bike_count - 1 WHERE station_id = $1 AND bike_count > 0',
        [startStationId]
      );
      if (stationUpdate.rowCount === 0) {
        throw new Error('대여소 재고 정보에 오류가 발생했습니다.');
      }

      // 3. (PDF [cite: 100]) 대여 기록(rentals) 생성
      await client.query(
        `INSERT INTO rentals (member_id, bike_id, start_station_id, start_time) 
         VALUES ($1, $2, $3, NOW())`,
        [memberId, bikeId, startStationId]
      );
      
      // 4. (PDF [cite: 101]) 사용자의 마지막 이용 자전거 기록
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
      console.log('[반납 트랜잭션] BEGIN');
      await client.query('BEGIN');
  
      // 1. 반납할 대여 기록 찾기 (rental_id도 함께 반환)
      console.log('[반납 트랜잭션] 1. 대여 기록 찾기...');
      const rentalUpdate = await client.query(
        `UPDATE rentals 
         SET end_station_id = $1, end_time = NOW()
         WHERE member_id = $2 AND end_time IS NULL
         RETURNING rental_id, bike_id, start_station_id, start_time`,
        [endStationId, memberId]
      );
  
      if (rentalUpdate.rowCount === 0) {
        console.error('[반납 트랜잭션] ❌ 반납할 대여 기록이 없습니다.');
        throw new Error('반납할 대여 기록이 없습니다.');
      }
      const { rental_id, bike_id, start_station_id, start_time } = rentalUpdate.rows[0];
      console.log('[반납 트랜잭션] ✅ 대여 기록 찾음:', { rental_id, bike_id, start_station_id });
  
      // 2. 거리 계산 (두 대여소 간 거리)
      console.log('[반납 트랜잭션] 2. 거리 계산 시작...');
      console.log('[반납 트랜잭션] 시작 대여소 ID:', start_station_id, '종료 대여소 ID:', endStationId);
      
      const distanceQuery = `
        SELECT 
          s1.latitude as start_lat,
          s1.longitude as start_lon,
          s2.latitude as end_lat,
          s2.longitude as end_lon
        FROM stations s1, stations s2
        WHERE s1.station_id = $1 AND s2.station_id = $2
      `;
      const { rows: stationRows } = await client.query(distanceQuery, [start_station_id, endStationId]);
      
      console.log('[반납 트랜잭션] 대여소 위치 정보:', stationRows);
      
      let distanceKm = null;
      if (stationRows.length > 0 && stationRows[0].start_lat && stationRows[0].end_lat) {
        const { start_lat, start_lon, end_lat, end_lon } = stationRows[0];
        console.log('[반납 트랜잭션] 위치 좌표:', { start_lat, start_lon, end_lat, end_lon });
        
        // Haversine 공식으로 거리 계산
        const R = 6371; // 지구 반지름 (km)
        const dLat = (end_lat - start_lat) * Math.PI / 180;
        const dLon = (end_lon - start_lon) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(start_lat * Math.PI / 180) * Math.cos(end_lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = R * c;
        console.log('[반납 트랜잭션] ✅ 거리 계산 완료:', distanceKm, 'km');
      } else {
        console.warn('[반납 트랜잭션] ⚠️ 거리 계산 실패: 대여소 위치 정보가 없습니다.');
      }
  
      // 3. 거리 업데이트 (rental_id로 정확히 찾기)
      if (distanceKm !== null) {
        console.log('[반납 트랜잭션] 3. 거리 업데이트...');
        const updateResult = await client.query(
          `UPDATE rentals SET distance_km = $1 WHERE rental_id = $2`,
          [distanceKm, rental_id]
        );
        console.log('[반납 트랜잭션] ✅ 거리 업데이트 완료:', updateResult.rowCount, '행 업데이트됨');
      } else {
        console.warn('[반납 트랜잭션] ⚠️ 거리가 null이어서 업데이트하지 않습니다.');
      }
  
      // 4. 자전거 상태 변경
      console.log('[반납 트랜잭션] 4. 자전거 상태 변경...');
      await client.query(
        `UPDATE bikes SET lock_status = 'LOCKED', station_id = $1 WHERE bike_id = $2`,
        [endStationId, bike_id]
      );
      console.log('[반납 트랜잭션] ✅ 자전거 상태 변경 완료');
  
      // 5. 대여소 자전거 재고 증가
      console.log('[반납 트랜잭션] 5. 대여소 재고 증가...');
      await client.query(
        'UPDATE stations SET bike_count = bike_count + 1 WHERE station_id = $1',
        [endStationId]
      );
      console.log('[반납 트랜잭션] ✅ 대여소 재고 증가 완료');
  
      await client.query('COMMIT');
      console.log('[반납 트랜잭션] ✅ COMMIT 완료');
      return { success: true, message: '반납이 완료되었습니다.', distance_km: distanceKm };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[반납 트랜잭션] ❌ ROLLBACK:', error.message);
      console.error('[반납 트랜잭션] 에러 스택:', error.stack);
      throw new Error(error.message || '반납 처리 중 오류가 발생했습니다.');
    } finally {
      client.release();
      console.log('[반납 트랜잭션] 클라이언트 해제');
    }
  },

  /**
   * (PDF [cite: 71]) 현재 대여 중인 정보 조회
   */
  findCurrentRentalByMemberId: async (memberId) => {
    const sql = `
      SELECT 
        r.rental_id, 
        -- UTC 시간을 KST(Asia/Seoul)로 변환하여 ISO 형식으로 반환 (시간대 정보 포함)
        TO_CHAR(r.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS start_time,
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
        r.rental_id, 
        -- UTC 시간을 KST(Asia/Seoul)로 변환하여 ISO 형식으로 반환 (시간대 정보 포함)
        TO_CHAR(r.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS start_time,
        TO_CHAR(r.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS end_time,
        s_start.name AS start_station_name,
        s_end.name AS end_station_name,
        r.bike_id,
        r.distance_km
      FROM rentals r
      JOIN stations s_start ON r.start_station_id = s_start.station_id
      LEFT JOIN stations s_end ON r.end_station_id = s_end.station_id
      WHERE r.member_id = $1 AND r.end_time IS NOT NULL
      ORDER BY r.start_time DESC
      LIMIT 20;
    `;
    const { rows } = await pool.query(sql, [memberId]);
    return rows;
  },

  /**
   * 모든 대여 기록 조회 (관리자용)
   */
  findAllRentals: async () => {
    const sql = `
      SELECT 
        r.rental_id,
        r.member_id,
        m.username,
        m.email,
        r.bike_id,
        TO_CHAR(r.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS start_time,
        TO_CHAR(r.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD"T"HH24:MI:SS"+09:00"') AS end_time,
        s_start.name AS start_station_name,
        s_end.name AS end_station_name
      FROM rentals r
      JOIN members m ON r.member_id = m.member_id
      JOIN stations s_start ON r.start_station_id = s_start.station_id
      LEFT JOIN stations s_end ON r.end_station_id = s_end.station_id
      ORDER BY r.start_time DESC
      LIMIT 100;
    `;
    const { rows } = await pool.query(sql);
    return rows;
  }
};

module.exports = rentalRepository;