/**
 * src/pages/SignupPage.tsx
 * 회원가입 페이지
 * 
 * 사용된 API:
 * - authApi: signup, sendVerificationEmail, verifyEmail
 */

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

  // 카카오 회원가입 핸들러
  const handleKakaoSignup = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // 카카오 JavaScript SDK가 로드되어 있는지 확인
      if (typeof window === 'undefined' || !(window as any).Kakao) {
        // 이미 스크립트가 로드 중인지 확인
        const existingScript = document.querySelector('script[src="https://developers.kakao.com/sdk/js/kakao.js"]');
        if (existingScript) {
          // 스크립트가 이미 추가되어 있으면 로드 완료를 기다림
          const checkKakao = setInterval(() => {
            if ((window as any).Kakao) {
              clearInterval(checkKakao);
              handleKakaoSignup();
            }
          }, 100);
          
          // 5초 후 타임아웃
          setTimeout(() => {
            clearInterval(checkKakao);
            if (!(window as any).Kakao) {
              setError('카카오 SDK 로드 시간이 초과되었습니다.');
              setIsLoading(false);
            }
          }, 5000);
          return;
        }
        
        // 카카오 SDK 동적 로드
        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
        script.async = true;
        script.onload = () => {
          handleKakaoSignup();
        };
        script.onerror = () => {
          setError('카카오 SDK를 불러오는데 실패했습니다.');
          setIsLoading(false);
        };
        document.head.appendChild(script);
        return;
      }

      const Kakao = (window as any).Kakao;
      
      // 카카오 SDK 초기화
      if (!Kakao.isInitialized()) {
        Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY || '0ddb80336b17ea45f9f7c27852fbea10');
      }

      // 회원가입 페이지에서는 항상 로그아웃 후 로그인 (자동 로그인 방지)
      // 1. 카카오 SDK 로그아웃
      await new Promise<void>((resolve) => {
        const currentToken = Kakao.Auth.getAccessToken();
        if (currentToken) {
          Kakao.Auth.logout((logoutResult: any) => {
            console.log('카카오 로그아웃 완료:', logoutResult);
            setTimeout(() => resolve(), 500);
          });
        } else {
          resolve();
        }
      });

      // 2. 카카오 SDK 내부 스토리지 정리
      try {
        // localStorage에서 카카오 관련 데이터 삭제
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('kakao') || key.includes('Kakao') || key.includes('KAKAO'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // sessionStorage에서도 카카오 관련 데이터 삭제
        const sessionKeysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('kakao') || key.includes('Kakao') || key.includes('KAKAO'))) {
            sessionKeysToRemove.push(key);
          }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

        // 카카오 관련 쿠키 삭제
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('kakao') || name.includes('Kakao') || name.includes('KAKAO')) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.kakao.com`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.kakao.co.kr`;
          }
        });
      } catch (err) {
        console.log('스토리지 정리 중 오류:', err);
      }

      // 3. 추가 확인: 로그아웃 후에도 토큰이 남아있으면 재시도
      let retryCount = 0;
      while (Kakao.Auth.getAccessToken() && retryCount < 5) {
        await new Promise<void>((resolve) => {
          Kakao.Auth.logout(() => {
            setTimeout(() => resolve(), 500);
          });
        });
        retryCount++;
      }

      // 4. 최종 확인: 토큰이 여전히 남아있으면 강제 제거
      if (Kakao.Auth.getAccessToken()) {
        console.warn('카카오 토큰이 여전히 남아있습니다. 강제 제거 시도');
        // SDK 내부 메서드로 토큰 제거 시도
        try {
          if (Kakao.Auth.setAccessToken) {
            Kakao.Auth.setAccessToken(null);
          }
        } catch (e) {
          console.log('토큰 강제 제거 실패:', e);
        }
      }

      // 카카오 로그인 실행 (팝업으로 열고 prompt=login 파라미터로 항상 로그인 화면 표시)
      const appKey = import.meta.env.VITE_KAKAO_APP_KEY || '0ddb80336b17ea45f9f7c27852fbea10';
      const redirectUri = `${window.location.origin}/kakao-callback`;
      
      // prompt=login 파라미터로 항상 로그인 화면 표시 (카카오 쿠키 무시)
      // state 파라미터에 회원가입 모드 정보 포함
      const state = 'signup_' + Date.now();
      const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${appKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&prompt=login&state=${state}`;
      
      // 세션 스토리지에 회원가입 모드임을 저장
      sessionStorage.setItem('kakao_signup_mode', 'true');
      sessionStorage.setItem('kakao_state', state);
      
      // 팝업으로 카카오 로그인 창 열기
      const popup = window.open(
        kakaoLoginUrl,
        '카카오 로그인',
        'width=500,height=600,scrollbars=yes,resizable=yes,left=' + (window.screen.width / 2 - 250) + ',top=' + (window.screen.height / 2 - 300)
      );

      if (!popup) {
        setError('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
        setIsLoading(false);
        return;
      }

      // 팝업에서 인증 코드 받기
      const checkPopup = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(false);
            return;
          }

          // 팝업의 URL이 리다이렉트 URI로 변경되었는지 확인
          if (popup.location.href.includes('/kakao-callback')) {
            clearInterval(checkPopup);
            
            // URL에서 인증 코드 추출
            const urlParams = new URLSearchParams(popup.location.search);
            const code = urlParams.get('code');
            const stateParam = urlParams.get('state');
            
            // state 검증
            if (stateParam !== state) {
              setError('인증 상태가 일치하지 않습니다.');
              setIsLoading(false);
              popup.close();
              return;
            }
            
            if (code) {
              // 인증 코드로 액세스 토큰 발급 및 로그인 처리
              handleKakaoCallback(code);
            } else {
              setError('카카오 로그인에 실패했습니다.');
              setIsLoading(false);
            }
            
            popup.close();
          }
        } catch (e) {
          // Cross-origin 에러는 무시 (팝업이 아직 리다이렉트되지 않았을 때)
        }
      }, 100);

      // 5분 후 타임아웃
      setTimeout(() => {
        clearInterval(checkPopup);
        if (popup && !popup.closed) {
          popup.close();
        }
        setIsLoading(false);
      }, 300000);

      // 인증 코드로 액세스 토큰 발급 및 로그인 처리
      async function handleKakaoCallback(code: string) {
        try {
          setIsLoading(true);
          setError("");
          
          // 인증 코드로 액세스 토큰 발급
          const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: appKey,
              redirect_uri: redirectUri,
              code: code,
            }),
          });

          if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(errorData.error_description || '액세스 토큰 발급에 실패했습니다.');
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          // 회원가입 모드로 호출 (이미 가입된 사용자면 에러 반환)
          const result = await kakaoLogin(accessToken, true);
          
          if (result.success && result.data) {
            alert(`환영합니다, ${result.data.user.username}님!`);
            setTimeout(() => {
              navigate('/');
            }, 100);
          } else {
            // 이미 가입된 사용자인 경우 로그인 페이지로 안내
            if (result.message?.includes('이미 가입된')) {
              const goToLogin = window.confirm(
                `${result.message}\n로그인 페이지로 이동하시겠습니까?`
              );
              if (goToLogin) {
                navigate('/login');
              }
            } else {
              setError(result.message || '카카오 로그인에 실패했습니다.');
            }
          }
        } catch (err: any) {
          console.error('카카오 로그인 에러:', err);
          setError('카카오 로그인 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error('카카오 로그인 에러:', err);
      setError('카카오 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newErrors = { ...validationErrors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "이름을 입력해주세요.";
        } else if (value.trim().length < 2) {
          newErrors.name = "이름은 2자 이상 입력해주세요.";
        } else {
          newErrors.name = "";
        }
        break;
      case "email":
        if (!value.trim()) {
          newErrors.email = "이메일을 입력해주세요.";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors.email = "올바른 이메일 형식이 아닙니다.";
          } else {
            newErrors.email = "";
          }
        }
        break;
      case "phone":
        if (value && !/^010-\d{4}-\d{4}$/.test(value)) {
          newErrors.phone = "올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)";
        } else {
          newErrors.phone = "";
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "비밀번호를 입력해주세요.";
        } else if (value.length < 8) {
          newErrors.password = "비밀번호는 8자 이상 입력해주세요.";
        } else {
          newErrors.password = "";
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        } else {
          newErrors.confirmPassword = "";
        }
        break;
    }

    setValidationErrors(newErrors);
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
                  onBlur={handleBlur}
                  className="pl-10"
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

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8자 이상 입력하세요"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className="pl-10 pr-8"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
            </div>

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
                  className="pl-10 pr-8"
                  minLength={8}
                  required
                />
                
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{validationErrors.confirmPassword}</p>}
            </div>

            <div className="border-t pt-4 mt-6">
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
                onClick={handleKakaoSignup}
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