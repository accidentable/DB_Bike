-- Imported from OneDrive postgrelsql/ddlall.sql
-- =================================================================
-- 4. 자전거 대여 (단계별 분리) - user1이 1번 자전거 대여 시도 
-- =================================================================
-- !!주의!! 아래 쿼리들은 실제 애플리케이션에서는 Service 계층에서 @Transactional로 묶여야 함

--  임의의 대여기록 삽입
INSERT INTO rentals (member_id, bike_id, start_station_id, start_time) VALUES (1, 1, 1, NOW());

-- 2단계: 자전거 상태 변경 (대여중 -> IN_USE, 대여소 없음) +
UPDATE bikes SET status = '대여중', lock_status = 'IN_USE', station_id = NULL 
WHERE bike_id = 1 AND status = '정상' AND lock_status = 'LOCKED'; 

-- 3단계: 대여소 자전거 수 감소 
UPDATE stations SET bike_count = bike_count - 1 WHERE station_id = 1 AND bike_count > 0;

-- 4단계: 사용자 마지막 대여 자전거 기록
UPDATE members SET last_bike_id = 1 WHERE member_id = 1;


--  대여 기록 갱신 
UPDATE rentals
SET
    end_time = NOW(),        -- 현재 시간으로 대여종료 시간 설정
    end_station_id = 5     -- 대여종료 대여소 ID 설정 
WHERE
    bike_id = 1              -- 해당 자전거 ID
    AND end_time IS NULL;    -- 아직 대여중인 자전거
	
-- -- 자전거 상태 변경 시도(대여종료)
UPDATE bikes SET status = '정상', lock_status = 'LOCKED', station_id = 5
WHERE bike_id = 1 AND status = '대여중' AND lock_status = 'IN_USE'; --대여중 -> 잠금,정상

SELECT * FROM bikes;
-- =================================================================
--  고급/복합 SQL 쿼리 (DQL) - PostgreSQL 버전
-- =================================================================

UPDATE members SET current_latitude = 37.5665, current_longitude = 126.9780 WHERE member_id = 1;
--id 1에 해당하는 유저 위치 업데이트

-- 6.1 주변 대여소 검색 및 총 대여횟수 계산
WITH me AS (
    SELECT current_latitude AS lat, current_longitude AS lon
    FROM members WHERE member_id = 1 -- 특정 사용자 ID 직접 지정
), nearby AS (
    SELECT
        s.station_id, s.name, s.latitude, s.longitude, s.status, s.bike_count,
        (6371 * acos(
            cos(radians(m.lat)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(m.lon)) +
            sin(radians(m.lat)) * sin(radians(s.latitude))
        )) AS distance_km
    FROM stations s CROSS JOIN me m)
SELECT
    n.station_id,
    n.name,
    n.bike_count,
    ROUND(n.distance_km::numeric, 2) AS distance_km_rounded,
    --  각 대여소의 총 대여 횟수를 계산하는 서브쿼리
    (SELECT COUNT(r.rental_id)
        FROM rentals r
        WHERE r.start_station_id = n.station_id -- 해당 대여소에서 출발한 횟수
    ) AS total_rentals_from_here  -- 총 대여 횟수
FROM nearby n -- nearby AS n
WHERE n.status = '정상' AND n.bike_count > 0 -- 조건 필터링
ORDER BY n.distance_km ASC -- 가까운 순 정렬
LIMIT 5; -- 상위 5개 선택

-- 6.2 출발 시 가장 많이 이용된 대여소
SELECT s.name, COUNT(r.rental_id) AS start_count
FROM rentals r JOIN stations s ON r.start_station_id = s.station_id
GROUP BY s.station_id, s.name -- PK 포함
ORDER BY start_count DESC LIMIT 3;

-- 6.3 한 번도 대여한 적 없는 회원 찾기 (LEFT JOIN)
SELECT m.username FROM members m LEFT JOIN rentals r ON m.member_id = r.member_id
WHERE r.rental_id IS NULL;


-- 6.5 2회 이상 대여한 우수 회원 찾기
SELECT m.username, COUNT(r.rental_id) AS rental_count
FROM rentals r JOIN members m ON r.member_id = m.member_id
GROUP BY m.member_id, m.username -- PK 포함
HAVING COUNT(r.rental_id) >= 2;

-- 6.6 사용자별 대여 횟수 및 전체 순위 
SELECT m.username, COUNT(r.rental_id) AS rental_count,
       RANK() OVER (ORDER BY COUNT(r.rental_id) DESC) AS ranking
FROM rentals r JOIN members m ON r.member_id = m.member_id
GROUP BY m.member_id, m.username; -- PK 포함

-- 회원별 등급 부여 
SELECT m.username, COUNT(r.rental_id) AS rental_count,
       CASE WHEN COUNT(r.rental_id) >= 3 THEN '🥇 VVIP'
            WHEN COUNT(r.rental_id) >= 1 THEN '🥈 우수회원'
            ELSE '🌱 신규회원' END AS user_grade
FROM members m LEFT JOIN rentals r ON m.member_id = r.member_id
GROUP BY m.member_id, m.username; -- PK 포함

-- 가장 붐비는 시간대 (대여 시작 기준) 
SELECT EXTRACT(HOUR FROM start_time) AS rental_start_hour, COUNT(rental_id) AS rental_count
FROM rentals GROUP BY rental_start_hour ORDER BY rental_count DESC;

-- 6.10 대여소별 '시작' 건수와 '대여종료' 건수 통합 조회 (UNION ALL)
(SELECT s.name, '대여시작' AS type, COUNT(*) AS count
 FROM rentals r JOIN stations s ON r.start_station_id = s.station_id GROUP BY s.station_id, s.name)
UNION ALL
(SELECT s.name, '대여종료' AS type, COUNT(*) AS count
 FROM rentals r JOIN stations s ON r.end_station_id = s.station_id WHERE r.end_time IS NOT NULL GROUP BY s.station_id, s.name)
ORDER BY name, type;

-- 휴면 계정 처리
UPDATE members
SET username = username || '(휴면계정)' -- 문자열 연결 연산자 사용
WHERE member_id IN (
    SELECT m.member_id
    FROM members m
    LEFT JOIN rentals r ON m.member_id = r.member_id -- 모든 회원을 기준으로 대여 기록 연결
    WHERE
        -- 가입일이 3개월 이전임
        m.created_at < NOW() - INTERVAL '3 months'
        AND
        -- 대여 기록이 전혀 없음
        r.rental_id IS NULL
    GROUP BY m.member_id -- 회원별로 그룹화 (LEFT JOIN 때문에 필요할 수 있음)
)
AND username NOT LIKE '%(휴면계정)'; -- 이미 추가된 경우는 제외 
   

-- 6.12 폐쇄 고려 대상 대여소 조회 
WITH station_stats AS (
    SELECT
        s.station_id, s.name, s.status AS current_status, -- 현재 상태 추가
        COUNT(CASE WHEN r.start_time >= NOW() - INTERVAL '3 months' THEN r.rental_id END) AS total_current_rentals,
        COUNT(CASE WHEN r.end_time >= NOW() - INTERVAL '3 months' THEN r.rental_id END) AS total_current_returns,
        COUNT(CASE WHEN r.start_time >= NOW() - INTERVAL '3 months' AND m.created_at < NOW() - INTERVAL '1 month' THEN r.rental_id END) AS non_new_current_rentals,
        COUNT(CASE WHEN r.end_time >= NOW() - INTERVAL '3 months' AND m.created_at < NOW() - INTERVAL '1 month' THEN r.rental_id END) AS non_new_current_returns,
        COUNT(CASE WHEN r.start_time >= NOW() - INTERVAL '6 months' AND r.start_time < NOW() - INTERVAL '3 months' THEN r.rental_id END) AS previous_period_rentals,
        COUNT(CASE WHEN r.end_time >= NOW() - INTERVAL '6 months' AND r.end_time < NOW() - INTERVAL '3 months' THEN r.rental_id END) AS previous_period_returns
    FROM stations s
    LEFT JOIN rentals r ON s.station_id = r.start_station_id OR s.station_id = r.end_station_id
    LEFT JOIN members m ON r.member_id = m.member_id
    WHERE s.status <> '폐쇄' -- 이미 폐쇄된 곳은 제외하고
    GROUP BY s.station_id, s.name, s.status
)
SELECT station_id, name, current_status, total_current_rentals, total_current_returns, non_new_current_rentals, non_new_current_returns, previous_period_rentals, previous_period_returns
FROM station_stats
WHERE (total_current_rentals = 0 OR total_current_returns = 0)
   OR (previous_period_rentals > 0 AND (COALESCE(non_new_current_rentals, 0)::numeric / previous_period_rentals) < 0.4)
   OR (previous_period_returns > 0 AND (COALESCE(non_new_current_returns, 0)::numeric / previous_period_returns) < 0.4);


-- 폐쇄 대상 대여소 상태 변경
UPDATE stations SET status = '폐쇄'
WHERE station_id IN (
    -- 6.12 쿼리의 결과 (SELECT station_id 부분만)
    SELECT station_id
    FROM (
        WITH station_stats AS (
            SELECT
                s.station_id, s.name, s.status AS current_status,
                COUNT(CASE WHEN r.start_time >= NOW() - INTERVAL '3 months' THEN r.rental_id END) AS total_current_rentals,
                COUNT(CASE WHEN r.end_time >= NOW() - INTERVAL '3 months' THEN r.rental_id END) AS total_current_returns,
                COUNT(CASE WHEN r.start_time >= NOW() - INTERVAL '3 months' AND m.created_at < NOW() - INTERVAL '1 month' THEN r.rental_id END) AS non_new_current_rentals,
                COUNT(CASE WHEN r.end_time >= NOW() - INTERVAL '3 months' AND m.created_at < NOW() - INTERVAL '1 month' THEN r.rental_id END) AS non_new_current_returns,
                COUNT(CASE WHEN r.start_time >= NOW() - INTERVAL '6 months' AND r.start_time < NOW() - INTERVAL '3 months' THEN r.rental_id END) AS previous_period_rentals,
                COUNT(CASE WHEN r.end_time >= NOW() - INTERVAL '6 months' AND r.end_time < NOW() - INTERVAL '3 months' THEN r.rental_id END) AS previous_period_returns
            FROM stations s
            LEFT JOIN rentals r ON s.station_id = r.start_station_id OR s.station_id = r.end_station_id
            LEFT JOIN members m ON r.member_id = m.member_id
            WHERE s.status <> '폐쇄' -- 이미 폐쇄된 곳은 제외
            GROUP BY s.station_id, s.name, s.status
        )
        SELECT station_id
        FROM station_stats
        WHERE (total_current_rentals = 0 OR total_current_returns = 0)
           OR (previous_period_rentals > 0 AND (COALESCE(non_new_current_rentals, 0)::numeric / previous_period_rentals) < 0.4)
           OR (previous_period_returns > 0 AND (COALESCE(non_new_current_returns, 0)::numeric / previous_period_returns) < 0.4)
    ) AS closable_stations
);



-- 3개월간 미사용 자전거 삭제
DELETE FROM bikes b 
WHERE
    --  자전거 상태가 '정상'이고 '잠김' 상태인 경우만 대상 (대여중/수리중 제외)
    b.status = '정상' AND b.lock_status = 'LOCKED'
    AND
    --  해당 자전거의 마지막 대여 시작일이 3개월 이전이거나, 대여 기록이 없는 경우
    NOT EXISTS (
        SELECT 1
        FROM rentals r
        WHERE r.bike_id = b.bike_id
        AND r.start_time >= NOW() - INTERVAL '3 months' -- 최근 3개월 내 대여 기록이 존재하는지 확인
        );
SELECT * FROM bikes WHERE bike_id IN (601, 602);


