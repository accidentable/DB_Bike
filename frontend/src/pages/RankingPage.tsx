/**
 * src/pages/RankingPage.tsx
 * 랭킹 페이지
 * 
 * 사용된 API:
 * - rankingApi: getTotalDistanceRanking, getTotalRideRanking
 */

import { useState, useEffect } from "react";
import { TrendingUp, MapPin, Bike, Clock } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getTotalDistanceRanking, getTotalRideRanking } from "../api/rankingApi";

interface RankingPageProps {
  onClose?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onStationFinderClick?: () => void;
  onNoticeClick?: () => void;
  onCommunityClick?: () => void;
  onPurchaseClick?: () => void;
  onFaqClick?: () => void;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
}

interface RankingUser {
  rank: number;
  name: string;
  distance: number;
  rides: number;
  badge?: string;
  isCurrentUser?: boolean;
  member_id?: number;  // 추가: 고유 키를 위해
}

// 다음 금요일 1시까지의 남은 시간 계산
const getNextFriday1AM = (): Date => {
  const now = new Date();
  const nextFriday = new Date(now);
  const currentDay = now.getDay();
  let daysUntilFriday = 5 - currentDay;
  
  // 오늘이 금요일이고 1시 이전이면 오늘, 그렇지 않으면 다음 금요일
  if (currentDay === 5 && now.getHours() < 1) {
    daysUntilFriday = 0;
  } else if (daysUntilFriday <= 0) {
    daysUntilFriday += 7; // 다음 주 금요일
  }
  
  nextFriday.setDate(now.getDate() + daysUntilFriday);
  nextFriday.setHours(1, 0, 0, 0); // 금요일 1시
  
  return nextFriday;
};

// 남은 시간 포맷팅
const formatTimeRemaining = (targetDate: Date): { days: number; hours: string; minutes: string; seconds: string } => {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: "00", minutes: "00", seconds: "00" };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    days,
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
};

export default function RankingPage(_props: RankingPageProps = {}) {
  const [rankingType, setRankingType] = useState<"distance" | "rides">("distance");
  const [period, setPeriod] = useState<"전체" | "이번달" | "이번주">("전체");
  const [rankingData, setRankingData] = useState<RankingUser[]>([]);
  const [currentUser, setCurrentUser] = useState<RankingUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(getNextFriday1AM()));

  useEffect(() => {
    const loadRanking = async () => {
      setIsLoading(true);
      try {
        const response = rankingType === 'distance' 
          ? await getTotalDistanceRanking()
          : await getTotalRideRanking();
          
        if (response.success && response.data) {
          // 데이터 변환
          const transformed: RankingUser[] = response.data.ranking.map((user, index) => ({
            rank: user.rank_position,
            name: user.username,
            distance: Math.round((user.total_distance_km || 0) * 10) / 10,
            rides: user.total_rides || 0,
            badge: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : undefined,
            isCurrentUser: false,
            member_id: user.member_id
          }));
          
          setRankingData(transformed);
          
          // 현재 사용자 정보
          if (response.data.currentUser) {
            const user = response.data.currentUser;
            setCurrentUser({
              rank: user.rank_position,
              name: user.username,
              distance: Math.round((user.total_distance_km || 0) * 10) / 10,
              rides: user.total_rides || 0,
              isCurrentUser: true,
              member_id: user.member_id
            });
          } else {
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error("랭킹 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRanking();
  }, [rankingType]);

  // 카운트다운 타이머
  useEffect(() => {
    const updateTimer = () => {
      const nextFriday = getNextFriday1AM();
      setTimeRemaining(formatTimeRemaining(nextFriday));
    };

    // 즉시 업데이트
    updateTimer();

    // 1초마다 업데이트
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentUserDisplay = currentUser;
  const topRankers = rankingData.filter(u => !u.isCurrentUser);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">랭킹을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* 보상까지 남은 시간 */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-[#00A862]/10 to-[#008F54]/10 border-[#00A862]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#00A862]" />
              <div>
                <div className="text-sm text-gray-600 mb-1">보상까지 남은 시간</div>
                <div className="text-lg font-bold text-[#00A862]">
                  D-{timeRemaining.days} / {timeRemaining.hours}:{timeRemaining.minutes}:{timeRemaining.seconds}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-[#00A862] text-[#00A862]">
              매주 금요일 01:00 초기화
            </Badge>
          </div>
        </Card>

        {/* Top 3 Podium */}
        {topRankers.length >= 3 && (  // 최소 3명이 있을 때만 표시
          <div className="mb-8">
            <Card className="p-8 bg-gradient-to-br from-[#00A862]/10 to-white">
              <h2 className="mb-6 text-center">🏆 TOP 3 🏆</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topRankers.slice(0, 3).map((user) => (
                  <div
                    key={user.member_id || user.rank}  // 고유 키 사용
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
                      {rankingType === 'distance' ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{user.distance}km</span>
                      </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <Bike className="w-4 h-4" />
                          <span>{user.rides}회</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        {rankingType === 'distance' ? (
                          <>
                        <Bike className="w-4 h-4" />
                        <span>{user.rides}회</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            <span>{user.distance}km</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Current User Rank */}
        {currentUserDisplay && (
          <div className="mb-6">
            <Card className="p-6 border-2 border-[#00A862] bg-[#00A862]/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-[#00A862]">
                    {currentUserDisplay.rank}위
                  </div>
                  <div>
                    <h3 className="mb-1">{currentUserDisplay.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {rankingType === 'distance' ? (
                        <>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentUserDisplay.distance}km
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="w-4 h-4" />
                        {currentUserDisplay.rides}회
                      </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <Bike className="w-4 h-4" />
                            {currentUserDisplay.rides}회
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {currentUserDisplay.distance}km
                          </span>
                        </>
                      )}
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
            {topRankers.length > 0 ? (
              topRankers.map((user) => (
                <div
                  key={user.member_id || user.rank}  // 고유 키 사용
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
                        {rankingType === 'distance' ? (
                          <>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.distance}km
                        </span>
                        <span className="flex items-center gap-1">
                          <Bike className="w-3 h-3" />
                          {user.rides}회
                        </span>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center gap-1">
                              <Bike className="w-3 h-3" />
                              {user.rides}회
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.distance}km
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {user.rank <= 10 && (
                    <TrendingUp className="w-5 h-5 text-[#00A862]" />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                랭킹 데이터가 없습니다.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}