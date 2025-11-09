/**
 * 댓글 관련 API 함수들
 */

import client from './client';

// 댓글 타입 정의
export interface Comment {
  comment_id: number;
  post_id: number;
  member_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 댓글 작성
 */
export async function createComment(postId: number, content: string): Promise<ApiResponse<Comment>> {
  try {
    const response = await client.post(`/api/posts/${postId}/comments`, { content });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '댓글 작성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 게시글의 댓글 목록 조회
 */
export async function getComments(postId: number): Promise<ApiResponse<Comment[]>> {
  try {
    const response = await client.get(`/api/posts/${postId}/comments`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '댓글 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 댓글 삭제
 */
export async function deleteComment(postId: number, commentId: number): Promise<ApiResponse<void>> {
  try {
    const response = await client.delete(`/api/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '댓글 삭제 중 오류가 발생했습니다.',
    };
  }
}

