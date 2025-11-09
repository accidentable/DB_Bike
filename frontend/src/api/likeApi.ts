/**
 * 좋아요 관련 API 함수들
 */

import client from './client';

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// 좋아요 토글 응답 타입
export interface ToggleLikeResponse {
  liked: boolean;
  message: string;
}

// 좋아요 정보 응답 타입
export interface LikeInfo {
  likeCount: number;
  isLiked: boolean;
}

/**
 * 좋아요 토글 (추가/취소)
 */
export async function toggleLike(postId: number): Promise<ApiResponse<ToggleLikeResponse>> {
  try {
    const response = await client.post(`/api/posts/${postId}/like`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '좋아요 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 게시글의 좋아요 정보 조회
 */
export async function getLikeInfo(postId: number): Promise<ApiResponse<LikeInfo>> {
  try {
    const response = await client.get(`/api/posts/${postId}/like`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '좋아요 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

