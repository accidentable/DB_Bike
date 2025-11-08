import { useState } from "react";
import { MapPin, Search, Navigation } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const stations = [
  { id: 1, name: "강남역 1번 출구", available: 12, total: 20, distance: "0.2km" },
  { id: 2, name: "역삼역 2번 출구", available: 8, total: 15, distance: "0.5km" },
  { id: 3, name: "선릉역 3번 출구", available: 15, total: 25, distance: "0.7km" },
  { id: 4, name: "삼성역 4번 출구", available: 3, total: 18, distance: "0.9km" },
  { id: 5, name: "잠실역 5번 출구", available: 20, total: 30, distance: "1.2km" },
  { id: 6, name: "종로3가역 6번 출구", available: 7, total: 12, distance: "1.5km" },
  { id: 7, name: "시청역 1번 출구", available: 10, total: 20, distance: "1.8km" },
  { id: 8, name: "광화문역 2번 출구", available: 5, total: 15, distance: "2.0km" },
];

export function StationMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">대여소 찾기</h2>
          <p className="text-gray-600">
            가까운 대여소를 찾아 바로 이용하세요
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-gray-200 rounded-lg overflow-hidden h-[500px] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-[#00A862] mx-auto mb-4" />
                <p className="text-gray-600">지도 영역</p>
                <p className="text-sm text-gray-500 mt-2">
                  실제 서비스에서는 실시간 대여소 위치가 표시됩니다
                </p>
              </div>
            </div>
            {/* Map pins visualization */}
            <div className="absolute top-20 left-32">
              <div className="w-8 h-8 bg-[#00A862] rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute top-40 right-40">
              <div className="w-8 h-8 bg-[#00A862] rounded-full flex items-center justify-center text-white shadow-lg">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute bottom-32 left-1/3">
              <div className="w-8 h-8 bg-[#00A862] rounded-full flex items-center justify-center text-white shadow-lg">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Station List */}
          <div>
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
              <Button variant="outline" size="icon">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 h-[440px] overflow-y-auto">
              {filteredStations.map((station) => (
                <Card
                  key={station.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedStation === station.id ? "border-[#00A862] bg-green-50" : ""
                  }`}
                  onClick={() => setSelectedStation(station.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base">{station.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {station.distance}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        이용 가능 자전거: {station.available}대 / {station.total}대
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
        </div>
      </div>
    </section>
  );
}
