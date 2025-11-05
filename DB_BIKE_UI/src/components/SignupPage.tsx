import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Header } from "./Header";
import { Mail, Lock, User, Phone, Check } from "lucide-react";

interface SignupPageProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
}

export function SignupPage({ onClose, onSwitchToLogin, onStationFinderClick, onNoticeClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAllAgreements = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    const newAgreements = {
      ...agreements,
      [key]: checked,
    };
    
    if (key !== "all") {
      newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
    }
    
    setAgreements(newAgreements);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    if (!agreements.terms || !agreements.privacy) {
      alert("필수 약관에 동의해주세요.");
      return;
    }
    
    console.log("Signup:", formData, agreements);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onSwitchToLogin}
        onSignupClick={onClose}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
      />
      <div className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00A862] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚲</span>
            </div>
            <h2 className="mb-2">회원가입</h2>
            <p className="text-gray-600 text-sm">
              따릉이와 함께 건강한 서울 생활을 시작하세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">이메일</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">휴대폰 번호</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="8자 이상 입력하세요"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="all"
                    checked={agreements.all}
                    onCheckedChange={(checked) => handleAllAgreements(checked as boolean)}
                  />
                  <Label htmlFor="all" className="cursor-pointer">
                    전체 동의
                  </Label>
                </div>

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreements.terms}
                      onCheckedChange={(checked) => handleAgreementChange("terms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      이용약관 동의 <span className="text-red-500">(필수)</span>
                    </Label>
                  </div>
                  <a href="#" className="text-xs text-gray-500 underline">
                    보기
                  </a>
                </div>

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="privacy"
                      checked={agreements.privacy}
                      onCheckedChange={(checked) => handleAgreementChange("privacy", checked as boolean)}
                    />
                    <Label htmlFor="privacy" className="text-sm cursor-pointer">
                      개인정보 수집 및 이용 동의 <span className="text-red-500">(필수)</span>
                    </Label>
                  </div>
                  <a href="#" className="text-xs text-gray-500 underline">
                    보기
                  </a>
                </div>

                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="marketing"
                      checked={agreements.marketing}
                      onCheckedChange={(checked) => handleAgreementChange("marketing", checked as boolean)}
                    />
                    <Label htmlFor="marketing" className="text-sm cursor-pointer">
                      마케팅 정보 수신 동의 (선택)
                    </Label>
                  </div>
                  <a href="#" className="text-xs text-gray-500 underline">
                    보기
                  </a>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#00A862] hover:bg-[#008F54] mt-6">
              회원가입
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">이미 계정이 있으신가요? </span>
            <button
              onClick={onSwitchToLogin}
              className="text-[#00A862] hover:underline"
            >
              로그인
            </button>
          </div>
        </Card>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="mb-1">회원가입 후 다음 혜택을 받으실 수 있습니다:</p>
              <ul className="text-xs space-y-1 text-blue-800">
                <li>• 서울시 전역 2,500개 이상 대여소 이용</li>
                <li>• 모바일 앱에서 QR 스캔으로 간편 대여</li>
                <li>• 이용 내역 및 결제 관리</li>
                <li>• 정기권 할인 혜택</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
