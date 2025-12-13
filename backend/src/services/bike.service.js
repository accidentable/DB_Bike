/**
 * src/services/bike.service.js
 * 자전거 관련 비즈니스 로직
 */

const bikeRepository = require('../repositories/bike.repository');

// 모든 자전거 조회
exports.getAllBikes = async () => {
  return await bikeRepository.findAll();
};

// 새 자전거 추가
exports.createBike = async (bikeData) => {
  const { bike_number, status, station_id } = bikeData;
  return await bikeRepository.create({
    bike_number,
    status: status || 'available',
    station_id: station_id || null
  });
};

// 자전거 정보 업데이트
exports.updateBike = async (bikeId, bikeData) => {
  return await bikeRepository.update(bikeId, bikeData);
};

// 자전거 삭제
exports.deleteBike = async (bikeId) => {
  return await bikeRepository.delete(bikeId);
};
