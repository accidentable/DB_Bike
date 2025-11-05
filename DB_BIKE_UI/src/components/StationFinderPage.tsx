import { useState } from "react";
import { MapPin, Search, Navigation, Bike, Battery, Clock, CheckCircle2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Header } from "./Header";

interface StationFinderPageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
}

interface Station {
  id: number;
  name: string;
  address: string;
  available: number;
  total: number;
  distance: string;
  bikes: Bike[];
}

interface Bike {
  id: string;
  number: string;
  battery: number;
  status: "available" | "rented" | "maintenance";
}

const mockStations: Station[] = [
  {
    id: 1,
    name: "강남역 1번 출구",
    address: "서울시 강남구 강남대로 지하 396",
    available: 12,
    total: 20,
    distance: "0.2km",
    bikes: [
      { id: "b1", number: "1001", battery: 95, status: "available" },
      { id: "b2", number: "1002", battery: 87, status: "available" },
      { id: "b3", number: "1003", battery: 72, status: "available" },
      { id: "b4", number: "1004", battery: 91, status: "available" },
      { id: "b5", number: "1005", battery: 0, status: "rented" },
      { id: "b6", number: "1006", battery: 88, status: "available" },
      { id: "b7", number: "1007", battery: 65, status: "available" },
      { id: "b8", number: "1008", battery: 0, status: "rented" },
    ],
  },
  {
    id: 2,
    name: "역삼역 2번 출구",
    address: "서울시 강남구 테헤란로 지하 151",
    available: 8,
    total: 15,
    distance: "0.5km",
    bikes: [
      { id: "b9", number: "2001", battery: 93, status: "available" },
      { id: "b10", number: "2002", battery: 78, status: "available" },
      { id: "b11", number: "2003", battery: 0, status: "rented" },
      { id: "b12", number: "2004", battery: 85, status: "available" },
      { id: "b13", number: "2005", battery: 69, status: "available" },
    ],
  },
  {
    id: 3,
    name: "선릉역 3번 출구",
    address: "서울시 강남구 선릉로 428",
    available: 15,
    total: 25,
    distance: "0.7km",
    bikes: [
      { id: "b14", number: "3001", battery: 96, status: "available" },
      { id: "b15", number: "3002", battery: 82, status: "available" },
      { id: "b16", number: "3003", battery: 77, status: "available" },
      { id: "b17", number: "3004", battery: 91, status: "available" },
      { id: "b18", number: "3005", battery: 88, status: "available" },
      { id: "b19", number: "3006", battery: 0, status: "rented" },
    ],
  },
  {
    id: 4,
    name: "삼성역 4번 출구",
    address: "서울시 강남구 영동대로 지하 524",
    available: 3,
    total: 18,
    distance: "0.9km",
    bikes: [
      { id: "b20", number: "4001", battery: 71, status: "available" },
      { id: "b21", number: "4002", battery: 0, status: "rented" },
      { id: "b22", number: "4003", battery: 83, status: "available" },
      { id: "b23", number: "4004", battery: 0, status: "rented" },
    ],
  },
];

export function StationFinderPage({ onClose, onLoginClick, onSignupClick, onNoticeClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick }: StationFinderPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [rentalAction, setRentalAction] = useState<"rent" | "return" | null>(null);

  const filteredStations = mockStations.filter((station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRent = () => {
    if (selectedBike) {
      setRentalAction("rent");
      setTimeout(() => {
        alert(`자전거 ${selectedBike.number}번을 대여했습니다!`);
        setRentalAction(null);
        setSelectedBike(null);
      }, 1000);
    }
  };

  const handleReturn = () => {
    if (selectedStation) {
      setRentalAction("return");
      setTimeout(() => {
        alert(`${selectedStation.name}에 자전거를 반납했습니다!`);
        setRentalAction(null);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onStationFinderClick={onClose}
        onNoticeClick={onNoticeClick}
        onCommunityClick={onCommunityClick}
        onPurchaseClick={onPurchaseClick}
        onFaqClick={onFaqClick}
        onHomeClick={onHomeClick}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">대여소 찾기</h1>
          <p className="text-gray-600">가까운 대여소를 찾아 자전거를 대여하세요</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Station List */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="대여소 이름 또는 주소 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 h-[calc(100vh-280px)] overflow-y-auto">
              {filteredStations.map((station) => (
                <Card
                  key={station.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedStation?.id === station.id ? "border-[#00A862] bg-green-50" : ""
                  }`}
                  onClick={() => {
                    setSelectedStation(station);
                    setSelectedBike(null);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base">{station.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {station.distance}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{station.address}</p>
                      <p className="text-sm text-gray-600">
                        이용 가능: <span className="text-[#00A862]">{station.available}대</span> / {station.total}대
                      </p>
                    </div>
                    <MapPin className="w-5 h-5 text-[#00A862]" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        station.available / station.total > 0.5
                          ? "bg-[#00A862]"
                          : station.available / station.total > 0.2
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${(station.available / station.total) * 100}%`,
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Station Detail & Bike List */}
          <div className="lg:col-span-2">
            {selectedStation ? (
              <Card className="p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="mb-2">{selectedStation.name}</h2>
                      <p className="text-sm text-gray-600 mb-1">{selectedStation.address}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Bike className="w-4 h-4 text-[#00A862]" />
                          이용 가능: {selectedStation.available}대
                        </span>
                        <span className="text-gray-500">총 {selectedStation.total}대</span>
                      </div>
                    </div>
                    <Badge className="bg-[#00A862]">{selectedStation.distance}</Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between mb-4">
                    <h3>이용 가능한 자전거</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRent}
                        className="bg-[#00A862] hover:bg-[#008F54]"
                        disabled={!selectedBike || rentalAction !== null}
                      >
                        대여하기
                      </Button>
                      <Button
                        onClick={handleReturn}
                        variant="outline"
                        className="border-[#00A862] text-[#00A862] hover:bg-green-50"
                        disabled={rentalAction !== null}
                      >
                        반납하기
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedStation.bikes.map((bike) => (
                      <Card
                        key={bike.id}
                        className={`p-4 transition-all ${
                          bike.status === "available"
                            ? "cursor-pointer hover:shadow-md"
                            : "opacity-50 cursor-not-allowed"
                        } ${
                          selectedBike?.id === bike.id ? "border-[#00A862] bg-green-50" : ""
                        }`}
                        onClick={() => {
                          if (bike.status === "available") {
                            setSelectedBike(bike);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Bike className="w-5 h-5 text-[#00A862]" />
                            <span className="font-medium">#{bike.number}</span>
                          </div>
                          {bike.status === "available" ? (
                            <Badge className="bg-[#00A862]">이용 가능</Badge>
                          ) : bike.status === "rented" ? (
                            <Badge variant="secondary">대여중</Badge>
                          ) : (
                            <Badge variant="destructive">정비중</Badge>
                          )}
                        </div>

                        {bike.status === "available" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">배터리</span>
                              <span className="flex items-center gap-1">
                                <Battery
                                  className={`w-4 h-4 ${
                                    bike.battery > 70
                                      ? "text-[#00A862]"
                                      : bike.battery > 30
                                      ? "text-yellow-500"
                                      : "text-red-500"
                                  }`}
                                />
                                {bike.battery}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  bike.battery > 70
                                    ? "bg-[#00A862]"
                                    : bike.battery > 30
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${bike.battery}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedBike && (
                  <div className="mt-6 pt-6 border-t">
                    <Card className="p-4 bg-green-50 border-[#00A862]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="mb-1">선택한 자전거</h3>
                          <p className="text-sm text-gray-600">
                            자전거 #{selectedBike.number} | 배터리 {selectedBike.battery}%
                          </p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-[#00A862]" />
                      </div>
                      <Button
                        onClick={handleRent}
                        className="w-full bg-[#00A862] hover:bg-[#008F54]"
                        size="lg"
                        disabled={rentalAction !== null}
                      >
                        {rentalAction === "rent" ? "대여 중..." : "대여하기"}
                      </Button>
                    </Card>
                  </div>
                )}
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
