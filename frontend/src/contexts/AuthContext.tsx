// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// 1. Context에 저장할 데이터 타입 정의
interface AuthContextType {
  token: string | null;
  user: { member_id: number, email: string, username: string, role: string } | null;
  isLoggedIn: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

// 2. Context 생성 (초기값은 undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Context를 앱에 제공하는 Provider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  // localStorage에서 토큰과 사용자 정보를 불러오는 함수
  const loadAuthState = () => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user'); // 'user' 키로 변경
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log('Auth state loaded:', { token: storedToken, user: parsedUser });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        // 잘못된 데이터인 경우 초기화
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  };

  // 앱 로드 시 인증 상태 복원
  useEffect(() => {
    loadAuthState();
  }, []);

  // 로그인 이벤트 리스너 설정
  useEffect(() => {
    const handleLoginStatusChanged = (event: Event) => {
      console.log('Login status changed event received');
      loadAuthState(); // 인증 상태 다시 로드
    };

    window.addEventListener('loginStatusChanged', handleLoginStatusChanged);
    return () => {
      window.removeEventListener('loginStatusChanged', handleLoginStatusChanged);
    };
  }, []);

  // 로그인 함수
  const login = (newToken: string, newUser: any) => {
    console.log('Login function called with:', { newToken, newUser });
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser)); // 'user' 키로 변경
  };

  // 로그아웃 함수
  const logout = () => {
    // 카카오 세션 제거
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const Kakao = (window as any).Kakao;
      if (Kakao.isInitialized()) {
        Kakao.Auth.logout();
      }
    }
    
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. (편의용) Context를 쉽게 꺼내 쓰는 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다.');
  }
  return context;
}