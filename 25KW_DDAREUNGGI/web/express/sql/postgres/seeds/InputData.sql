-- Imported from OneDrive postgrelsql/InputData.sql

-- 2.대여소 (stations) 샘플 데이터 삽입 (DML) 
INSERT INTO stations (station_id, name, latitude, longitude, bike_count, status,  created_at) VALUES
(1, '1. 광화문역 대여소', 37.5668, 126.9780, 2, '정상',NOW() - INTERVAL '6 months'),
(2, '2. 시청역 대여소', 37.4979, 127.0276, 1, '정상',NOW() - INTERVAL '5 months'),
(3, '3. 종각역 대여소', 37.5270, 126.9340, 2, '정상', NOW() - INTERVAL '4 months'),
(5, '5. 을지로입구역 대여소', 37.5569, 126.9239, 1, '정상',NOW() - INTERVAL '4 months'),
(6, '6. 종로3가역 대여소', 37.5713, 126.9918,  2, '점검중',NOW() - INTERVAL '3 months'),
(7, '7. 잊혀진 대여소', 37.5000, 127.0000, 0, '정상',NOW() - INTERVAL '1 year'); -- 초기 상태 '정상'


-- 자전거 (bikes) - 수리중 자전거 포함
INSERT INTO bikes (bike_id, station_id, status, lock_status,created_at) VALUES
(1, 1, '정상', 'LOCKED',NOW() - INTERVAL '1day'),
(2, 1, '정상', 'LOCKED',NOW() - INTERVAL '2day'),
(3, 2, '정상', 'LOCKED',NOW() - INTERVAL '3day'),
(4, 3, '정상', 'LOCKED',NOW() - INTERVAL '4day'),
(6, 3, '정상', 'LOCKED',NOW() - INTERVAL '5day'),
(7, 5, '정상', 'LOCKED',NOW() - INTERVAL '6day'),
(8, 1, '수리중', 'LOCKED',NOW() - INTERVAL '1months'),
(601, 7, '정상', 'LOCKED', NOW() - INTERVAL '1 year'), -- 마지막 대여가 4개월 전인 자전거
(602, 7, '정상', 'LOCKED', NOW() - INTERVAL '1 year'); 

-- bike_count 재조정 (수리중 자전거도 포함된 것으로 가정)
UPDATE stations SET bike_count = 3 WHERE station_id = 1;



-- 회원 (members)
INSERT INTO members (member_id, username, email, password, role, has_subscription, created_at, join_date,last_bike_id) VALUES
(1, 'park', 'park@example.com', 'pass1', 'user', TRUE, NOW() - INTERVAL '1 year', CURRENT_DATE - INTERVAL '1 year',1),
(2, 'kim', 'kim@example.com', 'pass2', 'user', TRUE, NOW() - INTERVAL '8 months', CURRENT_DATE - INTERVAL '8 months',NULL),
(3, 'lee', 'lee@example.com', 'pass3', 'user', FALSE, NOW() - INTERVAL '1 year', CURRENT_DATE - INTERVAL '1 year',3),
(4, 'choi', 'choi@example.com', 'pass4', 'admin', TRUE, NOW() - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days',2),
(5, 'jang', 'jang@example.com', 'pass5', 'user', FALSE, NOW() - INTERVAL '2 months', CURRENT_DATE - INTERVAL '2 months',NULL),
(6, 'ghost_user', 'ghost@example.com', 'pass6', 'user', FALSE, NOW() - INTERVAL '6 months', CURRENT_DATE - INTERVAL '6 months',NULL);




INSERT INTO rentals (member_id, bike_id, start_station_id, end_station_id, start_time, end_time) VALUES
-- 최근 3개월 데이터
(1, 1, 1, 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '45 minutes'),
(1, 2, 1, 3, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month' + INTERVAL '1 hour'),
(2, 3, 1, 3, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days' + INTERVAL '50 minutes'),
-- 3~6개월 전 데이터
(1, 4, 3, 1, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months' + INTERVAL '30 minutes'),
(3, 1, 1, 2, NOW() - INTERVAL '5 months', NOW() - INTERVAL '5 months' + INTERVAL '20 minutes'),
(3, 3, 2, 1, NOW() - INTERVAL '5 months' - INTERVAL '10 days', NOW() - INTERVAL '5 months' - INTERVAL '10 days' + INTERVAL '40 minutes'),
-- 신규 사용자 기록
(4, 2, 1, 5, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '15 minutes'),
-- 폐쇄 대상 대여소(7번 대여소) 관련 기록 - 모두 3개월 이전
(1, 1, 7, 1, NOW() - INTERVAL '7 months', NOW() - INTERVAL '7 months' + INTERVAL '1 hour'), -- 7개월 전
(2, 3, 2, 7, NOW() - INTERVAL '8 months', NOW() - INTERVAL '8 months' + INTERVAL '30 minutes'), -- 8개월 전
--잊혀진 대여소의 자전거(대여되지 않음 4개월간)
(1, 601, 7, 1, NOW() - INTERVAL '4 months', NOW() - INTERVAL '4 months' + INTERVAL '30 minutes'); -- 4개월 전 마지막 대여


