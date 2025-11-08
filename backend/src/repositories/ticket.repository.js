/**
 * src/repositories/ticket.repository.js
 * 이용권 관련 데이터베이스 작업
 */

const pool = require('../config/db.config');

/**
 * 모든 이용권 종류 조회
 */
async function getAllTicketTypes() {
  const query = `
    SELECT 
      ticket_type_id,
      name,
      duration_hours,
      price,
      description,
      ride_limit_minutes,
      created_at
    FROM ticket_types
    ORDER BY price ASC
  `;
  
  const result = await pool.query(query);
  return result.rows;
}

/**
 * 특정 이용권 종류 조회
 */
async function getTicketTypeById(ticketTypeId) {
  const query = `
    SELECT 
      ticket_type_id,
      name,
      duration_hours,
      price,
      description,
      ride_limit_minutes,
      created_at
    FROM ticket_types
    WHERE ticket_type_id = $1
  `;
  
  const result = await pool.query(query, [ticketTypeId]);
  return result.rows[0];
}

/**
 * 회원의 이용권 구매
 */
async function purchaseTicket(memberId, ticketTypeId, expiryTime) {
  const query = `
    INSERT INTO member_tickets (member_id, ticket_type_id, expiry_time, status)
    VALUES ($1, $2, $3, 'active')
    RETURNING 
      member_ticket_id,
      member_id,
      ticket_type_id,
      purchase_time,
      expiry_time,
      status
  `;
  
  const result = await pool.query(query, [memberId, ticketTypeId, expiryTime]);
  return result.rows[0];
}

/**
 * 회원의 활성 이용권 조회
 */
async function getActiveMemberTickets(memberId) {
  const query = `
    SELECT 
      mt.member_ticket_id,
      mt.member_id,
      mt.ticket_type_id,
      mt.purchase_time,
      mt.expiry_time,
      mt.status,
      tt.name AS ticket_name,
      tt.duration_hours,
      tt.price,
      tt.description,
      tt.ride_limit_minutes
    FROM member_tickets mt
    JOIN ticket_types tt ON mt.ticket_type_id = tt.ticket_type_id
    WHERE mt.member_id = $1 
      AND mt.status = 'active'
      AND mt.expiry_time > NOW()
    ORDER BY mt.purchase_time DESC
  `;
  
  const result = await pool.query(query, [memberId]);
  return result.rows;
}

/**
 * 회원의 모든 이용권 이력 조회 (활성, 만료 모두)
 */
async function getAllMemberTickets(memberId) {
  const query = `
    SELECT 
      mt.member_ticket_id,
      mt.member_id,
      mt.ticket_type_id,
      mt.purchase_time,
      mt.expiry_time,
      mt.status,
      tt.name AS ticket_name,
      tt.duration_hours,
      tt.price,
      tt.description,
      tt.ride_limit_minutes
    FROM member_tickets mt
    JOIN ticket_types tt ON mt.ticket_type_id = tt.ticket_type_id
    WHERE mt.member_id = $1
    ORDER BY mt.purchase_time DESC
  `;
  
  const result = await pool.query(query, [memberId]);
  return result.rows;
}

/**
 * 특정 이용권 조회
 */
async function getMemberTicketById(memberTicketId) {
  const query = `
    SELECT 
      mt.member_ticket_id,
      mt.member_id,
      mt.ticket_type_id,
      mt.purchase_time,
      mt.expiry_time,
      mt.status,
      tt.name AS ticket_name,
      tt.duration_hours,
      tt.price,
      tt.description,
      tt.ride_limit_minutes
    FROM member_tickets mt
    JOIN ticket_types tt ON mt.ticket_type_id = tt.ticket_type_id
    WHERE mt.member_ticket_id = $1
  `;
  
  const result = await pool.query(query, [memberTicketId]);
  return result.rows[0];
}

/**
 * 이용권 상태 업데이트
 */
async function updateTicketStatus(memberTicketId, status) {
  const query = `
    UPDATE member_tickets
    SET status = $1
    WHERE member_ticket_id = $2
    RETURNING *
  `;
  
  const result = await pool.query(query, [status, memberTicketId]);
  return result.rows[0];
}

/**
 * 만료된 이용권 자동 업데이트
 */
async function expireOldTickets() {
  const query = `
    UPDATE member_tickets
    SET status = 'expired'
    WHERE status = 'active' 
      AND expiry_time < NOW()
    RETURNING member_ticket_id
  `;
  
  const result = await pool.query(query);
  return result.rows.length; // 만료 처리된 이용권 개수
}

/**
 * 회원이 유효한 이용권을 가지고 있는지 확인
 */
async function hasValidTicket(memberId) {
  const query = `
    SELECT 
      member_ticket_id,
      status,
      expiry_time,
      NOW() as current_time,
      (expiry_time > NOW()) as is_valid
    FROM member_tickets
    WHERE member_id = $1 
      AND status = 'active'
  `;
  
  const result = await pool.query(query, [memberId]);
  
  console.log('📊 이용권 조회 결과:', result.rows);
  console.log('조회된 이용권 개수:', result.rows.length);
  
  // 유효한 이용권이 있는지 확인
  const validTickets = result.rows.filter(t => t.is_valid);
  console.log('유효한 이용권 개수:', validTickets.length);
  
  return validTickets.length > 0;
}

module.exports = {
  getAllTicketTypes,
  getTicketTypeById,
  purchaseTicket,
  getActiveMemberTickets,
  getAllMemberTickets,
  getMemberTicketById,
  updateTicketStatus,
  expireOldTickets,
  hasValidTicket
};

