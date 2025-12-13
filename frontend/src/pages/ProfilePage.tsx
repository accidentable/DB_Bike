/**
 * src/pages/ProfilePage.tsx
 * 사용자 프로필 페이지 - 개선 버전
 * 
 * 사용된 API:
 * - authApi: getCurrentUser, isAuthenticated, updateProfile, changePassword, 
 *            sendPasswordChangeEmail, verifyEmail, deleteAccount
 * - ticketApi: getMyActiveTickets
 * - rentalApi: getRentalHistory
 * - achievementApi: getMyAchievements, claimAchievementPoints
 * - rankingApi: getTotalDistanceRanking
 */

import { useState, useEffect } from "react";
import { User, Award, MapPin, Trophy, Star, Bike, Edit, Lock, AlertCircle, Eye, EyeOff, Check, X, Trash2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { getCurrentUser as getUser, isAuthenticated, updateProfile, changePassword, sendPasswordChangeEmail, verifyEmail, deleteAccount, logout } from "../api/authApi";
import { getMyActiveTickets } from "../api/ticketApi";
import { getRentalHistory } from "../api/rentalApi";
import { getMyAchievements, claimAchievementPoints } from "../api/achievementApi";
import { getTotalDistanceRanking } from "../api/rankingApi";
import { getPointHistory } from "../api/pointApi";
import type { PointTransaction } from "../api/pointApi";
import { useNavigate } from "react-router-dom";


interface ProfilePageProps {
  onClose?: () => void;
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
  const [activeTab, setActiveTab] = useState<"info" | "achievements" | "points">("info");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [isLoadingPointHistory, setIsLoadingPointHistory] = useState(false);
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
    memberSince: "",
    totalDistance: 0,
    totalRides: 0,
    rank: 0,
    currentTicket: "",
    ticketExpiry: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  // 비밀번호 변경 폼 상태
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    verificationCode: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  const [passwordStep, setPasswordStep] = useState<"password" | "verification" | "complete">("password");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

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
          phone: "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false,
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

  // 포인트 내역 로드
  useEffect(() => {
    if (activeTab === "points" && isAuthenticated()) {
      const loadPointHistory = async () => {
        setIsLoadingPointHistory(true);
        try {
          const response = await getPointHistory();
          if (response.success && response.data) {
            setPointHistory(response.data);
          }
        } catch (err) {
          console.error("포인트 내역 로드 실패:", err);
        } finally {
          setIsLoadingPointHistory(false);
        }
      };
      loadPointHistory();
    }
  }, [activeTab]);

  const handleEditProfile = async () => {
    setError("");
    setSuccess("");

    // 최소 하나의 필드는 입력되어야 함
    if (!editForm.name.trim() && !editForm.phone && !editForm.currentPassword) {
      setError("수정할 정보를 입력해주세요.");
      return;
    }

    // 사용자명 검증
    if (editForm.name && !editForm.name.trim()) {
      setError("사용자명을 입력해주세요.");
      return;
    }

    // 비밀번호 변경 검증
    if (editForm.currentPassword || editForm.newPassword) {
      if (!editForm.currentPassword || !editForm.newPassword) {
        setError("비밀번호 변경을 위해 현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
        return;
      }

      if (editForm.newPassword.length < 6) {
        setError("새 비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }

      if (editForm.newPassword !== editForm.confirmPassword) {
        setError("새 비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const updateData: any = {};
      if (editForm.name) updateData.username = editForm.name.trim();
      if (editForm.phone) updateData.phone = editForm.phone;
      if (editForm.currentPassword) updateData.currentPassword = editForm.currentPassword;
      if (editForm.newPassword) updateData.newPassword = editForm.newPassword;

      const response = await updateProfile(updateData);
      
      if (response.success && response.data) {
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
        setUserData(prev => ({
          ...prev,
          name: response.data.username,
          email: response.data.email,
        }));

        setSuccess("프로필이 수정되었습니다.");
        setTimeout(() => {
    setIsEditDialogOpen(false);
          setEditForm({
            name: response.data.username,
            phone: editForm.phone,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
          });
          setSuccess("");
        }, 1500);
      } else {
        setError(response.message || "프로필 수정에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("프로필 수정 중 오류:", err);
      setError("프로필 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: 비밀번호와 이메일 인증 요청
  const handleRequestPasswordChange = async () => {
    setError("");
    setSuccess("");

    if (!passwordForm.currentPassword) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!passwordForm.newPassword) {
      setError("새 비밀번호를 입력해주세요.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    
    setIsLoading(true);

    try {
      // 이메일 인증 코드 발송
      const response = await sendPasswordChangeEmail();
      
      if (response.success) {
        setEmailVerificationSent(true);
        setPasswordStep("verification");
        setSuccess("인증 코드가 이메일로 발송되었습니다.");
      } else {
        setError(response.message || "인증 코드 발송에 실패했습니다.");
      }
    } catch (err) {
      console.error("인증 코드 발송 중 오류:", err);
      setError("인증 코드 발송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: 비밀번호 변경 완료
  const handleCompletePasswordChange = async () => {
    setError("");
    setSuccess("");

    if (!passwordForm.verificationCode) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    if (passwordForm.verificationCode.length !== 6) {
      setError("인증 코드는 6자리입니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.verificationCode
      );

      if (response.success) {
        setPasswordStep("complete");
        setSuccess("비밀번호가 성공적으로 변경되었습니다.");
        setTimeout(() => {
    setIsPasswordDialogOpen(false);
          setPasswordStep("password");
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            verificationCode: "",
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
          });
          setEmailVerificationSent(false);
        }, 1500);
      } else {
        setError(response.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("비밀번호 변경 중 오류:", err);
      setError("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountPassword.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await deleteAccount(deleteAccountPassword);
      
      if (response.success) {
        setSuccess("회원 탈퇴 처리 중입니다...");
        logout();
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        setError(response.message || "회원 탈퇴에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("회원 탈퇴 중 오류:", err);
      setError("회원 탈퇴 중 오류가 발생했습니다.");
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
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => {
                    setDeleteAccountPassword("");
                    setError("");
                    setSuccess("");
                    setIsDeleteAccountDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  회원 탈퇴
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
          <button
            onClick={() => setActiveTab("points")}
            className={`px-6 py-3 transition-colors ${
              activeTab === "points"
                ? "border-b-2 border-[#00A862] text-[#00A862]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            포인트 내역
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
              </div>
            </Card>
          </div>
        ) : activeTab === "achievements" ? (
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
        ) : activeTab === "points" ? (
          <div>
            <div className="mb-6">
              <h2 className="mb-2">포인트 사용 내역</h2>
              <p className="text-gray-600">포인트 충전 및 사용 내역을 확인할 수 있습니다.</p>
            </div>
            {isLoadingPointHistory ? (
              <div className="text-center py-12">
                <p className="text-gray-600">포인트 내역을 불러오는 중...</p>
              </div>
            ) : pointHistory.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-gray-500">포인트 사용 내역이 없습니다.</p>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">날짜</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">유형</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">내용</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">금액</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">잔액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointHistory.map((transaction) => (
                        <tr key={transaction.transaction_id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(transaction.created_at).toLocaleString('ko-KR')}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                transaction.type === 'CHARGE' || transaction.type === 'SIGNUP_BONUS'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }
                            >
                              {transaction.type === 'CHARGE' ? '충전' : transaction.type === 'USE' ? '사용' : '보너스'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{transaction.description}</td>
                          <td className={`py-3 px-4 text-sm text-right font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                          </td>
                          <td className="py-3 px-4 text-sm text-right text-gray-600">
                            {transaction.balance_after.toLocaleString()}P
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        ) : null}

      </div>

      {/* 정보 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditForm({
            name: userData.name,
            phone: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
          });
          setError("");
          setSuccess("");
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>프로필 정보 수정</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            {/* 이메일 (읽기 전용) */}
            <div>
              <Label htmlFor="edit-email">이메일</Label>
              <Input
                id="edit-email"
                type="email"
                value={userData.email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* 사용자명 */}
            <div>
              <Label htmlFor="edit-name">사용자명</Label>
              <Input
                id="edit-name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="사용자명을 입력하세요"
              />
            </div>

            {/* 전화번호 */}
            <div>
              <Label htmlFor="edit-phone">전화번호 (선택)</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="010-1234-5678"
              />
            </div>

            {/* 비밀번호 변경 섹션 */}
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm mb-3">비밀번호 변경 (선택)</h4>

              {/* 현재 비밀번호 */}
              <div className="mb-3">
                <Label htmlFor="edit-current-password">현재 비밀번호</Label>
                <div className="relative mt-1">
                  <Input
                    id="edit-current-password"
                    type={editForm.showCurrentPassword ? "text" : "password"}
                    value={editForm.currentPassword}
                    onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                    placeholder="현재 비밀번호 입력 (선택)"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({
                      ...prev,
                      showCurrentPassword: !prev.showCurrentPassword
                    }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {editForm.showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 새 비밀번호 */}
              <div className="mb-3">
                <Label htmlFor="edit-new-password">새 비밀번호</Label>
                <div className="relative mt-1">
                  <Input
                    id="edit-new-password"
                    type={editForm.showNewPassword ? "text" : "password"}
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="새 비밀번호 입력 (선택)"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({
                      ...prev,
                      showNewPassword: !prev.showNewPassword
                    }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {editForm.showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">최소 6자 이상 입력해주세요.</p>
              </div>

              {/* 새 비밀번호 확인 */}
              <div>
                <Label htmlFor="edit-confirm-password">비밀번호 확인</Label>
                <div className="relative mt-1">
                  <Input
                    id="edit-confirm-password"
                    type={editForm.showConfirmPassword ? "text" : "password"}
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    placeholder="비밀번호 다시 입력 (선택)"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({
                      ...prev,
                      showConfirmPassword: !prev.showConfirmPassword
                    }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {editForm.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 pt-4">
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
          setPasswordStep("password");
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            verificationCode: "",
            showCurrentPassword: false,
            showNewPassword: false,
            showConfirmPassword: false,
          });
          setEmailVerificationSent(false);
          setError("");
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            {passwordStep === "password" && (
              <>
            <div>
              <Label htmlFor="current-password">현재 비밀번호</Label>
                  <div className="relative mt-1">
              <Input
                id="current-password"
                      type={passwordForm.showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="현재 비밀번호를 입력하세요"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm(prev => ({
                        ...prev,
                        showCurrentPassword: !prev.showCurrentPassword
                      }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {passwordForm.showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
            </div>
                </div>

            <div>
              <Label htmlFor="new-password">새 비밀번호</Label>
                  <div className="relative mt-1">
              <Input
                id="new-password"
                      type={passwordForm.showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm(prev => ({
                        ...prev,
                        showNewPassword: !prev.showNewPassword
                      }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {passwordForm.showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
            </div>
                </div>

            <div>
                  <Label htmlFor="confirm-password">비밀번호 확인</Label>
                  <div className="relative mt-1">
              <Input
                id="confirm-password"
                      type={passwordForm.showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="비밀번호를 다시 입력하세요"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordForm(prev => ({
                        ...prev,
                        showConfirmPassword: !prev.showConfirmPassword
                      }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {passwordForm.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
            </div>
                </div>

            <div className="flex gap-2">
              <Button
                    onClick={handleRequestPasswordChange}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                disabled={isLoading}
                  >
                    {isLoading ? "확인 중..." : "다음"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(false)}
                    disabled={isLoading}
                  >
                    취소
                  </Button>
                </div>
              </>
            )}

            {passwordStep === "verification" && emailVerificationSent && (
              <>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  이메일로 발송된 6자리 인증 코드를 입력하세요.
                </div>

                <div>
                  <Label htmlFor="verification-code">인증 코드</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    value={passwordForm.verificationCode}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      verificationCode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                    }))}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCompletePasswordChange}
                    className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                    disabled={isLoading || passwordForm.verificationCode.length !== 6}
              >
                {isLoading ? "변경 중..." : "변경"}
              </Button>
              <Button
                variant="outline"
                    onClick={() => setPasswordStep("password")}
                    disabled={isLoading}
                  >
                    뒤로
                  </Button>
                </div>
              </>
            )}

            {passwordStep === "complete" && (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-green-700 font-semibold">비밀번호가 변경되었습니다</p>
                <p className="text-sm text-gray-600 mt-1">자동으로 닫힙니다...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 회원 탈퇴 다이얼로그 */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={(open) => {
        setIsDeleteAccountDialogOpen(open);
        if (!open) {
          setDeleteAccountPassword("");
          setError("");
          setSuccess("");
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>회원 탈퇴</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>주의:</strong> 회원 탈퇴 후에는 계정을 복구할 수 없습니다. 신중하게 선택해주세요.
              </p>
            </div>

            <div>
              <Label htmlFor="delete-password">비밀번호 확인</Label>
              <div className="relative mt-1">
                <Input
                  id="delete-password"
                  type={showDeletePassword ? "text" : "password"}
                  value={deleteAccountPassword}
                  onChange={(e) => setDeleteAccountPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading && deleteAccountPassword.trim()) {
                      handleDeleteAccount();
                    }
                  }}
                  placeholder="비밀번호를 입력하세요"
                  className="pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">계정 삭제를 확인하기 위해 비밀번호를 입력해주세요.</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isLoading || !deleteAccountPassword.trim()}
              >
                {isLoading ? "처리 중..." : "확인"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteAccountDialogOpen(false)}
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