/**
 * src/services/ticket.service.js
 * 이용권 관련 비즈니스 로직
 */

const ticketRepository = require('../repositories/ticket.repository');

/**
 * 모든 이용권 종류 조회
 */
async function getAllTicketTypes() {
  try {
    const ticketTypes = await ticketRepository.getAllTicketTypes();
    return ticketTypes;
  } catch (error) {
    console.error('Error in getAllTicketTypes:', error);
    throw new Error('이용권 목록을 불러오는 중 오류가 발생했습니다.');
  }
}

/**
 * 이용권 구매
 */
async function purchaseTicket(memberId, ticketTypeId) {
  try {
    console.log('=== 이용권 구매 시작 ===');
    console.log('회원 ID:', memberId, '타입:', typeof memberId);
    console.log('이용권 타입 ID:', ticketTypeId);
    
    // 0. memberId 유효성 검증
    if (!memberId || isNaN(parseInt(memberId, 10))) {
      throw new Error('유효하지 않은 사용자 ID입니다.');
    }
    
    const numericMemberId = parseInt(memberId, 10);
    
    // 1. 이용권 종류가 존재하는지 확인
    const ticketType = await ticketRepository.getTicketTypeById(ticketTypeId);
    
    if (!ticketType) {
      throw new Error('존재하지 않는 이용권입니다.');
    }

    console.log('이용권 정보:', ticketType.name);

    // 2. 만료 시간 계산
    const now = new Date();
    const expiryTime = new Date(now.getTime() + ticketType.duration_hours * 60 * 60 * 1000);
    console.log('만료 시간:', expiryTime);

    // 3. 이용권 구매 처리
    const purchasedTicket = await ticketRepository.purchaseTicket(
      numericMemberId,
      ticketTypeId,
      expiryTime
    );

    console.log('구매 완료:', purchasedTicket);

    // 4. 구매한 이용권 상세 정보 조회
    const ticketDetail = await ticketRepository.getMemberTicketById(purchasedTicket.member_ticket_id);

    console.log('=== 이용권 구매 완료 ===');

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

/**
 * 회원의 활성 이용권 조회
 */
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

/**
 * 회원의 모든 이용권 이력 조회
 */
async function getMyTicketHistory(memberId) {
  try {
    // 만료된 이용권 자동 업데이트
    await ticketRepository.expireOldTickets();
    
    const tickets = await ticketRepository.getAllMemberTickets(memberId);
    return tickets;
  } catch (error) {
    console.error('Error in getMyTicketHistory:', error);
    throw new Error('이용권 이력을 불러오는 중 오류가 발생했습니다.');
  }
}

/**
 * 회원이 유효한 이용권을 가지고 있는지 확인
 */
async function hasValidTicket(memberId) {
  try {
    console.log('=== 이용권 확인 시작 ===');
    console.log('회원 ID:', memberId);
    
    // 만료된 이용권 자동 업데이트
    await ticketRepository.expireOldTickets();
    
    const hasTicket = await ticketRepository.hasValidTicket(memberId);
    console.log('이용권 보유 여부:', hasTicket);
    console.log('=== 이용권 확인 완료 ===');
    
    return hasTicket;
  } catch (error) {
    console.error('Error in hasValidTicket:', error);
    throw new Error('이용권 확인 중 오류가 발생했습니다.');
  }
}

/**
 * 이용권 사용 (대여 시 호출)
 */
async function useTicket(memberId) {
  try {
    // 1. 활성 이용권 조회
    const activeTickets = await ticketRepository.getActiveMemberTickets(memberId);
    
    if (activeTickets.length === 0) {
      throw new Error('사용 가능한 이용권이 없습니다.');
    }

    // 2. 가장 먼저 만료되는 이용권 선택 (FIFO)
    const ticketToUse = activeTickets[activeTickets.length - 1];

    // 3. 이용권 정보 반환 (상태 변경은 하지 않음, 대여 완료 시에만 처리)
    return ticketToUse;
  } catch (error) {
    console.error('Error in useTicket:', error);
    throw error;
  }
}

/**
 * 만료된 이용권 자동 정리 (스케줄러에서 호출)
 */
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

module.exports = {
  getAllTicketTypes,
  purchaseTicket,
  getMyActiveTickets,
  getMyTicketHistory,
  hasValidTicket,
  useTicket,
  cleanupExpiredTickets
};

