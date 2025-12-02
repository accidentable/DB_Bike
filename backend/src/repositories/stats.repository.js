const pool = require('../config/db.config');

const statsRepository = {
  /**
   * 관리자 대시보드 통계 조회
   * @returns {Promise<object>} - 전체 사용자, 자전거, 대여소, 현재 대여 수, 전체 대여 수, 누적 거리, 오늘 대여 수
   */
  getDashboardStats: async () => {
    try {
      const queries = [
        pool.query('SELECT COUNT(*) AS total_users FROM members'),
        pool.query('SELECT COUNT(*) AS total_bikes FROM bikes'),
        pool.query('SELECT COUNT(*) AS total_stations FROM stations'),
        pool.query("SELECT COUNT(*) AS active_rentals FROM rentals WHERE end_time IS NULL"),
        pool.query("SELECT COUNT(*) AS total_rentals FROM rentals WHERE end_time IS NOT NULL"),
        pool.query("SELECT COALESCE(SUM(distance_km), 0) AS total_distance FROM rentals WHERE distance_km IS NOT NULL"),
        pool.query("SELECT COUNT(*) AS today_rentals FROM rentals WHERE DATE(start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul') = CURRENT_DATE")
      ];

      const results = await Promise.all(queries);

      const stats = {
        totalUsers: parseInt(results[0].rows[0].total_users, 10),
        totalBikes: parseInt(results[1].rows[0].total_bikes, 10),
        totalStations: parseInt(results[2].rows[0].total_stations, 10),
        activeRentals: parseInt(results[3].rows[0].active_rentals, 10),
        totalRentals: parseInt(results[4].rows[0].total_rentals, 10),
        totalDistance: parseFloat(results[5].rows[0].total_distance) || 0,
        todayRentals: parseInt(results[6].rows[0].today_rentals, 10),
      };

      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  /**
   * 지역구별 대여소 현황 조회
   * 주의: 대여소 이름에서 지역구를 추출해야 함 (예: "강남구 XX역")
   */
  getDistrictStats: async () => {
    try {
      // 대여소 이름에서 지역구 추출 (간단한 방법)
      // 실제로는 주소나 별도 컬럼이 필요할 수 있음
      const query = `
        SELECT 
          CASE 
            WHEN name LIKE '%강남%' THEN '강남구'
            WHEN name LIKE '%서초%' THEN '서초구'
            WHEN name LIKE '%영등포%' THEN '영등포구'
            WHEN name LIKE '%마포%' THEN '마포구'
            WHEN name LIKE '%용산%' THEN '용산구'
            WHEN name LIKE '%종로%' THEN '종로구'
            WHEN name LIKE '%성동%' THEN '성동구'
            WHEN name LIKE '%광진%' THEN '광진구'
            WHEN name LIKE '%송파%' THEN '송파구'
            WHEN name LIKE '%중구%' OR name LIKE '%중구 %' THEN '중구'
            WHEN name LIKE '%동작%' THEN '동작구'
            WHEN name LIKE '%은평%' THEN '은평구'
            WHEN name LIKE '%강서%' THEN '강서구'
            WHEN name LIKE '%관악%' THEN '관악구'
            WHEN name LIKE '%노원%' THEN '노원구'
            ELSE '기타'
          END as district,
          COUNT(*) as count
        FROM stations
        GROUP BY 
          CASE 
            WHEN name LIKE '%강남%' THEN '강남구'
            WHEN name LIKE '%서초%' THEN '서초구'
            WHEN name LIKE '%영등포%' THEN '영등포구'
            WHEN name LIKE '%마포%' THEN '마포구'
            WHEN name LIKE '%용산%' THEN '용산구'
            WHEN name LIKE '%종로%' THEN '종로구'
            WHEN name LIKE '%성동%' THEN '성동구'
            WHEN name LIKE '%광진%' THEN '광진구'
            WHEN name LIKE '%송파%' THEN '송파구'
            WHEN name LIKE '%중구%' OR name LIKE '%중구 %' THEN '중구'
            WHEN name LIKE '%동작%' THEN '동작구'
            WHEN name LIKE '%은평%' THEN '은평구'
            WHEN name LIKE '%강서%' THEN '강서구'
            WHEN name LIKE '%관악%' THEN '관악구'
            WHEN name LIKE '%노원%' THEN '노원구'
            ELSE '기타'
          END
        HAVING 
          CASE 
            WHEN name LIKE '%강남%' THEN '강남구'
            WHEN name LIKE '%서초%' THEN '서초구'
            WHEN name LIKE '%영등포%' THEN '영등포구'
            WHEN name LIKE '%마포%' THEN '마포구'
            WHEN name LIKE '%용산%' THEN '용산구'
            WHEN name LIKE '%종로%' THEN '종로구'
            WHEN name LIKE '%성동%' THEN '성동구'
            WHEN name LIKE '%광진%' THEN '광진구'
            WHEN name LIKE '%송파%' THEN '송파구'
            WHEN name LIKE '%중구%' OR name LIKE '%중구 %' THEN '중구'
            WHEN name LIKE '%동작%' THEN '동작구'
            WHEN name LIKE '%은평%' THEN '은평구'
            WHEN name LIKE '%강서%' THEN '강서구'
            WHEN name LIKE '%관악%' THEN '관악구'
            WHEN name LIKE '%노원%' THEN '노원구'
            ELSE '기타'
          END != '기타'
        ORDER BY count DESC
        LIMIT 15
      `;
      const { rows } = await pool.query(query);
      
      const total = rows.reduce((sum, row) => sum + parseInt(row.count, 10), 0);
      
      return rows.map(row => ({
        name: row.district,
        value: parseInt(row.count, 10),
        percent: total > 0 ? ((parseInt(row.count, 10) / total) * 100).toFixed(1) : "0.0"
      }));
    } catch (error) {
      console.error('Error getting district stats:', error);
      throw error;
    }
  },

  /**
   * 대여소별 대여율 조회 (TOP 10)
   */
  getStationRentalRates: async () => {
    try {
      const query = `
        SELECT 
          s.station_id,
          s.name,
          COUNT(r.rental_id) as rental_count,
          s.bike_count,
          CASE 
            WHEN s.bike_count > 0 
            THEN (COUNT(r.rental_id)::FLOAT / NULLIF(s.bike_count, 0) * 100)
            ELSE 0
          END as rental_rate
        FROM stations s
        LEFT JOIN rentals r ON s.station_id = r.start_station_id
          AND r.end_time IS NOT NULL
          AND r.start_time >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY s.station_id, s.name, s.bike_count
        HAVING COUNT(r.rental_id) > 0
        ORDER BY rental_rate DESC
        LIMIT 10
      `;
      const { rows } = await pool.query(query);
      
      // 색상 그라데이션 생성
      const colors = ['#FF0000', '#FF4500', '#FF6347', '#FF8C00', '#FFA500', '#FFB347', '#FFC04D', '#FFCC66', '#FFD700', '#FFE066'];
      
      return rows.map((row, index) => ({
        name: row.name,
        percent: parseFloat(row.rental_rate) || 0,
        color: colors[index] || '#FF0000'
      }));
    } catch (error) {
      console.error('Error getting station rental rates:', error);
      throw error;
    }
  }
};

module.exports = statsRepository;