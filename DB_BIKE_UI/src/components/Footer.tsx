import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#00A862] rounded-full flex items-center justify-center">
                <span className="text-white">🚲</span>
              </div>
              <span className="text-white">서울자전거 따릉이</span>
            </div>
            <p className="text-sm mb-4">
              서울시 공공자전거 서비스로 시민 여러분의 건강하고 즐거운 이동을 돕습니다.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#00A862] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#00A862] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#00A862] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white mb-4">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  이용안내
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  대여소 찾기
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  이용요금
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  자주 묻는 질문
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">정보</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  공지사항
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  이벤트
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  운영정책
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#00A862] transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">고객센터</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#00A862]" />
                <span>1599-0120</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00A862]" />
                <span>help@seoulbike.kr</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#00A862] flex-shrink-0 mt-0.5" />
                <span>서울특별시 중구 세종대로 110</span>
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
              © 2025 Seoul Bike Sharing. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-[#00A862] transition-colors">
                이용약관
              </a>
              <a href="#" className="hover:text-[#00A862] transition-colors">
                개인정보처리방침
              </a>
              <a href="#" className="hover:text-[#00A862] transition-colors">
                위치기반서비스 이용약관
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
