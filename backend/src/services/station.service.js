// src/services/station.service.js
// (비즈니스 로직)

const stationRepository = require('../repositories/station.repository');
const stationFavoriteRepository = require('../repositories/stationFavorite.repository');

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
  },
  /**
   * Add station favorite for member.
   */
  addFavorite: async (memberId, stationId) => {
    const station = await stationRepository.findById(stationId);
    if (!station) {
      throw new Error('Station not found.');
    }
    return stationFavoriteRepository.addFavorite(memberId, stationId);
  },

  /**
   * Remove station favorite for member.
   */
  removeFavorite: async (memberId, stationId) => {
    return stationFavoriteRepository.removeFavorite(memberId, stationId);
  },

  /**
   * List favorites for a member.
   */
  listFavorites: async (memberId) => {
    return stationFavoriteRepository.listFavoritesByMember(memberId);
  },

  /**
   * Check if station is favorited by member.
   */
  isFavorited: async (memberId, stationId) => {
    return stationFavoriteRepository.isFavorited(memberId, stationId);
  },

  /**
   * 대여소 생성 (관리자용)
   */
  createStation: async (name, latitude, longitude, status = '정상') => {
    try {
      // 이름 중복 확인
      const existingStations = await stationRepository.findStations({ query: name });
      if (existingStations.some(s => s.name === name)) {
        throw new Error('이미 존재하는 대여소 이름입니다.');
      }

      const station = await stationRepository.create(name, latitude, longitude, status);
      return station;
    } catch (error) {
      throw new Error(error.message || '대여소 생성 중 오류가 발생했습니다.');
    }
  },

  /**
   * 대여소 삭제 (관리자용)
   */
  deleteStation: async (stationId) => {
    try {
      // 대여소 존재 확인
      const station = await stationRepository.findById(stationId);
      if (!station) {
        throw new Error('대여소를 찾을 수 없습니다.');
      }

      await stationRepository.delete(stationId);
      return { success: true, message: '대여소가 삭제되었습니다.' };
    } catch (error) {
      throw new Error(error.message || '대여소 삭제 중 오류가 발생했습니다.');
    }
  },

  /**
   * 모든 대여소 조회 (관리자용, LIMIT 없음)
   */
  getAllStations: async (query = null) => {
    try {
      const stations = await stationRepository.findAllStations(query);
      return stations;
    } catch (error) {
      throw new Error('대여소 조회 중 오류가 발생했습니다.');
    }
  }
};

module.exports = stationService;
