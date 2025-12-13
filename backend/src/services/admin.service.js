/**
 * src/services/admin.service.js
 * 관리자 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - getDashboardStats: 대시보드 통계 조회
 * - getUsers: 모든 사용자 조회
 * - updateUser, deleteUser: 사용자 관리
 * - getRentals: 모든 대여 기록 조회
 * - addPointsToUser, deductPointsFromUser: 포인트 관리
 * - getActivityLogs: 활동 로그 조회
 * - getDistrictStats: 지역구별 통계 조회
 * - getStationRentalRates: 대여소별 대여율 조회
 */

const memberRepository = require('../repositories/member.repository');
const rentalRepository = require('../repositories/rental.repository');
const statsRepository = require('../repositories/stats.repository');
const activityLogRepository = require('../repositories/activityLog.repository');

// 대시보드 통계 조회
exports.getDashboardStats = async () => {
  const stats = await statsRepository.getDashboardStats();
  return stats;
};

// 모든 사용자 조회
exports.getUsers = async () => {
  return await memberRepository.findAll();
};

// 사용자 정보 수정
exports.updateUser = async (userId, userData) => {
  const { username, email, role, point_balance } = userData;
  const updatedUser = await memberRepository.update(userId, { username, email, role, point_balance });
  return updatedUser;
};

// 사용자 삭제
exports.deleteUser = async (userId) => {
  await memberRepository.delete(userId);
  return;
};

// 모든 대여 기록 조회
exports.getRentals = async () => {
  return await rentalRepository.findAllRentals();
};

// 사용자 포인트 추가
exports.addPointsToUser = async (memberId, amount, description) => {
  const pointService = require('./point.service');
  return await pointService.addPoints(memberId, amount, description);
};

// 사용자 포인트 차감
exports.deductPointsFromUser = async (memberId, amount, description) => {
  const pointService = require('./point.service');
  return await pointService.deductPoints(memberId, amount, description);
};

// 활동 로그 조회
exports.getActivityLogs = async (limit = 50) => {
  try {
    const [rentalLogs, returnLogs, pointLogs] = await Promise.all([
      activityLogRepository.getRentalLogs(limit),
      activityLogRepository.getReturnLogs(limit),
      activityLogRepository.getPointTransactionLogs(limit)
    ]);

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

    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return allLogs.slice(0, limit);
  } catch (error) {
    console.error('Error getting activity logs:', error);
    throw error;
  }
};

// 지역구별 통계 조회
exports.getDistrictStats = async () => {
  return await statsRepository.getDistrictStats();
};

// 대여소별 대여율 조회
exports.getStationRentalRates = async () => {
  return await statsRepository.getStationRentalRates();
};

// 모든 자전거 조회
exports.getBikes = async () => {
  const bikeRepository = require('../repositories/bike.repository');
  return await bikeRepository.findAll();
};