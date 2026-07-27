import apiClient from './apiClient';
import { Challan, ChallanQuery, DashboardStats, PaginatedResult } from '../types';

export async function createChallan(payload: {
  truckNumber: string;
  placeOfDelivery: string;
}): Promise<Challan> {
  const { data } = await apiClient.post('/challans', payload);
  return data.data;
}

export async function listChallans(params: ChallanQuery): Promise<PaginatedResult<Challan>> {
  const { data } = await apiClient.get('/challans', { params });
  return data.data;
}

export async function getChallan(id: string): Promise<Challan> {
  const { data } = await apiClient.get(`/challans/${id}`);
  return data.data;
}

export async function updateChallan(
  id: string,
  payload: Partial<Pick<Challan, 'truckNumber' | 'placeOfDelivery' | 'challanDate' | 'challanTime'>>,
): Promise<Challan> {
  const { data } = await apiClient.patch(`/challans/${id}`, payload);
  return data.data;
}

export async function deleteChallan(id: string, reason: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete(`/challans/${id}`, { data: { reason } });
  return data.data;
}

export async function registerPrint(id: string): Promise<Challan> {
  const { data } = await apiClient.post(`/challans/${id}/print`);
  return data.data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get('/dashboard');
  return data.data;
}
