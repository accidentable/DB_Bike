import client from './client';

export interface PointTransaction {
  transaction_id: number;
  member_id: number;
  amount: number;
  type: 'CHARGE' | 'USE' | 'SIGNUP_BONUS';
  description: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// 포인트 잔액 조회
export async function getPointBalance(): Promise<ApiResponse<number>> {
  try {
    const response = await client.get('/api/points/balance');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '포인트 잔액 조회 중 오류가 발생했습니다.',
    };
  }
}

// 포인트 충전
export async function chargePoints(amount: number): Promise<ApiResponse<PointTransaction>> {
  try {
    const response = await client.post('/api/points/charge', { amount });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '포인트 충전 중 오류가 발생했습니다.',
    };
  }
}

// 포인트 사용 내역 조회
export async function getPointHistory(): Promise<ApiResponse<PointTransaction[]>> {
  try {
    const response = await client.get('/api/points/history');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '포인트 내역 조회 중 오류가 발생했습니다.',
    };
  }
}