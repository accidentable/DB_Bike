/**
 * 이용권 관련 API 함수들
 */

import client from './client';

// 이용권 종류 타입 정의
export interface TicketType {
  ticket_type_id: number;
  name: string;
  duration_hours: number;
  price: number;
  description: string;
  ride_limit_minutes: number | null;
  created_at: string;
}

// 회원이 구매한 이용권 타입 정의
export interface MemberTicket {
  member_ticket_id: number;
  member_id: number;
  ticket_type_id: number;
  ticket_name: string;
  purchase_time: string;
  expiry_time: string;
  status: 'active' | 'used' | 'expired';
  price: number;
  ride_limit_minutes: number | null;
  duration_hours: number;
  description: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * 모든 이용권 종류 조회 (공개)
 */
export async function getTicketTypes(): Promise<ApiResponse<TicketType[]>> {
  try {
    const response = await client.get('/api/tickets/types');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '이용권 목록을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 이용권 구매 (로그인 필요)
 */
export async function purchaseTicket(ticketTypeId: number): Promise<ApiResponse<MemberTicket>> {
  try {
    const response = await client.post('/api/tickets/purchase', { ticketTypeId });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '이용권 구매 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 내 활성 이용권 조회 (로그인 필요)
 */
export async function getMyActiveTickets(): Promise<ApiResponse<MemberTicket[]>> {
  try {
    const response = await client.get('/api/tickets/my-tickets');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '활성 이용권을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 내 이용권 구매 이력 조회 (로그인 필요)
 */
export async function getMyTicketHistory(): Promise<ApiResponse<MemberTicket[]>> {
  try {
    const response = await client.get('/api/tickets/history');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '이용권 이력을 불러오는 중 오류가 발생했습니다.',
    };
  }
}

