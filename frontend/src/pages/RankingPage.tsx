import { useState } from "react";
import { Trophy, Medal, TrendingUp, MapPin, Bike, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Header } from "./Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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

const rankingData: RankingUser[] = [
  { rank: 1, name: "박라이더", distance: 1247.8, rides: 342, badge: "🥇" },
  { rank: 2, name: "이환경", distance: 1156.2, rides: 298, badge: "🥈" },
  { rank: 3, name: "최건강", distance: 1089.5, rides: 276, badge: "🥉" },
  { rank: 4, name: "정열정", distance: 987.3, rides: 251 },
  { rank: 5, name: "강에코", distance: 945.6, rides: 234 },
  { rank: 6, name: "윤자전거", distance: 892.4, rides: 219 },
  { rank: 7, name: "임페달", distance: 856.9, rides: 207 },
  { rank: 8, name: "한출퇴근", distance: 823.1, rides: 198 },
  { rank: 9, name: "송바람", distance: 791.5, rides: 186 },
  { rank: 10, name: "오달리기", distance: 765.8, rides: 174 },
  { rank: 142, name: "김따릉", distance: 287.5, rides: 67, isCurrentUser: true },
];

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

  const currentUser = rankingData.find(u => u.isCurrentUser);
  const topRankers = rankingData.filter(u => !u.isCurrentUser);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
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
          <h1 className="mb-2">랭킹</h1>
          <p className="text-gray-600">따릉이 이용자들과 함께 경쟁해보세요!</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <Select
            value={rankingType}
            onValueChange={(value) => setRankingType(value as "distance" | "rides")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="랭킹 타입" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">누적 거리</SelectItem>
              <SelectItem value="rides">이용 횟수</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as "전체" | "이번달" | "이번주")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="기간" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="전체">전체 기간</SelectItem>
              <SelectItem value="이번달">이번 달</SelectItem>
              <SelectItem value="이번주">이번 주</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-8">
          <Card className="p-8 bg-gradient-to-br from-[#00A862]/10 to-white">
            <h2 className="mb-6 text-center">🏆 TOP 3 🏆</h2>
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
                      <span>{user.rides}회</span>
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
                    {currentUser.rank}위
                  </div>
                  <div>
                    <h3 className="mb-1">{currentUser.name} (나)</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentUser.distance}km
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="w-4 h-4" />
                        {currentUser.rides}회
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-[#00A862]">
                  상위 5%
                </Badge>
              </div>
            </Card>
          </div>
        )}

        {/* Full Ranking List */}
        <Card className="p-6">
          <h2 className="mb-4">전체 랭킹</h2>
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
                        {user.rides}회
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
