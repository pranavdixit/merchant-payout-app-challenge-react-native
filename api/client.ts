import { API_BASE_URL } from '@/constants';
import type {
  CreatePayoutRequest,
  MerchantDataResponse,
  PaginatedActivityResponse,
  PayoutResponse,
} from '@/types/api';

/** A non-2xx response, carrying the status and the server's `error` message when present. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function errorMessage(res: Response): Promise<string> {
  const body: unknown = await res.json().catch(() => null);
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'string'
  ) {
    return body.error;
  }
  return `Request failed (${res.status})`;
}

const REQUEST_TIMEOUT_MS = 15000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res));
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

/** The idempotency key lets the server de-duplicate a retry of a request whose response was lost. */
export const createPayout = ({
  idempotencyKey,
  ...payout
}: CreatePayoutRequest & { idempotencyKey: string }) =>
  request<PayoutResponse>('/api/payouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(payout),
  });
