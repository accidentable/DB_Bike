import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { StationMap } from "./components/StationMap";
import { HowToUse } from "./components/HowToUse";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { StationFinderPage } from "./components/StationFinderPage";
import { NoticePage } from "./components/NoticePage";
import { CommunityPage } from "./components/CommunityPage";
import { PurchasePage } from "./components/PurchasePage";
import { FAQPage } from "./components/FAQPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "login" | "signup" | "stationfinder" | "notice" | "community" | "purchase" | "faq">("home");

  if (currentPage === "login") {
    return (
      <LoginPage
        onClose={() => setCurrentPage("home")}
        onSwitchToSignup={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("notice")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "signup") {
    return (
      <SignupPage
        onClose={() => setCurrentPage("home")}
        onSwitchToLogin={() => setCurrentPage("login")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("notice")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "stationfinder") {
    return (
      <StationFinderPage
        onClose={() => setCurrentPage("home")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onNoticeClick={() => setCurrentPage("notice")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "notice") {
    return (
      <NoticePage
        onClose={() => setCurrentPage("home")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "community") {
    return (
      <CommunityPage
        onClose={() => setCurrentPage("home")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("notice")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "purchase") {
    return (
      <PurchasePage
        onClose={() => setCurrentPage("home")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("notice")}
        onCommunityClick={() => setCurrentPage("community")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
    );
  }

  if (currentPage === "faq") {
    return (
      <FAQPage
        onClose={() => setCurrentPage("home")}
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("notice")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onHomeClick={() => setCurrentPage("home")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setCurrentPage("login")}
        onSignupClick={() => setCurrentPage("signup")}
        onStationFinderClick={() => setCurrentPage("stationfinder")}
        onNoticeClick={() => setCurrentPage("notice")}
        onCommunityClick={() => setCurrentPage("community")}
        onPurchaseClick={() => setCurrentPage("purchase")}
        onFaqClick={() => setCurrentPage("faq")}
        onHomeClick={() => setCurrentPage("home")}
      />
      <Hero />
      <StationMap />
      <HowToUse />
      <Footer />
    </div>
  );
}
