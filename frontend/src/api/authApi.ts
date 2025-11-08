// src/api/authApi.ts

import client from './client'; // 2번에서 만든 axios 인스턴스

/**
 * 로그인 API
 */
export const login = async (email, password) => {
  try {
    // POST /api/auth/login
    const response = await client.post('/api/auth/login', {
      email,
      password,
    });
    return response.data; // { success: true, data: { token, user } }
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

/**
 * 회원가입 API
 */
export const signup = async (userData) => {
  try {
    // POST /api/auth/signup
    const response = await client.post('/api/auth/signup', userData);
    return response.data; // { success: true, data: { newUser } }
  } catch (error) {
    console.error('Signup API error:', error);
    throw error;
  }
};