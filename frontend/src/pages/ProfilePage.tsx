/**
 * src/pages/ProfilePage.tsx
 * 사용자 프로필 페이지
 * 
 * 사용된 API:
 * - authApi: getCurrentUser, isAuthenticated, updateProfile, changePassword, 
 *            sendPasswordChangeEmail, verifyEmail
 * - ticketApi: getMyActiveTickets
 * - rentalApi: getRentalHistory
 * - achievementApi: getMyAchievements, claimAchievementPoints
 * - rankingApi: getTotalDistanceRanking
 */

import { useState, useEffect } from "react";
import { User, Award, MapPin, Trophy, Star, Bike, Edit, Lock } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { getCurrentUser as getUser, isAuthenticated, updateProfile, changePassword, sendPasswordChangeEmail, verifyEmail } from "../api/authApi";
import { getMyActiveTickets } from "../api/ticketApi";
import { getRentalHistory } from "../api/rentalApi";
import { getMyAchievements, claimAchievementPoints } from "../api/achievementApi";
import { getTotalDistanceRanking } from "../api/rankingApi";
import { useNavigate } from "react-router-dom";


interface ProfilePageProps {
  onClose?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onStationFinderClick?: () => void;
  onNoticeClick?: () => void;
  onCommunityClick?: () => void;
  onPurchaseClick?: () => void;
  onFaqClick?: () => void;
  onHomeClick?: () => void;
  onRankingClick?: () => void;
}

// Achievement interface
interface Achievement {
  achievement_id: number;
  name: string;
  description: string;
  icon: string;
  condition_type: string;
  condition_value: number;
  earned: boolean;
  earned_at?: string | null;
  points_awarded: boolean;
  progress?: number | null;
  total?: number | null;
}


export default function ProfilePage(_props: ProfilePageProps = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "achievements">("info");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [statsData, setStatsData] = useState({
    carbonReduction: 0,
    avgRentalTime: 0,
    topPercentText: "랭킹 없음",
    achievementRate: 0
  });

  // 사용자 데이터 상태
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    memberSince: "",
    totalDistance: 0,
    totalRides: 0,
    rank: 0,
    currentTicket: "",
    ticketExpiry: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    verificationCode: "",
  });
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // 사용자 정보 및 이용권 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated()) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      try {
        const user = getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const ticketsResponse = await getMyActiveTickets();
        let ticketInfo = { name: "이용권 없음", expiry: "" };
        
        if (ticketsResponse.success && ticketsResponse.data && ticketsResponse.data.length > 0) {
          const activeTicket = ticketsResponse.data[0];
          ticketInfo = {
            name: activeTicket.ticket_name,
            expiry: new Date(activeTicket.expiry_time).toLocaleDateString()
          };
        }

        const historyResponse = await getRentalHistory();
        let totalRides = 0;
        let totalDistance = 0;
        let totalRentalTime = 0;

        if (historyResponse.success && historyResponse.data) {
          totalRides = historyResponse.data.length;
          historyResponse.data.forEach((rental) => {
            totalDistance += rental.distance_km || 0;
            if (rental.start_time && rental.end_time) {
              const startTime = new Date(rental.start_time).getTime();
              const endTime = new Date(rental.end_time).getTime();
              totalRentalTime += (endTime - startTime);
            }
          });
        }

        let userRank = 0;
        let totalUsersCount = 0;
        try {
          const rankingResponse = await getTotalDistanceRanking();
          if (rankingResponse.success && rankingResponse.data) {
            totalUsersCount = rankingResponse.data.ranking?.length || 0;
            if (rankingResponse.data.currentUser) {
              userRank = rankingResponse.data.currentUser.rank_position || 0;
            }
          }
        } catch (rankError) {
          console.error("랭킹 조회 실패:", rankError);
        }

        const avgRentalTime = totalRides > 0 && totalRentalTime > 0 
          ? Math.round(totalRentalTime / totalRides / 1000 / 60)
          : 0;

        const carbonReduction = Math.round(totalDistance * 0.234 * 10) / 10;

        const topPercent = totalUsersCount > 0 && userRank > 0
          ? Math.round((userRank / totalUsersCount) * 100 * 10) / 10
          : 0;
        const topPercentText = topPercent > 0 ? `상위 ${topPercent}%` : "랭킹 없음";

        const achievementsResponse = await getMyAchievements();
        let achievementRate = 0;
        if (achievementsResponse.success && achievementsResponse.data) {
          setAchievements(achievementsResponse.data);
          const earnedCount = achievementsResponse.data.filter(a => a.earned).length;
          const totalCount = achievementsResponse.data.length;
          achievementRate = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
}

        setUserData({
          name: user.username || "",
          email: user.email || "",
          phone: "",
          memberSince: new Date().toLocaleDateString(),
          totalDistance: totalDistance,
          totalRides: totalRides,
          rank: userRank,
          currentTicket: ticketInfo.name,
          ticketExpiry: ticketInfo.expiry,
        });

        setEditForm({
          name: user.username || "",
        });

        // 통계 데이터를 상태로 저장
        setStatsData({
          carbonReduction,
          avgRentalTime,
          topPercentText,
          achievementRate
        });
      } catch (err) {
        console.error("사용자 데이터 로드 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleEditProfile = async () => {
    if (!editForm.name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await updateProfile(editForm.name);
      
      if (response.success && response.data) {
        // 로컬 스토리지 업데이트
        const currentUser = getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            username: response.data.username,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // 로그인 상태 변경 이벤트 발생
          window.dispatchEvent(new CustomEvent('loginStatusChanged', {
            detail: { user: updatedUser }
          }));
        }

        // 사용자 데이터 업데이트
        setUserData({
          ...userData,
          name: response.data.username,
        });

        alert("프로필이 수정되었습니다.");
    setIsEditDialogOpen(false);
        setEditForm({ name: response.data.username });
      } else {
        setError(response.message || "프로필 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("프로필 수정 중 오류:", err);
      setError("프로필 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 인증 코드 발송 핸들러
  const handleSendVerificationEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await sendPasswordChangeEmail();
      if (response.success) {
        setEmailVerificationSent(true);
        alert("인증 코드가 이메일로 발송되었습니다.");
      } else {
        setError(response.message || "이메일 발송에 실패했습니다.");
      }
    } catch (err) {
      console.error("이메일 발송 중 오류:", err);
      setError("이메일 발송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 인증 코드 검증 핸들러
  const handleVerifyEmailCode = async () => {
    if (!passwordForm.verificationCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    if (passwordForm.verificationCode.length !== 6) {
      setError("인증 코드는 6자리입니다.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = getUser();
      if (!user || !user.email) {
        setError("사용자 정보를 찾을 수 없습니다.");
        setIsLoading(false);
        return;
      }

      console.log("인증 코드 검증 시도:", {
        email: user.email,
        code: passwordForm.verificationCode,
        purpose: 'password-change'
      });

      const response = await verifyEmail(user.email, passwordForm.verificationCode, 'password-change');
      console.log("인증 코드 검증 응답:", response);
      
      if (response.success) {
        setEmailVerified(true);
        setError("");
      } else {
        setError(response.message || "인증 코드가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error("이메일 인증 중 오류:", err);
      setError("이메일 인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = async () => {
    if (!emailVerified) {
      setError("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setError("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (!passwordForm.verificationCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.verificationCode
      );

      if (response.success) {
        alert("비밀번호가 변경되었습니다.");
    setIsPasswordDialogOpen(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          verificationCode: "",
        });
        setEmailVerificationSent(false);
        setEmailVerified(false);
      } else {
        setError(response.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err) {
      console.error("비밀번호 변경 중 오류:", err);
      setError("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { 
      label: "누적 거리", 
      value: `${Math.round(userData.totalDistance * 10) / 10}km`, 
      icon: <MapPin className="w-5 h-5 text-[#00A862]" />, 
      description: statsData.carbonReduction > 0 ? `탄소 배출 절감 약 ${statsData.carbonReduction}kg` : "이용 기록 없음"
    },
    { 
      label: "이용 횟수", 
      value: `${userData.totalRides}회`, 
      icon: <Bike className="w-5 h-5 text-[#00A862]" />, 
      description: statsData.avgRentalTime > 0 ? `평균 이용 시간 ${statsData.avgRentalTime}분` : "이용 기록 없음"
    },
    { 
      label: "전체 랭킹", 
      value: userData.rank > 0 ? `${userData.rank}위` : "랭킹 없음", 
      icon: <Trophy className="w-5 h-5 text-[#00A862]" />, 
      description: statsData.topPercentText
    },
    { 
      label: "획득 업적", 
      value: `${achievements.filter(a => a.earned).length}/${achievements.length}`, 
      icon: <Award className="w-5 h-5 text-[#00A862]" />, 
      description: achievements.length > 0 ? `달성률 ${statsData.achievementRate}%` : "업적 없음"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header는 App.tsx에서 렌더링되므로 제거 */}

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-[#00A862] rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="mb-2">{userData.name}</h1>
                <p className="text-gray-600 mb-1">{userData.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-[#00A862]">
                    {userData.currentTicket}
                  </Badge>
                  <Badge variant="outline">
                    가입일: {userData.memberSince}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-[#00A862] text-[#00A862] hover:bg-[#00A862] hover:text-white"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  정보 수정
                </Button>
                <Button
                  variant="outline"
                  className="border-[#00A862] text-[#00A862] hover:bg-[#00A862] hover:text-white"
                  onClick={() => navigate('/ranking')}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  랭킹 보기
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {stat.icon}
                <span className="text-sm text-gray-600">{stat.label}</span>
              </div>
              <div className="mb-1">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 transition-colors ${
              activeTab === "info"
                ? "border-b-2 border-[#00A862] text-[#00A862]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            기본 정보
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-6 py-3 transition-colors ${
              activeTab === "achievements"
                ? "border-b-2 border-[#00A862] text-[#00A862]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            업적
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" ? (
          <div className="max-w-2xl">
            <Card className="p-6">
              <h2 className="mb-6">기본 정보</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">이름</span>
                  <span className="col-span-2">{userData.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">이메일</span>
                  <span className="col-span-2">{userData.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">가입일</span>
                  <span className="col-span-2">{userData.memberSince}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b">
                  <span className="text-gray-600">현재 이용권</span>
                  <span className="col-span-2">{userData.currentTicket}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3">
                  <span className="text-gray-600">이용권 만료일</span>
                  <span className="col-span-2">{userData.ticketExpiry}</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <Button 
                  className="bg-[#00A862] hover:bg-[#008F54] mr-3"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  정보 수정
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  비밀번호 변경
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="mb-2">업적 ({achievements.filter(a => a.earned).length}/{achievements.length})</h2>
              <p className="text-gray-600">따릉이를 이용하며 다양한 업적을 달성해보세요!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements
                .sort((a, b) => {
                  const typeOrder = ['FIRST_RIDE', 'TOTAL_RIDES', 'CONSECUTIVE_DAYS', 'TOTAL_DISTANCE', 'TOTAL_STATIONS'];
                  const aTypeIndex = typeOrder.indexOf(a.condition_type);
                  const bTypeIndex = typeOrder.indexOf(b.condition_type);
                  if (aTypeIndex !== bTypeIndex) {
                    return aTypeIndex - bTypeIndex;
                  }
                  return a.condition_value - b.condition_value;
                })
                .map((achievement) => (
                <Card 
                  key={achievement.achievement_id} 
                  className={`p-6 ${achievement.earned ? 'bg-gradient-to-br from-[#00A862]/10 to-white' : 'opacity-75'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {achievement.earned && !achievement.points_awarded ? (
                        <Button
                          size="sm"
                          className="bg-[#00A862] hover:bg-[#008F54] text-white"
                          onClick={async () => {
                            try {
                              const response = await claimAchievementPoints(achievement.achievement_id);
                              if (response.success) {
                                alert('500포인트가 지급되었습니다!');
                                const achievementsResponse = await getMyAchievements();
                                if (achievementsResponse.success && achievementsResponse.data) {
                                  setAchievements(achievementsResponse.data);
                                }
                              } else {
                                alert(response.message || '포인트 수령에 실패했습니다.');
                              }
                            } catch (error) {
                              console.error('포인트 수령 중 오류:', error);
                              alert('포인트 수령 중 오류가 발생했습니다.');
                            }
                          }}
                        >
                          +500p
                        </Button>
                      ) : achievement.earned && achievement.points_awarded ? (
                        <Badge className="bg-[#00A862]">
                          <Star className="w-3 h-3 mr-1" />
                          달성 완료
                        </Badge>
                      ) : achievement.progress !== null && achievement.progress !== undefined && achievement.total ? (
                        <div>
                          <div className="flex items-center justify-between mb-1 text-sm text-gray-600">
                            <span>{achievement.progress} / {achievement.total}</span>
                            <span>{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.total) * 100} 
                            className="h-2"
                          />
                        </div>
                      ) : (
                        <Badge variant="outline">
                          잠김
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 정보 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 정보 수정</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEditProfile}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                disabled={isLoading}
              >
                {isLoading ? "저장 중..." : "저장"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
        setIsPasswordDialogOpen(open);
        if (!open) {
          // 다이얼로그 닫을 때 상태 초기화
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            verificationCode: "",
          });
          setEmailVerificationSent(false);
          setEmailVerified(false);
          setError("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {/* 이메일 인증 단계 */}
            {!emailVerified && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="mb-3">
                  <Label className="text-sm font-medium text-blue-900">이메일 인증</Label>
                  <p className="text-xs text-blue-700 mt-1">
                    비밀번호 변경을 위해 이메일 인증이 필요합니다.
                  </p>
                </div>
                {!emailVerificationSent ? (
                  <Button
                    onClick={handleSendVerificationEmail}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? "발송 중..." : "인증 코드 발송"}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="verification-code">인증 코드</Label>
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="6자리 인증 코드 입력"
                        value={passwordForm.verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
                          setPasswordForm({ ...passwordForm, verificationCode: value });
                        }}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        이메일로 발송된 6자리 인증 코드를 입력하세요.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleVerifyEmailCode}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-black"
                        disabled={isLoading || !passwordForm.verificationCode || passwordForm.verificationCode.length !== 6}
                      >
                        {isLoading ? "인증 중..." : "인증 확인"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSendVerificationEmail}
                        disabled={isLoading}
                      >
                        재발송
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 이메일 인증 완료 후 비밀번호 변경 폼 */}
            {emailVerified && (
              <>
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ 이메일 인증이 완료되었습니다.
                </div>
            <div>
              <Label htmlFor="current-password">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-password">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
                  <p className="text-xs text-gray-500 mt-1">
                    최소 6자 이상 입력해주세요.
                  </p>
            </div>
            <div>
              <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
              </>
            )}

            <div className="flex gap-2">
              {emailVerified && (
              <Button
                onClick={handleChangePassword}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                disabled={isLoading}
              >
                {isLoading ? "변경 중..." : "변경"}
              </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={isLoading}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}