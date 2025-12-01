// src/repositories/station.repository.js
// (init.sql 스키마 반영 수정본)

const pool = require('../config/db.config');

const stationRepository = {
  /**
   * 대여소 목록 조회 (검색 + 거리순 정렬)
   * @param {string} query - 검색어 (예: '강남')
   * @param {number} lat - 현재 위치 위도
   * @param {number} lon - 현재 위치 경도
   */
  findStations: async ({ query, lat, lon }) => {
    let sql = `
      SELECT 
        station_id, 
        name,
        latitude, 
        longitude, 
        status, 
        bike_count
    `;
    
    // Haversine 공식을 사용하여 거리(km) 계산
    if (lat && lon) {
      sql += `,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(latitude)) *
          cos(radians(longitude) - radians(${lon})) +
          sin(radians(${lat})) * sin(radians(latitude))
        )) AS distance_km
      `;
    }
    
    // init.sql의 CHECK 제약 ('정상') 반영
    sql += ' FROM stations WHERE status = \'정상\'';
    
    const params = [];

    // init.sql에 address가 없으므로 'name'으로만 검색
    if (query) {
      sql += ' AND name LIKE $1';
      params.push(`%${query}%`);
    }

    if (lat && lon) {
      sql += ' ORDER BY distance_km ASC';
    } else {
      sql += ' ORDER BY name ASC';
    }
    
    sql += ' LIMIT 20';

    try {
      const { rows } = await pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Error finding stations:', error);
      throw error;
    }
  },
  /**
   * Find station by id.
   */
  findById: async (stationId) => {
    const sql = `
      SELECT station_id, name, latitude, longitude, status, bike_count
      FROM stations
      WHERE station_id = $1
    `;
    try {
      const { rows } = await pool.query(sql, [stationId]);
      return rows[0];
    } catch (error) {
      console.error('Error finding station by id:', error);
      throw error;
    }
  },


  /**
   * 특정 대여소의 '정상' 상태 자전거 목록 조회
   * @param {number} stationId
   */
  findAvailableBikesByStationId: async (stationId) => {
    // init.sql 스키마 반영 (status='정상', battery 컬럼 없음)
    const sql = `
      SELECT 
        json_agg(
          json_build_object(
            'bike_id', bike_id,
            'status', status
          )
        ) AS available_bikes
      FROM bikes
      WHERE station_id = $1 AND status = '정상' AND lock_status = 'LOCKED';
    `;
    
    try {
      const { rows } = await pool.query(sql, [stationId]);
      return rows[0]?.available_bikes || [];
    } catch (error) {
      console.error('Error finding available bikes:', error);
      throw error;
    }
  }
};

module.exports = stationRepository;
