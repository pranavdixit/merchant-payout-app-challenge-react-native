import { API_BASE_URL } from '@/constants';
import type { MerchantDataResponse, PaginatedActivityResponse } from '@/types/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const getMerchant = () => request<MerchantDataResponse>('/api/merchant');

export const getPaginatedActivities = (cursor?: string | null, limit = 15) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }
  return request<PaginatedActivityResponse>(`/api/merchant/activity?${params}`);
};
