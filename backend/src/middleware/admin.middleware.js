/**
 * src/middleware/admin.middleware.js
 * 관리자 권한 확인 미들웨어
 * 
 * 주요 함수:
 * - checkAdminRole: DB에서 사용자 역할을 재확인하여 관리자 권한 검증
 */

const memberRepository = require('../repositories/member.repository');

const checkAdminRole = async (req, res, next) => {
  if (!req.user || !req.user.memberId) {
    return res.status(401).json({ message: '인증 정보가 없습니다.' });
  }

  try {
    const member = await memberRepository.findById(req.user.memberId);

    if (!member) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (member.role !== 'admin') {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }

    req.user.role = member.role;
    next();
  } catch (error) {
    console.error('관리자 권한 확인 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = {
  checkAdminRole,
};
