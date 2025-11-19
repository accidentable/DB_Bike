import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Mail, Lock, User, Phone, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signup, kakaoLogin, sendVerificationEmail, verifyEmail } from "../api/authApi";

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
  
  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

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

  // 이메일 인증 코드 발송
  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      setVerificationMessage("이메일을 먼저 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setVerificationMessage("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setIsSendingCode(true);
    setVerificationMessage("");

    try {
      const result = await sendVerificationEmail(formData.email);
      if (result.success) {
        setVerificationMessage("인증 코드가 발송되었습니다. 이메일을 확인해주세요.");
      } else {
        setVerificationMessage(result.message || "인증 코드 발송에 실패했습니다.");
      }
    } catch (err: any) {
      setVerificationMessage("인증 코드 발송 중 오류가 발생했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };

  // 이메일 인증 코드 검증
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerificationMessage("인증 코드를 입력해주세요.");
      return;
    }

    setIsVerifyingCode(true);
    setVerificationMessage("");

    try {
      const result = await verifyEmail(formData.email, verificationCode);
      if (result.success) {
        setIsEmailVerified(true);
        setVerificationMessage("이메일 인증이 완료되었습니다.");
      } else {
        setVerificationMessage(result.message || "인증 코드가 올바르지 않습니다.");
      }
    } catch (err: any) {
      setVerificationMessage("인증 코드 검증 중 오류가 발생했습니다.");
    } finally {
      setIsVerifyingCode(false);
    }
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

    if (!isEmailVerified) {
      setError("이메일 인증을 완료해주세요.");
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
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#00A862]">
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

            {/* 이메일 필드 및 인증 */}
            <div>
              <Label htmlFor="email">이메일</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => {
                      handleInputChange(e);
                      setIsEmailVerified(false);
                      setVerificationCode("");
                      setVerificationMessage("");
                    }}
                    onBlur={handleBlur}
                    className="pl-10"
                    required
                    disabled={isEmailVerified}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSendingCode || isEmailVerified || !formData.email}
                  className="bg-[#00A862] hover:bg-[#008F54] whitespace-nowrap"
                >
                  {isSendingCode ? "발송 중..." : isEmailVerified ? "인증 완료" : "인증 코드 발송"}
                </Button>
              </div>
              {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
              
              {/* 인증 코드 입력 */}
              {!isEmailVerified && formData.email && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="인증 코드 6자리"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                        setVerificationMessage("");
                      }}
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isVerifyingCode || verificationCode.length !== 6}
                      className="bg-[#00A862] hover:bg-[#008F54] whitespace-nowrap"
                    >
                      {isVerifyingCode ? "확인 중..." : "인증 확인"}
                    </Button>
                  </div>
                  {verificationMessage && (
                    <p className={`text-xs mt-1 ${isEmailVerified ? 'text-green-600' : 'text-red-500'}`}>
                      {verificationMessage}
                    </p>
                  )}
                  {isEmailVerified && (
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                      <Check className="w-3 h-3" />
                      <span>이메일 인증이 완료되었습니다.</span>
                    </div>
                  )}
                </div>
              )}
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black border-[#FEE500]" 
                type="button" 
                onClick={async () => {
                  // 카카오 JavaScript SDK가 로드되어 있는지 확인
                  if (typeof window !== 'undefined' && (window as any).Kakao) {
                    const Kakao = (window as any).Kakao;
                    
                    // 카카오 SDK 초기화
                    if (!Kakao.isInitialized()) {
                      Kakao.init(process.env.REACT_APP_KAKAO_APP_KEY || '0ddb80336b17ea45f9f7c27852fbea10');
                    }

                    // 카카오 로그인 실행
                    Kakao.Auth.login({
                      success: async (authObj: any) => {
                        try {
                          setIsLoading(true);
                          setError("");
                          
                          // 카카오 액세스 토큰으로 백엔드에 로그인 요청
                          const result = await kakaoLogin(authObj.access_token);
                          
                          if (result.success && result.data) {
                            alert(`환영합니다, ${result.data.user.username}님!`);
                            setTimeout(() => {
                              navigate('/');
                            }, 100);
                          } else {
                            setError(result.message || '카카오 로그인에 실패했습니다.');
                          }
                        } catch (err: any) {
                          console.error('카카오 로그인 에러:', err);
                          setError('카카오 로그인 중 오류가 발생했습니다.');
                        } finally {
                          setIsLoading(false);
                        }
                      },
                      fail: (err: any) => {
                        console.error('카카오 로그인 실패:', err);
                        setError('카카오 로그인에 실패했습니다.');
                      }
                    });
                  } else {
                    // 카카오 SDK 동적 로드
                    const script = document.createElement('script');
                    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
                    script.async = true;
                    script.onload = () => {
                      const Kakao = (window as any).Kakao;
                      if (!Kakao.isInitialized()) {
                        Kakao.init(process.env.REACT_APP_KAKAO_APP_KEY || '0ddb80336b17ea45f9f7c27852fbea10');
                      }
                      Kakao.Auth.login({
                        success: async (authObj: any) => {
                          try {
                            setIsLoading(true);
                            setError("");
                            const result = await kakaoLogin(authObj.access_token);
                            if (result.success && result.data) {
                              alert(`환영합니다, ${result.data.user.username}님!`);
                              setTimeout(() => {
                                navigate('/');
                              }, 100);
                            } else {
                              setError(result.message || '카카오 로그인에 실패했습니다.');
                            }
                          } catch (err: any) {
                            console.error('카카오 로그인 에러:', err);
                            setError('카카오 로그인 중 오류가 발생했습니다.');
                          } finally {
                            setIsLoading(false);
                          }
                        },
                        fail: (err: any) => {
                          console.error('카카오 로그인 실패:', err);
                          setError('카카오 로그인에 실패했습니다.');
                        }
                      });
                    };
                    document.head.appendChild(script);
                  }
                }}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                </svg>
                카카오로 시작하기
              </Button>
            </div>
          </div>

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