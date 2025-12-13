import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Search, Navigation, Bike, Star } from "lucide-react";
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
import { addFavoriteStation, removeFavoriteStation, getFavoriteStations, getStations } from "../api/stationApi";
import { useAuth } from "../contexts/AuthContext";

const SEARCH_RADIUS_KM = 3.0; // 검색 반경 3km

interface Station {
  id?: number;
  station_id?: number;
  name: string;
  available?: number;
  bike_count?: number;
  total?: number;
  latitude?: number;
  longitude?: number;
  distance?: string;
  distanceValue?: number;
}

export function StationMap() {
  const [stations, setStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<KakaoMapPosition | null>(null);
  const [mapCenter, setMapCenter] = useState<KakaoMapPosition>(DEFAULT_CENTER);
  const [error, setError] = useState<string | null>(null);
  const [favoriteStationIds, setFavoriteStationIds] = useState<Set<number>>(new Set());
  const { isLoggedIn } = useAuth();

  console.log('StationMap mounted, stations:', stations);

  // 대여소 목록 로드
  useEffect(() => {
    console.log('StationMap useEffect fired - fetching stations');
    const fetchStations = async () => {
      try {
        const response = await getStations();
        console.log('Stations API response:', response);
        if (response.success && response.data) {
          console.log('Loaded stations:', response.data);
          setStations(response.data);
        } else {
          console.log('API response not successful or no data');
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
      }
    };
    fetchStations();
  }, []);

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

  // 로그인된 사용자의 즐겨찾기 목록 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      const fetchFavorites = async () => {
        try {
          const response = await getFavoriteStations();
          if (response.success && response.data) {
            const favoriteIds = new Set(response.data.map((station: any) => station.station_id));
            setFavoriteStationIds(favoriteIds);
          }
        } catch (err) {
          console.error("Error fetching favorites:", err);
        }
      };
      fetchFavorites();
    }
  }, [isLoggedIn]);

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

  console.log('filteredStations:', filteredStations, 'stations:', stations, 'searchQuery:', searchQuery);

  const handleToggleFavorite = async (stationId: number | undefined, e: React.MouseEvent) => {
    if (!stationId) return;
    e.stopPropagation(); // 대여소 카드 클릭 이벤트 방지
    
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const isFavorited = favoriteStationIds.has(stationId);
      const response = isFavorited
        ? await removeFavoriteStation(stationId)
        : await addFavoriteStation(stationId);

      if (response.success) {
        const newFavorites = new Set(favoriteStationIds);
        if (isFavorited) {
          newFavorites.delete(stationId);
        } else {
          newFavorites.add(stationId);
        }
        setFavoriteStationIds(newFavorites);
      } else {
        alert(response.message || "작업 실패");
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("작업 중 오류가 발생했습니다.");
    }
  };

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
              {stations.map((station) => {
                const stationId = station.station_id || station.id;
                return station.latitude && station.longitude && (
                <React.Fragment key={stationId}>
                  <MapMarker
                    position={{
                      lat: station.latitude,
                      lng: station.longitude
                    }}
                    onClick={() => setSelectedStation(stationId || null)}
                    image={{
                      src: selectedStation === stationId 
                        ? "/marker-selected.svg" 
                        : "/marker-default.svg",
                      size: { width: 45, height: 45 },
                    }}
                  />
                  {selectedStation === stationId && (
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
                          {Array.from({ length: station.available || station.bike_count || 0 }).map((_, i) => (
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
                          이용 가능: {station.available || station.bike_count || 0}/{station.total || 20}
                        </div>
                      </div>
                    </CustomOverlayMap>
                  )}
                </React.Fragment>
              );
              })}

              {userLocation && (
                <MapMarker
                  position={{ lat: userLocation.lat, lng: userLocation.lng }}
                  image={{
                    src: "/my-location-red.svg",
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
              {filteredStations && filteredStations.length > 0 ? (
                filteredStations.map((station) => {
                  const stationId = station.station_id || station.id;
                  const available = station.available || station.bike_count || 0;
                  const total = station.total || 20;
                  return (
                  <Card
                    key={stationId}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedStation === stationId ? "border-[#00A862] bg-green-50" : ""
                    }`}
                    onClick={() => setSelectedStation(stationId || null)}
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
                          이용 가능 자전거: {available}대 / {total}대
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleFavorite(stationId, e)}
                          className="p-2 hover:bg-gray-100 rounded-full transition"
                          title={stationId && favoriteStationIds.has(stationId) ? "즐겨찾기 제거" : "즐겨찾기 추가"}
                        >
                          <Star
                            className="w-5 h-5 transition"
                            style={{
                              fill: stationId && favoriteStationIds.has(stationId) ? "#FFD700" : "none",
                              color: stationId && favoriteStationIds.has(stationId) ? "#FFD700" : "#999",
                            }}
                          />
                        </button>
                        <MapPin className="w-5 h-5 text-[#00A862]" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          available / total > 0.5
                            ? "bg-[#00A862]"
                            : available / total > 0.2
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${(available / total) * 100}%`,
                        }}
                      />
                    </div>
                  </Card>
                );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  대여소를 찾을 수 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
