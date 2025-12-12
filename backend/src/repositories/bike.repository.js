const pool = require('../config/db.config');

const bikeRepository = {
  /**
   * 모든 자전거 조회
   */
  findAll: async () => {
    try {
      const query = `
        SELECT 
          bike_id,
          station_id,
          status,
          lock_status,
          created_at
        FROM bikes
        ORDER BY bike_id ASC
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error finding all bikes:', error);
      throw error;
    }
  },

  /**
   * ID로 자전거 조회
   */
  findById: async (bikeId) => {
    try {
      const query = `
        SELECT 
          bike_id,
          station_id,
          status,
          lock_status,
          created_at
        FROM bikes
        WHERE bike_id = $1
      `;
      const { rows } = await pool.query(query, [bikeId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding bike by id:', error);
      throw error;
    }
  },

  /**
   * 자전거 생성
   */
  create: async (stationId, status = '정상', lockStatus = 'LOCKED') => {
    try {
      const query = `
        INSERT INTO bikes (station_id, status, lock_status)
        VALUES ($1, $2, $3)
        RETURNING bike_id, station_id, status, lock_status, created_at
      `;
      const { rows } = await pool.query(query, [stationId, status, lockStatus]);
      
      // 대여소 자전거 수 증가
      if (stationId) {
        await pool.query(
          'UPDATE stations SET bike_count = bike_count + 1 WHERE station_id = $1',
          [stationId]
        );
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error creating bike:', error);
      throw error;
    }
  },

  /**
   * 자전거 정보 업데이트
   */
  update: async (bikeId, updateData) => {
    try {
      const { station_id, status, lock_status } = updateData;
      
      // 기존 자전거 정보 조회
      const oldBike = await bikeRepository.findById(bikeId);
      if (!oldBike) {
        throw new Error('자전거를 찾을 수 없습니다.');
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // 자전거 정보 업데이트
        const updateFields = [];
        const values = [];
        let paramIndex = 1;

        if (station_id !== undefined) {
          updateFields.push(`station_id = $${paramIndex}`);
          values.push(station_id);
          paramIndex++;
        }
        if (status !== undefined) {
          updateFields.push(`status = $${paramIndex}`);
          values.push(status);
          paramIndex++;
        }
        if (lock_status !== undefined) {
          updateFields.push(`lock_status = $${paramIndex}`);
          values.push(lock_status);
          paramIndex++;
        }

        if (updateFields.length === 0) {
          await client.query('ROLLBACK');
          return oldBike;
        }

        values.push(bikeId);
        const query = `
          UPDATE bikes
          SET ${updateFields.join(', ')}
          WHERE bike_id = $${paramIndex}
          RETURNING bike_id, station_id, status, lock_status, created_at
        `;
        const { rows } = await client.query(query, values);
        const updatedBike = rows[0];

        // 대여소 재고 업데이트 (station_id가 변경된 경우)
        if (station_id !== undefined && oldBike.station_id !== station_id) {
          // 이전 대여소 재고 감소
          if (oldBike.station_id) {
            await client.query(
              'UPDATE stations SET bike_count = GREATEST(bike_count - 1, 0) WHERE station_id = $1',
              [oldBike.station_id]
            );
          }
          // 새 대여소 재고 증가
          if (station_id) {
            await client.query(
              'UPDATE stations SET bike_count = bike_count + 1 WHERE station_id = $1',
              [station_id]
            );
          }
        }

        await client.query('COMMIT');
        return updatedBike;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating bike:', error);
      throw error;
    }
  },

  /**
   * 자전거 삭제
   */
  delete: async (bikeId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 자전거 정보 조회
      const bike = await bikeRepository.findById(bikeId);
      if (!bike) {
        await client.query('ROLLBACK');
        throw new Error('자전거를 찾을 수 없습니다.');
      }

      // 자전거 삭제
      await client.query('DELETE FROM bikes WHERE bike_id = $1', [bikeId]);

      // 대여소 재고 감소
      if (bike.station_id) {
        await client.query(
          'UPDATE stations SET bike_count = GREATEST(bike_count - 1, 0) WHERE station_id = $1',
          [bike.station_id]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting bike:', error);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = bikeRepository;