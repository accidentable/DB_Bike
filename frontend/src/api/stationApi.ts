// src/api/stationApi.ts
// (getAvailableBikes 함수 추가)

import client from './client';

// (참고) 인터페이스는 필요시 파일 상단에 정의합니다.
// interface StationListResponse { success: boolean; data: any[]; }

/**
 * 대여소 목록 조회 (검색, 정렬)
 */
export const getStations = async (params: { query?: string; lat?: number; lon?: number }) => {
  try {
    const response = await client.get('/api/stations', { params });
    return response.data; // { success: true, data: Station[] }
  } catch (error) {
    console.error('getStations API error:', error);
    throw error;
  }
};

/**
 * 자전거 목록 조회 (특정 대여소)
 * HomePage.tsx에서 이 함수를 찾고 있습니다.
 */
export const getAvailableBikes = async (stationId: number) => {
  try {
    // GET /api/stations/:stationId/bikes
    const response = await client.get(`/api/stations/${stationId}/bikes`);
    return response.data; // { success: true, data: Bike[] }
  } catch (error) {
    console.error('getAvailableBikes API error:', error);
    throw error;
  }
};

// (다른 station 관련 API가 있다면 여기에 추가)