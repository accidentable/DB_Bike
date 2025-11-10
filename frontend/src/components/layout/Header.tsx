// src/components/layout/Header.tsx
// (모든 import 경로 수정 완료)

import { Link, useNavigate } from 'react-router-dom';

// (수정) ../../contexts/AuthContext (O)
import { useAuth } from '../../contexts/AuthContext'; 
// (수정) ../ui/button (O)
import { Button } from '../ui/button'; 
import { Bike } from 'lucide-react';

// (수정) export default function Header
export default function Header() {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // 로그아웃 후 홈으로
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Bike className="w-6 h-6 text-[#00A862]" />
          <span className="font-bold text-lg">광운따릉이</span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/" className="text-sm font-medium hover:text-[#00A862]">대여소 찾기</Link>
          <Link to="/purchase" className="text-sm font-medium hover:text-[#00A862]">이용권 구매</Link>
          <Link to="/community" className="text-sm font-medium hover:text-[#00A862]">커뮤니티</Link>
          <Link to="/faq" className="text-sm font-medium hover:text-[#00A862]">FAQ</Link>
          <Link to="/ranking" className="text-sm font-medium hover:text-[#00A862]">랭킹</Link>
          {user?.isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#00A862] hover:bg-green-50"
              onClick={() => navigate('/admin')}
            >
              관리자
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm">환영합니다, {user?.username}님!</span>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>마이페이지</Button>
              <Button size="sm" onClick={handleLogout} className="bg-[#00A862] hover:bg-[#007F4E]">
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                로그인
              </Button>
              <Button size="sm" onClick={() => navigate('/signup')} className="bg-[#00A862] hover:bg-[#007F4E]">
                회원가입
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}