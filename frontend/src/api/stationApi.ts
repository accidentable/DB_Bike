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

/**
 * 대여소 추가 (관리자 전용)
 */
export async function createStation(data: {
  name: string;
  latitude: number;
  longitude: number;
  status?: string;
}): Promise<ApiResponse<Station>> {
  try {
    const response = await client.post('/api/stations', data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '대여소 추가 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 대여소 수정 (관리자 전용)
 */
export async function updateStation(
  stationId: number,
  data: {
    name: string;
    latitude: number;
    longitude: number;
    status?: string;
  }
): Promise<ApiResponse<Station>> {
  try {
    const response = await client.put(`/api/stations/${stationId}`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '대여소 수정 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 대여소 삭제 (관리자 전용)
 */
export async function deleteStation(stationId: number): Promise<ApiResponse<void>> {
  try {
    const response = await client.delete(`/api/stations/${stationId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '대여소 삭제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 모든 대여소 목록 조회 (관리자 전용, LIMIT 없음)
 */
export async function getAllStations(query?: string): Promise<ApiResponse<Station[]>> {
  try {
    const response = await client.get('/api/stations/all', { params: { query } });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '대여소 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 대여소를 즐겨찾기에 추가 (로그인 필요)
 */
export async function addFavoriteStation(stationId: number): Promise<ApiResponse<any>> {
  try {
    const response = await client.post(`/api/stations/${stationId}/favorite`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '즐겨찾기 추가 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 대여소를 즐겨찾기에서 제거 (로그인 필요)
 */
export async function removeFavoriteStation(stationId: number): Promise<ApiResponse<any>> {
  try {
    const response = await client.delete(`/api/stations/${stationId}/favorite`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '즐겨찾기 제거 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 내 즐겨찾기 대여소 목록 조회 (로그인 필요)
 */
export async function getFavoriteStations(): Promise<ApiResponse<Station[]>> {
  try {
    const response = await client.get('/api/stations/favorites/me');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '즐겨찾기 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}
