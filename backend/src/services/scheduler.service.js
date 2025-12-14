/**
 * src/services/scheduler.service.js
 * 배치 스케줄러 서비스
 * 
 * 주요 함수:
 * - fetchAllBikeCounts: 서울시 API에서 대여소 재고 정보 조회
 * - updateBikeCounts: DB의 bike_count 최신화
 * - initializeScheduler: 스케줄러 시작 (5분마다 재고 업데이트)
 */

require('dotenv').config();
const axios = require('axios');
const pool = require('../config/db.config');

const API_KEY = process.env.SEOUL_API_KEY;

// 서울시 API에서 대여소 재고 정보 조회
async function fetchAllBikeCounts() {
  const ranges = [
    axios.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/1/1000/`),
    axios.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/1001/2000/`),
    axios.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/2001/3000/`)
  ];

  try {
    const responses = await Promise.all(ranges);
    const allStations = responses.map(res => res.data.rentBikeStatus.row || []).flat();
    return allStations;
  } catch (error) {
    console.error('[스케줄러] API 호출 오류:', error.message);
    return [];
  }
}

// DB의 bike_count 최신화
async function updateBikeCounts() {
  console.log('[스케줄러] 실시간 자전거 재고 업데이트를 시작합니다...');
  
  const allStations = await fetchAllBikeCounts();
  if (allStations.length === 0) {
    console.log('[스케줄러] API에서 가져올 데이터가 없습니다. 중단합니다.');
    return;
  }

  try {
    const updatePromises = allStations.map(station => {
      const { stationName, parkingBikeTotCnt } = station;
      const query = `
        UPDATE stations 
        SET bike_count = $1 
        WHERE name = $2
      `;
      return pool.query(query, [parseInt(parkingBikeTotCnt) || 0, stationName]);
    });

    await Promise.all(updatePromises);
    console.log(`[스케줄러] 성공: ${allStations.length}개 대여소의 재고가 업데이트되었습니다.`);

  } catch (error) {
    console.error('[스케줄러] DB 업데이트 중 오류:', error);
  }
}

// 스케줄러 시작 (5분마다 재고 업데이트)
function initializeScheduler() {
  console.log('🚀 배치 스케줄러가 활성화되었습니다. 5분마다 재고를 업데이트합니다.');
  
  updateBikeCounts(); 
  setInterval(updateBikeCounts, 300000); 
}

module.exports = { initializeScheduler };