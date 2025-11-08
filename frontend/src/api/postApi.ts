// src/api/postApi.ts
// (게시글 관련 API)

import client from './client';

/**
 * 게시글 작성
 * POST /api/posts
 * (로그인 필요)
 * @param {Object} postData - 게시글 정보
 * @param {string} postData.title - 제목
 * @param {string} postData.content - 내용
 * @param {string} postData.category - 카테고리 (notice, event, review 등)
 * @param {boolean} postData.is_pinned - 고정 여부 (관리자만 가능, 선택)
 */
export const createPost = async (postData: {
  title: string;
  content: string;
  category: string;
  is_pinned?: boolean;
}) => {
  try {
    const response = await client.post('/api/posts', postData);
    return response.data; // { success: true, data: Post }
  } catch (error) {
    console.error('createPost API error:', error);
    throw error;
  }
};

/**
 * 게시글 목록 조회
 * GET /api/posts
 * (로그인 불필요)
 * @param {Object} params - 쿼리 파라미터
 * @param {string} params.category - 카테고리 필터 (선택)
 * @param {string} params.sort_by - 정렬 기준 ('latest', 'views', 'likes') (선택, 기본값: 'latest')
 * @param {number} params.page - 페이지 번호 (선택, 기본값: 1)
 * @param {number} params.limit - 페이지당 항목 수 (선택, 기본값: 10)
 * @param {string} params.search - 검색어 (선택)
 */
export const getPosts = async (params?: {
  category?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  try {
    const response = await client.get('/api/posts', { params });
    return response.data; // { success: true, data: { posts: Post[], pagination: {...} } }
  } catch (error) {
    console.error('getPosts API error:', error);
    throw error;
  }
};

/**
 * 게시글 상세 조회
 * GET /api/posts/:id
 * (로그인 불필요)
 * @param {number} postId - 게시글 ID
 */
export const getPostById = async (postId: number) => {
  try {
    const response = await client.get(`/api/posts/${postId}`);
    return response.data; // { success: true, data: Post }
  } catch (error) {
    console.error('getPostById API error:', error);
    throw error;
  }
};

/**
 * 게시글 수정
 * PUT /api/posts/:id
 * (로그인 필요, 작성자 또는 관리자만 가능)
 * @param {number} postId - 게시글 ID
 * @param {Object} postData - 수정할 게시글 정보
 * @param {string} postData.title - 제목
 * @param {string} postData.content - 내용
 * @param {string} postData.category - 카테고리
 */
export const updatePost = async (
  postId: number,
  postData: {
    title: string;
    content: string;
    category: string;
  }
) => {
  try {
    const response = await client.put(`/api/posts/${postId}`, postData);
    return response.data; // { success: true, data: Post }
  } catch (error) {
    console.error('updatePost API error:', error);
    throw error;
  }
};

/**
 * 게시글 삭제
 * DELETE /api/posts/:id
 * (로그인 필요, 작성자 또는 관리자만 가능)
 * @param {number} postId - 게시글 ID
 */
export const deletePost = async (postId: number) => {
  try {
    const response = await client.delete(`/api/posts/${postId}`);
    return response.data; // { success: true, message: '게시글이 삭제되었습니다.' }
  } catch (error) {
    console.error('deletePost API error:', error);
    throw error;
  }
};

/**
 * 게시글 고정/고정 해제
 * PATCH /api/posts/:id/pin
 * (로그인 필요, 관리자만 가능)
 * @param {number} postId - 게시글 ID
 * @param {boolean} is_pinned - 고정 여부
 */
export const togglePinned = async (postId: number, is_pinned: boolean) => {
  try {
    const response = await client.patch(`/api/posts/${postId}/pin`, {
      is_pinned,
    });
    return response.data; // { success: true, data: Post }
  } catch (error) {
    console.error('togglePinned API error:', error);
    throw error;
  }
};

