/**
 * src/repositories/bike.repository.js
 * 자전거(Bike) 데이터베이스 접근 계층 (Repository/DAO)
 * 
 * 역할: 데이터베이스와 직접 통신하는 계층입니다.
 * - SQL 쿼리 실행
 * - 데이터베이스 결과를 JavaScript 객체로 변환
 * - 에러 처리 및 로깅
 * 
 * 아키텍처:
 *   - 계층형 아키텍처의 Repository 패턴을 따릅니다.
 *   - Service 계층에서 이 Repository를 호출합니다.
 *   - 데이터베이스 구현 세부사항을 Service 계층으로부터 숨깁니다.
 * 
 * 의존성:
 *   - db.config: PostgreSQL 연결 풀 (Pool 객체)
 */

const pool = require('../config/db.config'); // PostgreSQL 연결 풀 가져오기

const bikeRepository = {
  /**
   * ID로 자전거 조회
   * 
   * @param {number} bikeId - 조회할 자전거 ID
   * @returns {Promise<Object|undefined>} - 자전거 정보 객체 또는 undefined
   * 
   * SQL 쿼리:
   *   SELECT * FROM bikes WHERE bike_id = $1
   *   - $1은 PostgreSQL의 파라미터화된 쿼리 (SQL 인젝션 방지)
   */
  findById: async (bikeId) => {
    try {
      const query = 'SELECT * FROM bikes WHERE bike_id = $1';
      const { rows } = await pool.query(query, [bikeId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding bike by ID:', error);
      throw error;
    }
  },

  /**
   * 대여소별 자전거 목록 조회
   * 
   * @param {number} stationId - 대여소 ID
   * @returns {Promise<Array>} - 자전거 배열
   */
  findByStationId: async (stationId) => {
    try {
      const query = `
        SELECT * FROM bikes 
        WHERE station_id = $1 
        ORDER BY bike_id ASC
      `;
      const { rows } = await pool.query(query, [stationId]);
      return rows;
    } catch (error) {
      console.error('Error finding bikes by station ID:', error);
      throw error;
    }
  },

  /**
   * 대여소별 사용 가능한 자전거 목록 조회
   * (status='정상', lock_status='LOCKED')
   * 
   * @param {number} stationId - 대여소 ID
   * @returns {Promise<Array>} - 사용 가능한 자전거 배열
   */
  findAvailableByStationId: async (stationId) => {
    try {
      const query = `
        SELECT * FROM bikes 
        WHERE station_id = $1 
          AND status = '정상' 
          AND lock_status = 'LOCKED'
        ORDER BY bike_id ASC
      `;
      const { rows } = await pool.query(query, [stationId]);
      return rows;
    } catch (error) {
      console.error('Error finding available bikes by station ID:', error);
      throw error;
    }
  },

  /**
   * 상태별 자전거 목록 조회
   * 
   * @param {string} status - 자전거 상태 ('정상', '고장', '수리중')
   * @returns {Promise<Array>} - 자전거 배열
   */
  findByStatus: async (status) => {
    try {
      const query = `
        SELECT * FROM bikes 
        WHERE status = $1 
        ORDER BY bike_id ASC
      `;
      const { rows } = await pool.query(query, [status]);
      return rows;
    } catch (error) {
      console.error('Error finding bikes by status:', error);
      throw error;
    }
  },

  /**
   * 잠금 상태별 자전거 목록 조회
   * 
   * @param {string} lockStatus - 잠금 상태 ('LOCKED', 'IN_USE')
   * @returns {Promise<Array>} - 자전거 배열
   */
  findByLockStatus: async (lockStatus) => {
    try {
      const query = `
        SELECT * FROM bikes 
        WHERE lock_status = $1 
        ORDER BY bike_id ASC
      `;
      const { rows } = await pool.query(query, [lockStatus]);
      return rows;
    } catch (error) {
      console.error('Error finding bikes by lock status:', error);
      throw error;
    }
  },

  /**
   * 모든 자전거 조회 (관리자용)
   * 
   * @returns {Promise<Array>} - 모든 자전거 배열
   */
  findAll: async () => {
    try {
      const query = `
        SELECT 
          b.*,
          s.name AS station_name
        FROM bikes b
        LEFT JOIN stations s ON b.station_id = s.station_id
        ORDER BY b.bike_id ASC
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error finding all bikes:', error);
      throw error;
    }
  },

  /**
   * 새 자전거 생성
   * 
   * @param {number} stationId - 대여소 ID (선택)
   * @param {string} status - 자전거 상태 (기본값: '정상')
   * @param {string} lockStatus - 잠금 상태 (기본값: 'LOCKED')
   * @returns {Promise<Object>} - 생성된 자전거 정보
   */
  create: async (stationId = null, status = '정상', lockStatus = 'LOCKED') => {
    try {
      await pool.query('BEGIN');

      const query = `
        INSERT INTO bikes (station_id, status, lock_status)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [stationId, status, lockStatus]);
      const newBike = rows[0];

      // 대여소에 자전거가 추가되면 bike_count 증가
      if (stationId) {
        await pool.query(
          'UPDATE stations SET bike_count = bike_count + 1 WHERE station_id = $1',
          [stationId]
        );
      }

      await pool.query('COMMIT');
      return newBike;
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error creating bike:', error);
      throw error;
    }
  },

  /**
   * 자전거 정보 업데이트
   * 
   * @param {number} bikeId - 자전거 ID
   * @param {Object} bikeData - 업데이트할 데이터
   * @returns {Promise<Object>} - 업데이트된 자전거 정보
   */
  update: async (bikeId, bikeData) => {
    try {
      const { station_id, status, lock_status } = bikeData;
      
      // 기존 자전거 정보 조회 (이전 station_id 확인용)
      const oldBike = await bikeRepository.findById(bikeId);
      if (!oldBike) {
        throw new Error('자전거를 찾을 수 없습니다.');
      }

      await pool.query('BEGIN');

      const query = `
        UPDATE bikes
        SET 
          station_id = COALESCE($1, station_id),
          status = COALESCE($2, status),
          lock_status = COALESCE($3, lock_status)
        WHERE bike_id = $4
        RETURNING *;
      `;
      const values = [station_id, status, lock_status, bikeId];
      const { rows } = await pool.query(query, values);
      const updatedBike = rows[0];

      // 대여소 재고 업데이트
      if (oldBike.station_id !== station_id) {
        // 이전 대여소에서 제거
        if (oldBike.station_id) {
          await pool.query(
            'UPDATE stations SET bike_count = GREATEST(bike_count - 1, 0) WHERE station_id = $1',
            [oldBike.station_id]
          );
        }
        // 새 대여소에 추가
        if (station_id) {
          await pool.query(
            'UPDATE stations SET bike_count = bike_count + 1 WHERE station_id = $1',
            [station_id]
          );
        }
      }

      await pool.query('COMMIT');
      return updatedBike;
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error updating bike:', error);
      throw error;
    }
  },

  /**
   * 자전거 상태 업데이트
   * 
   * @param {number} bikeId - 자전거 ID
   * @param {string} status - 새 상태 ('정상', '고장', '수리중')
   * @returns {Promise<Object>} - 업데이트된 자전거 정보
   */
  updateStatus: async (bikeId, status) => {
    try {
      const query = `
        UPDATE bikes
        SET status = $1
        WHERE bike_id = $2
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [status, bikeId]);
      return rows[0];
    } catch (error) {
      console.error('Error updating bike status:', error);
      throw error;
    }
  },

  /**
   * 자전거 잠금 상태 업데이트
   * 
   * @param {number} bikeId - 자전거 ID
   * @param {string} lockStatus - 새 잠금 상태 ('LOCKED', 'IN_USE')
   * @param {number} stationId - 대여소 ID (선택, lockStatus가 'LOCKED'일 때)
   * @returns {Promise<Object>} - 업데이트된 자전거 정보
   */
  updateLockStatus: async (bikeId, lockStatus, stationId = null) => {
    try {
      const query = `
        UPDATE bikes
        SET 
          lock_status = $1,
          station_id = CASE WHEN $1 = 'LOCKED' THEN COALESCE($2, station_id) ELSE NULL END
        WHERE bike_id = $3
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [lockStatus, stationId, bikeId]);
      return rows[0];
    } catch (error) {
      console.error('Error updating bike lock status:', error);
      throw error;
    }
  },

  /**
   * 자전거 삭제
   * 
   * @param {number} bikeId - 삭제할 자전거 ID
   * @returns {Promise<void>}
   */
  delete: async (bikeId) => {
    try {
      await pool.query('BEGIN');

      // 자전거 정보 조회 (대여소 재고 업데이트용)
      const bike = await bikeRepository.findById(bikeId);
      if (!bike) {
        throw new Error('자전거를 찾을 수 없습니다.');
      }

      // 자전거 삭제
      await pool.query('DELETE FROM bikes WHERE bike_id = $1', [bikeId]);

      // 대여소 재고 감소
      if (bike.station_id) {
        await pool.query(
          'UPDATE stations SET bike_count = GREATEST(bike_count - 1, 0) WHERE station_id = $1',
          [bike.station_id]
        );
      }

      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error deleting bike:', error);
      throw error;
    }
  },

  /**
   * 자전거 통계 조회
   * 
   * @returns {Promise<Object>} - 자전거 통계 정보
   */
  getStats: async () => {
    try {
      const query = `
        SELECT 
          COUNT(*) AS total_bikes,
          COUNT(*) FILTER (WHERE status = '정상') AS normal_bikes,
          COUNT(*) FILTER (WHERE status = '고장') AS broken_bikes,
          COUNT(*) FILTER (WHERE status = '수리중') AS repairing_bikes,
          COUNT(*) FILTER (WHERE lock_status = 'LOCKED') AS locked_bikes,
          COUNT(*) FILTER (WHERE lock_status = 'IN_USE') AS in_use_bikes
        FROM bikes
      `;
      const { rows } = await pool.query(query);
      return rows[0];
    } catch (error) {
      console.error('Error getting bike stats:', error);
      throw error;
    }
  }
};

// Repository 객체를 모듈로 내보내기 (services에서 사용)
module.exports = bikeRepository;

