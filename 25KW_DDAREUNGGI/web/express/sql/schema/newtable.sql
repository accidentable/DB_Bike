-- contents from OneDrive newtable.sql
-- =================================================================
-- 1. 테이블 생성 (DDL)
-- =================================================================

-- 1.1 대여소 테이블
CREATE TABLE stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    status VARCHAR(20),
    bike_count INT DEFAULT 0 CHECK (bike_count >= 0), -- 음수 불가 제약 조건
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 자전거 테이블
CREATE TABLE bikes (
    bike_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT,
    status VARCHAR(20),
    lock_status VARCHAR(20) DEFAULT 'locked',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
);

-- 1.3 회원 테이블 (member_id를 사용자가 직접 입력)
CREATE TABLE members (
    member_id INT PRIMARY KEY,
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

-- 1.4 대여 기록 테이블
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

-- 1.5 FAQ 카테고리 테이블
CREATE TABLE faq_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 FAQ 문서 테이블
CREATE TABLE faq_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES faq_categories(category_id)
);

-- 1.7 FAQ 피드백 테이블
CREATE TABLE faq_feedbacks (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT,
    member_id INT,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES faq_documents(document_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- 1.8 문의/신고 테이블 (reports 확장)
CREATE TABLE inquiries (
    inquiry_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT,
    bike_id INT NULL,
    station_id INT NULL,
    status VARCHAR(20) DEFAULT '처리중',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (category_id) REFERENCES faq_categories(category_id),
    FOREIGN KEY (bike_id) REFERENCES bikes(bike_id),
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
);

-- 1.9 문의 첨부 이미지 테이블
CREATE TABLE inquiry_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    inquiry_id INT,
    image_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(inquiry_id)
);

-- 1.10 게시판 테이블
CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT,
    title VARCHAR(200),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);


