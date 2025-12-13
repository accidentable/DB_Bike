/**
 * src/pages/KakaoCallbackPage.tsx
 * 카카오 로그인 콜백 페이지
 * 
 * 사용된 API:
 * - authApi: kakaoLogin
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { kakaoLogin } from '../api/authApi';

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        // URL에서 인증 코드 추출
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('카카오 로그인이 취소되었습니다.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        if (!code) {
          setError('인증 코드를 받지 못했습니다.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        // 인증 코드로 액세스 토큰 발급
        const appKey = import.meta.env.VITE_KAKAO_APP_KEY || '0ddb80336b17ea45f9f7c27852fbea10';
        const redirectUri = `${window.location.origin}/kakao-callback`;

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

        // 회원가입 모드인지 확인
        const isSignup = sessionStorage.getItem('kakao_signup_mode') === 'true';
        sessionStorage.removeItem('kakao_signup_mode');

        // 백엔드에 액세스 토큰 전송
        const result = await kakaoLogin(accessToken, isSignup);

        if (result.success && result.data) {
          if (isSignup) {
            alert(`환영합니다, ${result.data.user.username}님!`);
          } else {
            alert(`환영합니다, ${result.data.user.username}님!`);
          }
          navigate('/');
        } else {
          // 이미 가입된 사용자인 경우 로그인 페이지로 안내
          if (result.message?.includes('이미 가입된')) {
            const goToLogin = window.confirm(
              `${result.message}\n로그인 페이지로 이동하시겠습니까?`
            );
            if (goToLogin) {
              navigate('/login');
            } else {
              navigate('/signup');
            }
          } else {
            setError(result.message || '카카오 로그인에 실패했습니다.');
            setTimeout(() => {
              navigate(isSignup ? '/signup' : '/login');
            }, 2000);
          }
        }
      } catch (err: any) {
        console.error('카카오 콜백 처리 에러:', err);
        setError(err.message || '카카오 로그인 중 오류가 발생했습니다.');
        setTimeout(() => {
          const isSignup = sessionStorage.getItem('kakao_signup_mode') === 'true';
          sessionStorage.removeItem('kakao_signup_mode');
          navigate(isSignup ? '/signup' : '/login');
        }, 2000);
      }
    };

    handleKakaoCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-500">잠시 후 이동합니다...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A862] mx-auto mb-4"></div>
            <p className="text-gray-600">카카오 로그인 처리 중...</p>
          </>
        )}
      </div>
    </div>
  );
}

