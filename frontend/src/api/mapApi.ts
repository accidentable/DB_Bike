import { useState, useEffect } from 'react';

// Kakao Maps SDK 타입
export interface KakaoMapPosition {
  lat: number;
  lng: number;
}

export interface KakaoMapBounds {
  sw: KakaoMapPosition;
  ne: KakaoMapPosition;
}

// 현재 위치 정보를 가져오는 함수
export const getCurrentLocation = (): Promise<KakaoMapPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

// 두 지점 간의 거리를 계산하는 함수 (Haversine formula)
export const calculateDistance = (
  point1: KakaoMapPosition,
  point2: KakaoMapPosition
): { distance: number; formatted: string } => {
  const R = 6371; // 지구의 반경 (km)
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  // 거리를 형식화된 문자열로 변환
  const formatted = distance < 1
    ? `${(distance * 1000).toFixed(0)}m`
    : `${distance.toFixed(1)}km`;

  return { distance, formatted };
};

// Kakao Maps SDK 로딩 커스텀 훅
export const useKakaoLoader = (config: { appkey: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${config.appkey}&autoload=false`;
    script.async = true;

    const onScriptLoad = () => {
      window.kakao.maps.load(() => {
        setLoading(false);
      });
    };

    const onScriptError = () => {
      setError(new Error('Failed to load Kakao Maps SDK'));
      setLoading(false);
    };

    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
      document.head.removeChild(script);
    };
  }, [config.appkey]);

  return [loading, error] as const;
};

// 기본 지도 설정
export const DEFAULT_CENTER = {
  lat: 37.5665, // 서울시청 위도
  lng: 126.9780 // 서울시청 경도
};

export const DEFAULT_LEVEL = 5; // 기본 줌 레벨

// 주어진 반경(km) 내에 있는지 확인하는 함수
export const isWithinRadius = (
  center: KakaoMapPosition,
  point: KakaoMapPosition,
  radiusKm: number
): boolean => {
  const { distance } = calculateDistance(center, point);
  return distance <= radiusKm;
};