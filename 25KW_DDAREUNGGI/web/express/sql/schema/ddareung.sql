-- contents from OneDrive ddareung.sql
-- =================================================================
-- 테이블 생성 (올바른 순서 적용)
-- =================================================================

-- 1. 대여소 테이블 (참조되는 테이블이므로 먼저 생성)
CREATE TABLE stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    status VARCHAR(20), -- 대여소 상태
    bike_count INT DEFAULT 0, -- 현재 주차된 자전거 수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 자전거 테이블 (lock_status 추가 및 stations 참조)
CREATE TABLE bikes (
    bike_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT,
    status VARCHAR(20),
    lock_status VARCHAR(20) DEFAULT 'locked', -- 자전거 잠금 상태
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
);

-- 3. 회원 테이블 (bikes 참조)
CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20),
    has_subscription BOOLEAN DEFAULT FALSE,  -- 이용권 유무
    current_latitude DOUBLE,                 -- 현재 위치 위도
    current_longitude DOUBLE,                -- 현재 위치 경도
    last_bike_id INT,                        -- 최근 사용한 자전거
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (last_bike_id) REFERENCES bikes(bike_id)
);

-- 4. 대여 기록 테이블 (members, bikes, stations 참조)
CREATE TABLE rentals (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    bike_id INT,
    start_station_id INT,
    end_station_id INT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (bike_id) REFERENCES bikes(bike_id),
    FOREIGN KEY (start_station_id) REFERENCES stations(station_id),
    FOREIGN KEY (end_station_id) REFERENCES stations(station_id)
);


