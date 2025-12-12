/**
 * src/pages/AdminDashboardpage.tsx
 * 관리자 대시보드 페이지
 * 
 * 사용된 API:
 * - adminApi: getDashboardStats, getUsers, getRentals, updateUser, deleteUser, 
 *             getActivityLogs, getDistrictStats, getStationRentalRates, grantTicketToUser
 * - ticketApi: getTicketTypes
 * - stationApi: getAllStations, createStation, updateStation, deleteStation
 */

import { useState, useEffect } from "react";
import { Users, Bike, TrendingUp, Activity, Edit, Trash2, Search, Ticket, Plus } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { getDashboardStats, getUsers, getRentals, updateUser, deleteUser, getActivityLogs, getDistrictStats, getStationRentalRates, grantTicketToUser } from "../api/adminApi";
import type { ActivityLog, DistrictStat, StationRentalRate } from "../api/adminApi";
import { getTicketTypes } from "../api/ticketApi";
import type { TicketType } from "../api/ticketApi";
import { getAllStations, createStation, updateStation, deleteStation } from "../api/stationApi";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#C084FC', '#34D399', '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#F97316'];


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
  const [stationSearchTerm, setStationSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    isAdmin: false,
  });
  const [ticketForm, setTicketForm] = useState({
    ticketTypeId: null as number | null,
    expiryTime: "",
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isStationDialogOpen, setIsStationDialogOpen] = useState(false);
  const [isEditStationDialogOpen, setIsEditStationDialogOpen] = useState(false);
  const [isDeleteStationDialogOpen, setIsDeleteStationDialogOpen] = useState(false);
  const [selectedStationForEdit, setSelectedStationForEdit] = useState<any>(null);
  const [selectedStationForDelete, setSelectedStationForDelete] = useState<any>(null);
  const [stationForm, setStationForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    status: "정상",
  });
  const [editStationForm, setEditStationForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    status: "정상",
  });

  useEffect(() => {
    loadData();
    loadTicketTypes();
  }, []);

  const loadTicketTypes = async () => {
    try {
      const response = await getTicketTypes();
      if (response.success && response.data) {
        setTicketTypes(response.data);
      }
    } catch (error) {
      console.error("이용권 종류 로드 실패:", error);
    }
  }; 

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
      const [statsRes, usersRes, rentalsRes, stationsRes, districtStatsRes, rentalRatesRes] = await Promise.all([
        getDashboardStats(),
        getUsers(),
        getRentals(),
        getAllStations(), // 관리자 페이지에서는 모든 대여소 조회
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
        totalRides: parseInt(user.total_rides || 0, 10), // Backend에서 계산된 대여 횟수 사용
        currentTicket: null, // TODO: 이용권 정보 필요
        isAdmin: user.role === 'admin',
        role: user.role,
      }));
      setUsers(transformedUsers);
      
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
    setTicketForm({
      ticketTypeId: null,
      expiryTime: "",
    });
    setIsTicketDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      const updateData: any = {
        username: editForm.name,
      };
      
      if (editForm.isAdmin !== undefined) {
        updateData.role = editForm.isAdmin ? 'admin' : 'user';
      }

      await updateUser(selectedUser.id, updateData);
      alert("사용자 정보가 업데이트되었습니다.");
      setIsEditDialogOpen(false);
      await loadData();
    } catch (error: any) {
      console.error("Error updating user:", error);
      alert(error.response?.data?.message || "업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleSaveTicket = async () => {
    if (!selectedUser || !ticketForm.ticketTypeId) {
      alert("이용권 종류를 선택해주세요.");
      return;
    }

    try {
      const expiryTime = ticketForm.expiryTime 
        ? new Date(ticketForm.expiryTime).toISOString()
        : undefined;

      const response = await grantTicketToUser(
        selectedUser.id,
        ticketForm.ticketTypeId,
        expiryTime
      );

      if (response.success) {
        alert(response.message || "이용권이 부여되었습니다.");
        setIsTicketDialogOpen(false);
        setTicketForm({ ticketTypeId: null, expiryTime: "" });
        await loadData();
      } else {
        alert(response.message || "이용권 부여에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("Error granting ticket:", error);
      alert(error.response?.data?.message || "이용권 부여 중 오류가 발생했습니다.");
    }
  };

  const handleAddStation = async () => {
    if (!stationForm.name || !stationForm.latitude || !stationForm.longitude) {
      alert("대여소 이름, 위도, 경도를 모두 입력해주세요.");
      return;
    }

    try {
      const latitude = parseFloat(stationForm.latitude);
      const longitude = parseFloat(stationForm.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        alert("위도와 경도는 숫자여야 합니다.");
        return;
      }

      const response = await createStation({
        name: stationForm.name,
        latitude,
        longitude,
        status: stationForm.status,
      });

      if (response.success) {
        alert("대여소가 추가되었습니다.");
        setIsStationDialogOpen(false);
        setStationForm({ name: "", latitude: "", longitude: "", status: "정상" });
        await loadData();
      } else {
        alert(response.message || "대여소 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error adding station:", error);
      alert("대여소 추가 중 오류가 발생했습니다.");
    }
  };

  const handleEditStation = (station: any) => {
    setSelectedStationForEdit(station);
    setEditStationForm({
      name: station.name,
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString(),
      status: station.status || "정상",
    });
    setIsEditStationDialogOpen(true);
  };

  const handleUpdateStation = async () => {
    if (!selectedStationForEdit) return;
    if (!editStationForm.name || !editStationForm.latitude || !editStationForm.longitude) {
      alert("대여소 이름, 위도, 경도를 모두 입력해주세요.");
      return;
    }

    try {
      const latitude = parseFloat(editStationForm.latitude);
      const longitude = parseFloat(editStationForm.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        alert("올바른 좌표를 입력해주세요.");
        return;
      }

      const response = await updateStation(selectedStationForEdit.station_id, {
        name: editStationForm.name,
        latitude: latitude,
        longitude: longitude,
        status: editStationForm.status,
      });

      if (response.success) {
        alert("대여소가 수정되었습니다.");
        setIsEditStationDialogOpen(false);
        setSelectedStationForEdit(null);
        setEditStationForm({ name: "", latitude: "", longitude: "", status: "정상" });
        loadData();
      } else {
        alert(response.message || "대여소 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error updating station:", error);
      alert("대여소 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteStation = (station: any) => {
    setSelectedStationForDelete(station);
    setIsDeleteStationDialogOpen(true);
  };

  const handleConfirmDeleteStation = async () => {
    if (!selectedStationForDelete) return;

    try {
      const response = await deleteStation(selectedStationForDelete.station_id);

      if (response.success) {
        alert("대여소가 삭제되었습니다.");
        setIsDeleteStationDialogOpen(false);
        setSelectedStationForDelete(null);
        await loadData();
      } else {
        alert(response.message || "대여소 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error deleting station:", error);
      alert("대여소 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">대여소 정보</h3>
              <Button
                onClick={() => setIsStationDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded-md font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                대여소 추가
              </Button>
            </div>
            {/* 대여소 검색 */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="대여소 이름으로 검색..."
                  value={stationSearchTerm}
                  onChange={(e) => setStationSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <div className="overflow-y-auto max-h-[500px]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">대여소명 ▼</th>
                      <th className="px-4 py-3 text-left">위치 (좌표) ▼</th>
                      <th className="px-4 py-3 text-right">대여가능 ▼</th>
                      <th className="px-4 py-3 text-right">대여중 ▼</th>
                      <th className="px-4 py-3 text-center">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-gray-700 text-white">
                    {isLoading && stations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">대여소 정보를 불러오는 중...</td>
                      </tr>
                    ) : stations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">대여소 정보가 없습니다.</td>
                      </tr>
                    ) : (
                      stations
                        .filter((station) =>
                          station.name.toLowerCase().includes(stationSearchTerm.toLowerCase())
                        )
                        .slice(0, 20)
                        .map((station) => {
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
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditStation(station)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteStation(station)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-800 text-white border-t border-gray-700">
                <div className="px-4 py-3 flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <div className="flex gap-6">
                    <span className="text-blue-400 font-semibold">
                      대여가능: {stations.reduce((sum, station) => sum + (station.bike_count || 0), 0)}
                    </span>
                    <span className="font-semibold">
                      대여중: {rentals.filter((rental) => rental.returnedAt === null).length}
                    </span>
                  </div>
                </div>
              </div>
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
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSaveUser}
                className="bg-blue-600 hover:bg-blue-700 text-black"
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
            <DialogTitle>이용권 부여</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>사용자</Label>
              <Input value={`${selectedUser?.name || ""} (${selectedUser?.email || ""})`} disabled />
            </div>
            <div>
              <Label htmlFor="ticket-type">이용권 종류</Label>
              <select
                id="ticket-type"
                value={ticketForm.ticketTypeId || ""}
                onChange={(e) => setTicketForm({ ...ticketForm, ticketTypeId: parseInt(e.target.value) || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">이용권을 선택하세요</option>
                {ticketTypes.map((ticketType) => (
                  <option key={ticketType.ticket_type_id} value={ticketType.ticket_type_id}>
                    {ticketType.name} ({ticketType.duration_hours}시간, {ticketType.price.toLocaleString()}P)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="ticket-expiry">만료 시간 (선택사항)</Label>
              <Input
                id="ticket-expiry"
                type="datetime-local"
                value={ticketForm.expiryTime}
                onChange={(e) => setTicketForm({ ...ticketForm, expiryTime: e.target.value })}
                placeholder="지정하지 않으면 기본 기간 적용"
              />
              <p className="text-xs text-gray-500 mt-1">
                만료 시간을 지정하지 않으면 선택한 이용권의 기본 기간이 적용됩니다.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleSaveTicket}
                className="bg-blue-600 hover:bg-blue-700 text-black"
              >
                부여
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTicketDialogOpen(false);
                  setTicketForm({ ticketTypeId: null, expiryTime: "" });
                }}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 대여소 추가 다이얼로그 */}
      <Dialog open={isStationDialogOpen} onOpenChange={setIsStationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대여소 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="station-name">대여소 이름</Label>
              <Input
                id="station-name"
                value={stationForm.name}
                onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                placeholder="예: 강남역 1번 출구"
              />
            </div>
            <div>
              <Label htmlFor="station-latitude">위도 (Latitude)</Label>
              <Input
                id="station-latitude"
                type="number"
                step="any"
                value={stationForm.latitude}
                onChange={(e) => setStationForm({ ...stationForm, latitude: e.target.value })}
                placeholder="예: 37.5665"
              />
            </div>
            <div>
              <Label htmlFor="station-longitude">경도 (Longitude)</Label>
              <Input
                id="station-longitude"
                type="number"
                step="any"
                value={stationForm.longitude}
                onChange={(e) => setStationForm({ ...stationForm, longitude: e.target.value })}
                placeholder="예: 126.9780"
              />
            </div>
            <div>
              <Label htmlFor="station-status">상태</Label>
              <select
                id="station-status"
                value={stationForm.status}
                onChange={(e) => setStationForm({ ...stationForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="정상">정상</option>
                <option value="점검중">점검중</option>
                <option value="폐쇄">폐쇄</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleAddStation}
                className="bg-blue-600 hover:bg-blue-700 text-black"
              >
                추가
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsStationDialogOpen(false);
                  setStationForm({ name: "", latitude: "", longitude: "", status: "정상" });
                }}
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 대여소 수정 다이얼로그 */}
      <Dialog open={isEditStationDialogOpen} onOpenChange={setIsEditStationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대여소 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-station-name">대여소 이름</Label>
              <Input
                id="edit-station-name"
                type="text"
                value={editStationForm.name}
                onChange={(e) => setEditStationForm({ ...editStationForm, name: e.target.value })}
                placeholder="대여소 이름을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="edit-station-latitude">위도 (Latitude)</Label>
              <Input
                id="edit-station-latitude"
                type="number"
                step="any"
                value={editStationForm.latitude}
                onChange={(e) => setEditStationForm({ ...editStationForm, latitude: e.target.value })}
                placeholder="37.5665"
              />
            </div>
            <div>
              <Label htmlFor="edit-station-longitude">경도 (Longitude)</Label>
              <Input
                id="edit-station-longitude"
                type="number"
                step="any"
                value={editStationForm.longitude}
                onChange={(e) => setEditStationForm({ ...editStationForm, longitude: e.target.value })}
                placeholder="126.9780"
              />
            </div>
            <div>
              <Label htmlFor="edit-station-status">상태</Label>
              <select
                id="edit-station-status"
                value={editStationForm.status}
                onChange={(e) => setEditStationForm({ ...editStationForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="정상">정상</option>
                <option value="점검중">점검중</option>
                <option value="폐쇄">폐쇄</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditStationDialogOpen(false);
                setSelectedStationForEdit(null);
                setEditStationForm({ name: "", latitude: "", longitude: "", status: "정상" });
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleUpdateStation}
              className="bg-blue-600 hover:bg-blue-700 text-black"
            >
              수정
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 대여소 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteStationDialogOpen} onOpenChange={setIsDeleteStationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>대여소 삭제 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              정말로 <strong>{selectedStationForDelete?.name}</strong> 대여소를 삭제하시겠습니까?
            </p>
            <p className="text-sm text-gray-500">
              이 작업은 되돌릴 수 없으며, 관련된 자전거 및 대여 기록도 함께 처리됩니다.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleConfirmDeleteStation}
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                삭제
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteStationDialogOpen(false);
                  setSelectedStationForDelete(null);
                }}
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