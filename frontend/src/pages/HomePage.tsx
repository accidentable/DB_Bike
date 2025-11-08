// src/pages/HomePage.tsx
// (모든 import 경로 수정 완료)

import { useState, useEffect } from "react";
import { MapPin, Search, Navigation, Bike, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

// (수정) ../api/ (O)
import { getStations, getAvailableBikes } from "../api/stationApi";
import { rentBike, returnBike, getCurrentRental } from "../api/rentalApi";
// (수정) ../contexts/ (O)
import { useAuth } from "../contexts/AuthContext";

// (수정) ../components/ui/ (O)
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

// (Interface 정의는 동일)
// ... (Station, Bike, RentedBikeInfo interface) ...
interface Station {
  station_id: number;
  name: string;
  latitude: number;
  longitude: number;
  bike_count: number;
  distance_km?: number;
}
interface Bike {
  bike_id: number;
  status: string;
}
interface RentedBikeInfo {
  rental_id: number;
  start_time: string;
  start_station_name: string;
  bike_id: number;
}


// (수정) export default function
export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // ... (이하 모든 코드는 이전 답변의 수정본과 동일합니다) ...
  // ... (API 연동 로직, JSX 렌더링 부분) ...
  // --- API 데이터 상태 ---
  const [stations, setStations] = useState<Station[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [rentedBike, setRentedBike] = useState<RentedBikeInfo | null>(null);

  // --- UI 상태 ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // --- API 호출 함수 ---
  const fetchStations = async (query = "", lat?: number, lon?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStations({ query, lat, lon });
      if (data.success) {
        setStations(data.data);
      }
    } catch (err) {
      setError("대여소 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentRental = async () => {
    if (!isLoggedIn) return;
    try {
      const data = await getCurrentRental();
      if (data.success && data.data) {
        setRentedBike(data.data);
      } else {
        setRentedBike(null);
      }
    } catch (err) {
      console.error("현재 대여 정보 로드 실패", err);
      setRentedBike(null);
    }
  };
  
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchStations("", position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError("위치 정보를 가져올 수 없습니다.");
        }
      );
    }
  };

  // --- 대여/반납 로직 ---
  const handleStationClick = async (station: Station) => {
    setSelectedStation(station);
    setSelectedBike(null);
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAvailableBikes(station.station_id);
      if (data.success) {
        setBikes(data.data);
      }
    } catch (err) {
      setError("자전거 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRent = async () => {
    if (!isLoggedIn) return navigate('/login');
    if (!selectedBike || !selectedStation) return setError("자전거를 선택해주세요.");

    setIsLoading(true);
    setError(null);
    try {
      await rentBike({
        bikeId: selectedBike.bike_id,
        startStationId: selectedStation.station_id
      });
      await fetchCurrentRental();
      setSelectedBike(null);
      setSelectedStation(null);
      setBikes([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "대여에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!isLoggedIn) return navigate('/login');
    if (!rentedBike) return setError("반납할 자전거가 없습니다.");
    if (!selectedStation) return setError("반납할 대여소를 선택해주세요.");

    setIsLoading(true);
    setError(null);
    try {
      await returnBike({ endStationId: selectedStation.station_id });
      setRentedBike(null);
      setElapsedTime(0);
      setSelectedStation(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "반납에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- useEffect 훅 ---
  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchStations(searchQuery);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  useEffect(() => {
    fetchStations();
  }, []); 

  useEffect(() => {
    fetchCurrentRental();
  }, [isLoggedIn]);

  useEffect(() => {
    if (rentedBike) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(rentedBike.start_time).getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rentedBike]);

  // --- JSX 렌더링 ---
  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn && rentedBike && (
        <div className="fixed bottom-4 right-4 z-40 w-80">
          <Card className="p-4 shadow-lg border-2 border-[#00A862] bg-white">
            <h3 className="flex items-center gap-2 mb-3">
              <Bike className="w-5 h-5 text-[#00A862]" />
              {user?.username}님, 대여 중
            </h3>
            <Separator className="mb-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">자전거 번호</span>
                <span>{rentedBike.bike_id}번</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">대여 장소</span>
                <span className="text-right">{rentedBike.start_station_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이용 시간</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#00A862]" />
                  {Math.floor(elapsedTime / 60)}분 {elapsedTime % 60}초
                </span>
              </div>
            </div>
            <Button
              onClick={handleReturn}
              className="w-full mt-4 bg-[#00A862] hover:bg-[#008F54]"
              disabled={!selectedStation || isLoading}
            >
              {selectedStation ? `${selectedStation.name}에 반납하기` : "반납할 대여소 선택"}
            </Button>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        <div className="mb-8">
          <h1 className="mb-2">대여소 찾기</h1>
          <p className="text-gray-600">가까운 대여소를 찾아 자전거를 대여하세요</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="대여소 이름 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleMyLocation} disabled={isLoading}>
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto">
              {isLoading && stations.length === 0 && <p>대여소 목록을 불러오는 중...</p>}
              {stations.map((station) => (
                <Card
                  key={station.station_id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedStation?.station_id === station.station_id ? "border-[#00A862] bg-green-50" : ""
                  }`}
                  onClick={() => handleStationClick(station)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base">{station.name}</h3>
                        {station.distance_km && (
                          <Badge variant="outline" className="text-xs">
                            {station.distance_km.toFixed(1)}km
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        이용 가능: <span className="text-[#00A862]">{station.bike_count}대</span>
                      </p>
                    </div>
                    <MapPin className="w-5 h-5 text-[#00A862]" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        station.bike_count > 10 ? "bg-[#00A862]" : station.bike_count > 3 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min((station.bike_count / 20) * 100, 100)}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            {selectedStation ? (
              <Card className="p-6">
                <h2 className="mb-2">{selectedStation.name}</h2>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <Bike className="w-4 h-4 text-[#00A862]" />
                    이용 가능: {selectedStation.bike_count}대
                  </span>
                  {selectedStation.distance_km && (
                    <Badge className="bg-[#00A862]">{selectedStation.distance_km.toFixed(1)}km</Badge>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between mb-4">
                  <h3>이용 가능한 자전거</h3>
                  <Button
                    onClick={handleRent}
                    className="bg-[#00A862] hover:bg-[#008F54]"
                    disabled={!selectedBike || isLoading || !!rentedBike}
                  >
                    {rentedBike ? "이미 대여 중" : (isLoading ? "처리 중..." : "대여하기")}
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {isLoading && bikes.length === 0 && <p>자전거 목록을 불러오는 중...</p>}
                  {bikes.map((bike) => (
                    <Card
                      key={bike.bike_id}
                      className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                        selectedBike?.bike_id === bike.bike_id ? "border-[#00A862] bg-green-50" : ""
                      }`}
                      onClick={() => setSelectedBike(bike)}
                    >
                      <div className="flex items-center gap-2">
                        <Bike className="w-5 h-5 text-[#00A862]" />
                        <span className="font-medium">자전거 #{bike.bike_id}</span>
                        <Badge className="bg-[#00A862]">이용 가능</Badge>
                      </div>
                    </Card>
                  ))}
                  {bikes.length === 0 && !isLoading && <p>이용 가능한 자전거가 없습니다.</p>}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2 text-gray-600">대여소를 선택하세요</h3>
                <p className="text-sm text-gray-500">
                  왼쪽 목록에서 대여소를 선택하면 이용 가능한 자전거를 확인할 수 있습니다.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}