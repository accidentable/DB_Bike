// src/App.tsx
// (경로 수정 및 default import 수정 완료)

import { Routes, Route } from 'react-router-dom';

// (수정) './components/layout/Header' (O)
import Header from './components/layout/Header'; 
// (수정) './pages/HomePage' (O)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import PurchasePage from './pages/PurchasePage';
import FAQPage from './pages/FAQPage';
import RankingPage from './pages/RankingPage';
import ContactPage from './pages/ContactPage'; // 문의 페이지 import
import KakaoCallbackPage from './pages/KakaoCallbackPage'; // 카카오 콜백 페이지 import
// ... (다른 페이지들도 import)

import AdminRoute from './AdminRoute';
import AdminDashboard from './pages/AdminDashboardpage';

function App() {
  return (
    <>
      <Header /> {/* Header가 로그인/로그아웃 상태를 알 수 있음 */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/kakao-callback" element={<KakaoCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/purchase" element={<PurchasePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/contact" element={<ContactPage />} /> {/* 문의 페이지 라우트 추가 */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;