import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Search, Navigation, Bike } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import type {
  KakaoMapPosition
} from "../api/mapApi";
import {
  calculateDistance,
  getCurrentLocation,
  DEFAULT_CENTER,
  DEFAULT_LEVEL,
  isWithinRadius
} from "../api/mapApi";

const SEARCH_RADIUS_KM = 3.0; // 검색 반경 3km

const stations: Station[] = [
  { 
    id: 1, 
    name: "강남역 1번 출구", 
    available: 12, 
    total: 20,
    latitude: 37.498095,
    longitude: 127.027610
  },
  { 
    id: 2, 
    name: "역삼역 2번 출구", 
    available: 8, 
    total: 15,
    latitude: 37.500622,
    longitude: 127.036456
  },
  { 
    id: 3, 
    name: "선릉역 3번 출구", 
    available: 15, 
    total: 25,
    latitude: 37.504479,
    longitude: 127.049008
  },
  { 
    id: 4, 
    name: "삼성역 4번 출구", 
    available: 3, 
    total: 18,
    latitude: 37.508844,
    longitude: 127.063130
  },
  { 
    id: 5, 
    name: "잠실역 5번 출구", 
    available: 20, 
    total: 30,
    latitude: 37.513251,
    longitude: 127.099935
  },
  { 
    id: 6, 
    name: "종로3가역 6번 출구", 
    available: 7, 
    total: 12,
    latitude: 37.571607,
    longitude: 126.991806
  },
  { 
    id: 7, 
    name: "시청역 1번 출구", 
    available: 10, 
    total: 20,
    latitude: 37.565443,
    longitude: 126.977063
  },
  { 
    id: 8, 
    name: "광화문역 2번 출구", 
    available: 5, 
    total: 15,
    latitude: 37.571026,
    longitude: 126.976669
  },
];

interface Station {
  id: number;
  name: string;
  available: number;
  total: number;
  latitude?: number;
  longitude?: number;
}

export function StationMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<KakaoMapPosition | null>(null);
  const [mapCenter, setMapCenter] = useState<KakaoMapPosition>(DEFAULT_CENTER);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        setMapCenter(location);
      } catch (err) {
        console.error("Error getting location:", err);
        setError("위치 정보를 가져올 수 없습니다.");
      }
    };

    initializeLocation();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const nameMatchStations = stations.filter((station) =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (nameMatchStations.length > 0) {
        const firstMatch = nameMatchStations[0];
        if (firstMatch.latitude && firstMatch.longitude) {
          setMapCenter({ lat: firstMatch.latitude, lng: firstMatch.longitude });
        }
      }
    }
  }, [searchQuery]);

  const filteredStations = useMemo(() => {
    // 검색어가 없으면 모든 대여소를 거리순으로 보여줍니다.
    if (!searchQuery) {
      return stations
        .map(station => {
          const distanceResult = userLocation && station.latitude && station.longitude
            ? calculateDistance(userLocation, { lat: station.latitude, lng: station.longitude })
            : null;
          return {
            ...station,
            distance: distanceResult ? distanceResult.formatted : "거리 계산 중...",
            distanceValue: distanceResult ? distanceResult.distance : Infinity
          };
        })
        .sort((a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity));
    }

    // 검색어가 있으면, 이름이 일치하는 대여소를 찾습니다.
    const nameMatchStations = stations.filter((station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 일치하는 대여소가 없으면 빈 목록을 반환합니다.
    if (nameMatchStations.length === 0) {
      return [];
    }

    // 첫 번째로 일치하는 대여소를 '앵커(기준점)'로 설정합니다.
    const anchorStation = nameMatchStations[0];

    if (!anchorStation.latitude || !anchorStation.longitude) {
      // 앵커 대여소에 위치 정보가 없으면, 이름이 일치하는 대여소 목록만 반환합니다.
      return nameMatchStations.map(station => ({ 
        ...station, 
        distance: "거리 정보 없음", 
        distanceValue: Infinity 
      }));
    }

    const anchorPosition = { lat: anchorStation.latitude, lng: anchorStation.longitude };

    // 전체 대여소 목록에서 앵커 대여소 반경 3km 내에 있는 모든 대여소를 필터링합니다.
    return stations
      .filter(station => {
        if (!station.latitude || !station.longitude) return false;
        
        return isWithinRadius(
          anchorPosition,
          { lat: station.latitude, lng: station.longitude },
          SEARCH_RADIUS_KM
        );
      })
      .map(station => {
        const distanceResult = userLocation && station.latitude && station.longitude
          ? calculateDistance(userLocation, { lat: station.latitude, lng: station.longitude })
          : null;
        return {
          ...station,
          distance: distanceResult ? distanceResult.formatted : "거리 계산 중...",
          distanceValue: distanceResult ? distanceResult.distance : Infinity
        };
      })
      .sort((a, b) => (a.distanceValue || Infinity) - (b.distanceValue || Infinity));

  }, [searchQuery, userLocation]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">대여소 찾기</h2>
          <p className="text-gray-600">
            가까운 대여소를 찾아 바로 이용하세요
          </p>
          {error && (
            <p className="text-red-500 mt-2 text-sm">{error}</p>
          )}
          {searchQuery && (
            <p className="text-gray-500 mt-2 text-sm">
              검색어와 일치하는 대여소 및 해당 대여소 주변 {SEARCH_RADIUS_KM}km 반경 내의 대여소를 표시합니다.
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="rounded-lg overflow-hidden h-[500px] relative">
            <Map
              center={mapCenter}
              style={{ width: "100%", height: "100%" }}
              level={DEFAULT_LEVEL}
              onCenterChanged={(map) => setMapCenter({
                lat: map.getCenter().getLat(),
                lng: map.getCenter().getLng()
              })}
            >
              {stations.map((station) => station.latitude && station.longitude && (
                <React.Fragment key={station.id}>
                  <MapMarker
                    position={{
                      lat: station.latitude,
                      lng: station.longitude
                    }}
                    onClick={() => setSelectedStation(station.id)}
                    image={{
                      src: selectedStation === station.id 
                        ? "/marker-selected.svg" 
                        : "/marker-default.svg",
                      size: { width: 45, height: 45 },
                    }}
                  />
                  {selectedStation === station.id && (
                    <CustomOverlayMap
                      position={{
                        lat: station.latitude,
                        lng: station.longitude
                      }}
                      yAnchor={1.5}
                    >
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">{station.name}</h3>
                        <div className="space-y-2">
                          {Array.from({ length: station.available }).map((_, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-green-50 cursor-pointer"
                            >
                              <Bike className="w-5 h-5 text-[#00A862]" />
                              <span className="text-sm">자전거 #{i + 1}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-sm text-gray-500">
                          이용 가능: {station.available}/{station.total}
                        </div>
                      </div>
                    </CustomOverlayMap>
                  )}
                </React.Fragment>
              ))}
              {userLocation && (
                <MapMarker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  image={{
                    src: "/my-location.svg",
                    size: { width: 35, height: 35 },
                  }}
                />
              )}
            </Map>
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
              <Button 
                variant="outline" 
                size="icon"
                onClick={async () => {
                  try {
                    const location = await getCurrentLocation();
                    setUserLocation(location);
                    setMapCenter(location);
                  } catch (err) {
                    console.error("Error getting location:", err);
                    setError("위치 정보를 가져올 수 없습니다.");
                  }
                }}
                title="내 위치 기준으로 정렬"
              >
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
