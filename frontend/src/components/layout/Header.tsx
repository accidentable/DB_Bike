// src/components/layout/Header.tsx
// (모든 import 경로 수정 완료)

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

// (수정) ../../contexts/AuthContext (O)
import { useAuth } from '../../contexts/AuthContext'; 
// (수정) ../ui/button (O)
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Bike } from 'lucide-react';

// (수정) export default function Header
export default function Header() {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/'); // 로그아웃 후 홈으로
  };

  const handleAdminClick = () => {
    setIsAdminDialogOpen(true);
    setAdminPassword('');
    setAdminError('');
  };

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 백엔드에 비밀번호 전송하여 토큰 받기
      const response = await axios.post('http://localhost:3000/api/admin/auth-password', {
        password: adminPassword
      });
      
      if (response.data.success && response.data.token) {
        // 토큰을 localStorage에 저장
        localStorage.setItem('authToken', response.data.token);
        console.log('✅ 토큰 저장됨:', response.data.token);
        
        // 모달 닫고 관리자 페이지로 이동
        setIsAdminDialogOpen(false);
        setAdminPassword('');
        setAdminError('');
        navigate('/admin');
      }
    } catch (error) {
      console.error('❌ 관리자 인증 실패:', error);
      setAdminError('비밀번호가 틀렸습니다.');
      setAdminPassword('');
    }
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
          <Button
            variant="ghost"
            size="sm"
            className="text-[#00A862] hover:bg-green-50"
            onClick={handleAdminClick}
          >
            관리자
          </Button>
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

      {/* 관리자 비밀번호 입력 모달 */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 페이지 접근</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">관리자 비밀번호</label>
              <Input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setAdminError(''); // 입력 시 에러 메시지 제거
                }}
                className="mt-1"
                autoFocus
              />
              {adminError && (
                <p className="text-red-500 text-sm mt-1">{adminError}</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdminDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-[#00A862] hover:bg-[#007F4E]"
              >
                확인
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}