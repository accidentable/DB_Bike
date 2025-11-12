const pool = require('../config/db.config');

const statsRepository = {
  /**
   * 관리자 대시보드 통계 조회
   * @returns {Promise<object>} - 전체 사용자, 자전거, 대여소, 현재 대여 수
   */
  getDashboardStats: async () => {
    try {
      const queries = [
        pool.query('SELECT COUNT(*) AS total_users FROM members'),
        pool.query('SELECT COUNT(*) AS total_bikes FROM bikes'),
        pool.query('SELECT COUNT(*) AS total_stations FROM stations'),
        pool.query("SELECT COUNT(*) AS active_rentals FROM rentals WHERE end_time IS NULL"),
      ];

      const results = await Promise.all(queries);

      const stats = {
        totalUsers: parseInt(results[0].rows[0].total_users, 10),
        totalBikes: parseInt(results[1].rows[0].total_bikes, 10),
        totalStations: parseInt(results[2].rows[0].total_stations, 10),
        activeRentals: parseInt(results[3].rows[0].active_rentals, 10),
      };

      return stats;
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },
};

module.exports = statsRepository;
