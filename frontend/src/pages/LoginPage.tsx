// src/pages/LoginPage.tsx
// (모든 import 경로 수정 완료)

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// (수정) ../contexts/ (O)
import { useAuth } from '../contexts/AuthContext';
// (수정) ../api/ (O)
import { login } from '../api/authApi';

// (수정) ../components/ui/ (O)
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';

// (수정) export default function
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await login(email, password);

      if (response.success) {
        auth.login(response.data.token, response.data.user);
        navigate('/'); // 홈으로 이동
      } else {
        setError(response.message || '로그인 실패');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full bg-[#00A862] hover:bg-[#007F4E]">
              로그인
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm gap-2">
          <Link to="/signup" className="text-[#00A862] hover:underline">회원가입</Link>
          |
          <Link to="/find-password" className="text-gray-600 hover:underline">비밀번호 찾기</Link>
        </CardFooter>
      </Card>
    </div>
  );
}