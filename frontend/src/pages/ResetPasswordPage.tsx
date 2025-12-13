/**
 * src/pages/ResetPasswordPage.tsx
 * 비밀번호 재설정 페이지
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Lock, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { resetPassword } from "../api/authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // ForgotPasswordPage에서 전달받은 이메일이 있으면 자동 입력
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !code || !newPassword || !confirmPassword) {
        setError("모든 필드를 입력해주세요.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("새 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (newPassword.length < 6) {
        setError("비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }

      const result = await resetPassword(email, code, newPassword);

      if (result.success) {
        setSuccess(true);
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || "비밀번호 재설정에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("비밀번호 재설정 에러:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-8">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">비밀번호가 재설정되었습니다</h2>
          <p className="text-gray-600 mb-6">
            새로운 비밀번호로 로그인해주세요.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            자동으로 로그인 페이지로 이동합니다...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-8">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-[#00A862] hover:underline mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            로그인으로 돌아가기
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#00A862]">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">비밀번호 재설정</h2>
            <p className="text-gray-600 text-sm">
              이메일로 받은 인증 코드와 새 비밀번호를 입력하세요.
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
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="code">인증 코드</Label>
              <Input
                id="code"
                type="text"
                placeholder="이메일에서 받은 인증 코드 입력"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="새 비밀번호를 입력하세요"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10"
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
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00A862] hover:bg-[#008F54]"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : "비밀번호 재설정"}
            </Button>
          </form>

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
      </div>
    </div>
  );
}
