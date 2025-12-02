// src/pages/AdminDashboard.tsx
// (Supabase API 호출 로직 제거 및 Node.js API 호출 뼈대로 대체)

import { useState, useEffect } from "react";
import { Users, Bike, TrendingUp, Activity, Edit, Trash2, Search, Ticket } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
// (수정) supabase 관련 import 제거
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Admin API 함수
//import { getDashboardStats, getUsers, getRentals, updateUser, deleteUser } from "../api/adminApi";
// Admin API 함수
import { getDashboardStats, getUsers, getRentals, updateUser, deleteUser, getActivityLogs, getDistrictStats, getStationRentalRates } from "../api/adminApi";
import type { ActivityLog, DistrictStat, StationRentalRate } from "../api/adminApi";

// Station API 함수
import { getStations } from "../api/stationApi"; 


// 목업 데이터
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#C084FC', '#34D399', '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#F97316'];

/*const districtData = [
  { name: '영등포구', value: 57, percent: 10.2 },
  { name: '강남구', value: 53, percent: 9.5 },
  { name: '서초구', value: 51, percent: 9.1 },
  { name: '마포구', value: 48, percent: 8.6 },
  { name: '용산구', value: 44, percent: 7.9 },
  { name: '종로구', value: 41, percent: 7.3 },
  { name: '성동구', value: 39, percent: 7.0 },
  { name: '광진구', value: 36, percent: 6.4 },
  { name: '송파구', value: 33, percent: 5.9 },
  { name: '중구', value: 31, percent: 5.5 },
  { name: '동작구', value: 28, percent: 5.0 },
  { name: '은평구', value: 26, percent: 4.6 },
  { name: '강서구', value: 24, percent: 4.3 },
  { name: '관악구', value: 22, percent: 3.9 },
  { name: '노원구', value: 20, percent: 3.6 },
];

const rentalRateData = [
  { name: '101. 순화동주민센터 앞', percent: 96.55, color: '#FF0000' },
  { name: '102. 시청역 1번출구 앞', percent: 95.24, color: '#FF4500' },
  { name: '2. 103. 을지로입구역 4번 출구 앞', percent: 94.44, color: '#FF6347' },
  { name: '104. 광화문역 7번출구 옆', percent: 89.66, color: '#FF8C00' },
  { name: '105. 광화문역 5번출구 옆', percent: 87.5, color: '#FFA500' },
  { name: '106. 서울역사박물관 옆', percent: 86.67, color: '#FFB347' },
  { name: '117. 삼청파출소 앞', percent: 85.71, color: '#FFC04D' },
  { name: '118. 안국역 1번 출구 옆', percent: 84.21, color: '#FFCC66' },
  { name: '119. 종각역 1번출구 앞', percent: 83.33, color: '#FFD700' },
  { name: '1. 120. 종각역 3번출구 앞', percent: 82.76, color: '#FFE066' },
];*/

/*
const activityLogsData = [
  { time: '2025-11-11 08:30:15', user: 'hong@test.com', action: '로그인 시도 (성공)', status: 'success' },
  { time: '2025-11-11 08:25:42', user: 'kim@test.com', action: '자전거 대여 (1001번)', status: 'success' },
  { time: '2025-11-11 08:20:33', user: 'lee@test.com', action: '이용권 구매 (30일권)', status: 'success' },
  { time: '2025-11-11 08:15:28', user: 'park@test.com', action: '로그인 시도 (실패 - 비밀번호 오류)', status: 'error' },
  { time: '2025-11-11 08:10:19', user: 'choi@test.com', action: '자전거 반납 (1002번)', status: 'success' },
  { time: '2025-11-11 08:05:11', user: 'jung@test.com', action: '프로필 수정', status: 'success' },
  { time: '2025-11-11 08:00:03', user: 'kang@test.com', action: '대여소 조회', status: 'info' },
  { time: '2025-11-11 07:55:47', user: 'system', action: '자동 백업 시작', status: 'info' },
];*/

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({totalUsers: 0, totalRentals: 0, activeRentals: 0, totalDistance: 0});
  const [users, setUsers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [districtData, setDistrictData] = useState<DistrictStat[]>([]);  // 추가
const [rentalRateData, setRentalRateData] = useState<StationRentalRate[]>([]);  // 추가
  const [isLoading, setIsLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);  // 추가
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);  // 추가
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    isAdmin: false,
  });
  const [ticketForm, setTicketForm] = useState({
    name: "",
    duration: 30,
    remainingRides: null as number | null,
    expiresAt: "",
  });

  useEffect(() => {
    loadData();
  }, []); 

  // Activity Logs 로드
useEffect(() => {
  const loadActivityLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await getActivityLogs(50);
      setActivityLogs(logs);
    } catch (error) {
      console.error("Activity Log 로드 실패:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };
  loadActivityLogs();
}, []);
  
  // --- API 호출 로직 ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Node.js 백엔드 API 호출
      const [statsRes, usersRes, rentalsRes, stationsRes, districtStatsRes, rentalRatesRes] = await Promise.all([
        getDashboardStats(),
        getUsers(),
        getRentals(),
        getStations(),
        getDistrictStats(),  // 추가
        getStationRentalRates()  // 추가
      ]);
  
      // 통계 데이터 설정
      setStats(statsRes);
      
      // 지역구별 통계 설정
      setDistrictData(districtStatsRes);
      
      // 대여소별 대여율 설정
      setRentalRateData(rentalRatesRes);
      
      // 사용자 데이터 변환 (백엔드 형식 -> 프론트엔드 형식)
      const transformedUsers = usersRes.map((user: any) => ({
        id: user.member_id,
        name: user.username,
        email: user.email,
        createdAt: user.created_at,
        totalRides: 0, // TODO: 대여 횟수 집계 필요
        currentTicket: null, // TODO: 이용권 정보 필요
        isAdmin: user.role === 'admin',
        role: user.role,
      }));
      setUsers(transformedUsers);
      
      // 대여 데이터 변환 (백엔드 형식 -> 프론트엔드 형식)
      const transformedRentals = rentalsRes.map((rental: any) => ({
        id: rental.rental_id,
        userName: rental.username,
        userEmail: rental.email,
        bikeNumber: rental.bike_id,
        stationName: rental.start_station_name,
        returnStationName: rental.end_station_name,
        rentedAt: rental.start_time,
        returnedAt: rental.end_time,
        distance: rental.distance_km ? Math.round(rental.distance_km * 10) / 10 : null,  // 추가
      }));
      setRentals(transformedRentals);

      // 대여소 데이터 설정
      if (stationsRes.success && stationsRes.data) {
        setStations(stationsRes.data);
      }
      
    } catch (error) {
      console.error("Error loading admin data:", error);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone || "",
      isAdmin: user.isAdmin || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditTicket = (user: any) => {
    setSelectedUser(user);
    const ticket = user.currentTicket;
    setTicketForm({
      name: ticket?.name || "1일권",
      duration: 30,
      remainingRides: ticket?.remainingRides || null,
      expiresAt: ticket?.expiresAt ? new Date(ticket.expiresAt).toISOString().split('T')[0] : "",
    });
    setIsTicketDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    // (신규) Node.js API 호출로 대체
    // try {
    //   await updateUser(selectedUser.email, editForm);
    //   alert("사용자 정보가 업데이트되었습니다.");
    //   setIsEditDialogOpen(false);
    //   loadData();
    // } catch (error) {
    //   console.error("Error updating user:", error);
    //   alert("업데이트 중 오류가 발생했습니다.");
    // }
  };

  const handleSaveTicket = async () => {
    if (!selectedUser) return;
    // (신규) Node.js API 호출로 대체
    // try {
    //   await updateUser(selectedUser.email, {currentTicket: ticketForm});
    //   alert("이용권이 업데이트되었습니다.");
    //   setIsTicketDialogOpen(false);
    //   loadData();
    // } catch (error) {
    //   console.error("Error updating ticket:", error);
    //   alert("업데이트 중 오류가 발생했습니다.");
    // }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;
    // (신규) Node.js API 호출로 대체
    // try {
    //   await deleteUser(email);
    //   alert("사용자가 삭제되었습니다.");
    //   loadData();
    // } catch (error) {
    //   console.error("Error deleting user:", error);
    //   alert("삭제 중 오류가 발생했습니다.");
    // }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... (JSX 렌더링 부분은 원본과 동일하게 유지) ... */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">관리자 대시보드</h1>
            <p className="text-gray-600">시스템 전체를 관리하고 모니터링합니다</p>
          </div>
          <Button onClick={loadData} disabled={isLoading}>
            {isLoading ? "새로고침 중..." : "새로고침"}
          </Button>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-8 h-8 text-[#00A862]" />
                <span className="text-sm text-gray-600">전체 사용자</span>
              </div>
              <p className="text-3xl">{stats.totalUsers}명</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Bike className="w-8 h-8 text-[#00A862]" />
                <span className="text-sm text-gray-600">전체 대여</span>
              </div>
              <p className="text-3xl">{stats.totalRentals}회</p>
              <p className="text-sm text-gray-600 mt-1">오늘: {stats.todayRentals}회</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-8 h-8 text-[#00A862]" />
                <span className="text-sm text-gray-600">현재 대여 중</span>
              </div>
              <p className="text-3xl">{stats.activeRentals}건</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-[#00A862]" />
                <span className="text-sm text-gray-600">누적 거리</span>
              </div>
              <p className="text-3xl">{stats.totalDistance}km</p>
            </Card>
          </div>
        )}

        {/* 시각화 그래프 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 서울 따릉이 대여소 수 (목업 유지) */}
          <Card className="p-6">
  <h3 className="mb-2">서울 따릉이 대여소 수</h3>
  <div className="flex items-center justify-center h-48">
    <p className="text-6xl text-pink-500">{stats?.totalStations || 0}</p>
  </div>
</Card>

          {/* 지역구별 대여소 현황 파이차트들 */}
<Card className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h3>지역구별 대여소 현황(TOP15)</h3>
  </div>
  {isLoading ? (
    <div className="flex items-center justify-center h-[300px] text-gray-500">
      데이터를 불러오는 중...
    </div>
  ) : districtData.length > 0 ? (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={districtData.map(item => ({
              name: item.name,
              value: item.value,
              percent: parseFloat(item.percent)
            }))}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {districtData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-sm text-gray-600">대여소: {payload[0].value}개</p>
                    <p className="text-sm text-gray-600">비율: {payload[0].payload.percent}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {districtData.slice(0, 6).map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
            <span className="text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </>
  ) : (
    <div className="flex items-center justify-center h-[300px] text-gray-500">
      데이터가 없습니다.
    </div>
  )}
</Card>

          {/* 서울 따릉이 대여율 막대 그래프 */}
<Card className="p-6 lg:col-span-2">
  <h3 className="mb-4">서울 따릉이 대여율</h3>
  {isLoading ? (
    <div className="flex items-center justify-center h-[300px] text-gray-500">
      데이터를 불러오는 중...
    </div>
  ) : rentalRateData.length > 0 ? (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rentalRateData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <p className="font-semibold">{payload[0].payload.name}</p>
                  <p className="text-sm text-gray-600">대여율: {payload[0].value?.toFixed(2)}%</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          dataKey="percent" 
          radius={[0, 8, 8, 0]}
          animationBegin={0}
          animationDuration={800}
        >
          {rentalRateData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div className="flex items-center justify-center h-[300px] text-gray-500">
      데이터가 없습니다.
    </div>
  )}
</Card>
          {/* 대여소 정보 */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="mb-4">대여소 정보</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">대여소명 ▼</th>
                    <th className="px-4 py-3 text-left">위치 (좌표) ▼</th>
                    <th className="px-4 py-3 text-right">대여가능 ▼</th>
                    <th className="px-4 py-3 text-right">대여중 ▼</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-gray-700 text-white">
                  {isLoading && stations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">대여소 정보를 불러오는 중...</td>
                    </tr>
                  ) : stations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400">대여소 정보가 없습니다.</td>
                    </tr>
                  ) : (
                    stations.map((station) => {
                      // 현재 대여중인 자전거 수 계산 (end_time이 null인 rentals 중에서 해당 대여소에서 시작한 것들)
                      const rentedCount = rentals.filter(
                        (rental) => rental.returnedAt === null && rental.stationName === station.name
                      ).length;
                      
                      return (
                        <tr key={station.station_id} className="hover:bg-gray-600 transition-colors">
                          <td className="px-4 py-3">{station.name}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                          </td>
                          <td className="px-4 py-3 text-right text-blue-400">{station.bike_count}</td>
                          <td className="px-4 py-3 text-right">{rentedCount}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-gray-800 text-white">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 font-semibold">Total</td>
                    <td className="px-4 py-3 text-right text-blue-400 font-semibold">
                      {stations.reduce((sum, station) => sum + (station.bike_count || 0), 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {rentals.filter((rental) => rental.returnedAt === null).length}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* User Activity Logs (목업 유지) */}
        <Card className="p-6 mb-8">
          <h3 className="mb-4">User Activity Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
  {isLoadingLogs ? (
    <tr>
      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
        로그를 불러오는 중...
      </td>
    </tr>
  ) : activityLogs.length > 0 ? (
    activityLogs.map((log, index) => {
      // timestamp 포맷팅
      const formattedTime = new Date(log.timestamp).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/,/g, '').replace(/\//g, '-');

      return (
        <tr key={index} className="hover:bg-gray-50">
          <td className="px-4 py-3 text-gray-600">{formattedTime}</td>
          <td className="px-4 py-3">{log.user}</td>
          <td className="px-4 py-3">{log.action}</td>
          <td className="px-4 py-3 text-right">
            <Badge 
              className={
                log.status === 'success' ? 'bg-green-500' :
                log.status === 'error' ? 'bg-red-500' :
                log.status === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }
            >
              {log.status === 'success' ? '● Success' :
               log.status === 'error' ? '● Error' :
               log.status === 'warning' ? '● Warning' :
               '● Info'}
            </Badge>
          </td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
        활동 로그가 없습니다.
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
        </Card>

        {/* 탭 메뉴 */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="rentals">대여 이력</TabsTrigger>
          </TabsList>

          {/* 사용자 관리 탭 */}
          <TabsContent value="users">
            <Card className="p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="이름, 이메일로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">이름</th>
                      <th className="px-4 py-3 text-left text-sm">이메일</th>
                      <th className="px-4 py-3 text-left text-sm">가입일</th>
                      <th className="px-4 py-3 text-left text-sm">이용 횟수</th>
                      <th className="px-4 py-3 text-left text-sm">이용권</th>
                      <th className="px-4 py-3 text-left text-sm">권한</th>
                      <th className="px-4 py-3 text-center text-sm">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{user.totalRides || 0}회</td>
                        <td className="px-4 py-3">
                          {user.currentTicket ? (
                            <Badge variant="outline" className="text-xs">
                              {user.currentTicket.name}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">없음</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {user.isAdmin ? (
                            <Badge className="bg-[#00A862]">관리자</Badge>
                          ) : (
                            <Badge variant="outline">일반</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(user)}
                              title="정보 수정"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTicket(user)}
                              title="이용권 관리"
                            >
                              <Ticket className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.email)}
                              disabled={user.isAdmin}
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* 대여 이력 탭 */}
          <TabsContent value="rentals">
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">사용자</th>
                      <th className="px-4 py-3 text-left text-sm">자전거</th>
                      <th className="px-4 py-3 text-left text-sm">대여소</th>
                      <th className="px-4 py-3 text-left text-sm">대여 시간</th>
                      <th className="px-4 py-3 text-left text-sm">반납 시간</th>
                      <th className="px-4 py-3 text-left text-sm">거리</th>
                      <th className="px-4 py-3 text-left text-sm">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rentals.slice(0, 50).map((rental) => (
                      <tr key={rental.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {rental.userName || "-"}
                          <br />
                          <span className="text-xs text-gray-500">{rental.userEmail}</span>
                        </td>
                        <td className="px-4 py-3">{rental.bikeNumber}번</td>
                        <td className="px-4 py-3">
                          {rental.stationName}
                          {rental.returnStationName && rental.returnStationName !== rental.stationName && (
                            <>
                              <br />
                              <span className="text-xs text-gray-500">→ {rental.returnStationName}</span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(rental.rentedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {rental.returnedAt
                            ? new Date(rental.returnedAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {rental.distance ? `${rental.distance}km` : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {rental.returnedAt ? (
                            <Badge variant="outline">완료</Badge>
                          ) : (
                            <Badge className="bg-[#00A862]">대여중</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 사용자 수정 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>이메일 (수정 불가)</Label>
              <Input value={selectedUser?.email || ""} disabled />
            </div>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-admin"
                checked={editForm.isAdmin}
                onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-admin">관리자 권한 부여</Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveUser}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
              >
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 이용권 수정 다이얼로그 */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이용권 관리</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>사용자</Label>
              <Input value={selectedUser?.name || ""} disabled />
            </div>
            <div>
              <Label htmlFor="ticket-name">이용권 종류</Label>
              <select
                id="ticket-name"
                value={ticketForm.name}
                onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="1일권">1일권</option>
                <option value="7일권">7일권</option>
                <option value="30일권">30일권</option>
                <option value="90일권">90일권</option>
                <option value="365일권">365일권</option>
              </select>
            </div>
            <div>
              <Label htmlFor="ticket-duration">기간 (일)</Label>
              <Input
                id="ticket-duration"
                type="number"
                value={ticketForm.duration}
                onChange={(e) => setTicketForm({ ...ticketForm, duration: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="ticket-rides">남은 이용 횟수 (null = 무제한)</Label>
              <Input
                id="ticket-rides"
                type="number"
                placeholder="무제한은 비워두세요"
                value={ticketForm.remainingRides || ""}
                onChange={(e) => setTicketForm({ ...ticketForm, remainingRides: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
            <div>
              <Label htmlFor="ticket-expires">만료일</Label>
              <Input
                id="ticket-expires"
                type="date"
                value={ticketForm.expiresAt}
                onChange={(e) => setTicketForm({ ...ticketForm, expiresAt: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveTicket}
                className="flex-1 bg-[#00A862] hover:bg-[#008F54]"
              >
                저장
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsTicketDialogOpen(false)}
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