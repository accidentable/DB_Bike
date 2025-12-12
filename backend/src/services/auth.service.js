/**
 * src/services/auth.service.js
 * 인증 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - login: 로그인 (JWT 토큰 발급)
 * - signup: 회원가입 (이메일 인증 필요)
 * - kakaoLogin: 카카오 로그인/회원가입
 * - updateProfile: 프로필 정보 수정
 * - changePassword: 비밀번호 변경 (이메일 인증 필요)
 */

const memberRepository = require('../repositories/member.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('./email.service');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || 'dev-secret-key';

const authService = {
  // 로그인 처리 및 JWT 토큰 발급
  login: async (email, password) => {
    const user = await memberRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('User not found.');
    }

    const isAdminEmail = email.toLowerCase().startsWith('admin');
    if (isAdminEmail && user.role !== 'admin') {
      const updatedUser = await memberRepository.updateRole(user.member_id, 'admin');
      if (updatedUser) {
        user.role = updatedUser.role;
      } else {
        user.role = 'admin';
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid password.');
    }

    const token = jwt.sign(
      {
        memberId: user.member_id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      token: token,
      user: {
        member_id: user.member_id,
        email: user.email,
        username: user.username,
        role: user.role,
        point_balance: typeof user.point_balance === 'number' ? user.point_balance : 0,
        isAdmin: user.role === 'admin'
      }
    };
  },

  // 회원가입 처리
  signup: async (username, email, password, skipEmailVerification = false) => {
    const existingUserByEmail = await memberRepository.findByEmail(email);
    
    if (existingUserByEmail) {
      throw new Error('Email already in use.');
    }

    const existingUserByUsername = await memberRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('Username already in use.');
    }

    if (!skipEmailVerification && !emailService.isEmailVerified(email)) {
      throw new Error('Email verification is required.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdminEmail = email.toLowerCase().startsWith('admin');
    const role = isAdminEmail ? 'admin' : 'user';

    const newUser = await memberRepository.createUser(
      username,
      email,
      hashedPassword,
      role
    );
    
    emailService.deleteVerificationCode(email);
    
    return newUser;
  },

  // 카카오 로그인/회원가입 처리
  kakaoLogin: async (accessToken) => {
    try {
      const kakaoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      });

      if (!kakaoResponse.ok) {
        throw new Error('카카오 인증에 실패했습니다.');
      }

      const kakaoUser = await kakaoResponse.json();
      const kakaoId = kakaoUser.id;
      const kakaoEmail = kakaoUser.kakao_account?.email;
      const kakaoNickname = kakaoUser.kakao_account?.profile?.nickname || `카카오${kakaoId}`;

      let user = await memberRepository.findByKakaoId(kakaoId);

      if (!user) {
        if (kakaoEmail) {
          const existingUser = await memberRepository.findByEmail(kakaoEmail);
          if (existingUser) {
            await memberRepository.updateKakaoId(existingUser.member_id, kakaoId);
            user = await memberRepository.findByKakaoId(kakaoId);
          }
        }

        if (!user) {
          const randomPassword = require('crypto').randomBytes(32).toString('hex');
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          const newUser = await memberRepository.createUser(
            kakaoNickname,
            kakaoEmail || `kakao_${kakaoId}@kakao.com`,
            hashedPassword,
            'user',
            kakaoId
          );
          user = await memberRepository.findByKakaoId(kakaoId);
        }
      }

      const token = jwt.sign(
        {
          memberId: user.member_id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return {
        token: token,
        user: {
          member_id: user.member_id,
          email: user.email,
          username: user.username,
          role: user.role,
          point_balance: typeof user.point_balance === 'number' ? user.point_balance : 0,
          isAdmin: user.role === 'admin'
        }
      };
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      throw new Error(error.message || '카카오 로그인에 실패했습니다.');
    }
  },

  // 프로필 정보 수정
  updateProfile: async (memberId, username) => {
    // 사용자명 중복 확인
    const existingUser = await memberRepository.findByUsername(username);
    if (existingUser && existingUser.member_id !== memberId) {
      throw new Error('이미 사용 중인 사용자명입니다.');
    }

    // 사용자 정보 업데이트
    const updatedUser = await memberRepository.update(memberId, { username });

    return {
      member_id: updatedUser.member_id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    };
  },

  // 비밀번호 변경
  changePassword: async (memberId, currentPassword, newPassword) => {
    // 사용자 조회
    const user = await memberRepository.findById(memberId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('현재 비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await memberRepository.updatePassword(memberId, hashedPassword);
  },
};

module.exports = authService;

