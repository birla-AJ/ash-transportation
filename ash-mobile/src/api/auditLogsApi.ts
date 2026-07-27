import apiClient from './apiClient';
import { AuditLog, PaginatedResult } from '../types';

export async function listAuditLogs({
  page = 1,
  limit = 20,
}: { page?: number; limit?: number } = {}): Promise<PaginatedResult<AuditLog>> {
  const { data } = await apiClient.get('/audit-logs', { params: { page, limit } });
  return data.data;
}
