// src/contexts/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Context에 저장할 데이터 타입 정의
interface AuthContextType {
  token: string | null;
  user: { email: string, username: string, role: string } | null;
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

  // (중요) 앱 로드 시 localStorage에서 토큰을 복원
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 로그인 함수
  const login = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  };

  // 로그아웃 함수
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
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