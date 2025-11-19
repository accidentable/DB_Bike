// src/services/email.service.js
// 이메일 발송 서비스

const nodemailer = require('nodemailer');
require('dotenv').config();

// 이메일 인증 코드 저장소 (인메모리, 실제 운영에서는 Redis 등 사용 권장)
const emailVerificationCodes = new Map();

// Nodemailer 트랜스포터 설정 (EMAIL_USER와 EMAIL_PASS가 있을 때만 생성)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Gmail 앱 비밀번호 사용
    }
  });
}

// SMTP 직접 설정 예시 (Gmail 외 다른 서비스 사용 시)
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || 'smtp.gmail.com',
//   port: process.env.SMTP_PORT || 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

const emailService = {
  /**
   * 6자리 인증 코드 생성
   */
  generateVerificationCode: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * 이메일 인증 코드 발송
   * @param {string} email - 수신자 이메일 주소
   * @returns {Promise<string>} - 생성된 인증 코드
   */
  sendVerificationEmail: async (email) => {
    try {
      // 인증 코드 생성
      const code = emailService.generateVerificationCode();
      
      // 인증 코드 저장 (5분 유효)
      emailVerificationCodes.set(email, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5분
        verified: false
      });

      // 이메일 내용
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@bike-rental.com',
        to: email,
        subject: '[자전거 대여 서비스] 이메일 인증 코드',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00A862;">이메일 인증</h2>
            <p>안녕하세요,</p>
            <p>회원가입을 위한 이메일 인증 코드입니다.</p>
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

      // 개발 환경에서는 항상 콘솔에 출력 (실제 이메일 발송 안 함)
      // 운영 환경에서만 실제 이메일 발송
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      const shouldSendEmail = !isDevelopment && transporter && process.env.USE_EMAIL_SERVICE === 'true';
      
      if (!shouldSendEmail) {
        console.log('='.repeat(50));
        console.log(`[개발 모드] 이메일 인증 코드 발송 (실제 이메일 미발송)`);
        console.log(`수신자: ${email}`);
        console.log(`인증 코드: ${code}`);
        console.log('='.repeat(50));
        console.log(`💡 실제 이메일을 발송하려면 .env에 USE_EMAIL_SERVICE=true를 추가하세요.`);
        console.log('='.repeat(50));
        return code;
      }

      // 운영 환경에서 실제 이메일 발송
      await transporter.sendMail(mailOptions);
      console.log(`✅ 인증 코드 이메일 발송 완료: ${email}`);
      
      return code;
    } catch (error) {
      console.error('이메일 발송 에러:', error);
      throw new Error('이메일 발송에 실패했습니다.');
    }
  },

  /**
   * 이메일 인증 코드 검증
   * @param {string} email - 이메일 주소
   * @param {string} code - 인증 코드
   * @returns {Promise<boolean>} - 검증 성공 여부
   */
  verifyCode: (email, code) => {
    const stored = emailVerificationCodes.get(email);
    
    if (!stored) {
      return { success: false, message: '인증 코드가 존재하지 않습니다.' };
    }

    // 만료 확인
    if (Date.now() > stored.expiresAt) {
      emailVerificationCodes.delete(email);
      return { success: false, message: '인증 코드가 만료되었습니다.' };
    }

    // 코드 일치 확인
    if (stored.code !== code) {
      return { success: false, message: '인증 코드가 일치하지 않습니다.' };
    }

    // 인증 완료 표시
    stored.verified = true;
    emailVerificationCodes.set(email, stored);
    
    return { success: true, message: '인증이 완료되었습니다.' };
  },

  /**
   * 이메일 인증 완료 여부 확인
   * @param {string} email - 이메일 주소
   * @returns {boolean} - 인증 완료 여부
   */
  isEmailVerified: (email) => {
    const stored = emailVerificationCodes.get(email);
    return stored && stored.verified === true;
  },

  /**
   * 인증 코드 삭제 (회원가입 완료 후)
   * @param {string} email - 이메일 주소
   */
  deleteVerificationCode: (email) => {
    emailVerificationCodes.delete(email);
  },

  /**
   * 만료된 인증 코드 정리 (주기적으로 실행)
   */
  cleanupExpiredCodes: () => {
    const now = Date.now();
    for (const [email, data] of emailVerificationCodes.entries()) {
      if (now > data.expiresAt) {
        emailVerificationCodes.delete(email);
      }
    }
  }
};

// 10분마다 만료된 코드 정리
setInterval(() => {
  emailService.cleanupExpiredCodes();
}, 10 * 60 * 1000);

module.exports = emailService;

