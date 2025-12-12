/**
 * src/services/email.service.js
 * 이메일 발송 서비스
 * 
 * 주요 함수:
 * - generateVerificationCode: 6자리 인증 코드 생성
 * - sendVerificationEmail: 이메일 인증 코드 발송
 * - verifyCode: 이메일 인증 코드 검증
 * - isEmailVerified: 이메일 인증 완료 여부 확인
 * - deleteVerificationCode: 인증 코드 삭제
 * - cleanupExpiredCodes: 만료된 인증 코드 정리
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

const emailVerificationCodes = new Map();

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const emailService = {
  // 6자리 인증 코드 생성
  generateVerificationCode: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // 이메일 인증 코드 발송
  sendVerificationEmail: async (email, purpose = 'signup') => {
    try {
      const code = emailService.generateVerificationCode();
      
      const codeKey = `${email}_${purpose}`;
      emailVerificationCodes.set(codeKey, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000,
        verified: false,
        purpose
      });

      const subject = purpose === 'password-change' 
        ? '[자전거 대여 서비스] 비밀번호 변경 인증 코드'
        : '[자전거 대여 서비스] 이메일 인증 코드';
      
      const purposeText = purpose === 'password-change'
        ? '비밀번호 변경을 위한'
        : '회원가입을 위한';

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@bike-rental.com',
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00A862;">이메일 인증</h2>
            <p>안녕하세요,</p>
            <p>${purposeText} 이메일 인증 코드입니다.</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #00A862; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
            </div>
            <p>이 코드는 5분간 유효합니다.</p>
            <p>본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">© 자전거 대여 서비스</p>
          </div>
        `,
        text: `이메일 인증 코드: ${code}\n이 코드는 5분간 유효합니다.`
      };

      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      const shouldSendEmail = !isDevelopment && transporter && process.env.USE_EMAIL_SERVICE === 'true';
      
      if (!shouldSendEmail) {
        console.log(`[개발 모드] 이메일 인증 코드: ${code} (수신자: ${email})`);
        return code;
      }

      await transporter.sendMail(mailOptions);
      console.log(`✅ 인증 코드 이메일 발송 완료: ${email}`);
      
      return code;
    } catch (error) {
      console.error('이메일 발송 에러:', error);
      throw new Error('이메일 발송에 실패했습니다.');
    }
  },

  // 이메일 인증 코드 검증
  verifyCode: (email, code, purpose = 'signup') => {
    const codeKey = `${email}_${purpose}`;
    const stored = emailVerificationCodes.get(codeKey);
    
    if (!stored) {
      return { success: false, message: '인증 코드가 존재하지 않습니다. 인증 코드를 다시 발송해주세요.' };
    }

    if (Date.now() > stored.expiresAt) {
      emailVerificationCodes.delete(codeKey);
      return { success: false, message: '인증 코드가 만료되었습니다. 인증 코드를 다시 발송해주세요.' };
    }

    if (stored.code !== code) {
      return { success: false, message: '인증 코드가 일치하지 않습니다.' };
    }

    stored.verified = true;
    emailVerificationCodes.set(codeKey, stored);
    
    return { success: true, message: '인증이 완료되었습니다.' };
  },

  // 이메일 인증 완료 여부 확인
  isEmailVerified: (email, purpose = 'signup') => {
    const codeKey = `${email}_${purpose}`;
    const stored = emailVerificationCodes.get(codeKey);
    return stored && stored.verified === true;
  },

  // 인증 코드 삭제
  deleteVerificationCode: (email, purpose = 'signup') => {
    const codeKey = `${email}_${purpose}`;
    emailVerificationCodes.delete(codeKey);
  },

  // 만료된 인증 코드 정리
  cleanupExpiredCodes: () => {
    const now = Date.now();
    for (const [email, data] of emailVerificationCodes.entries()) {
      if (now > data.expiresAt) {
        emailVerificationCodes.delete(email);
      }
    }
  }
};

setInterval(() => {
  emailService.cleanupExpiredCodes();
}, 10 * 60 * 1000);

module.exports = emailService;

