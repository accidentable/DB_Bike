// populateStations.js
// (이 내용으로 파일 전체를 덮어쓰세요)

require('dotenv').config();
const axios = require('axios');
const pool = require('./src/config/db.config'); // DB 풀 경로 확인

const API_KEY = process.env.SEOUL_API_KEY;

/**
 * 서울시 API에서 대여소 정보를 가져오는 함수
 */
async function fetchBikeData(start, end) {
  const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/${start}/${end}/`;
  try {
    const response = await axios.get(url);
    if (!response.data || !response.data.rentBikeStatus) {
      throw new Error('API 응답 형식이 잘못되었습니다: ' + JSON.stringify(response.data));
    }
    return response.data.rentBikeStatus.row || [];
  } catch (error) {
    console.error(`API 호출 중 오류 (범위: ${start}-${end}):`, error.message);
    return []; // 오류 발생 시 빈 배열 반환
  }
}

/**
 * 메인 실행 함수
 */
async function populateDatabase() {
  console.log('서울시 공공자전거 대여소 정보 동기화를 시작합니다...');
  
  // 1. API를 3번 호출
  const ranges = [
    fetchBikeData(1, 1000),
    fetchBikeData(1001, 2000),
    fetchBikeData(2001, 3000)
  ];

  // 2. 모든 API 호출이 끝날 때까지 기다림
  const results = await Promise.all(ranges);
  
  // 3. (중요!) results.flat()으로 allStations 변수 정의
  const allStations = results.flat(); // 3개 배열을 하나로 합치기

  if (allStations.length === 0) {
    console.error('API에서 대여소 정보를 가져오지 못했습니다. API 키를 확인하세요.');
    return; // 함수 종료
  }

  // 4. (이제 정상 작동) allStations 변수를 사용
  console.log(`총 ${allStations.length}개의 대여소 정보를 가져왔습니다.`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 5. 기존 데이터 모두 삭제
    console.log('기존 대여소, 자전거, 대여이력 데이터를 모두 삭제합니다 (TRUNCATE)...');
    await client.query('TRUNCATE TABLE stations CASCADE');

    // 6. 새 대여소 정보 INSERT
    console.log('새 대여소 정보를 DB에 INSERT합니다...');
    
    const stationInsertPromises = allStations.map(station => {
      const { stationName, stationLatitude, stationLongitude, parkingBikeTotCnt } = station;
      const query = `
        INSERT INTO stations (name, latitude, longitude, bike_count, status)
        VALUES ($1, $2, $3, $4, '정상')
        RETURNING station_id, bike_count; 
      `;
      return client.query(query, [
        stationName, 
        parseFloat(stationLatitude) || 0, 
        parseFloat(stationLongitude) || 0,
        parseInt(parkingBikeTotCnt) || 0
      ]);
    });

    const insertedStationsResults = await Promise.all(stationInsertPromises);
    console.log(`✅ ${insertedStationsResults.length}개 대여소 저장 완료.`);

    // 7. 각 대여소의 '초기 재고'만큼 '가상 자전거' INSERT
    console.log('각 대여소의 초기 재고만큼 가상 자전거(bikes)를 생성합니다...');
    
    let totalBikesCreated = 0;
    const bikeInsertPromises = [];

    for (const result of insertedStationsResults) {
      if (!result.rows[0]) continue; // 간혹 빈 결과가 있을 수 있음
      const { station_id, bike_count } = result.rows[0];
      
      for (let i = 0; i < bike_count; i++) {
        const bikeQuery = `
          INSERT INTO bikes (station_id, status, lock_status) 
          VALUES ($1, '정상', 'LOCKED')
        `;
        bikeInsertPromises.push(client.query(bikeQuery, [station_id]));
      }
      totalBikesCreated += bike_count;
    }

    await Promise.all(bikeInsertPromises);
    
    await client.query('COMMIT');
    console.log(`✅ 성공: 약 ${totalBikesCreated}개의 가상 자전거가 DB에 저장되었습니다.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('DB 동기화 중 오류 발생:', error);
  } finally {
    client.release();
    pool.end(); // 스크립트이므로 풀 종료
  }
}

// --- 스크립트 실행 ---
// populateDatabase 함수를 호출하고, 에러 발생 시 콘솔에 찍도록 수정
populateDatabase().catch(err => {
  console.error("스크립트 실행 중 치명적 오류:", err);
  pool.end(); // 오류 발생 시에도 풀 종료
});