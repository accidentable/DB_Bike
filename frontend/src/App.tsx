import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Hero } from "./components/Hero";
import { StationMap } from "./components/StationMap";
import { HowToUse } from "./components/HowToUse";
import { Footer } from "./components/layout/Footer";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { CommunityPage } from "./pages/CommunityPage";
import { PurchasePage } from "./pages/PurchasePage";
import { FAQPage } from "./pages/FAQPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RankingPage } from "./pages/RankingPage";
import { ChatbotWidget } from "./components/common/ChatbotWidget";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StationFinderPage } from "./pages/StationFinderPage";
import { getCurrentUser } from "./api/client";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "login" | "signup" | "stationfinder" | "community" | "purchase" | "faq" | "profile" | "ranking" | "admin">("home");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 관리자 여부 확인
    const user = getCurrentUser();
    if (user && user.isAdmin) {
      setIsAdmin(true);
    }

    // 로그인 상태 변경 감지
    const handleLoginChange = () => {
      const user = getCurrentUser();
      setIsAdmin(user?.isAdmin || false);
    };

    window.addEventListener('loginStatusChanged', handleLoginChange);
    return () => window.removeEventListener('loginStatusChanged', handleLoginChange);
  }, []);

  if (currentPage === "login") {
    return (
      <LoginPage
        onClose={() => setCurrentPage("home")}
        onSwitchToSignup={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  if (currentPage === "signup") {
    return (
      <SignupPage
        onClose={() => setCurrentPage("home")}
        onSwitchToLogin={() => setCurrentPage("login")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  if (currentPage === "stationfinder") {
    return (
      <StationFinderPage
        onClose={() => setCurrentPage("stationfinder")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  if (currentPage === "community") {
    return (
      <CommunityPage
        onClose={() => setCurrentPage("community")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  if (currentPage === "purchase") {
    return (
      <PurchasePage
        onClose={() => setCurrentPage("purchase")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  if (currentPage === "faq") {
    return (
      <FAQPage
        onClose={() => setCurrentPage("faq")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  if (currentPage === "profile") {
    return (
      <ProfilePage
        onClose={() => setCurrentPage("profile")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  if (currentPage === "ranking") {
    return (
      <RankingPage
        onClose={() => setCurrentPage("ranking")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
      />
    );
  }

  if (currentPage === "admin" && isAdmin) {
    return (
      <AdminDashboard
        onClose={() => setCurrentPage("home")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("community")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
        onProfileClick={() => setCurrentPage("profile")}
        onRankingClick={() => setCurrentPage("ranking")}
        onAdminClick={() => setCurrentPage("admin")}
      />
      <Hero />
      <StationMap />
      <HowToUse />
      <Footer 
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
      <ChatbotWidget />
    </div>
  );
}
