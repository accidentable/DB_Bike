-- ---mock data---
-- 
-- stations
INSERT INTO stations (name, latitude, longitude, rack_count, status)
VALUES
('광화문역 대여소', 37.5714, 126.9768, 10, '정상'),
('시청역 대여소', 37.5657, 126.9784, 8, '정상'),
('종각역 대여소', 37.5693, 126.9826, 6, '정상'),
('을지로입구역 대여소', 37.5660, 126.9833, 4, '정상');

-- bikes
INSERT INTO bikes (station_id, status)
VALUES
(1, '대여중'),
(2, '정상'),
(3, '정상'),
(1, '정상'),
(2, '정상');

-- memebers
INSERT INTO members (username, email, password, role, has_subscription, current_latitude, current_longitude, last_bike_id)
VALUES
('park', 'park@example.com', '1234', 'user', TRUE, 37.5665, 126.9780, 1),
('kim', 'kim@example.com', 'abcd', 'user', FALSE, 37.5700, 126.9900, NULL);

-- rentals
INSERT INTO rentals (member_id, bike_id, start_station_id, start_time)
VALUES
(1, 1, 1, NOW());

-- ---QUERY---
-- 현재 내 위치 확인
SELECT current_latitude, current_longitude
FROM members
WHERE member_id = 1;

-- 근처 대여소 찾기
SELECT station_id, name, latitude, longitude,
       SQRT(POW(latitude - 37.5665, 2) + POW(longitude - 126.9780, 2)) AS distance
FROM stations
ORDER BY distance ASC
LIMIT 5;

-- 상태 정상 대여소만 필터링
SELECT station_id, name, rack_count
FROM stations
WHERE status = '정상'
ORDER BY rack_count DESC;

-- 빈 거치대 계산
SELECT s.station_id, s.name,
       s.rack_count - COUNT(b.bike_id) AS available_racks
FROM stations s
LEFT JOIN bikes b ON s.station_id = b.station_id
GROUP BY s.station_id, s.name, s.rack_count
HAVING available_racks > 0
ORDER BY available_racks DESC;

-- 내 자전거 정보 확인
SELECT m.last_bike_id, b.status, b.station_id
FROM members m
JOIN bikes b ON m.last_bike_id = b.bike_id
WHERE m.member_id = 1;

-- 자전거 상태 & 위치 업데이트 (반납)
UPDATE bikes
SET station_id = 3, status = '정상'
WHERE bike_id = (
  SELECT last_bike_id FROM members WHERE member_id = 1
);

-- 대여 기록 종료
UPDATE rentals
SET end_station_id = 3, end_time = NOW()
WHERE member_id = 1 AND end_time IS NULL;

-- last_bike_id 가장 최근 반납 자전거로 갱신
UPDATE members
SET last_bike_id = (
  SELECT bike_id
  FROM rentals
  WHERE member_id = 1
  ORDER BY end_time DESC
  LIMIT 1
)
WHERE member_id = 1;

-- 최근 반납 내역 + 마지막 이용 자전거 조회
SELECT 
  r.rental_id,
  m.username,
  m.last_bike_id,
  b.status AS bike_status,
  s.name AS end_station,
  r.end_time
FROM rentals r
JOIN members m ON r.member_id = m.member_id
JOIN bikes b ON m.last_bike_id = b.bike_id
JOIN stations s ON r.end_station_id = s.station_id
WHERE r.member_id = 1
ORDER BY r.end_time DESC
LIMIT 1;


