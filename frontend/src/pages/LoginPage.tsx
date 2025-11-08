import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Header } from "../components/layout/Header";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { login } from "../api/client";

interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onRankingClick: () => void;
}

export function LoginPage({ onClose, onSwitchToSignup, onStationFinderClick, onNoticeClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick, onProfileClick, onRankingClick }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // 로그???�태 변�??�벤??발생
        window.dispatchEvent(new Event('loginStatusChanged'));
        alert(`?�영?�니?? ${result.user?.name}??`);
        onClose(); // 로그???�공 ???�으�??�동
      }
    } catch (err: any) {
      setError(err.message || "로그?�에 ?�패?�습?�다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'kakao' | 'naver') => {
    setError("");
    try {
      await socialLogin(provider);
      // OAuth ?�로?��? ?�작?�면 리다?�렉?�됨
    } catch (err: any) {
      setError(err.message || `${provider} 로그?�에 ?�패?�습?�다.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onClose}
        onSignupClick={onSwitchToSignup}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onRankingClick={onRankingClick}
      />
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-md">

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#00A862]">
              <span className="text-4xl">?��</span>
            </div>
            <h2 className="mb-2">로그??/h2>
            <p className="text-gray-600 text-sm">
              광운?�릉???�비?��? ?�용?�려�?로그?�하?�요
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
              <Label htmlFor="email">?�메??/Label>
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
              <Label htmlFor="password">비�?번호</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="비�?번호�??�력?�세??
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
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
                  로그???�태 ?��?
                </Label>
              </div>
              <a href="#" className="text-sm text-[#00A862] hover:underline">
                비�?번호 찾기
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#00A862] hover:bg-[#008F54]"
              disabled={isLoading}
            >
              {isLoading ? "로그??�?.." : "로그??}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">?�는</span>
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
                ?�이버로 로그??
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
                카카?�로 로그??
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">계정???�으?��??? </span>
            <button
              onClick={onSwitchToSignup}
              className="text-[#00A862] hover:underline"
            >
              ?�원가??
            </button>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          로그?�하?�면 ?�릉?�의{" "}
          <a href="#" className="underline">
            ?�용?��?
          </a>
          �?" "}
          <a href="#" className="underline">
            개인?�보처리방침
          </a>
          ???�의?�는 것으�?간주?�니??
        </p>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">소셜 로그인 안내</p>
              <p className="text-xs text-amber-800">
                네이버, 카카오 로그인 기능은 현재 개발 중입니다.
                <br />
                이메일 로그인을 이용해주세요.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
