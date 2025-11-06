-- contents from OneDrive table.sql

-- 1. 대여소 테이블 생성 (CHECK 제약 조건 추가)
CREATE TABLE stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    status VARCHAR(20),
    bike_count INT DEFAULT 0 CHECK (bike_count >= 0), -- 음수 불가 제약 조건
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 자전거 테이블 생성
CREATE TABLE bikes (
    bike_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT,
    status VARCHAR(20),
    lock_status VARCHAR(20) DEFAULT 'locked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
);

-- 3. 회원 테이블 생성
CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20),
    has_subscription BOOLEAN DEFAULT FALSE,
    current_latitude DOUBLE,
    current_longitude DOUBLE,
    last_bike_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (last_bike_id) REFERENCES bikes(bike_id)
);

-- 4. 나머지 테이블 생성
CREATE TABLE rentals (
    rental_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT, bike_id INT, start_station_id INT, end_station_id INT,
    start_time TIMESTAMP, end_time TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (bike_id) REFERENCES bikes(bike_id),
    FOREIGN KEY (start_station_id) REFERENCES stations(station_id),
    FOREIGN KEY (end_station_id) REFERENCES stations(station_id)
);


