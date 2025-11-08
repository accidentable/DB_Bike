/**
 * 인증 관련 API 함수들
 */

import client from './client';

// 사용자 타입 정의
export interface User {
  member_id: number;
  username: string;
  email: string;
  role: string;
  isAdmin?: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// 로그인 응답 타입
export interface LoginResponse {
  token: string;
  user: User;
}

// 회원가입 데이터 타입
export interface SignupData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  studentId?: string;
}

/**
 * 회원가입
 */
export async function signup(userData: SignupData): Promise<ApiResponse<User>> {
  try {
    const response = await client.post('/api/auth/signup', userData);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '회원가입 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 로그인
 */
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  try {
    const response = await client.post('/api/auth/login', { email, password });
    
    if (response.data.success && response.data.data) {
      // 토큰과 사용자 정보 저장
      const { token, user } = response.data.data;
      localStorage.setItem('authToken', token);
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
      message: error.response?.data?.message || '로그인 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 로그아웃
 */
export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('loginStatusChanged'));
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
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

/**
 * 로그인 상태 확인
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken');
}
