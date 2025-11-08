import { Menu, User, MapPin, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { isLoggedIn, getCurrentUser, logout as apiLogout } from "../utils/api";

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onStationFinderClick?: () => void;
  onNoticeClick?: () => void;
  onCommunityClick?: () => void;
  onPurchaseClick?: () => void;
  onFaqClick?: () => void;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onRankingClick?: () => void;
  onAdminClick?: () => void;
}

export function Header({ onLoginClick, onSignupClick, onStationFinderClick, onNoticeClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick, onProfileClick, onRankingClick, onAdminClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedInStatus = isLoggedIn();
      setLoggedIn(loggedInStatus);
      
      if (loggedInStatus) {
        const user = getCurrentUser();
        setUserName(user?.name || "");
        setIsAdmin(user?.isAdmin || false);
      } else {
        setIsAdmin(false);
      }
    };

    checkLoginStatus();
    
    // 로그인 상태 변경 감지를 위한 이벤트 리스너
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('loginStatusChanged', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiLogout();
      setLoggedIn(false);
      setUserName("");
      window.dispatchEvent(new Event('loginStatusChanged'));
      alert("로그아웃 되었습니다.");
      if (onHomeClick) onHomeClick();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-[#00A862] text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={onHomeClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-[#00A862]">
              <span className="text-2xl">🚲</span>
            </div>
            <span className="text-xl">광운따릉이</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={onStationFinderClick} className="hover:text-green-100 transition-colors">
              대여소 찾기
            </button>
            <button onClick={onPurchaseClick} className="hover:text-green-100 transition-colors">
              이용권 구매
            </button>
            <button onClick={onCommunityClick} className="hover:text-green-100 transition-colors">
              커뮤니티
            </button>
            <button onClick={onFaqClick} className="hover:text-green-100 transition-colors">
              FAQ
            </button>
            <button onClick={onRankingClick} className="hover:text-green-100 transition-colors">
              랭킹
            </button>
            {isAdmin && onAdminClick && (
              <button onClick={onAdminClick} className="hover:text-green-100 transition-colors">
                관리자
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <>
                <span className="text-sm">안녕하세요, {userName}님</span>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-green-700"
                  onClick={onProfileClick}
                >
                  <User className="w-4 h-4 mr-2" />
                  마이페이지
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-green-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="bg-white text-[#00A862] hover:bg-green-50 border-white"
                onClick={onLoginClick}
              >
                로그인
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <button onClick={onStationFinderClick} className="hover:text-green-100 transition-colors text-left">
              대여소 찾기
            </button>
            <button onClick={onPurchaseClick} className="hover:text-green-100 transition-colors text-left">
              이용권 구매
            </button>
            <button onClick={onCommunityClick} className="hover:text-green-100 transition-colors text-left">
              커뮤니티
            </button>
            <button onClick={onFaqClick} className="hover:text-green-100 transition-colors text-left">
              FAQ
            </button>
            <button onClick={onRankingClick} className="hover:text-green-100 transition-colors text-left">
              랭킹
            </button>
            {isAdmin && onAdminClick && (
              <button onClick={onAdminClick} className="hover:text-green-100 transition-colors text-left">
                관리자
              </button>
            )}
            {loggedIn ? (
              <>
                <div className="text-sm py-2">안녕하세요, {userName}님</div>
                <button onClick={onProfileClick} className="hover:text-green-100 transition-colors text-left">
                  마이페이지
                </button>
                <button onClick={handleLogout} className="hover:text-green-100 transition-colors text-left">
                  로그아웃
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Button
                  variant="outline"
                  className="bg-white text-[#00A862] border-white"
                  onClick={onLoginClick}
                >
                  로그인
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
