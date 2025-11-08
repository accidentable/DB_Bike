// src/services/scheduler.service.js

require('dotenv').config();
const axios = require('axios');
const pool = require('../config/db.config');

const API_KEY = process.env.SEOUL_API_KEY;

/**
 * 서울시 API에서 모든 대여소의 '최신 재고'를 가져오는 함수
 */
async function fetchAllBikeCounts() {
  const ranges = [
    axios.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/1/1000/`),
    axios.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/1001/2000/`),
    axios.get(`http://openapi.seoul.go.kr:8088/${API_KEY}/json/bikeList/2001/3000/`)
  ];

  try {
    const responses = await Promise.all(ranges);
    // 응답에서 'row' 데이터만 추출하여 하나의 배열로 합침
    const allStations = responses.map(res => res.data.rentBikeStatus.row || []).flat();
    return allStations;
  } catch (error) {
    console.error('[스케줄러] API 호출 오류:', error.message);
    return [];
  }
}

/**
 * DB의 bike_count를 최신화하는 함수
 */
async function updateBikeCounts() {
  console.log('[스케줄러] 실시간 자전거 재고 업데이트를 시작합니다...');
  
  const allStations = await fetchAllBikeCounts();
  if (allStations.length === 0) {
    console.log('[스케줄러] API에서 가져올 데이터가 없습니다. 중단합니다.');
    return;
  }

  // 모든 UPDATE 쿼리를 병렬로 실행
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
    console.log(`[스케줄러] ✅ 성공: ${allStations.length}개 대여소의 재고가 업데이트되었습니다.`);

  } catch (error) {
    console.error('[스케줄러] DB 업데이트 중 오류:', error);
  }
}

/**
 * 스케줄러를 시작하는 함수
 */
function initializeScheduler() {
  console.log('🚀 배치 스케줄러가 활성화되었습니다. 5분마다 재고를 업데이트합니다.');
  
  // 1. 서버 시작 시 즉시 1회 실행
  updateBikeCounts(); 
  
  // 2. 그 후 5분(300,000 밀리초)마다 반복 실행
  setInterval(updateBikeCounts, 300000); 
}

module.exports = { initializeScheduler };