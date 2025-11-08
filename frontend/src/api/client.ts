import axios from 'axios';

// 백엔드 API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface SignupData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  member_id: number;
  email: string;
  username: string;
  role: string;
  isAdmin?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
}

// 회원가입 API
export async function signup(data: SignupData): Promise<ApiResponse<User>> {
  try {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Signup failed',
    };
  }
}

// 로그인 API
export async function login(data: LoginData): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await apiClient.post('/auth/login', data);
    
    if (response.data.success && response.data.data) {
      // 토큰과 사용자 정보 저장
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        ...user,
        isAdmin: user.role === 'admin'
      }));
      
      // 로그인 상태 변경 이벤트 발생
      window.dispatchEvent(new Event('loginStatusChanged'));
    }
    
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
    };
  }
}

// 로그아웃
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('loginStatusChanged'));
}

// 현재 로그인한 사용자 정보 가져오기
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return {
      ...user,
      isAdmin: user.role === 'admin'
    };
  } catch {
    return null;
  }
}

// 로그인 상태 확인
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

// 대여소 목록 조회
export async function getStations(params?: {
  query?: string;
  lat?: number;
  lon?: number;
}): Promise<ApiResponse<any[]>> {
  try {
    const response = await apiClient.get('/stations', { params });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch stations',
    };
  }
}

// 특정 대여소의 자전거 목록 조회
export async function getAvailableBikes(stationId: number): Promise<ApiResponse<any[]>> {
  try {
    const response = await apiClient.get(`/stations/${stationId}/bikes`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch bikes',
    };
  }
}

// 현재 대여 중인 자전거 조회
export async function getCurrentRental(): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.get('/rentals/current');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch current rental',
    };
  }
}

// 대여 이력 조회
export async function getRentalHistory(): Promise<ApiResponse<any[]>> {
  try {
    const response = await apiClient.get('/rentals/history');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch rental history',
    };
  }
}

// 자전거 대여
export async function rentBike(bikeId: number, startStationId: number): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.post('/rentals/rent', { bikeId, startStationId });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to rent bike',
    };
  }
}

// 자전거 반납
export async function returnBike(endStationId: number): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.post('/rentals/return', { endStationId });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to return bike',
    };
  }
}

// 게시글 목록 조회
export async function getPosts(params?: {
  category?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch posts',
    };
  }
}

// 게시글 상세 조회
export async function getPost(postId: number): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch post',
    };
  }
}

// 게시글 작성
export async function createPost(data: {
  title: string;
  content: string;
  category: string;
  is_pinned?: boolean;
}): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.post('/posts', data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create post',
    };
  }
}

// 게시글 수정
export async function updatePost(postId: number, data: {
  title: string;
  content: string;
  category: string;
}): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update post',
    };
  }
}

// 게시글 삭제
export async function deletePost(postId: number): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete post',
    };
  }
}

export default apiClient;
