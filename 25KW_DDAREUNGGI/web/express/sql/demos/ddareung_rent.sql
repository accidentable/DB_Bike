-- =================================================================
-- 0. 사전 데이터 준비 (가장 먼저 실행)
-- =================================================================

-- 대여소 데이터 추가
INSERT INTO stations (station_id, name, latitude, longitude, rack_count, status)
VALUES
    (101, '101번 대여소', 37.5660, 126.9770, 20, 'active'),
    (102, '102번 대여소', 35.5660, 121.9770, 20, 'active'),
    (105, '105번 대여소', 37.5670, 126.9790, 15, 'active');

-- 자전거 데이터 추가 (lock_status 추가)
INSERT INTO bikes (bike_id, station_id, status, lock_status)
VALUES (501, 101, 'available', 'locked'),
       (502, 102, 'available', 'locked');


-- =================================================================
-- 1. 회원가입
-- =================================================================

-- 사용자 'user1', 'user2' 추가
INSERT INTO members (username, email, password, role)
VALUES ('user1', 'user1@example.com', 'hashed_password_1', 'USER'),
       ('user2', 'user2@example.com', 'hashed_password_2', 'USER');


-- =================================================================
-- 2. 로그인 및 이용권 구매 (user1으로 진행)
-- =================================================================

-- 'user1'로 로그인 시도
SELECT member_id, username, role, has_subscription
FROM members
WHERE username = 'user1' AND password = 'hashed_password_1';

-- member_id가 1인 사용자('user1')가 이용권을 구매
UPDATE members
SET has_subscription = TRUE
WHERE member_id = 1;


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
    station_id, name, latitude, longitude,
    (@radius * ACOS(
        COS(RADIANS(@my_lat)) * COS(RADIANS(latitude)) *
        COS(RADIANS(longitude) - RADIANS(@my_lon)) +
        SIN(RADIANS(@my_lat)) * SIN(RADIANS(latitude))
    )) AS distance_in_km
FROM stations
WHERE status = 'active'
ORDER BY distance_in_km ASC
LIMIT 5;


-- =================================================================
-- 4. 자전거 대여 및 반납 (user1로 진행)
-- =================================================================

-- 대여 과정 (트랜잭션)
START TRANSACTION;
INSERT INTO rentals (member_id, bike_id, start_station_id, start_time) VALUES (1, 501, 101, NOW());
UPDATE bikes SET status = 'rented', station_id = NULL, lock_status = 'unlocked' WHERE bike_id = 501; -- 잠금 해제
UPDATE members SET last_bike_id = 501 WHERE member_id = 1;
COMMIT;

-- 반납 과정 (트랜잭션)
START TRANSACTION;
UPDATE rentals SET end_time = NOW(), end_station_id = 105 WHERE member_id = 1 AND bike_id = 501 AND end_time IS NULL;
UPDATE bikes SET status = 'available', station_id = 105, lock_status = 'locked' WHERE bike_id = 501; -- 잠금
COMMIT;


