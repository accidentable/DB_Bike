import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Mail, Lock, User, Phone, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signup } from "../api/authApi";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    if (!agreements.terms || !agreements.privacy) {
      setError("필수 약관에 동의해주세요.");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signup({
        username: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      if (result.success) {
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        navigate('/login');
      } else {
        setError(result.message || "회원가입에 실패했습니다.");
      }
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // (이하 유효성 검사 함수들은 동일하게 유지)
  const validateEmail = (email: string) => { /* ... */ };
  const validateName = (name: string) => { /* ... */ };
  const validatePhone = (phone: string) => { /* ... */ };
  const validatePassword = (password: string) => { /* ... */ };
  const validateConfirmPassword = (confirmPassword: string) => { /* ... */ };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => { /* ... */ };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            {/* ... (헤더 동일) ... */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#00A862]">
              <span className="text-4xl">🚲</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">회원가입</h2>
            <p className="text-gray-600 text-sm">
              따릉이와 함께 건강한 서울 생활을 시작하세요
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 🚨 [수정] 이름 필드 - 아이콘 구조 및 클래스 변경 */}
            <div>
              <Label htmlFor="name">이름</Label>
              <div className="relative mt-1">
                {/* - div 래퍼 제거
                  - 'inset-y-0 pl-3 pointer-events-none' 대신
                  - 'absolute left-3 top-1/2 -translate-y-1/2' 사용
                */}
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10" // .pl-10은 index.css에 존재
                  required
                />
              </div>
              {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
            </div>

            {/* 🚨 [수정] 이메일 필드 - 아이콘 구조 및 클래스 변경 */}
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
                  onBlur={handleBlur}
                  className="pl-10"
                  required
                />
              </div>
              {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
            </div>

            {/* 🚨 [수정] 휴대폰 필드 - 아이콘 구조 및 클래스 변경 */}
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
                  onBlur={handleBlur}
                  className="pl-10"
                />
              </div>
              {validationErrors.phone && <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>}
            </div>

            {/* 🚨 [수정] 비밀번호 필드 - 아이콘/버튼 구조, 클래스, 패딩 변경 */}
            <div>
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative mt-1">
                {/* 왼쪽 아이콘 */}
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8자 이상 입력하세요"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  // .pr-10 대신 .pr-8 사용
                  className="pl-10 pr-8"
                  minLength={8}
                  required
                />
                
                {/* 오른쪽 버튼 (div 래퍼 제거) */}
                <button
                  type="button"
                  // .right-3 대신 .right-4 사용
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {/* .w-5 .h-5 대신 .w-4 .h-4 사용 (일관성) */}
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
            </div>

            {/* 🚨 [수정] 비밀번호 확인 필드 - 아이콘/버튼 구조, 클래스, 패딩 변경 */}
            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  // .pr-10 대신 .pr-8 사용
                  className="pl-10 pr-8"
                  minLength={8}
                  required
                />
                
                <button
                  type="button"
                  // .right-3 대신 .right-4 사용
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
            </div>

            {/* ... (이하 약관 동의, 버튼, 하단 링크 등은 동일) ... */}
            
            <div className="border-t pt-4 mt-6">
              {/* ... (약관 동의 JSX) ... */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="all"
                    checked={agreements.all}
                    onCheckedChange={(checked) => handleAllAgreements(checked as boolean)}
                  />
                  <Label htmlFor="all" className="cursor-pointer font-semibold">
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

            <Button type="submit" className="w-full bg-[#00A862] hover:bg-[#008F54] mt-6" disabled={isLoading}>
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">이미 계정이 있으신가요? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-[#00A862] hover:underline"
            >
              로그인
            </button>
          </div>
        </Card>

        {/* ... (하단 혜택 안내 JSX 동일) ... */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          {/* ... */}
        </div>
        </div>
      </div>
    </div>
  );
}