import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FooterProps {
  onStationFinderClick?: () => void;
  onCommunityClick?: () => void;
  onPurchaseClick?: () => void;
  onFaqClick?: () => void;
  onHomeClick?: () => void;
}

export function Footer({ onStationFinderClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick }: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <button onClick={onHomeClick} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-[#00A862] rounded-full flex items-center justify-center border-2 border-[#00A862]">
                <span className="text-2xl">🚲</span>
              </div>
              <span className="text-white">광운따릉이</span>
            </button>
            <p className="text-sm mb-4">
              광운대학교 공공자전거 서비스로 학생 여러분의 건강하고 즐거운 이동을 돕습니다.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#C8102E] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#C8102E] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#C8102E] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white mb-4">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={onHomeClick} className="hover:text-[#C8102E] transition-colors text-left">
                  이용안내
                </button>
              </li>
              <li>
                <button onClick={onStationFinderClick} className="hover:text-[#C8102E] transition-colors text-left">
                  대여소 찾기
                </button>
              </li>
              <li>
                <button onClick={onPurchaseClick} className="hover:text-[#C8102E] transition-colors text-left">
                  이용권 구매
                </button>
              </li>
              <li>
                <button onClick={onFaqClick} className="hover:text-[#C8102E] transition-colors text-left">
                  자주 묻는 질문
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">정보</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={onCommunityClick} className="hover:text-[#C8102E] transition-colors text-left">
                  공지사항
                </button>
              </li>
              <li>
                <button onClick={onCommunityClick} className="hover:text-[#C8102E] transition-colors text-left">
                  이벤트
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-[#C8102E] transition-colors text-left">
                  이메일 문의
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-[#C8102E] transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">고객센터</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C8102E]" />
                <span>02-940-5114</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C8102E]" />
                <span>help@kw-bike.kr</span>
                <button onClick={() => navigate('/contact')} className="flex items-center gap-2 hover:text-[#C8102E] transition-colors">
                  <Mail className="w-4 h-4 text-[#C8102E]" />
                  <span>이메일 문의</span>
                </button>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C8102E] flex-shrink-0 mt-0.5" />
                <span>서울특별시 노원구 광운로 20 (월계동)</span>
              </li>
              <li className="text-xs text-gray-400 mt-2">
                평일 09:00 - 18:00
                <br />
                주말 및 공휴일 휴무
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2025 Kwangwoon University Bike Sharing. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-[#C8102E] transition-colors">
                이용약관
              </a>
              <a href="#" className="hover:text-[#C8102E] transition-colors">
                개인정보처리방침
              </a>
              <a href="#" className="hover:text-[#C8102E] transition-colors">
                위치기반서비스 이용약관
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
