import { useState, useEffect } from "react";
import { Trophy, Medal, TrendingUp, MapPin, Bike, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Header } from "../components/layout/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface RankingPageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
}

interface RankingUser {
  rank: number;
  name: string;
  distance: number;
  rides: number;
  badge?: string;
  isCurrentUser?: boolean;
}

export function RankingPage({
  onClose,
  onLoginClick,
  onSignupClick,
  onStationFinderClick,
  onNoticeClick,
  onCommunityClick,
  onPurchaseClick,
  onFaqClick,
  onHomeClick,
  onProfileClick
}: RankingPageProps) {
  const [rankingType, setRankingType] = useState<"distance" | "rides">("distance");
  const [period, setPeriod] = useState<"전체" | "이번달" | "이번주">("전체");
  const [rankingData, setRankingData] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 랭킹 데이터 로드
  useEffect(() => {
    loadRanking();
  }, [rankingType, period]);

  const loadRanking = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/rankings?type=${rankingType}&period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setRankingData(data.data || []);
      }
    } catch (error) {
      console.error("Error loading ranking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentUser = rankingData.find(u => u.isCurrentUser);
  const topRankers = rankingData.filter(u => !u.isCurrentUser);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "?��";
    if (rank === 2) return "?��";
    if (rank === 3) return "?��";
    return rank;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onStationFinderClick={onStationFinderClick}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
        onProfileClick={onProfileClick}
        onRankingClick={onClose}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">??��</h1>
          <p className="text-gray-600">?�릉???�용?�들�??�께 경쟁?�보?�요!</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <Select
            value={rankingType}
            onValueChange={(value) => setRankingType(value as "distance" | "rides")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="??�� ?�?? />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">?�적 거리</SelectItem>
              <SelectItem value="rides">?�용 ?�수</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as "?�체" | "?�번?? | "?�번�?)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="기간" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="?�체">?�체 기간</SelectItem>
              <SelectItem value="?�번??>?�번 ??/SelectItem>
              <SelectItem value="?�번�?>?�번 �?/SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-8">
          <Card className="p-8 bg-gradient-to-br from-[#00A862]/10 to-white">
            <h2 className="mb-6 text-center">?�� TOP 3 ?��</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topRankers.slice(0, 3).map((user) => (
                <div
                  key={user.rank}
                  className={`flex flex-col items-center p-6 rounded-lg ${
                    user.rank === 1
                      ? "bg-yellow-100 border-2 border-yellow-400"
                      : user.rank === 2
                      ? "bg-gray-100 border-2 border-gray-400"
                      : "bg-orange-100 border-2 border-orange-400"
                  }`}
                >
                  <div className="text-5xl mb-3">{user.badge}</div>
                  <h3 className="mb-2">{user.name}</h3>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{user.distance}km</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Bike className="w-4 h-4" />
                      <span>{user.rides}??/span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Current User Rank */}
        {currentUser && (
          <div className="mb-6">
            <Card className="p-6 border-2 border-[#00A862] bg-[#00A862]/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-[#00A862]">
                    {currentUser.rank}??
                  </div>
                  <div>
                    <h3 className="mb-1">{currentUser.name} (??</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentUser.distance}km
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="w-4 h-4" />
                        {currentUser.rides}??
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-[#00A862]">
                  ?�위 5%
                </Badge>
              </div>
            </Card>
          </div>
        )}

        {/* Full Ranking List */}
        <Card className="p-6">
          <h2 className="mb-4">?�체 ??��</h2>
          <div className="space-y-2">
            {topRankers.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  user.rank <= 3
                    ? "bg-gray-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                    user.rank <= 3 
                      ? "bg-gradient-to-br from-[#00A862] to-[#008F54] text-white" 
                      : "bg-gray-100"
                  }`}>
                    {getRankDisplay(user.rank)}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1">{user.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {user.distance}km
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="w-3 h-3" />
                        {user.rides}??
                      </span>
                    </div>
                  </div>
                </div>
                {user.rank <= 10 && (
                  <TrendingUp className="w-5 h-5 text-[#00A862]" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
