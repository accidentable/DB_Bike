/**
 * src/pages/HomePage.tsx
 * 대여소 찾기 및 자전거 대여/반납 페이지
 * 
 * 사용된 API:
 * - stationApi: getStations, getAvailableBikes
 * - rentalApi: rentBike, returnBike, getCurrentRental
 */

import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Navigation, Bike, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStations, getAvailableBikes } from "../api/stationApi";
import { rentBike, returnBike, getCurrentRental } from "../api/rentalApi";
import { useAuth } from "../contexts/AuthContext";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

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

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
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
  const [returnDialog, setReturnDialog] = useState<{ open: boolean; station: Station | null }>({ open: false, station: null });
  const [returning, setReturning] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 37.619662,
    lng: 127.060001,
  });

  // --- API 호출 함수 ---
  const fetchStations = async (query = "", lat?: number, lon?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStations({ query, lat, lon });
      if (data.success && data.data) {
        setStations(data.data);
        // 검색 결과가 있으면 첫 번째 대여소 위치로 지도 중심 이동
        if (data.data.length > 0 && !lat && !lon) {
          setMapCenter({ lat: data.data[0].latitude, lng: data.data[0].longitude });
        }
      }
    } catch {
      setError("대여소 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentRental = async () => {
    if (!isLoggedIn) {
      setRentedBike(null);
      setElapsedTime(0);
      return;
    }
    try {
      const data = await getCurrentRental();
      if (data.success && data.data) {
        // Rental 타입을 RentedBikeInfo 타입으로 변환
        const rentalInfo: RentedBikeInfo = {
          rental_id: data.data.rental_id,
          start_time: data.data.start_time,
          start_station_name: (data.data as { start_station_name?: string }).start_station_name || '', // API에서 제공하지 않으면 빈 문자열
          bike_id: data.data.bike_id
        };
        setRentedBike(rentalInfo);
        // elapsedTime은 useEffect에서 계산하므로 여기서는 설정하지 않음
      } else {
        setRentedBike(null);
        setElapsedTime(0);
      }
    } catch (err) {
      console.error("현재 대여 정보 로드 실패", err);
      setRentedBike(null);
      setElapsedTime(0);
    }
  };
  
  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchStations("", position.coords.latitude, position.coords.longitude);
          setMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          setError("위치 정보를 가져올 수 없습니다.");
        }
      );
    }
  };

  // 지도 드래그 종료 시 새로운 중심 좌표 기준으로 대여소 조회
  const handleMapDragEnd = (map: any) => {
    const center = map.getCenter();
    const newLat = center.getLat();
    const newLng = center.getLng();
    
    // 지도 중심 좌표 업데이트
    setMapCenter({ lat: newLat, lng: newLng });
    
    // 검색어는 유지하되 새로운 위치 기준으로 대여소 조회
    fetchStations(searchQuery, newLat, newLng);
  };

  // --- 대여/반납 로직 ---
  const handleStationClick = async (station: Station) => {
    setSelectedStation(station);
    setSelectedBike(null);
    setMapCenter({ lat: station.latitude, lng: station.longitude }); // 지도 중심 이동
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAvailableBikes(station.station_id);
      if (data.success && data.data) {
        setBikes(data.data);
      }
    } catch {
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
    
    const response = await rentBike(selectedBike.bike_id, selectedStation.station_id);
    
    if (response.success) {
      alert("대여가 완료되었습니다!");
      await fetchCurrentRental();
      setSelectedBike(null);
      setSelectedStation(null);
      setBikes([]);
    } else {
      const errorMessage = response.message || "대여에 실패했습니다.";
      
      // 이용권이 없는 경우 처리
      if (errorMessage.includes("이용권")) {
        const goToPurchase = window.confirm(
          "이용권이 없습니다.\n이용권 구매 페이지로 이동하시겠습니까?"
        );
        if (goToPurchase) {
          navigate('/purchase');
        }
      } else {
        setError(errorMessage);
      }
    }
    
    setIsLoading(false);
  };

  // 반납 확인 다이얼로그 열기
  const handleReturnClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!rentedBike) {
      setError("반납할 자전거가 없습니다.");
      return;
    }
    if (!selectedStation) {
      setError("반납할 대여소를 선택해주세요.");
      return;
    }
    setReturnDialog({ open: true, station: selectedStation });
  };

  // 실제 반납 처리
  const handleConfirmReturn = async () => {
    if (!returnDialog.station || !rentedBike) return;

    setReturning(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await returnBike(returnDialog.station.station_id);
      
      if (response.success) {
        // 반납 성공
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        setSuccessMessage(`${returnDialog.station.name}에 반납이 완료되었습니다.\n이용 시간: ${minutes}분 ${seconds}초`);
        
        // 상태 초기화
        setRentedBike(null);
        setElapsedTime(0);
        setSelectedStation(null);
        setReturnDialog({ open: false, station: null });
        
        // 대여소 목록 새로고침
        await fetchStations(searchQuery);
        
        // 성공 메시지 3초 후 자동 제거
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.message || "반납에 실패했습니다.");
      }
    } catch (err: unknown) {
      console.error("반납 에러:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "반납에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setReturning(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (rentedBike && rentedBike.start_time) {
      // 즉시 경과 시간 계산
      const updateElapsedTime = () => {
        const now = new Date();
        const startTime = new Date(rentedBike.start_time);
        
        // start_time이 유효한 날짜인지 확인
        if (isNaN(startTime.getTime())) {
          console.error('Invalid start_time in useEffect:', rentedBike.start_time);
          setElapsedTime(0);
          return;
        }
        
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(Math.max(0, diff)); // 음수 방지
      };
      
      // 초기 계산
      updateElapsedTime();
      
      // 1초마다 업데이트
      const interval = setInterval(updateElapsedTime, 1000);
      return () => clearInterval(interval);
    } else {
      // rentedBike가 없으면 elapsedTime을 0으로 초기화
      setElapsedTime(0);
    }
  }, [rentedBike]);

  return (
    <KakaoMapLoader>
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
              onClick={handleReturnClick}
              className="w-full mt-4 bg-[#00A862] hover:bg-[#008F54]"
              disabled={!selectedStation || isLoading || returning}
            >
              {returning ? "반납 중..." : selectedStation ? `${selectedStation.name.replace(/^\d+\.\s*/, '')}에 반납하기` : "반납할 대여소 선택"}
            </Button>
          </Card>
        </div>
      )}

       <div className="container mlpx-9 py-7 max-w-full">
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-400 rounded flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <div className="whitespace-pre-line">{successMessage}</div>
          </div>
        )}
        <div className="mb-8 pl-10 ">
          <h1 className="mb-2">대여소 찾기</h1>
          <p className="text-gray-600">가까운 대여소를 찾아 자전거를 대여하세요</p>
        </div>
         <div className="flex flex-row gap-5 h-[700px] pl-10 w-full">
          <div className="w-56 flex-shrink-0 flex flex-col">
            <div className="mb-4 flex gap-2 flex-shrink-0">
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
            <div className="space-y-3 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
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

      {/* 지도와 자전거 목록을 포함하는 영역 */}
      <div className="flex-1 relative min-w-0 h-full">
        <div className="h-full">
          <Card className="w-full h-full overflow-hidden rounded-lg">
            <Map // 카카오 맵 컴포넌트
              center={mapCenter}
              style={{ width: "100%", height: "100%"}}
              level={4} // 지도 확대 레벨
              onDragEnd={(map) => handleMapDragEnd(map)}
            >
              {stations.map((station) => {
                const isSelected = selectedStation?.station_id === station.station_id;
                const bikeCount = station.bike_count;
                const markerColor = bikeCount > 10 ? '#00A862' : bikeCount > 3 ? '#F59E0B' : '#EF4444';
                
                // SVG를 URL 인코딩하여 사용
                const svgString = `<svg width="48" height="56" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56">
                  <path d="M24 2C11.869 2 2 11.869 2 24c0 16 22 30 22 30s22-14 22-30C46 11.869 36.131 2 24 2z" fill="${markerColor}" stroke="${isSelected ? '#EF4321C7' : '#fff'}" stroke-width="${isSelected ? '2' : '1'}" stroke-linejoin="round"/>
                  <circle cx="24" cy="20" r="12" fill="white"/>
                  <text x="24" y="21" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${markerColor}" text-anchor="middle" dominant-baseline="middle">${bikeCount}</text>
                </svg>`;
                const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
                
                return (
                  <MapMarker
                    key={station.station_id}
                    position={{ lat: station.latitude, lng: station.longitude }}
                    onClick={() => handleStationClick(station)}
                    image={{
                      src: svgUrl,
                      size: { width: 40, height: 46 },
                      options: {
                        offset: { x: 24, y: 56 }
                      }
                    }}
                  >
                    <div style={{padding: '5px', color: '#000', textAlign: 'center', fontSize: '10px'}}>
                      {station.name.replace(/^\d+\.\s*/, '')}
                    </div>
                  </MapMarker>
                );
              })}
            </Map>
          </Card>
        </div>
        
         {/* 자전거 목록 슬라이드 패널 */}
         <div className={`absolute top-0 right-1 h-full w-96 bg-white rounded border-gray-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
           selectedStation && !rentedBike ? 'translate-x-0' : 'translate-x-full'
         }`}>
          {selectedStation && !rentedBike && (
            <>
              <div className="p-6 rounded border-b border-gray-200 bg-gradient-to-r from-[#00A862]/10 to-white shrink-0 rounded-tl-xl">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold mb-1 text-gray-800">{selectedStation.name.replace(/^\d+\.\s*/, '')}</h2>
                  <button 
                    onClick={() => { setSelectedStation(null); setBikes([]); setSelectedBike(null);}} 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-[#00A862]" />
                    <span className="text-gray-600">이용 가능:</span>
                    <span className="font-bold text-[#00A862]">{selectedStation.bike_count}대</span>
                  </span>
                  {selectedStation.distance_km && (
                    <Badge className="bg-[#00A862] text-white text-xs px-2 py-1 rounded font-medium">
                      {selectedStation.distance_km.toFixed(1)}km
                    </Badge>
                  )}
                </div>
              </div>
              <div className="h-px bg-gray-200 shrink-0" />
              <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-hide">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="font-semibold text-gray-800">이용 가능한 자전거</h3>
                  <Button
                    onClick={handleRent}
                    className="bg-[#00A862] hover:bg-[#008F54] text-white"
                    disabled={!selectedBike || isLoading || !!rentedBike}
                  >
                    {rentedBike ? "이미 대여 중" : (isLoading ? "처리 중..." : "대여하기")}
                  </Button>
                </div>
                {isLoading && bikes.length === 0 && (
                  <div className="text-center text-gray-500 py-12">자전거 정보를 불러오는 중...</div>
                )}
                {!isLoading && bikes.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <Bike className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium mb-1">이용 가능한 자전거가 없습니다</p>
                    <p className="text-sm">다른 대여소를 선택해주세요</p>
                  </div>
                )}
                <div className="space-y-3 pb-4">
                  {bikes.map((bike) => (
                     <Card
                       key={bike.bike_id}
                       className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                         selectedBike?.bike_id === bike.bike_id ? "border-[#00A862] bg-green-50 shadow-md scale-[1.02]" : "border-gray-200 hover:border-gray-300"
                       }`}
                       onClick={() => setSelectedBike(bike)}
                     >
                       <div className="flex items-center gap-3">
                         <div className="flex items-center gap-3 flex-1">
                           <div className={`p-2 rounded-full ${selectedBike?.bike_id === bike.bike_id ? "bg-[#00A862]" : "bg-gray-100"}`}>
                             <Bike className={`w-5 h-5 ${selectedBike?.bike_id === bike.bike_id ? "text-white" : "text-[#00A862]"}`} />
                           </div>
                           <span className="font-medium text-gray-800">자전거 #{bike.bike_id}</span>
                         </div>
                         <Badge className="bg-[#00A862] text-white text-xs px-2 py-1 rounded font-medium">이용 가능</Badge>
                       </div>
                     </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
        </div>
      </div>

      {/* 반납 확인 다이얼로그 */}
      <AlertDialog open={returnDialog.open} onOpenChange={(open) => setReturnDialog({ open, station: returnDialog.station })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>자전거 반납 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {returnDialog.station && rentedBike && (
                <>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">반납할 대여소:</span>
                      <span className="font-semibold">{returnDialog.station.name.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">자전거 번호:</span>
                      <span className="font-semibold">{rentedBike.bike_id}번</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">이용 시간:</span>
                      <span className="font-semibold">
                        {Math.floor(elapsedTime / 60)}분 {elapsedTime % 60}초
                      </span>
                    </div>
                  </div>
                  <p className="mt-4">정말 반납하시겠습니까?</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={returning}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReturn}
              disabled={returning}
              className="bg-[#00A862] hover:bg-[#008F54]"
            >
              {returning ? "반납 중..." : "반납하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </KakaoMapLoader>
  );
}

function KakaoMapLoader({ children }: { children: React.ReactNode }) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_API_KEY || "0ddb80336b17ea45f9f7c27852fbea10", 
  });

  if (loading) return <div className="text-center py-12">지도 로딩 중...</div>;
  if (error) return <div className="text-center py-12 text-red-600">지도 로딩에 실패했습니다. API 키 또는 네트워크 연결을 확인해주세요.</div>;

  return <>{children}</>;
} 