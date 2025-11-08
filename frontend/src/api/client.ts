import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-442de064`;

// Supabase 클라이언트 초기화
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  studentId?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  studentId: string;
  createdAt: string;
  totalDistance: number;
  totalRides: number;
  achievements: string[];
  isAdmin?: boolean;
  tickets?: any[];
  currentTicket?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  user?: User;
  token?: string;
}

// 회원가입 API
export async function signup(data: SignupData): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '회원가입에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('Signup API error:', error);
    throw error;
  }
}

// 로그인 API
export async function login(data: LoginData): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '로그인에 실패했습니다.');
    }

    // 로그인 성공 시 토큰 저장
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
}

// 세션 확인 API
export async function checkAuth(): Promise<ApiResponse<User>> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw new Error(result.error || '인증에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('Check auth error:', error);
    throw error;
  }
}

// 로그아웃 API
export async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    // 에러가 발생해도 로컬 스토리지는 정리
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

// 현재 로그인한 사용자 정보 가져오기
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// 로그인 여부 확인
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('authToken');
}

// 이메일 중복 체크 API
export async function checkEmailAvailability(email: string): Promise<{ available: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '이메일 확인에 실패했습니다.');
    }

    return { available: result.available, message: result.message };
  } catch (error) {
    console.error('Check email availability error:', error);
    throw error;
  }
}

// 유저명 중복 체크 API
export async function checkUsernameAvailability(name: string): Promise<{ available: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/check-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ name }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '이름 확인에 실패했습니다.');
    }

    return { available: result.available, message: result.message };
  } catch (error) {
    console.error('Check username availability error:', error);
    throw error;
  }
}

// 프로필 정보 수정 API
export async function updateProfile(data: { name?: string; phone?: string; studentId?: string }): Promise<ApiResponse<User>> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '프로필 업데이트에 실패했습니다.');
    }

    // 업데이트된 사용자 정보 로컬 스토리지에 저장
    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

// 비밀번호 변경 API
export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '비밀번호 변경에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

// 자전거 대여 API
export async function rentBike(data: {
  bikeId: string;
  bikeNumber: string;
  stationId: number;
  stationName: string;
  battery: number;
}): Promise<any> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/rent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '자전거 대여에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('Rent bike error:', error);
    throw error;
  }
}

// 자전거 반납 API
export async function returnBike(data: {
  returnStationId?: number;
  returnStationName?: string;
}): Promise<any> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '자전거 반납에 실패했습니다.');
    }

    // 업데이트된 사용자 정보가 있으면 저장
    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    return result;
  } catch (error) {
    console.error('Return bike error:', error);
    throw error;
  }
}

// 현재 대여 정보 조회
export async function getCurrentRental(): Promise<any> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/rental/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '대여 정보 조회에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('Get current rental error:', error);
    throw error;
  }
}

// 대여 이력 조회
export async function getRentalHistory(): Promise<any> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/rental/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || '대여 이력 조회에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('Get rental history error:', error);
    throw error;
  }
}

// 소셜 로그인 (네이버, 카카오) - Supabase Auth 사용
export async function socialLogin(provider: 'kakao' | 'naver'): Promise<void> {
  try {
    // OAuth 로그인 시작
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`${provider} login error:`, error);
    throw new Error(`${provider} 로그인에 실패했습니다. 관리자에게 문의하세요.`);
  }
}