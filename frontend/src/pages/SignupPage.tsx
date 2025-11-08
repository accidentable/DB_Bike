// src/pages/SignupPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/authApi'; // 3번에서 만든 API 함수

// (사용자님의 파일 구조에 있던 UI 컴포넌트 import)
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';

export default function SignupPage() {
  // 1. 폼(Form) 상태 관리
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate(); // 페이지 이동 훅

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 2. 백엔드로 보낼 데이터 객체
    const userData = {
      username,
      email,
      password,
      phone,
      studentId,
    };

    try {
      // 3. API 호출
      const response = await signup(userData);

      if (response.success) {
        // 4. (성공) 로그인 페이지로 이동
        // (선택) 회원가입 성공 메시지를 login 페이지로 전달할 수 있음
        navigate('/login', { state: { message: '회원가입 성공! 로그인해주세요.' } });
      } else {
        setError(response.message || '회원가입 실패');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">회원가입</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 폼 필드들 */}
            <div className="space-y-2">
              <Label htmlFor="username">사용자명</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">학번</Label>
              <Input id="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <Button type="submit" className="w-full bg-[#00A862] hover:bg-[#007F4E]">
              가입하기
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          {/* <Link to="/login">이미 계정이 있으신가요?</Link> */}
        </CardFooter>
      </Card>
    </div>
  );
}