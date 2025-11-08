// src/services/auth.service.js
// [cite: 277] auth.service.js (비즈니스 로직)

const memberRepository = require('../repositories/member.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authService = {
  /**
   * 로그인 로직
   */
  login: async (email, password) => {
    // 1. 이메일로 사용자 조회
    const user = await memberRepository.findByEmail(email);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 2. 비밀번호 검증 (PDF의 bcrypt.compare 로직) [cite: 21, 26]
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // 3. JWT 토큰 생성
    const token = jwt.sign(
      { 
        memberId: user.member_id, 
        email: user.email, 
        role: user.role 
      }, // 토큰에 담을 정보
      process.env.JWT_SECRET_KEY, // .env의 비밀키
      { expiresIn: '1h' } // 1시간 유효
    );

    return { 
      token, 
      user: { 
        email: user.email, 
        username: user.username, 
        role: user.role 
      } 
    };
  },

  /**
   * 회원가입 로직
   */
  signup: async (username, email, password, phone, studentId) => {
    // 1. 이메일 중복 확인 [cite: 24]
    const existingUser = await memberRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    // 2. 비밀번호 암호화 (PDF의 bcrypt.hash 로직) [cite: 20]
    const hashedPassword = await bcrypt.hash(password, 10); // 10번 salt

    // 3. Repository를 통해 사용자 생성
    const newUser = await memberRepository.createUser(
      username, 
      email, 
      hashedPassword, 
      phone, 
      studentId
    );
    
    return newUser;
  },
};

module.exports = authService;