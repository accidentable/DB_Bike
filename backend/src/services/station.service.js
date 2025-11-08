// src/services/station.service.js
// (비즈니스 로직)

const stationRepository = require('../repositories/station.repository');

const stationService = {
  /**
   * 대여소 목록 가져오기
   */
  getStations: async (searchParams) => {
    // searchParams는 { query, lat, lon } 객체
    try {
      const stations = await stationRepository.findStations(searchParams);
      return stations;
    } catch (error) {
      // (심화) 에러 종류에 따라 다른 http status code를 던질 수 있음
      throw new Error('대여소 조회 중 오류가 발생했습니다.');
    }
  },

  /**
   * 특정 대여소의 자전거 목록 가져오기
   */
  getAvailableBikes: async (stationId) => {
    try {
      const bikes = await stationRepository.findAvailableBikesByStationId(stationId);
      return bikes;
    } catch (error) {
      throw new Error('자전거 목록 조회 중 오류가 발생했습니다.');
    }
  }
};

module.exports = stationService;