import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { login } from "../api/authApi";

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

  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    // 소셜 로그인 기능은 아직 구현되지 않았습니다.
    alert(`${provider} 로그인은 현재 준비 중입니다.`);
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
            <Button variant="outline" className="w-full" type="button" onClick={() => handleSocialLogin('naver')}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#03C75A"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              네이버로 로그인
            </Button>
            <Button variant="outline" className="w-full" type="button" onClick={() => handleSocialLogin('kakao')}>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#FEE500"
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
                />
                <path
                  fill="#000000"
                  d="M12 4c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z"
                />
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

      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">소셜 로그인 설정 안내</p>
            <p className="text-xs text-amber-800">
              네이버/카카오 로그인을 사용하려면 Supabase 대시보드에서 OAuth 설정이 필요합니다.
              <br />
              설정 방법: <a href="https://supabase.com/docs/guides/auth/social-login" target="_blank" rel="noopener noreferrer" className="underline">Supabase Social Login 문서</a>를 참고하세요.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
