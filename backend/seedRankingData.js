/**
 * 랭킹 페이지용 샘플 데이터 삽입 스크립트
 * 여러 사용자의 대여 기록을 생성하여 랭킹 데이터를 만듭니다.
 */

require('dotenv').config();
const pool = require('./src/config/db.config');
const bcrypt = require('bcrypt');

const sampleUsers = [
  { username: '윤태호', email: 'bike1@example.com', password: 'password123' },
  { username: '박도현현', email: 'bike2@example.com', password: 'password123' },
  { username: '박바이크', email: 'bike3@example.com', password: 'password123' },
  { username: '최사이클', email: 'bike4@example.com', password: 'password123' },
  { username: '정페달', email: 'bike5@example.com', password: 'password123' },
  { username: '강두발', email: 'bike6@example.com', password: 'password123' },
  { username: '윤자전거왕', email: 'bike7@example.com', password: 'password123' },
  { username: '임라이더', email: 'bike8@example.com', password: 'password123' },
  { username: '한사이클러', email: 'bike9@example.com', password: 'password123' },
  { username: '서바이크', email: 'bike10@example.com', password: 'password123' },
  { username: '신페달러', email: 'bike11@example.com', password: 'password123' },
  { username: '오자전거러', email: 'bike12@example.com', password: 'password123' },
  { username: '유따릉이러', email: 'bike13@example.com', password: 'password123' },
  { username: '류바이크러', email: 'bike14@example.com', password: 'password123' },
  { username: '전사이클러', email: 'bike15@example.com', password: 'password123' },
];

// 각 사용자별 대여 기록 데이터 (거리 km, 횟수)
const userRentalData = [
  { distance: 245.8, rides: 32 },  // 1위
  { distance: 198.5, rides: 28 },  // 2위
  { distance: 187.3, rides: 25 },  // 3위
  { distance: 165.2, rides: 22 },  // 4위
  { distance: 152.7, rides: 20 },  // 5위
  { distance: 138.9, rides: 18 },  // 6위
  { distance: 125.4, rides: 16 },  // 7위
  { distance: 112.6, rides: 15 },  // 8위
  { distance: 98.3, rides: 13 },   // 9위
  { distance: 87.5, rides: 12 },   // 10위
  { distance: 76.2, rides: 10 },   // 11위
  { distance: 65.8, rides: 9 },     // 12위
  { distance: 54.3, rides: 7 },    // 13위
  { distance: 43.7, rides: 6 },    // 14위
  { distance: 32.1, rides: 5 },    // 15위
];

const seedRankingData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('랭킹 샘플 데이터 삽입을 시작합니다...');
    
    // 1. 샘플 사용자 생성
    const createdUserIds = [];
    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i];
      
      // 이미 존재하는 사용자인지 확인
      const existingUser = await client.query(
        'SELECT member_id FROM members WHERE email = $1',
        [user.email]
      );
      
      let memberId;
      if (existingUser.rows.length > 0) {
        memberId = existingUser.rows[0].member_id;
        console.log(`사용자 ${user.username}는 이미 존재합니다. (ID: ${memberId})`);
      } else {
        // 새 사용자 생성
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const result = await client.query(
          `INSERT INTO members (username, email, password, role, point_balance)
           VALUES ($1, $2, $3, 'user', 5000)
           RETURNING member_id`,
          [user.username, user.email, hashedPassword]
        );
        memberId = result.rows[0].member_id;
        console.log(`사용자 ${user.username} 생성 완료 (ID: ${memberId})`);
      }
      
      createdUserIds.push(memberId);
    }
    
    // 2. 대여소 정보 가져오기 (최소 2개 필요)
    const stationsResult = await client.query(
      'SELECT station_id FROM stations LIMIT 10'
    );
    
    if (stationsResult.rows.length < 2) {
      throw new Error('대여소가 2개 이상 필요합니다. populateStations.js를 먼저 실행하세요.');
    }
    
    const stationIds = stationsResult.rows.map(row => row.station_id);
    
    // 3. 자전거 정보 가져오기
    const bikesResult = await client.query(
      'SELECT bike_id FROM bikes LIMIT 50'
    );
    
    if (bikesResult.rows.length === 0) {
      throw new Error('자전거가 필요합니다.');
    }
    
    const bikeIds = bikesResult.rows.map(row => row.bike_id);
    
    // 4. 각 사용자별 대여 기록 생성
    console.log('\n대여 기록을 생성합니다...');
    
    for (let i = 0; i < createdUserIds.length; i++) {
      const memberId = createdUserIds[i];
      const rentalInfo = userRentalData[i];
      
      // 기존 대여 기록이 있는지 확인
      const existingRentals = await client.query(
        'SELECT COUNT(*) as count FROM rentals WHERE member_id = $1 AND end_time IS NOT NULL',
        [memberId]
      );
      
      if (parseInt(existingRentals.rows[0].count) > 0) {
        console.log(`사용자 ID ${memberId}는 이미 대여 기록이 있습니다. 건너뜁니다.`);
        continue;
      }
      
      // 대여 기록 생성 (거리를 여러 번 나누어 생성)
      const rides = rentalInfo.rides;
      const totalDistance = rentalInfo.distance;
      const avgDistancePerRide = totalDistance / rides;
      
      // 과거 날짜부터 현재까지 분산
      const daysAgo = 30; // 최근 30일간
      const now = new Date();
      
      for (let j = 0; j < rides; j++) {
        // 랜덤하게 날짜 분산 (최근 30일 내)
        const daysBack = Math.floor(Math.random() * daysAgo);
        const rentalDate = new Date(now);
        rentalDate.setDate(rentalDate.getDate() - daysBack);
        rentalDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
        
        // 시작 시간
        const startTime = rentalDate.toISOString();
        
        // 종료 시간 (30분 ~ 2시간 후)
        const endTime = new Date(rentalDate);
        endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 90) + 30);
        const endTimeStr = endTime.toISOString();
        
        // 거리 (평균 거리 ± 20% 랜덤)
        const distanceVariation = avgDistancePerRide * 0.2;
        const distance = avgDistancePerRide + (Math.random() * distanceVariation * 2 - distanceVariation);
        
        // 시작/종료 대여소 (랜덤 선택)
        const startStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
        let endStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
        // 종료 대여소는 시작과 다르게
        while (endStationId === startStationId && stationIds.length > 1) {
          endStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
        }
        
        // 자전거 (랜덤 선택)
        const bikeId = bikeIds[Math.floor(Math.random() * bikeIds.length)];
        
        // 대여 기록 삽입
        await client.query(
          `INSERT INTO rentals (member_id, bike_id, start_station_id, end_station_id, start_time, end_time, distance_km)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [memberId, bikeId, startStationId, endStationId, startTime, endTimeStr, Math.round(distance * 10) / 10]
        );
      }
      
      console.log(`✓ 사용자 ID ${memberId}: ${rides}회 대여, 총 ${totalDistance.toFixed(1)}km 생성 완료`);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ 랭킹 샘플 데이터 삽입이 완료되었습니다!');
    console.log('\n랭킹 페이지에서 데이터를 확인할 수 있습니다.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

// 스크립트 실행
seedRankingData().catch(err => {
  console.error('스크립트 실행 중 오류:', err);
  process.exit(1);
});

