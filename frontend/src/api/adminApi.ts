import client from './client';
import type { User } from './authApi';

// 통계 데이터 타입
export interface DashboardStats {
  totalUsers: number;
  totalBikes: number;
  totalStations: number;
  activeRentals: number;
}

// 자전거 데이터 타입
export interface Bike {
  bike_id: number;
  status: 'available' | 'rented' | 'maintenance';
  station_id: number | null;
}

// 대여소 데이터 타입
export interface Station {
  station_id: number;
  station_name: string;
  latitude: number;
  longitude: number;
  bike_count: number;
}

/**
 * Activity Log 조회
 */
export interface ActivityLog {
  timestamp: string;
  user: string;
  action: string;
  status: 'success' | 'error' | 'warning' | 'info';
}

export async function getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  const response = await client.get('/api/admin/activity-logs', {
    params: { limit }
  });
  return response.data;
}

/**
 * 대시보드 통계 가져오기
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await client.get('/api/admin/stats');
  return response.data;
}

/**
 * 지역구별 대여소 현황 조회
 */
export interface DistrictStat {
  name: string;
  value: number;
  percent: string;
}

export async function getDistrictStats(): Promise<DistrictStat[]> {
  const response = await client.get('/api/admin/district-stats');
  return response.data;
}

/**
 * 대여소별 대여율 조회
 */
export interface StationRentalRate {
  name: string;
  percent: number;
  color: string;
}

export async function getStationRentalRates(): Promise<StationRentalRate[]> {
  const response = await client.get('/api/admin/station-rental-rates');
  return response.data;
}

/**
 * 모든 사용자 목록 가져오기
 */
export async function getUsers(): Promise<User[]> {
  const response = await client.get('/api/admin/users');
  return response.data;
}

/**
 * 사용자 정보 업데이트
 */
export async function updateUser(userId: number, userData: Partial<User>): Promise<User> {
  const response = await client.put(`/api/admin/users/${userId}`, userData);
  return response.data;
}

/**
 * 관리자가 이용권 부여
 */
export async function grantTicketToUser(userId: number, ticketTypeId: number, expiryTime?: string): Promise<{ success: boolean; message: string; data: any }> {
  const response = await client.post(`/api/admin/users/${userId}/tickets`, {
    ticketTypeId,
    expiryTime
  });
  return response.data;
}

/**
 * 사용자 삭제
 */
export async function deleteUser(userId: number): Promise<void> {
  await client.delete(`/api/admin/users/${userId}`);
}

/**
 * 모든 자전거 목록 가져오기
 */
export async function getBikes(): Promise<Bike[]> {
  const response = await client.get('/api/admin/bikes');
  return response.data;
}

/**
 * 새 자전거 추가
 */
export async function addBike(bikeData: Partial<Bike>): Promise<Bike> {
  const response = await client.post('/api/admin/bikes', bikeData);
  return response.data;
}

/**
 * 자전거 정보 업데이트
 */
export async function updateBike(bikeId: number, bikeData: Partial<Bike>): Promise<Bike> {
  const response = await client.put(`/api/admin/bikes/${bikeId}`, bikeData);
  return response.data;
}

/**
 * 자전거 삭제
 */
export async function deleteBike(bikeId: number): Promise<void> {
  await client.delete(`/api/admin/bikes/${bikeId}`);
}

/**
 * 모든 대여소 목록 가져오기
 */
export async function getStations(): Promise<Station[]> {
  const response = await client.get('/api/admin/stations');
  return response.data;
}

/**
 * 새 대여소 추가
 */
export async function addStation(stationData: Partial<Station>): Promise<Station> {
  const response = await client.post('/api/admin/stations', stationData);
  return response.data;
}

/**
 * 대여소 정보 업데이트
 */
export async function updateStation(stationId: number, stationData: Partial<Station>): Promise<Station> {
  const response = await client.put(`/api/admin/stations/${stationId}`, stationData);
  return response.data;
}

/**
 * 대여소 삭제
 */
export async function deleteStation(stationId: number): Promise<void> {
  await client.delete(`/api/admin/stations/${stationId}`);
}

/**
 * 모든 대여 기록 가져오기
 */
export interface Rental {
  rental_id: number;
  member_id: number;
  username: string;
  email: string;
  bike_id: number;
  start_time: string;
  end_time: string | null;
  start_station_name: string;
  end_station_name: string | null;
}

export async function getRentals(): Promise<Rental[]> {
  const response = await client.get('/api/admin/rentals');
  return response.data;
}