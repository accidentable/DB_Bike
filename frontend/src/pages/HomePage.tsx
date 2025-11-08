import { useState, useEffect } from "react";
import { MapPin, Search, Navigation, Bike, Battery, Clock, CheckCircle2, X } from "lucide-react";
import { rentBike as rentBikeApi, returnBike as returnBikeApi, getCurrentRental, isLoggedIn } from "../api/client";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Header } from "../components/layout/Header";

interface StationFinderPageProps {
  onClose: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onNoticeClick: () => void;
  onCommunityClick: () => void;
  onPurchaseClick: () => void;
  onFaqClick: () => void;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onRankingClick: () => void;
}

interface RentedBikeInfo {
  bike: Bike;
  station: Station;
  startTime: Date;
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

export function StationFinderPage({ onClose, onLoginClick, onSignupClick, onNoticeClick, onCommunityClick, onPurchaseClick, onFaqClick, onHomeClick, onProfileClick, onRankingClick }: StationFinderPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [rentalAction, setRentalAction] = useState<"rent" | "return" | null>(null);
  const [rentedBike, setRentedBike] = useState<RentedBikeInfo | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 대여소 데이터 로드
  useEffect(() => {
    const loadStations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/stations');
        if (response.ok) {
          const data = await response.json();
          setStations(data.data || []);
        }
      } catch (error) {
        console.error("Error loading stations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStations();
  }, []);

  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRent = () => {
    if (selectedBike && selectedStation) {
      setRentalAction("rent");
      setTimeout(() => {
        setRentedBike({
          bike: selectedBike,
          station: selectedStation,
          startTime: new Date(),
        });
        setRentalAction(null);
        setSelectedBike(null);
        setSelectedStation(null);
      }, 1000);
    }
  };

  const handleReturn = () => {
    if (rentedBike) {
      setRentalAction("return");
      setTimeout(() => {
        alert(`?�전거�? 반납?�습?�다! ?�용 ?�간: ${Math.floor(elapsedTime / 60)}�?${elapsedTime % 60}�?);
        setRentedBike(null);
        setElapsedTime(0);
        setRentalAction(null);
      }, 1000);
    }
  };

  // ?�???�간 ?�?�머
  useEffect(() => {
    if (rentedBike) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - rentedBike.startTime.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rentedBike]);

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
        onProfileClick={onProfileClick}
        onRankingClick={onRankingClick}
      />

      {/* ?�???�태 �?*/}
      {rentedBike && (
        <div className="fixed bottom-4 right-4 z-40 w-80">
          <Card className="p-4 shadow-lg border-2 border-[#00A862] bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-[#00A862]" />
                ?�??�?
              </h3>
            </div>
            <Separator className="mb-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">?�전�?번호</span>
                <span>{rentedBike.bike.number}�?/span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">?�???�소</span>
                <span className="text-right">{rentedBike.station.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">배터�?/span>
                <span className="flex items-center gap-1">
                  <Battery className="w-4 h-4 text-[#00A862]" />
                  {rentedBike.bike.battery}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">?�용 ?�간</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#00A862]" />
                  {Math.floor(elapsedTime / 60)}�?{elapsedTime % 60}�?
                </span>
              </div>
            </div>
            <Button
              onClick={handleReturn}
              className="w-full mt-4 bg-[#00A862] hover:bg-[#008F54]"
              disabled={rentalAction === "return"}
            >
              {rentalAction === "return" ? "반납 �?.." : "반납?�기"}
            </Button>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">?�?�소 찾기</h1>
          <p className="text-gray-600">가까운 ?�?�소�?찾아 ?�전거�? ?�?�하?�요</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Station List */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="?�?�소 ?�름 ?�는 주소 검??
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
                        이용 가능 <span className="text-[#00A862]">{station.available}대</span> / {station.total}대
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
                          ?�용 가?? {selectedStation.available}?�
                        </span>
                        <span className="text-gray-500">�?{selectedStation.total}?�</span>
                      </div>
                    </div>
                    <Badge className="bg-[#00A862]">{selectedStation.distance}</Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between mb-4">
                    <h3>?�용 가?�한 ?�전�?/h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRent}
                        className="bg-[#00A862] hover:bg-[#008F54]"
                        disabled={!selectedBike || rentalAction !== null}
                      >
                        ?�?�하�?
                      </Button>
                      <Button
                        onClick={handleReturn}
                        variant="outline"
                        className="border-[#00A862] text-[#00A862] hover:bg-green-50"
                        disabled={rentalAction !== null}
                      >
                        반납?�기
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
                            <Badge className="bg-[#00A862]">?�용 가??/Badge>
                          ) : bike.status === "rented" ? (
                            <Badge variant="secondary">?�?�중</Badge>
                          ) : (
                            <Badge variant="destructive">?�비�?/Badge>
                          )}
                        </div>

                        {bike.status === "available" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">배터�?/span>
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
                          <h3 className="mb-1">?�택???�전�?/h3>
                          <p className="text-sm text-gray-600">
                            ?�전�?#{selectedBike.number} | 배터�?{selectedBike.battery}%
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
                        {rentalAction === "rent" ? "?�??�?.." : "?�?�하�?}
                      </Button>
                    </Card>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="mb-2 text-gray-600">?�?�소�??�택?�세??/h3>
                <p className="text-sm text-gray-500">
                  ?�쪽 목록?�서 ?�?�소�??�택?�면 ?�용 가?�한 ?�전거�? ?�인?????�습?�다.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
