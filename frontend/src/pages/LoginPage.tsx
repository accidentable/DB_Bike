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

        // 잠시 대기 후 페이지 이동 (상태 업데이트를 위해)
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

  const handleKakaoLogin = () => {
    // 카카오 JavaScript SDK가 로드되어 있는지 확인
    if (typeof window !== 'undefined' && (window as any).Kakao) {
      const Kakao = (window as any).Kakao;
      
      // 카카오 SDK 초기화 (이미 초기화되어 있으면 무시)
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
      // 카카오 SDK가 로드되지 않은 경우
      alert('카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      
      // 카카오 SDK 동적 로드
      const script = document.createElement('script');
      script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
      script.async = true;
      script.onload = () => {
        handleKakaoLogin();
      };
      document.head.appendChild(script);
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
              onClick={() => alert('비밀번호 찾기 기능은 준비 중입니다.')}
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
