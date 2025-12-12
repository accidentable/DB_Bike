/**
 * src/services/station.service.js
 * 대여소 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - getStations: 대여소 목록 조회
 * - getAvailableBikes: 특정 대여소의 자전거 목록 조회
 * - addFavorite, removeFavorite, listFavorites, isFavorited: 즐겨찾기 관리
 * - createStation, updateStation, deleteStation: 대여소 관리 (관리자)
 * - getAllStations: 모든 대여소 조회 (관리자)
 */

const stationRepository = require('../repositories/station.repository');
const stationFavoriteRepository = require('../repositories/stationFavorite.repository');

const stationService = {
  // 대여소 목록 조회
  getStations: async (searchParams) => {
    try {
      const stations = await stationRepository.findStations(searchParams);
      return stations;
    } catch (error) {
      throw new Error('대여소 조회 중 오류가 발생했습니다.');
    }
  },

  // 특정 대여소의 자전거 목록 조회
  getAvailableBikes: async (stationId) => {
    try {
      const bikes = await stationRepository.findAvailableBikesByStationId(stationId);
      return bikes;
    } catch (error) {
      throw new Error('자전거 목록 조회 중 오류가 발생했습니다.');
    }
  },

  // 대여소 즐겨찾기 추가
  addFavorite: async (memberId, stationId) => {
    const station = await stationRepository.findById(stationId);
    if (!station) {
      throw new Error('Station not found.');
    }
    return stationFavoriteRepository.addFavorite(memberId, stationId);
  },

  // 대여소 즐겨찾기 제거
  removeFavorite: async (memberId, stationId) => {
    return stationFavoriteRepository.removeFavorite(memberId, stationId);
  },

  // 즐겨찾기 목록 조회
  listFavorites: async (memberId) => {
    return stationFavoriteRepository.listFavoritesByMember(memberId);
  },

  // 즐겨찾기 여부 확인
  isFavorited: async (memberId, stationId) => {
    return stationFavoriteRepository.isFavorited(memberId, stationId);
  },

  // 대여소 생성
  createStation: async (name, latitude, longitude, status = '정상') => {
    try {
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

  // 대여소 수정
  updateStation: async (stationId, name, latitude, longitude, status = '정상') => {
    try {
      const station = await stationRepository.findById(stationId);
      if (!station) {
        throw new Error('대여소를 찾을 수 없습니다.');
      }

      const existingStations = await stationRepository.findStations({ query: name });
      if (existingStations.some(s => s.name === name && s.station_id !== stationId)) {
        throw new Error('이미 존재하는 대여소 이름입니다.');
      }

      const updatedStation = await stationRepository.update(stationId, name, latitude, longitude, status);
      return updatedStation;
    } catch (error) {
      throw new Error(error.message || '대여소 수정 중 오류가 발생했습니다.');
    }
  },

  // 대여소 삭제
  deleteStation: async (stationId) => {
    try {
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

  // 모든 대여소 조회
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
