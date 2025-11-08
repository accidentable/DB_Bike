// src/api/client.ts

import axios from 'axios';

// 1. axios 인스턴스 생성 (baseURL 설정)
const client = axios.create({
  baseURL: 'http://localhost:3000', // 우리 백엔드 서버 주소
});

// 2. (핵심) API 요청 인터셉터
//    모든 API 요청이 백엔드로 날아가기 *전*에 이 코드가 실행됨
client.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰을 가져옴
    const token = localStorage.getItem('authToken');
    
    // 토큰이 있다면, HTTP 헤더에 'Authorization'을 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;