/**
 * src/pages/ForgotPasswordPage.tsx
 * 비밀번호 찾기 페이지
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../api/authApi";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email) {
        setError("이메일을 입력해주세요.");
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("올바른 이메일 형식을 입력해주세요.");
        return;
      }

      const result = await forgotPassword(email);

      if (result.success) {
        setSuccess(true);
        // 3초 후 비밀번호 재설정 페이지로 이동
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      } else {
        setError(result.message || "비밀번호 찾기 요청에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("비밀번호 찾기 에러:", err);
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
          <h2 className="text-2xl font-bold mb-4">이메일이 발송되었습니다</h2>
          <p className="text-gray-600 mb-6">
            입력하신 이메일 주소로 비밀번호 재설정 링크를 발송했습니다.
            <br />
            이메일을 확인하고 비밀번호를 재설정해주세요.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            자동으로 이동합니다...
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
              <span className="text-4xl">🚲</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">비밀번호 찾기</h2>
            <p className="text-gray-600 text-sm">
              가입 시 사용한 이메일을 입력하면
              <br />
              비밀번호 재설정 링크를 보내드립니다.
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

            <Button
              type="submit"
              className="w-full bg-[#00A862] hover:bg-[#008F54]"
              disabled={isLoading}
            >
              {isLoading ? "요청 중..." : "비밀번호 재설정 링크 발송"}
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

        <p className="text-center text-xs text-gray-500 mt-6">
          보안상의 이유로 등록되지 않은 이메일도 발송되었다고 표시됩니다.
        </p>
      </div>
    </div>
  );
}
