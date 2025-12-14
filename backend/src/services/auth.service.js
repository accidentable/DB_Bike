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
  kakaoLogin: async (accessToken, isSignup = false) => {
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

      // 1. 먼저 kakao_id로 사용자 조회
      let user = await memberRepository.findByKakaoId(kakaoId);

      // 2. kakao_id로 없으면 이메일로 조회
      if (!user && kakaoEmail) {
        user = await memberRepository.findByEmail(kakaoEmail);
        
        // 3. 이메일로 찾은 사용자가 있으면 kakao_id 업데이트
        if (user) {
          await memberRepository.updateKakaoId(user.member_id, kakaoId);
          user = await memberRepository.findByKakaoId(kakaoId);
        }
      }

      // 회원가입 모드이고 이미 가입된 사용자면 에러 반환
      if (isSignup && user) {
        throw new Error('이미 가입된 카카오 계정입니다. 로그인 페이지에서 로그인해주세요.');
      }

      // 4. 여전히 없으면 새로운 사용자 생성
      if (!user) {
        // username 중복 체크 및 고유한 username 생성
        let finalUsername = kakaoNickname;
        let usernameExists = await memberRepository.findByUsername(finalUsername);
        let counter = 1;
        
        while (usernameExists) {
          // username이 이미 존재하면 suffix 추가
          finalUsername = `${kakaoNickname}${counter}`;
          usernameExists = await memberRepository.findByUsername(finalUsername);
          counter++;
        }
        
        const randomPassword = require('crypto').randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        await memberRepository.createUser(
          finalUsername,
          kakaoEmail || `kakao_${kakaoId}@kakao.com`,
          hashedPassword,
          'user',
          kakaoId
        );
        
        user = await memberRepository.findByKakaoId(kakaoId);
      }

      if (!user) {
        throw new Error('카카오 로그인 처리 중 오류가 발생했습니다.');
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
      throw new Error(error.message || '카카오 로그인에 실패했습니다.');
    }
  },

  // 프로필 정보 수정
  updateProfile: async (memberId, profileData) => {
    const { username, phone, currentPassword, newPassword } = profileData;

    // 사용자 조회
    const user = await memberRepository.findById(memberId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 사용자명 중복 확인
    if (username) {
      const existingUser = await memberRepository.findByUsername(username);
      if (existingUser && existingUser.member_id !== memberId) {
        throw new Error('이미 사용 중인 사용자명입니다.');
      }
    }

    // 비밀번호 변경 처리
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('현재 비밀번호가 일치하지 않습니다.');
      }
      var hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // 업데이트할 데이터 구성
    const updateData = {};
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (hashedPassword) updateData.password = hashedPassword;

    // 사용자 정보 업데이트
    const updatedUser = await memberRepository.update(memberId, updateData);

    return {
      member_id: updatedUser.member_id,
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
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

  // 이메일로 사용자 조회
  findUserByEmail: async (email) => {
    return await memberRepository.findByEmail(email);
  },

  // 비밀번호 재설정
  resetPassword: async (email, newPassword) => {
    const user = await memberRepository.findByEmail(email);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await memberRepository.updatePassword(user.member_id, hashedPassword);
  },

  // 회원 탈퇴
  deleteAccount: async (memberId, password) => {
    const user = await memberRepository.findById(memberId);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // 사용자 삭제
    await memberRepository.delete(memberId);
  },
};

module.exports = authService;

