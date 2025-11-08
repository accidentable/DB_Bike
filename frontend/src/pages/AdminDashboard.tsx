import { useState, useEffect } from "react";
import { Users, Bike, TrendingUp, Activity, Edit, Trash2, Search, X, Ticket, Calendar, DollarSign } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Header } from "../components/layout/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

// 차트 색상
const COLORS = [
  "#60A5FA", "#FBBF24", "#F59E0B", "#FB923C", "#A78BFA", 
  "#34D399", "#14B8A6", "#EC4899", "#F472B6", "#A855F7",
  "#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9", "#06B6D4"
];

interface AdminDashboardProps {
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
  onRankingClick: () => void;
}

export function AdminDashboard({
  onClose,
  onLoginClick,
  onSignupClick,
  onStationFinderClick,
  onNoticeClick,
  onCommunityClick,
  onPurchaseClick,
  onFaqClick,
  onHomeClick,
  onProfileClick,
  onRankingClick,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [rentalRateData, setRentalRateData] = useState<any[]>([]);
  const [stationInfoData, setStationInfoData] = useState<any[]>([]);
  const [activityLogsData, setActivityLogsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    studentId: "",
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // 통계 로드
      const statsRes = await fetch(
        `${API_BASE_URL}/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // 사용자 목록 로드
      const usersRes = await fetch(
        `${API_BASE_URL}/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }

      // 대여 이력 로드
      const rentalsRes = await fetch(
        `${API_BASE_URL}/admin/rentals`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (rentalsRes.ok) {
        const data = await rentalsRes.json();
        setRentals(data.rentals);
      }

      // 지역구별 데이터 로드
      const districtRes = await fetch(
        `${API_BASE_URL}/admin/district-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (districtRes.ok) {
        const data = await districtRes.json();
        setDistrictData(data.districts || []);
      }

      // 대여율 데이터 로드
      const rentalRateRes = await fetch(
        `${API_BASE_URL}/admin/rental-rates`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (rentalRateRes.ok) {
        const data = await rentalRateRes.json();
        setRentalRateData(data.rates || []);
      }

      // 대여소 정보 로드
      const stationsRes = await fetch(
        `${API_BASE_URL}/admin/station-info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (stationsRes.ok) {
        const data = await stationsRes.json();
        setStationInfoData(data.stations || []);
      }

      // 활동 로그 로드
      const logsRes = await fetch(
        `${API_BASE_URL}/admin/activity-logs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (logsRes.ok) {
        const data = await logsRes.json();
        setActivityLogsData(data.logs || []);
      }

    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone || "",
      studentId: user.studentId || "",
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

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${selectedUser.email}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        alert("사용자 정보가 업데이트되었습니다");
        setIsEditDialogOpen(false);
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleSaveTicket = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const ticketData = {
        currentTicket: {
          name: ticketForm.name,
          duration: ticketForm.duration,
          remainingRides: ticketForm.remainingRides,
          expiresAt: ticketForm.expiresAt ? new Date(ticketForm.expiresAt).toISOString() : new Date(Date.now() + ticketForm.duration * 24 * 60 * 60 * 1000).toISOString(),
        }
      };

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${selectedUser.email}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(ticketData),
        }
      );

      if (response.ok) {
        alert("이용권이 업데이트되었습니다");
        setIsTicketDialogOpen(false);
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      alert("업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${email}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("사용자를 삭제했습니다");
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || "삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.studentId && user.studentId.includes(searchTerm))
  );

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
        onRankingClick={onRankingClick}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
            <p className="text-gray-600">시스템 전체를 관리하고 모니터링합니다</p>
          </div>
          <Button onClick={loadData} disabled={isLoading}>
            {isLoading ? "새로고침 중.." : "새로고침"}
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
              <p className="text-3xl font-bold">{stats.totalUsers}명</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Bike className="w-8 h-8 text-[#00A862]" />
                <span className="text-sm text-gray-600">전체 대여</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalRentals}회</p>
              <p className="text-sm text-gray-600 mt-1">오늘: {stats.todayRentals}회</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-8 h-8 text-[#00A862]" />
                <span className="text-sm text-gray-600">현재 대여중</span>
              </div>
              <p className="text-3xl font-bold">{stats.activeRentals}건</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-[#00A862]" />
                <span className="text-sm text-gray-600">누적 거리</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalDistance}km</p>
            </Card>
          </div>
        )}

        {/* 시각화 그래프 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 서울 따릉이 대여소 수 */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-2">서울 따릉이 대여소 수</h3>
            <div className="flex items-center justify-center h-48">
              <p className="text-6xl font-bold text-pink-500">560</p>
            </div>
          </Card>

          {/* 지역구별 대여소 현황 파이차트 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">지역구별 대여소 현황(TOP15)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={districtData}
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
          </Card>

          {/* 서울 따릉이 대여율 막대 그래프 */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">서울 따릉이 대여율</h3>
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
                          <p className="text-sm text-gray-600">대여율: {payload[0].value}%</p>
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
          </Card>

          {/* 대여소 정보 */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold mb-4">대여소 정보</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">대여소명</th>
                    <th className="px-4 py-3 text-left">주소 수</th>
                    <th className="px-4 py-3 text-right">대여가능 수</th>
                    <th className="px-4 py-3 text-right">대여중 수</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-gray-700 text-white">
                  {stationInfoData.map((station) => (
                    <tr key={station.id} className="hover:bg-gray-600 transition-colors">
                      <td className="px-4 py-3">{station.name}</td>
                      <td className="px-4 py-3">{station.bikes}</td>
                      <td className="px-4 py-3 text-right text-blue-400">{station.available}</td>
                      <td className="px-4 py-3 text-right">{station.rented}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-800 text-white">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 font-semibold">Total</td>
                    <td className="px-4 py-3 text-right text-blue-400 font-semibold">2150</td>
                    <td className="px-4 py-3 text-right font-semibold">117</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* User Activity Logs */}
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
                {activityLogsData.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{log.time}</td>
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
                        {log.status === 'success' ? '✓ Success' :
                         log.status === 'error' ? '✕ Error' :
                         log.status === 'warning' ? '⚠ Warning' :
                         'ℹ Info'}
                      </Badge>
                    </td>
                  </tr>
                ))}
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
                    placeholder="이름, 이메일, 학번으로 검색.."
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
                      <th className="px-4 py-3 text-left text-sm font-semibold">이름</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">이메일</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">학번</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">가입일</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">이용 횟수</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">이용권</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">권한</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.email}</td>
                        <td className="px-4 py-3">{user.studentId || "-"}</td>
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
                      <th className="px-4 py-3 text-left text-sm font-semibold">사용자</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">자전거</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">대여소</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">대여 시간</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">반납 시간</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">거리</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">상태</th>
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
              <Label>이메일(수정 불가)</Label>
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
            <div>
              <Label htmlFor="edit-student-id">학번</Label>
              <Input
                id="edit-student-id"
                value={editForm.studentId}
                onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
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
