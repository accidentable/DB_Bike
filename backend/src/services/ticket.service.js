/**
 * src/services/ticket.service.js
 * 이용권 관련 비즈니스 로직
 * 
 * 주요 함수:
 * - getAllTicketTypes: 모든 이용권 종류 조회
 * - purchaseTicket: 이용권 구매 (포인트 차감)
 * - getMyActiveTickets, getMyTicketHistory: 이용권 조회
 * - hasValidTicket: 유효한 이용권 보유 여부 확인
 * - useTicket: 이용권 사용 (대여 시)
 * - cleanupExpiredTickets: 만료된 이용권 정리
 * - grantTicketByAdmin: 관리자 이용권 부여 (포인트 차감 없음)
 */

const ticketRepository = require('../repositories/ticket.repository');
const pointService = require('./point.service');

// 모든 이용권 종류 조회
async function getAllTicketTypes() {
  try {
    const ticketTypes = await ticketRepository.getAllTicketTypes();
    return ticketTypes;
  } catch (error) {
    console.error('Error in getAllTicketTypes:', error);
    throw new Error('이용권 목록을 불러오는 중 오류가 발생했습니다.');
  }
}

// 이용권 구매
async function purchaseTicket(memberId, ticketTypeId) {
  try {
    if (!memberId || isNaN(parseInt(memberId, 10))) {
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    const numericMemberId = parseInt(memberId, 10);
    const ticketType = await ticketRepository.getTicketTypeById(ticketTypeId);
    
    if (!ticketType) {
      throw new Error('존재하지 않는 이용권입니다.');
    }

    try {
      await pointService.deductPoints(
        numericMemberId, 
        ticketType.price, 
        `${ticketType.name} 구매`
      );
    } catch (pointError) {
      console.error('포인트 차감 오류:', pointError);
      throw new Error(pointError.message || '포인트 차감 중 오류가 발생했습니다.');
    }

    const now = new Date();
    const expiryTime = new Date(now.getTime() + ticketType.duration_hours * 60 * 60 * 1000);

    const purchasedTicket = await ticketRepository.purchaseTicket(
      numericMemberId,
      ticketTypeId,
      expiryTime
    );

    const ticketDetail = await ticketRepository.getMemberTicketById(purchasedTicket.member_ticket_id);

    return {
      message: `${ticketType.name} 구매가 완료되었습니다.`,
      ticket: ticketDetail
    };
  } catch (error) {
    console.error('Error in purchaseTicket:', error);
    // 외래 키 제약 조건 위반 에러를 더 명확한 메시지로 변환
    if (error.message && error.message.includes('foreign key constraint')) {
      throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
    }
    throw error;
  }
}

// 활성 이용권 조회
async function getMyActiveTickets(memberId) {
  try {
    // 만료된 이용권 자동 업데이트
    await ticketRepository.expireOldTickets();
    
    const tickets = await ticketRepository.getActiveMemberTickets(memberId);
    return tickets;
  } catch (error) {
    console.error('Error in getMyActiveTickets:', error);
    throw new Error('활성 이용권을 불러오는 중 오류가 발생했습니다.');
  }
}

// 이용권 이력 조회
async function getMyTicketHistory(memberId) {
  try {
    await ticketRepository.expireOldTickets();
    
    const tickets = await ticketRepository.getAllMemberTickets(memberId);
    return tickets;
  } catch (error) {
    console.error('Error in getMyTicketHistory:', error);
    throw new Error('이용권 이력을 불러오는 중 오류가 발생했습니다.');
  }
}

// 유효한 이용권 보유 여부 확인
async function hasValidTicket(memberId) {
  try {
    await ticketRepository.expireOldTickets();
    const hasTicket = await ticketRepository.hasValidTicket(memberId);
    return hasTicket;
  } catch (error) {
    console.error('Error in hasValidTicket:', error);
    throw new Error('이용권 확인 중 오류가 발생했습니다.');
  }
}

// 이용권 사용
async function useTicket(memberId) {
  try {
    const activeTickets = await ticketRepository.getActiveMemberTickets(memberId);
    
    if (activeTickets.length === 0) {
      throw new Error('사용 가능한 이용권이 없습니다.');
    }

    const ticketToUse = activeTickets[activeTickets.length - 1];
    return ticketToUse;
  } catch (error) {
    console.error('Error in useTicket:', error);
    throw error;
  }
}

// 만료된 이용권 정리
async function cleanupExpiredTickets() {
  try {
    const expiredCount = await ticketRepository.expireOldTickets();
    console.log(`${expiredCount}개의 이용권이 만료 처리되었습니다.`);
    return expiredCount;
  } catch (error) {
    console.error('Error in cleanupExpiredTickets:', error);
    throw new Error('만료 이용권 정리 중 오류가 발생했습니다.');
  }
}

// 관리자 이용권 부여
async function grantTicketByAdmin(memberId, ticketTypeId, expiryTime = null) {
  try {
    const ticketType = await ticketRepository.getTicketTypeById(ticketTypeId);
    
    if (!ticketType) {
      throw new Error('존재하지 않는 이용권입니다.');
    }

    let expiry;
    if (expiryTime) {
      expiry = new Date(expiryTime);
    } else {
      const now = new Date();
      expiry = new Date(now.getTime() + ticketType.duration_hours * 60 * 60 * 1000);
    }

    const grantedTicket = await ticketRepository.purchaseTicket(
      memberId,
      ticketTypeId,
      expiry
    );

    const ticketDetail = await ticketRepository.getMemberTicketById(grantedTicket.member_ticket_id);

    return {
      message: `${ticketType.name}이(가) 부여되었습니다.`,
      ticket: ticketDetail
    };
  } catch (error) {
    console.error('Error in grantTicketByAdmin:', error);
    throw error;
  }
}

module.exports = {
  getAllTicketTypes,
  purchaseTicket,
  getMyActiveTickets,
  getMyTicketHistory,
  hasValidTicket,
  useTicket,
  cleanupExpiredTickets,
  grantTicketByAdmin
};

