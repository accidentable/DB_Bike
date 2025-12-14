// src/api/client.ts

import axios from 'axios';

// 1. axios 인스턴스 생성 (baseURL 설정)
const client = axios.create({
  baseURL: 'http://localhost:3000', // 우리 백엔드 서버 주소
});

// 2. API 요청 인터셉터
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
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// 3. API 응답 인터셉터 추가
client.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default client;