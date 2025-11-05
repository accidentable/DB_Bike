import { Menu, User, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onStationFinderClick?: () => void;
  onNoticeClick?: () => void;
  onCommunityClick?: () => void;
  onPurchaseClick?: () => void;
  onFaqClick?: () => void;
  onHomeClick?: () => void;
}

export function Header({ onLoginClick, onSignupClick, onStationFinderClick, onNoticeClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#00A862] text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#00A862]">🚲</span>
            </div>
            <span className="text-xl">서울자전거 따릉이</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={onHomeClick} className="hover:text-green-100 transition-colors">
              홈
            </button>
            <button onClick={onStationFinderClick} className="hover:text-green-100 transition-colors">
              대여소 찾기
            </button>
            <button onClick={onPurchaseClick} className="hover:text-green-100 transition-colors">
              이용권 구매
            </button>
            <button onClick={onNoticeClick} className="hover:text-green-100 transition-colors">
              공지사항
            </button>
            <button onClick={onCommunityClick} className="hover:text-green-100 transition-colors">
              커뮤니티
            </button>
            <button onClick={onFaqClick} className="hover:text-green-100 transition-colors">
              FAQ
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              className="bg-white text-[#00A862] hover:bg-green-50"
              onClick={onLoginClick}
            >
              <User className="w-4 h-4 mr-2" />
              로그인
            </Button>
            <Button
              variant="outline"
              className="bg-white text-[#00A862] hover:bg-green-50"
              onClick={onSignupClick}
            >
              회원가입
            </Button>
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
            <button onClick={onHomeClick} className="hover:text-green-100 transition-colors text-left">
              홈
            </button>
            <button onClick={onStationFinderClick} className="hover:text-green-100 transition-colors text-left">
              대여소 찾기
            </button>
            <button onClick={onPurchaseClick} className="hover:text-green-100 transition-colors text-left">
              이용권 구매
            </button>
            <button onClick={onNoticeClick} className="hover:text-green-100 transition-colors text-left">
              공지사항
            </button>
            <button onClick={onCommunityClick} className="hover:text-green-100 transition-colors text-left">
              커뮤니티
            </button>
            <button onClick={onFaqClick} className="hover:text-green-100 transition-colors text-left">
              FAQ
            </button>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="outline"
                className="bg-white text-[#00A862]"
                onClick={onLoginClick}
              >
                로그인
              </Button>
              <Button
                variant="outline"
                className="bg-white text-[#00A862]"
                onClick={onSignupClick}
              >
                회원가입
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
