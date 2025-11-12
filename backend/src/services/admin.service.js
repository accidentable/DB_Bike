
const memberRepository = require('../repositories/member.repository');
const rentalRepository = require('../repositories/rental.repository');
const statsRepository = require('../repositories/stats.repository');

exports.getDashboardStats = async () => {
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
