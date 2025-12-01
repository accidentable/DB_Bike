/**
 * 대여/반납 관련 API 함수들
 */

import client from './client';

// 대여 기록 타입 정의
export interface Rental {
  rental_id: number;
  member_id: number;
  bike_id: number;
  start_station_id: number;
  end_station_id?: number;
  start_time: string;
  end_time?: string;
  distance_km?: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 현재 대여 중인 자전거 조회 (로그인 필요)
 */
export async function getCurrentRental(): Promise<ApiResponse<Rental | null>> {
  try {
    const response = await client.get('/api/rentals/current');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '현재 대여 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 대여 이력 조회 (로그인 필요)
 */
export async function getRentalHistory(): Promise<ApiResponse<Rental[]>> {
  try {
    const response = await client.get('/api/rentals/history');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '대여 이력을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 자전거 대여 (로그인 필요)
 */
export async function rentBike(bikeId: number, startStationId: number): Promise<ApiResponse<Rental>> {
  try {
    const response = await client.post('/api/rentals/rent', { bikeId, startStationId });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '자전거 대여 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 자전거 반납 (로그인 필요)
 */
export async function returnBike(endStationId: number): Promise<ApiResponse<Rental>> {
  try {
    const response = await client.post('/api/rentals/return', { endStationId });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '자전거 반납 중 오류가 발생했습니다.',
    };
  }
}
