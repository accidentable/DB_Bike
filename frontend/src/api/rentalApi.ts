// src/api/rentalApi.ts
// (대여, 반납 관련 API)

import client from './client';

/**
 * 현재 대여 중인 내역 조회
 * GET /api/rentals/current
 * (로그인 필요)
 */
export const getCurrentRental = async () => {
  try {
    const response = await client.get('/api/rentals/current');
    return response.data; // { success: true, data: RentedBikeInfo | null }
  } catch (error) {
    console.error('getCurrentRental API error:', error);
    throw error;
  }
};

/**
 * 대여 이력 조회
 * GET /api/rentals/history
 * (로그인 필요)
 */
export const getRentalHistory = async () => {
  try {
    const response = await client.get('/api/rentals/history');
    return response.data; // { success: true, data: RentalHistory[] }
  } catch (error) {
    console.error('getRentalHistory API error:', error);
    throw error;
  }
};

/**
 * 자전거 대여
 * POST /api/rentals/rent
 * (로그인 필요)
 * @param {Object} params - 대여 정보
 * @param {number} params.bikeId - 자전거 ID
 * @param {number} params.startStationId - 대여소 ID
 */
export const rentBike = async (params: { bikeId: number; startStationId: number }) => {
  try {
    const response = await client.post('/api/rentals/rent', {
      bikeId: params.bikeId,
      startStationId: params.startStationId,
    });
    return response.data; // { success: true, data: RentalInfo }
  } catch (error) {
    console.error('rentBike API error:', error);
    throw error;
  }
};

/**
 * 자전거 반납
 * POST /api/rentals/return
 * (로그인 필요)
 * @param {Object} params - 반납 정보
 * @param {number} params.endStationId - 반납할 대여소 ID
 */
export const returnBike = async (params: { endStationId: number }) => {
  try {
    const response = await client.post('/api/rentals/return', {
      endStationId: params.endStationId,
    });
    return response.data; // { success: true, data: ReturnInfo }
  } catch (error) {
    console.error('returnBike API error:', error);
    throw error;
  }
};

