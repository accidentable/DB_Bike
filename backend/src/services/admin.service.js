
const memberRepository = require('../repositories/member.repository');
const rentalRepository = require('../repositories/rental.repository');
const statsRepository = require('../repositories/stats.repository');
const activityLogRepository = require('../repositories/activityLog.repository');  // 추가
const bikeRepository = require('../repositories/bike.repository');
const stationRepository = require('../repositories/station.repository');

/*exports.getDashboardStats = async () => {
  // statsRepository를 사용하여 실제 통계 데이터 가져오기
  const stats = await statsRepository.getDashboardStats();
  
  // 추가 통계 정보 계산 (필요한 경우)
  return {
    totalUsers: stats.totalUsers,
    totalBikes: stats.totalBikes,
    totalStations: stats.totalStations,
    totalRentals: 0, // TODO: 전체 대여 수 계산
    activeRentals: stats.activeRentals,
    totalDistance: 0, // TODO: 누적 거리 계산 (필요시 구현)
    todayRentals: 0, // TODO: 오늘 대여 수 계산 (필요시 구현)
  };
};*/

exports.getDashboardStats = async () => {
  const stats = await statsRepository.getDashboardStats();
  return stats;  // 이미 모든 통계가 포함되어 있음
};

exports.getUsers = async () => {
  return await memberRepository.findAll();
};

exports.updateUser = async (userId, userData) => {
  const { username, email, role, point_balance } = userData;
  const updatedUser = await memberRepository.update(userId, { username, email, role, point_balance });
  return updatedUser;
};

exports.deleteUser = async (userId) => {
  await memberRepository.delete(userId);
  return;
};

exports.getRentals = async () => {
  return await rentalRepository.findAllRentals();
};

exports.addPointsToUser = async (memberId, amount, description) => {
  const pointService = require('./point.service'); // 순환 참조 방지를 위해 런타임에 로드
  return await pointService.addPoints(memberId, amount, description);
};

exports.deductPointsFromUser = async (memberId, amount, description) => {
  const pointService = require('./point.service'); // 순환 참조 방지를 위해 런타임에 로드
  return await pointService.deductPoints(memberId, amount, description);
};

/**
 * Activity Log 조회 (기존 데이터 조합)
 * @param {number} limit - 조회할 최대 개수 (기본값: 50)
 * @returns {Promise<Array>} - Activity Log 배열
 */
exports.getActivityLogs = async (limit = 50) => {
  try {
    // 각 종류의 로그를 병렬로 조회
    const [rentalLogs, returnLogs, pointLogs] = await Promise.all([
      activityLogRepository.getRentalLogs(limit),
      activityLogRepository.getReturnLogs(limit),
      activityLogRepository.getPointTransactionLogs(limit)
    ]);

    // 모든 로그를 하나의 배열로 합치기
    const allLogs = [
      ...rentalLogs.map(row => ({
        timestamp: row.timestamp,
        user: row.user_email,
        action: row.action,
        status: row.status
      })),
      ...returnLogs.map(row => ({
        timestamp: row.timestamp,
        user: row.user_email,
        action: row.action,
        status: row.status
      })),
      ...pointLogs.map(row => ({
        timestamp: row.timestamp,
        user: row.user_email,
        action: row.action,
        status: row.status
      }))
    ];

    // 시간순으로 정렬 (최신순)
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // 최종적으로 limit 개수만 반환
    return allLogs.slice(0, limit);
  } catch (error) {
    console.error('Error getting activity logs:', error);
    throw error;
  }
};

/**
 * 지역구별 대여소 현황 조회
 */
exports.getDistrictStats = async () => {
  return await statsRepository.getDistrictStats();
};

/**
 * 대여소별 대여율 조회
 */
exports.getStationRentalRates = async () => {
  return await statsRepository.getStationRentalRates();
};

/**
 * 자전거 관리
 */
exports.getBikes = async () => {
  return await bikeRepository.findAll();
};

exports.getBikeById = async (bikeId) => {
  return await bikeRepository.findById(bikeId);
};

exports.createBike = async (bikeData) => {
  const { station_id, status, lock_status } = bikeData;
  
  // 대여소 존재 확인
  if (station_id) {
    const station = await stationRepository.findById(station_id);
    if (!station) {
      throw new Error('대여소를 찾을 수 없습니다.');
    }
  }
  
  return await bikeRepository.create(
    station_id || null,
    status || '정상',
    lock_status || 'LOCKED'
  );
};

exports.updateBike = async (bikeId, bikeData) => {
  // 자전거 존재 확인
  const bike = await bikeRepository.findById(bikeId);
  if (!bike) {
    throw new Error('자전거를 찾을 수 없습니다.');
  }
  
  // 대여소 존재 확인 (station_id가 변경되는 경우)
  if (bikeData.station_id !== undefined && bikeData.station_id !== null) {
    const station = await stationRepository.findById(bikeData.station_id);
    if (!station) {
      throw new Error('대여소를 찾을 수 없습니다.');
    }
  }
  
  return await bikeRepository.update(bikeId, bikeData);
};

exports.deleteBike = async (bikeId) => {
  const bike = await bikeRepository.findById(bikeId);
  if (!bike) {
    throw new Error('자전거를 찾을 수 없습니다.');
  }
  
  // 대여 중인 자전거는 삭제 불가
  if (bike.lock_status === 'IN_USE') {
    throw new Error('대여 중인 자전거는 삭제할 수 없습니다.');
  }
  
  return await bikeRepository.delete(bikeId);
};

/**
 * 대여소 관리
 */
exports.getStations = async () => {
  return await stationRepository.findAll();
};

exports.getStationById = async (stationId) => {
  return await stationRepository.findById(stationId);
};

exports.createStation = async (stationData) => {
  const { name, latitude, longitude, bike_count, status } = stationData;
  
  if (!name) {
    throw new Error('대여소 이름은 필수입니다.');
  }
  
  // 상태 유효성 검사
  if (status && !['정상', '점검중', '폐쇄'].includes(status)) {
    throw new Error('유효하지 않은 상태입니다. (정상, 점검중, 폐쇄)');
  }
  
  return await stationRepository.create(
    name,
    latitude,
    longitude,
    bike_count || 0,
    status || '정상'
  );
};

exports.updateStation = async (stationId, stationData) => {
  const station = await stationRepository.findById(stationId);
  if (!station) {
    throw new Error('대여소를 찾을 수 없습니다.');
  }
  
  // 상태 유효성 검사
  if (stationData.status && !['정상', '점검중', '폐쇄'].includes(stationData.status)) {
    throw new Error('유효하지 않은 상태입니다. (정상, 점검중, 폐쇄)');
  }
  
  return await stationRepository.update(stationId, stationData);
};

exports.deleteStation = async (stationId) => {
  const station = await stationRepository.findById(stationId);
  if (!station) {
    throw new Error('대여소를 찾을 수 없습니다.');
  }
  
  // 대여소에 자전거가 있으면 삭제 불가
  if (station.bike_count > 0) {
    throw new Error('대여소에 자전거가 있어 삭제할 수 없습니다.');
  }
  
  return await stationRepository.delete(stationId);
};

exports.updateStationStatus = async (stationId, status) => {
  if (!['정상', '점검중', '폐쇄'].includes(status)) {
    throw new Error('유효하지 않은 상태입니다. (정상, 점검중, 폐쇄)');
  }
  
  return await stationRepository.update(stationId, { status });
};