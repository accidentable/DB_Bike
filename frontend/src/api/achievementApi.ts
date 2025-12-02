/**
 * 업적 관련 API 함수들
 */

import client from './client';

export interface Achievement {
  achievement_id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  earned: boolean;
  earned_at?: string | null;
  points_awarded: boolean;
  progress?: number | null;
  total?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 내 업적 목록 조회 (로그인 필요)
 */
export async function getMyAchievements(): Promise<ApiResponse<Achievement[]>> {
  try {
    const response = await client.get('/api/achievements');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '업적 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 모든 업적 목록 조회 (공개)
 */
export async function getAllAchievements(): Promise<ApiResponse<Achievement[]>> {
  try {
    const response = await client.get('/api/achievements/all');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '업적 조회 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 업적 포인트 수령
 */
export async function claimAchievementPoints(achievementId: number): Promise<ApiResponse<{ points: number }>> {
  try {
    const response = await client.post(`/api/achievements/${achievementId}/claim`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '포인트 수령 중 오류가 발생했습니다.',
    };
  }
}

