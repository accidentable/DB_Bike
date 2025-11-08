// src/pages/ProfilePage.tsx
// (모든 import 경로 수정)

import { useState, useEffect } from "react";
import { User, Award, MapPin, Calendar, Trophy, Medal, Star, Target, Bike, TrendingUp, Edit, Lock, ArrowLeft } from "lucide-react"; // ArrowLeft 추가
import { Card } from "../components/ui/card"; // 경로 수정
import { Button } from "../components/ui/button"; // 경로 수정
import { Badge } from "../components/ui/badge"; // 경로 수정
import Header from "../components/layout/Header"; // 경로 수정 및 default import
import { Progress } from "../components/ui/progress"; // 경로 수정
import { Input } from "../components/ui/input"; // 경로 수정
import { Label } from "../components/ui/label"; // 경로 수정
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"; // 경로 수정

// (수정) 이전 utils/api 대신 우리가 만든 API 함수를 import 해야 함
// import { getCurrentUser, updateProfile, changePassword } from "../utils/api"; 
// (실제 API는 Person 1이 구현해야 하므로 임시 함수로 대체)
const getCurrentUser = () => { /* mock */ return { name: "사용자 이름", email: "user@kwangwoon.ac.kr" }; };
const updateProfile = async (form: any) => { /* mock */ return { success: true, user: form }; };
const changePassword = async (current: string, newP: string) => { /* mock */ return { success: true }; };


interface ProfilePageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onStationFinderClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onRankingClick: () => void;
}

// ... (Achievement interface와 achievements 데이터는 원본과 동일하게 유지) ...
interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
}

const achievements: Achievement[] = [
  { id: 1, name: "첫 걸음", description: "첫 따릉이 이용 완료", icon: "🚴", earned: true },
  { id: 2, name: "출퇴근 마스터", description: "10일 연속 이용", icon: "🏆", earned: true },
  { id: 3, name: "장거리 라이더", description: "누적 100km 달성", icon: "🎯", earned: true },
  { id: 4, name: "환경 지킴이", description: "누적 500km 달성", icon: "🌿", earned: false, progress: 287, total: 500 },
  { id: 5, name: "전국구", description: "50개 이상의 대여소 이용", icon: "🗺️", earned: false, progress: 32, total: 50 },
  { id: 6, name: "단골 회원", description: "100회 이용 달성", icon: "⭐", earned: false, progress: 67, total: 100 },
];


export default function ProfilePage({ 
  onClose, 
  onLoginClick, 
  onSignupClick, 
  onStationFinderClick, 
  onNoticeClick, 
  onCommunityClick, 
  onPurchaseClick, 
  onFaqClick, 
  onHomeClick,
  onRankingClick 
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"info" | "achievements">("info");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 사용자 데이터 상태
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    studentId: "",
    memberSince: "",
    totalDistance: 0,
    totalRides: 0,
    rank: 0,
    currentTicket: "정기권 (30일)",
    ticketExpiry: "2025-11-28",
  });

  // 수정 폼 데이터
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    studentId: "",
  });

  // 비밀번호 변경 폼
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 사용자 정보 로드
  useEffect(() => {
    // (이 부분은 Person 1이 AuthContext와 연동하여 수정해야 함)
    const user = getCurrentUser(); 
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        studentId: user.studentId || "",
        memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2025.11.08", // 임시값
        totalDistance: user.totalDistance || 0,
        totalRides: user.totalRides || 0,
        rank: 142, // 임시값
        currentTicket: "정기권 (30일)", // 임시값
        ticketExpiry: "2025-11-28", // 임시값
      });
      setEditForm({
        name: user.name,
        phone: user.phone || "",
        studentId: user.studentId || "",
      });
    }
  }, []);

  // 정보 수정 핸들러
  const handleEditProfile = async () => {
    // ... (로직은 원본과 동일하게 유지) ...
    setError("");
    setIsLoading(true);

    try {
      const result = await updateProfile(editForm);
      if (result.success && result.user) {
        setUserData(prev => ({
          ...prev,
          name: result.user!.name,
          phone: result.user!.phone,
          studentId: result.user!.studentId,
        }));
        alert("프로필이 업데이트되었습니다.");
        setIsEditDialogOpen(false);
        // window.dispatchEvent(new Event('loginStatusChanged')); // Context 사용 시 이 로직은 필요 없음
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = async () => {
    // ... (로직은 원본과 동일하게 유지) ...
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        alert("비밀번호가 변경되었습니다.");
        setIsPasswordDialogOpen(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    // ... (stats 데이터는 원본과 동일하게 유지) ...
    { label: "누적 거리", value: `${userData.totalDistance}km`, icon: <MapPin className="w-5 h-5 text-[#00A862]" />, description: "탄소 배출 절감 약 57.5kg" },
    { label: "이용 횟수", value: `${userData.totalRides}회`, icon: <Bike className="w-5 h-5 text-[#00A862]" />, description: "평균 이용 시간 25분" },
    { label: "전체 랭킹", value: `${userData.rank}위`, icon: <Trophy className="w-5 h-5 text-[#00A862]" />, description: "상위 5%" },
    { label: "획득 업적", value: `${achievements.filter(a => a.earned).length}/${achievements.length}`, icon: <Award className="w-5 h-5 text-[#00A862]" />, description: "달성률 50%" }
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
                  onClick={onRankingClick}
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
                  <span className="text-gray-600">전화번호</span>
                  <span className="col-span-2">{userData.phone}</span>
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
                <Button className="bg-[#00A862] hover:bg-[#008F54] mr-3">
                  정보 수정
                </Button>
                <Button variant="outline">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`p-6 ${achievement.earned ? 'bg-gradient-to-br from-[#00A862]/10 to-white' : 'opacity-75'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {achievement.earned ? (
                        <Badge className="bg-[#00A862]">
                          <Star className="w-3 h-3 mr-1" />
                          달성 완료
                        </Badge>
                      ) : achievement.progress !== undefined ? (
                        <div>
                          <div className="flex items-center justify-between mb-1 text-sm text-gray-600">
                            <span>{achievement.progress} / {achievement.total}</span>
                            <span>{Math.round((achievement.progress! / achievement.total!) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.total!) * 100} 
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

        {/* 기본 정보 탭 */}
        {activeTab === "info" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3>기본 정보</h3>
                <Button
                  variant="outline"
                  className="border-[#00A862] text-[#00A862] hover:bg-[#00A862] hover:text-white"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  비밀번호 변경
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">이름</span>
                    <p className="text-lg">{userData.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">이메일</span>
                    <p className="text-lg">{userData.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">전화번호</span>
                    <p className="text-lg">{userData.phone || "미등록"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">학번</span>
                    <p className="text-lg">{userData.studentId || "미등록"}</p>
                  </div>
                </div>
              </div>
            </Card>
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
            <div>
              <Label htmlFor="edit-phone">전화번호</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-student-id">학번</Label>
              <Input
                id="edit-student-id"
                value={editForm.studentId}
                onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
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
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
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
            <div className="flex gap-2">
              <Button
                onClick={handleChangePassword}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
                disabled={isLoading}
              >
                {isLoading ? "변경 중..." : "변경"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
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