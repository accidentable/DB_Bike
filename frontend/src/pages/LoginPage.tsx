/**
 * src/pages/LoginPage.tsx
 * 로그인 페이지
 * 
 * 사용된 API:
 * - authApi: login
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { login, kakaoLogin } from "../api/authApi";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("이메일과 비밀번호를 모두 입력해주세요.");
        return;
      }

      console.log("로그인 시도:", { email });
      const result = await login(email, password);
      console.log("로그인 응답:", result);
      
      if (result.success && result.data) {
        const { token, user } = result.data;
        
        if (!token || !user) {
          console.error("유효하지 않은 로그인 응답:", result);
          setError("로그인 응답 데이터가 올바르지 않습니다.");
          return;
        }

        console.log("로그인 성공. 사용자 정보:", user);

        // 기존 데이터 제거
        localStorage.clear();
        
        // 새로운 인증 데이터 저장
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));

        console.log("localStorage 저장 후 상태:", {
          token: localStorage.getItem('authToken'),
          user: localStorage.getItem('user')
        });

        // 로그인 상태 변경 이벤트 발생
        const loginEvent = new CustomEvent('loginStatusChanged', {
          detail: { user }
        });
        window.dispatchEvent(loginEvent);
        
        // 로그인 성공 메시지와 함께 홈으로 이동
        alert(`환영합니다, ${user.username}님!`);

        setTimeout(() => {
          console.log("홈으로 이동");
          navigate('/');
        }, 100);
      } else {
        console.error("로그인 실패:", result.message);
        setError(result.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
      }
    } catch (err: any) {
      console.error("로그인 에러:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
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
              handleKakaoLogin();
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
          handleKakaoLogin();
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

      // 로그인 페이지에서도 항상 로그아웃 후 로그인 (자동 로그인 방지)
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
      // state 파라미터에 로그인 모드 정보 포함
      const state = 'login_' + Date.now();
      const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${appKey}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&prompt=login&state=${state}`;
      
      // 세션 스토리지에 로그인 모드임을 저장
      sessionStorage.setItem('kakao_signup_mode', 'false');
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

          // 로그인 모드로 호출
          const result = await kakaoLogin(accessToken, false);
          
          if (result.success && result.data) {
            const { token, user } = result.data;
            
            // 로컬스토리지 초기화
            localStorage.clear();
            
            // 새로운 인증 데이터 저장
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // 로그인 상태 변경 이벤트 발생
            const loginEvent = new CustomEvent('loginStatusChanged', {
              detail: { user }
            });
            window.dispatchEvent(loginEvent);
            
            alert(`환영합니다, ${user.username}님!`);
            
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
      }
    } catch (err: any) {
      console.error('카카오 로그인 에러:', err);
      setError('카카오 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    if (provider === 'kakao') {
      handleKakaoLogin();
    } else {
      alert(`${provider} 로그인은 현재 준비 중입니다.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-8">
      <div className="w-full max-w-md">

      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#00A862]">
            <span className="text-4xl">🚲</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">로그인</h2>
          <p className="text-gray-600 text-sm">
            광운따릉이 서비스를 이용하려면 로그인하세요
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
            <Label htmlFor="email">이메일</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
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
            </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                로그인 상태 유지
              </Label>
            </div>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-[#00A862] hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#00A862] hover:bg-[#008F54]"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
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

          <div className="mt-6 space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black border-[#FEE500]" 
              type="button" 
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
              </svg>
              카카오로 로그인
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">계정이 없으신가요? </span>
          <button
            onClick={() => navigate('/signup')}
            className="text-[#00A862] hover:underline"
          >
            회원가입
          </button>
        </div>
      </Card>

      <p className="text-center text-xs text-gray-500 mt-6">
        로그인하시면 따릉이의{" "}
        <a href="#" className="underline">
          이용약관
        </a>
        과{" "}
        <a href="#" className="underline">
          개인정보처리방침
        </a>
        에 동의하는 것으로 간주됩니다.
      </p>

      </div>
    </div>
  );
}
