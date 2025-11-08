import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { StationMap } from "../components/StationMap";

interface StationFinderPageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onRankingClick: () => void;
}

export function StationFinderPage(props: StationFinderPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onLoginClick={props.onLoginClick}
        onSignupClick={props.onSignupClick}
        onStationFinderClick={props.onClose}
        onNoticeClick={props.onNoticeClick}
        onCommunityClick={props.onCommunityClick}
        onPurchaseClick={props.onPurchaseClick}
        onFaqClick={props.onFaqClick}
        onHomeClick={props.onHomeClick}
        onProfileClick={props.onProfileClick}
        onRankingClick={props.onRankingClick}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">?€?¬ì†Œ ì°¾ê¸°</h1>
        <StationMap />
      </main>
      <Footer
        onHomeClick={props.onHomeClick}
        onStationFinderClick={props.onClose}
        onNoticeClick={props.onNoticeClick}
        onCommunityClick={props.onCommunityClick}
        onPurchaseClick={props.onPurchaseClick}
        onFaqClick={props.onFaqClick}
      />
    </div>
  );
}

