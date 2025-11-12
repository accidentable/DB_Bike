/**
 * 게시글 관련 API 함수들
 */

import client from './client';

// 첨부파일 타입 정의
export interface Attachment {
  attachment_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

// 게시글 타입 정의
export interface Post {
  post_id: number;
  member_id: number;
  title: string;
  content: string;
  category: string;
  views: number;
  likes: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  username?: string;
  email?: string;
  images?: string[]; // 이미지 URL 배열 추가
  attachments?: Attachment[]; // 첨부파일 배열 추가
}

// 게시글 목록 응답 타입
export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 게시글 목록 조회
 */
export async function getPosts(params?: {
  category?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<PostsResponse>> {
  try {
    const response = await client.get('/api/posts', { params });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '게시글 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 게시글 상세 조회
 */
export async function getPost(postId: number): Promise<ApiResponse<Post>> {
  try {
    const response = await client.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '게시글을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 게시글 작성 (로그인 필요)
 */
export async function createPost(data: {
  title: string;
  content: string;
  category: string;
  is_pinned?: boolean;
  images?: File[];
  attachments?: File[];
}): Promise<ApiResponse<Post>> {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('category', data.category);
    
    if (data.is_pinned !== undefined) {
      formData.append('is_pinned', String(data.is_pinned));
    }
    
    // 이미지 파일 추가
    if (data.images) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    // 첨부파일 추가
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await client.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '게시글 작성 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 게시글 수정 (로그인 필요)
 */
export async function updatePost(postId: number, data: {
  title: string;
  content: string;
  category: string;
  images?: File[];
  deleteImages?: string[]; // 삭제할 이미지 URL 배열
  attachments?: File[]; // 새 첨부파일 배열
  deleteAttachments?: number[]; // 삭제할 첨부파일 ID 배열
}): Promise<ApiResponse<Post>> {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('category', data.category);
    
    // 새로운 이미지 파일 추가
    if (data.images) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    // 삭제할 이미지 URL 추가
    if (data.deleteImages) {
      formData.append('deleteImages', JSON.stringify(data.deleteImages));
    }

    // 새로운 첨부파일 추가
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    // 삭제할 첨부파일 ID 추가
    if (data.deleteAttachments) {
      formData.append('deleteAttachments', JSON.stringify(data.deleteAttachments));
    }

    const response = await client.put(`/api/posts/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '게시글 수정 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 게시글 삭제 (로그인 필요)
 */
export async function deletePost(postId: number): Promise<ApiResponse<void>> {
  try {
    const response = await client.delete(`/api/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '게시글 삭제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 고정된 게시글 목록 조회
 */
export async function getPinnedPosts(): Promise<ApiResponse<Post[]>> {
  try {
    const response = await client.get('/api/posts/pinned');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '고정된 게시글을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 첨부파일 다운로드
 */
export async function downloadAttachment(attachmentId: number, fileName: string): Promise<void> {
  try {
    const response = await client.get(`/api/posts/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    
    // 파일 다운로드
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    alert('파일 다운로드 중 오류가 발생했습니다.');
    throw error;
  }
}
