/**
 * 대여소 관련 API 함수들
 */

import client from './client';

// 대여소 타입 정의
export interface Station {
  station_id: number;
  name: string;
  latitude: number;
  longitude: number;
  bike_count: number;
  status: string;
  created_at: string;
}

// 자전거 타입 정의
export interface Bike {
  bike_id: number;
  bike_number?: string;
  status: string;
  lock_status: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 대여소 목록 조회 (공개)
 */
export async function getStations(params?: {
  query?: string;
  lat?: number;
  lon?: number;
}): Promise<ApiResponse<Station[]>> {
  try {
    const response = await client.get('/api/stations', { params });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '대여소 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 대여소의 자전거 목록 조회 (공개)
 */
export async function getAvailableBikes(stationId: number): Promise<ApiResponse<Bike[]>> {
  try {
    const response = await client.get(`/api/stations/${stationId}/bikes`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '자전거 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}
