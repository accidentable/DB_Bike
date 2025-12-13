// seedDatabase.js
// 전체 데이터베이스 시드 스크립트
// - DB 초기화 (init.sql)
// - 회원 데이터
// - 서울시 공공자전거 대여소 정보 (API)
// - 커뮤니티 게시글 목업 데이터

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pool = require('./src/config/db.config');
const bcrypt = require('bcrypt');

const API_KEY = process.env.SEOUL_API_KEY;

/**
 * 1단계: 데이터베이스 초기화 (init.sql 실행)
 */
async function initializeDatabase() {
  try {
    console.log('\n📝 1단계: 데이터베이스 초기화 중...');
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ 데이터베이스 스키마 생성 완료');
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    throw error;
  }
}

/**
 * 2단계: 서울시 API에서 대여소 정보를 가져오는 함수
 */
async function fetchBikeData(start, end) {
  const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/${start}/${end}/`;
  try {
    const response = await axios.get(url);
    if (!response.data || !response.data.rentBikeStatus) {
      throw new Error('API 응답 형식이 잘못되었습니다');
    }
    return response.data.rentBikeStatus.row || [];
  } catch (error) {
    console.error(`API 호출 중 오류 (범위: ${start}-${end}):`, error.message);
    return [];
  }
}

/**
 * 3단계: 대여소 정보 DB에 저장
 */
async function populateStations() {
  try {
    console.log('\n🚴 2단계: 서울시 공공자전거 대여소 정보 동기화 중...');

    // API 호출 (3개 범위로 나누어 호출)
    const ranges = [
      fetchBikeData(1, 1000),
      fetchBikeData(1001, 2000),
      fetchBikeData(2001, 3000)
    ];

    const results = await Promise.all(ranges);
    const allStations = results.flat();

    if (allStations.length === 0) {
      console.warn('⚠️ API에서 대여소 정보를 가져오지 못했습니다. API 키를 확인하세요.');
      return;
    }

    console.log(`총 ${allStations.length}개의 대여소 정보를 가져왔습니다.`);

    // DB에 저장
    console.log('대여소 정보를 DB에 INSERT합니다...');
    
    const stationInsertPromises = allStations.map(station => {
      const { stationName, stationLatitude, stationLongitude, parkingBikeTotCnt } = station;
      const query = `
        INSERT INTO stations (name, latitude, longitude, bike_count, status)
        VALUES ($1, $2, $3, $4, '정상')
        RETURNING station_id, bike_count
      `;
      return pool.query(query, [
        stationName,
        parseFloat(stationLatitude) || 0,
        parseFloat(stationLongitude) || 0,
        parseInt(parkingBikeTotCnt) || 0
      ]);
    });

    const insertedStationsResults = await Promise.all(stationInsertPromises);
    console.log(`✅ ${insertedStationsResults.length}개 대여소 저장 완료`);

    // 각 대여소마다 초기 재고만큼 자전거 생성
    console.log('각 대여소의 초기 재고만큼 가상 자전거를 생성합니다...');
    
    let totalBikesCreated = 0;
    const bikeInsertPromises = [];

    for (const result of insertedStationsResults) {
      if (!result.rows[0]) continue;
      const { station_id, bike_count } = result.rows[0];
      
      for (let i = 0; i < bike_count; i++) {
        const bikeQuery = `INSERT INTO bikes (station_id, status, lock_status) VALUES ($1, '정상', 'LOCKED')`;
        bikeInsertPromises.push(pool.query(bikeQuery, [station_id]));
      }
      totalBikesCreated += bike_count;
    }

    await Promise.all(bikeInsertPromises);
    console.log(`✅ ${totalBikesCreated}개의 자전거 생성 완료`);

  } catch (error) {
    console.error('대여소 정보 동기화 오류:', error);
    throw error;
  }
}

/**
 * 4단계: 랭킹 데이터 (대여 기록) 추가
 */
async function seedRankingData() {
  try {
    console.log('\n🏆 3단계: 랭킹 데이터 (대여 기록) 생성 중...');

    // 샘플 사용자 데이터
    const sampleUsers = [
      { username: '윤태호', email: 'bike1@example.com' },
      { username: '박도현', email: 'bike2@example.com' },
      { username: '박바이크', email: 'bike3@example.com' },
      { username: '최사이클', email: 'bike4@example.com' },
      { username: '정페달', email: 'bike5@example.com' },
      { username: '강두발', email: 'bike6@example.com' },
      { username: '윤자전거왕', email: 'bike7@example.com' },
      { username: '임라이더', email: 'bike8@example.com' },
      { username: '한사이클러', email: 'bike9@example.com' },
      { username: '서바이크', email: 'bike10@example.com' },
    ];

    // 각 사용자별 대여 거리 및 횟수
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
    ];

    // 1. 샘플 사용자 생성
    const createdUserIds = [];
    for (let i = 0; i < sampleUsers.length; i++) {
      const user = sampleUsers[i];
      
      // 이미 존재하는 사용자인지 확인
      const existingUser = await pool.query(
        'SELECT member_id FROM members WHERE email = $1',
        [user.email]
      );
      
      let memberId;
      if (existingUser.rows.length > 0) {
        memberId = existingUser.rows[0].member_id;
      } else {
        // 새 사용자 생성
        const hashedPassword = await bcrypt.hash('password123', 10);
        const result = await pool.query(
          `INSERT INTO members (username, email, password, role, point_balance)
           VALUES ($1, $2, $3, 'user', 5000)
           RETURNING member_id`,
          [user.username, user.email, hashedPassword]
        );
        memberId = result.rows[0].member_id;
      }
      
      createdUserIds.push(memberId);
    }
    console.log(`  ✓ 랭킹 사용자 ${createdUserIds.length}명 준비 완료`);

    // 2. 대여소 정보 가져오기
    const stationsResult = await pool.query('SELECT station_id FROM stations LIMIT 10');
    
    if (stationsResult.rows.length < 2) {
      console.warn('⚠️ 대여소가 2개 이상 필요합니다. 대여 기록 생성을 건너뜁니다.');
      return;
    }

    const stationIds = stationsResult.rows.map(row => row.station_id);

    // 3. 자전거 정보 가져오기
    const bikesResult = await pool.query('SELECT bike_id FROM bikes LIMIT 50');
    
    if (bikesResult.rows.length === 0) {
      console.warn('⚠️ 자전거가 없습니다. 대여 기록 생성을 건너뜁니다.');
      return;
    }

    const bikeIds = bikesResult.rows.map(row => row.bike_id);

    // 4. 각 사용자별 대여 기록 생성
    let totalRentalsCreated = 0;

    for (let i = 0; i < createdUserIds.length; i++) {
      const memberId = createdUserIds[i];
      const rentalInfo = userRentalData[i];
      
      // 기존 대여 기록이 있는지 확인
      const existingRentals = await pool.query(
        'SELECT COUNT(*) as count FROM rentals WHERE member_id = $1 AND end_time IS NOT NULL',
        [memberId]
      );
      
      if (parseInt(existingRentals.rows[0].count) > 0) {
        continue; // 이미 있으면 건너뛰기
      }
      
      // 대여 기록 생성
      const rides = rentalInfo.rides;
      const totalDistance = rentalInfo.distance;
      const avgDistancePerRide = totalDistance / rides;
      
      const daysAgo = 30;
      const now = new Date();
      
      for (let j = 0; j < rides; j++) {
        // 랜덤 날짜 분산 (최근 30일 내)
        const daysBack = Math.floor(Math.random() * daysAgo);
        const rentalDate = new Date(now);
        rentalDate.setDate(rentalDate.getDate() - daysBack);
        rentalDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
        
        const startTime = rentalDate.toISOString();
        
        const endTime = new Date(rentalDate);
        endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 90) + 30);
        const endTimeStr = endTime.toISOString();
        
        // 거리 계산
        const distanceVariation = avgDistancePerRide * 0.2;
        const distance = avgDistancePerRide + (Math.random() * distanceVariation * 2 - distanceVariation);
        
        // 시작/종료 대여소
        const startStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
        let endStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
        while (endStationId === startStationId && stationIds.length > 1) {
          endStationId = stationIds[Math.floor(Math.random() * stationIds.length)];
        }
        
        // 자전거
        const bikeId = bikeIds[Math.floor(Math.random() * bikeIds.length)];
        
        // 대여 기록 삽입
        await pool.query(
          `INSERT INTO rentals (member_id, bike_id, start_station_id, end_station_id, start_time, end_time, distance_km)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [memberId, bikeId, startStationId, endStationId, startTime, endTimeStr, Math.round(distance * 10) / 10]
        );
        
        totalRentalsCreated++;
      }
    }

    console.log(`  ✓ 대여 기록 ${totalRentalsCreated}개 생성 완료`);
    console.log(`✅ 랭킹 데이터 생성 완료`);

  } catch (error) {
    console.error('랭킹 데이터 생성 오류:', error);
    throw error;
  }
}

/**
 * 5단계: 커뮤니티 게시글 목업 데이터 추가
 */
async function seedPosts() {
  try {
    console.log('\n💬 4단계: 커뮤니티 게시글 목업 데이터 추가 중...');

    // 관리자와 일반 사용자 확인
    const membersResult = await pool.query(
      `SELECT member_id, username, role FROM members WHERE role = 'admin' OR role = 'user' LIMIT 20`
    );
    
    if (membersResult.rows.length === 0) {
      console.warn('⚠️ 회원 데이터가 없습니다. init.sql이 완료되어야 합니다.');
      return;
    }

    const members = membersResult.rows;
    const adminMembers = members.filter(m => m.role === 'admin');
    const userMembers = members.filter(m => m.role === 'user');

    if (adminMembers.length === 0 || userMembers.length === 0) {
      console.warn('⚠️ 관리자 또는 일반 사용자가 없습니다.');
      return;
    }

    const adminId = adminMembers[0].member_id;

    // 기존 게시글 삭제
    await pool.query('DELETE FROM posts WHERE category IN ($1, $2, $3, $4, $5)', 
      ['공지', '이벤트', '자유', '후기', '제안']);

    // 공지사항 (3개)
    const notices = [
      {
        title: '따릉이 이용 규정 안내',
        content: '따릉이를 안전하고 편하게 이용하기 위한 이용 규정을 안내드립니다.\n\n1. 헬멧은 필수입니다\n2. 자전거는 정해진 구역에만 반납 가능합니다\n3. 손상된 자전거는 즉시 신고해주세요\n\n감사합니다.',
        category: '공지',
        is_pinned: true
      },
      {
        title: '시스템 점검 안내 (12월 15일)',
        content: '안녕하세요. 따릉이입니다.\n\n12월 15일(금) 새벽 2:00 ~ 4:00에 시스템 점검이 예정되어 있습니다.\n해당 시간에는 서비스 이용이 불가능할 수 있습니다.\n\n불편을 드려 죄송합니다.',
        category: '공지',
        is_pinned: true
      },
      {
        title: '새로운 기능 추가 안내',
        content: '따릉이 앱이 업데이트되었습니다!\n\n✨ 새로운 기능:\n- 즐겨찾기 대여소 기능\n- 주간 랭킹 시스템\n- 업적 뱃지 시스템\n\n더욱 편해진 따릉이를 이용해주세요!',
        category: '공지',
        is_pinned: true
      }
    ];

    // 이벤트 (2개)
    const events = [
      {
        title: '12월 이용 이벤트 - 포인트 2배 이벤트',
        content: '12월 한 달간 이용한 자전거 요금의 포인트 적립이 2배가 됩니다!\n\n기간: 12월 1일 ~ 12월 31일\n적립 기간: 매월 5일\n\n이 기회를 놓치지 마세요!',
        category: '이벤트',
        is_pinned: true
      },
      {
        title: '따릉이 겨울 안전 캠페인',
        content: '겨울철 자전거 안전 이용을 위한 캠페인에 참여해주세요!\n\n✓ 안전모 착용 필수\n✓ 야간 이용시 라이트 필수\n✓ 빙판길 주의\n\n참여자 추첨을 통해 기프티콘을 드립니다!',
        category: '이벤트',
        is_pinned: true
      }
    ];

    // 자유 게시판 데이터
    const freePostTitles = [
      '따릉이 타고 출근하는데 정말 좋네요!',
      '강남역에서 강북역까지 가는 자전거 경로 추천받아요',
      '자전거 라이딩 팁 공유합니다',
      '오늘 따릉이 타다가 재미있는 일이 있었어요',
      '한강 자전거 길 진짜 경치 미쳤음',
      '따릉이로 운동하면서 포인트도 모으자!',
      '우리 동네 대여소 추천 게시물 모음',
      '자전거 안전 운전 꿀팁 나눔',
    ];

    const freePostContents = [
      '요즘 자전거 타고 출근하는데 정말 기분이 좋아요. 날씨도 좋고, 운동도 되고, 포인트도 모인다니 정말 좋은 서비스 같습니다!',
      '강남역에서 강북역까지 가는 자전거 경로를 찾고 있는데, 혹시 추천해주실 분 계신가요? 가장 안전하고 빠른 경로가 궁금합니다.',
      '자전거 라이딩할 때 몇 가지 팁을 공유하고 싶습니다. 첫째, 무게중심을 잘 이동시켜야 합니다. 둘째, 속도 조절이 중요합니다. 셋째, 안전모는 필수입니다!',
      '오늘 따릉이 타다가 정말 멋진 장면을 봤어요. 해질녘 한강공원이 정말 아름다웠습니다.',
      '한강 자전거 길을 탔는데 경치가 정말 미쳤습니다. 특히 석양 시간이 최고네요. 모두 한 번 가보세요!',
      '따릉이로 운동하면서 포인트도 모으고 건강도 챙기자! 이게 진정한 일석이조 아닐까요?',
      '우리 동네 대여소 중에 정말 좋은 곳이 몇 개 있습니다. 자전거도 깨끗하고 관리도 잘 되어있어요.',
      '자전거 안전 운전 꿀팁을 알려드릴게요. 첫째는 브레이크 점검, 둘째는 주변 상황 파악, 셋째는 안전거리 유지입니다!',
    ];

    // 후기 게시판 데이터
    const reviewPostTitles = [
      '따릉이 정말 훌륭한 서비스입니다!',
      '새벽 따릉이 타보니 좋아요',
      '자전거 상태가 정말 좋아졌어요',
      '앱 업데이트 후 사용이 편해졌어요',
      '이 서비스 없이는 살 수 없어요',
      '포인트 시스템 정말 좋다',
      '랭킹 시스템 덕분에 동기부여가 돼요',
      '대여소 위치가 딱 좋아요',
      '자전거 크기가 딱 맞아요',
      '가격이 정말 합리적입니다'
    ];

    const reviewPostContents = [
      '따릉이는 정말 훌륭한 서비스입니다. 자전거 상태도 좋고, 대여소도 많고, 가격도 합리적입니다. 강력 추천합니다!',
      '새벽 시간에 따릉이를 탔는데 공기도 맑고 정말 좋았어요. 새벽 운동에 따릉이는 최고입니다!',
      '최근 자전거 상태가 정말 좋아졌어요. 관리도 잘 되고 있는 것 같습니다. 감사합니다!',
      '앱 업데이트 후 사용이 매우 편해졌어요. UI도 깔끔하고 기능도 직관적입니다.',
      '이 서비스 없이는 요즘 생활이 불가능할 정도입니다. 정말 추천하는 서비스예요!',
      '포인트 시스템 덕분에 더 자주 이용하게 돼요. 포인트 모으는 재미가 쏠쏠합니다!',
      '랭킹 시스템 덕분에 자전거 타기가 더 즐거워졌어요. 매달 랭킹을 올려보려고 노력하고 있습니다!',
      '대여소 위치가 정말 딱 좋아요. 집 근처, 회사 근처 모두 있어서 정말 편합니다.',
      '자전거 크기가 딱 맞아요. 키가 작은 저도 편하게 탈 수 있습니다!',
      '가격이 정말 합리적입니다. 다른 서비스보다 훨씬 저렴한데 서비스는 더 좋습니다!'
    ];

    // 제안 게시판 데이터
    const suggestionPostTitles = [
      '24시간 운영 대여소가 필요합니다',
      '자전거 추가 좌석 기능 제안',
      '날씨에 따른 알림 기능이 있으면 좋을 것 같아요',
      '그룹 라이딩 기능 추가 제안',
      '자전거 배달 기능이 있으면 좋을 것 같아요',
      '대여소별 자전거 실시간 정보 API 공개 제안',
      '월 정액 요금제 도입 제안',
      '자전거 보험 서비스 추가 제안',
      '코스 저장 기능 제안',
      '친구와 함께 하는 이벤트가 있으면 좋을 것 같아요'
    ];

    const suggestionPostContents = [
      '야근이 늦을 때 24시간 운영되는 대여소가 있으면 정말 좋을 것 같습니다. 현재는 일부 대여소만 24시간 운영되고 있어서 불편합니다.',
      '자전거에 추가 좌석이나 짐칸 기능이 있으면 짐을 들고 다닐 때 편할 것 같습니다.',
      '날씨에 따른 알림 기능이 있으면 좋을 것 같아요. 예를 들어 비가 올 예정일 때 알림을 받으면 좋을 것 같습니다.',
      '친구들과 함께 같은 시간에 라이딩할 수 있는 그룹 라이딩 기능이 있으면 재미있을 것 같아요.',
      '자전거 배달 기능이 있으면 정말 편할 것 같습니다. 집 앞까지 배달받을 수 있으면 더 편할 것 같아요.',
      '개발자들도 따릉이를 이용할 수 있도록 대여소별 자전거 실시간 정보 API를 공개하면 좋을 것 같습니다.',
      '월 정액 요금제가 있으면 정말 좋을 것 같습니다. 매일 이용하는 사람들을 위한 요금제가 필요합니다.',
      '자전거 사고에 대비한 보험 서비스가 있으면 더 안심하고 이용할 수 있을 것 같습니다.',
      '내가 자주 타는 코스를 저장해서 나중에 다시 사용할 수 있는 기능이 있으면 좋을 것 같습니다.',
      '친구와 함께 하는 챌린지나 이벤트가 있으면 더 재미있게 따릉이를 이용할 수 있을 것 같습니다!'
    ];

    // 공지사항 추가
    for (const notice of notices) {
      await pool.query(
        `INSERT INTO posts (member_id, title, content, category, is_pinned, views, likes)
         VALUES ($1, $2, $3, $4, $5, 0, 0)`,
        [adminId, notice.title, notice.content, notice.category, notice.is_pinned]
      );
    }
    console.log(`  ✓ 공지사항 ${notices.length}개 추가`);

    // 이벤트 추가
    for (const event of events) {
      await pool.query(
        `INSERT INTO posts (member_id, title, content, category, is_pinned, views, likes)
         VALUES ($1, $2, $3, $4, $5, 0, 0)`,
        [adminId, event.title, event.content, event.category, event.is_pinned]
      );
    }
    console.log(`  ✓ 이벤트 ${events.length}개 추가`);

    // 자유 게시판 게시물 추가
    for (let i = 0; i < freePostTitles.length; i++) {
      const randomUser = userMembers[Math.floor(Math.random() * userMembers.length)];
      const views = Math.floor(Math.random() * 500) + 10;
      const likes = Math.floor(views * (Math.random() * 0.2));
      
      await pool.query(
        `INSERT INTO posts (member_id, title, content, category, views, likes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUser.member_id, freePostTitles[i], freePostContents[i], '자유', views, likes]
      );
    }
    console.log(`  ✓ 자유 게시판 ${freePostTitles.length}개 추가`);

    // 후기 게시판 게시물 추가
    for (let i = 0; i < reviewPostTitles.length; i++) {
      const randomUser = userMembers[Math.floor(Math.random() * userMembers.length)];
      const views = Math.floor(Math.random() * 300) + 20;
      const likes = Math.floor(views * (Math.random() * 0.3));
      
      await pool.query(
        `INSERT INTO posts (member_id, title, content, category, views, likes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUser.member_id, reviewPostTitles[i], reviewPostContents[i], '후기', views, likes]
      );
    }
    console.log(`  ✓ 후기 게시판 ${reviewPostTitles.length}개 추가`);

    // 제안 게시판 게시물 추가
    for (let i = 0; i < suggestionPostTitles.length; i++) {
      const randomUser = userMembers[Math.floor(Math.random() * userMembers.length)];
      const views = Math.floor(Math.random() * 250) + 15;
      const likes = Math.floor(views * (Math.random() * 0.25));
      
      await pool.query(
        `INSERT INTO posts (member_id, title, content, category, views, likes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUser.member_id, suggestionPostTitles[i], suggestionPostContents[i], '제안', views, likes]
      );
    }
    console.log(`  ✓ 제안 게시판 ${suggestionPostTitles.length}개 추가`);

    const totalPosts = notices.length + events.length + freePostTitles.length + reviewPostTitles.length + suggestionPostTitles.length;
    console.log(`✅ 총 ${totalPosts}개 게시글 추가 완료`);

  } catch (error) {
    console.error('게시글 추가 오류:', error);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('=====================================');
  console.log('🚀 따릉이 데이터베이스 시딩 시작');
  console.log('=====================================');

  try {
    // 1단계: DB 초기화
    await initializeDatabase();

    // 2단계: 대여소 정보 추가
    await populateStations();

    // 3단계: 랭킹 데이터 추가
    await seedRankingData();

    // 4단계: 게시글 목업 데이터 추가
    await seedPosts();

    console.log('\n=====================================');
    console.log('✅ 모든 데이터 시딩 완료!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  } finally {
    pool.end();
  }
}

// 스크립트 실행
main().catch(err => {
  console.error('스크립트 실행 중 치명적 오류:', err);
  pool.end();
  process.exit(1);
});
