-- =================================================================
-- 3. 위치 갱신 및 주변 대여소 검색 (user1 기준)
-- =================================================================

-- member_id가 1인 사용자('user1')의 현재 위치를 업데이트
UPDATE members
SET current_latitude = 37.5665, current_longitude = 126.9780
WHERE member_id = 1;

-- 'user1'의 위치를 기반으로 가장 가까운 대여소 5곳을 검색
SET @my_lat = 37.5665;
SET @my_lon = 126.9780;
SET @radius = 6371; -- 지구 반지름(km)

SELECT
    station_id, name, latitude, longitude, bike_count,
    (@radius * ACOS(
        COS(RADIANS(@my_lat)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(@my_lon)) +
        SIN(RADIANS(@my_lat)) * SIN(RADIANS(latitude))
    )) AS distance_in_km
FROM stations
WHERE status = 'active' AND bike_count > 0
ORDER BY distance_in_km ASC
LIMIT 5;

-- =================================================================
-- 4. 자전거 대여 
-- =================================================================
-- 1단계: 대여 기록 생성
INSERT INTO rentals (member_id, bike_id, start_station_id, start_time)
VALUES (1, 501, 101, NOW());

-- 2단계: 자전거 상태 변경 (대여 중, 잠금 해제)
UPDATE bikes
SET
    status = 'rented',
    lock_status = 'unlocked',
    station_id = NULL
WHERE
    bike_id = 501
    AND status = 'available'
    AND lock_status = 'locked';

-- 3단계: 대여소 자전거 수 갱신
UPDATE stations
SET bike_count = bike_count - 1
WHERE station_id = 101 AND bike_count > 0;

-- 4단계: 사용자 정보 갱신
UPDATE members
SET last_bike_id = 501
WHERE member_id = 1;
    
UPDATE members 
SET has_subscription = FALSE 
WHERE member_id = 1;


