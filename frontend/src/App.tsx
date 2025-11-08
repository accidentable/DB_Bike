// src/App.tsx
// (경로 수정 및 default import 수정 완료)

import { Routes, Route } from 'react-router-dom';

// (수정) './components/layout/Header' (O)
import Header from './components/layout/Header'; 
// (수정) './pages/HomePage' (O)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
// ... (다른 페이지들도 import)

function App() {
  return (
    <>
      <Header /> {/* Header가 로그인/로그아웃 상태를 알 수 있음 */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* ... (CommunityPage, ProfilePage 등 라우트 추가) ... */}
        </Routes>
      </main>
    </>
  );
}

export default App;