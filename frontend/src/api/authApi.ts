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
    console.log('Attempting login with:', { email });
    
    const response = await client.post('/api/auth/login', { email, password });
    console.log('Login API response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || '로그인에 실패했습니다.');
    }

    if (!response.data.data || !response.data.data.token || !response.data.data.user) {
      throw new Error('로그인 응답 데이터가 올바르지 않습니다.');
    }

    const { token, user } = response.data.data;

    // 기존 데이터 삭제
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // 새로운 데이터 저장
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user)); // user 객체는 이미 isAdmin을 포함

    // 로그인 상태가 변경되었음을 알림
    window.dispatchEvent(new CustomEvent('loginStatusChanged', {
      detail: { user }
    }));
    
    return {
      success: true,
      data: {
        token,
        user
      }
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || '로그인 중 오류가 발생했습니다.',
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
