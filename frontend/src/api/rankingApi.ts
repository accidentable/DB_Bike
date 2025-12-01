/**
 * 랭킹 관련 API 함수들
 */

import client from './client';
import { getCurrentUser } from './authApi';

export interface RankingUser {
  member_id: number;
  username: string;
  total_distance_km: number;
  total_rides: number;
  rank_position: number;
}

export interface RankingResponse {
  ranking: RankingUser[];
  currentUser: RankingUser | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 전체 기간 누적 거리 랭킹 조회
 */
export async function getTotalDistanceRanking(): Promise<ApiResponse<RankingResponse>> {
  try {
    const user = getCurrentUser();
    const memberId = user?.member_id;
    const params = memberId ? { memberId } : {};
    
    const response = await client.get('/api/rankings/total', { params });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '랭킹 조회 중 오류가 발생했습니다.',
    };
  }
}