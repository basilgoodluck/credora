import type { Dashboard, HistoryResponse, InvestigationCase, JobStatus, NotificationItem, User } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (refreshed.ok) return request<T>(path, init, false);
  }
  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }
  return (await response.json()) as T;
}

export const api = {
  register: (phone_number: string) => request<{ ok: true }>('/auth/register', { method: 'POST', body: JSON.stringify({ phone_number }) }),
  sendOtp: (phone_number: string, purpose: 'signup' | 'login' | 'reset_password' = 'signup') =>
    request<{ ok: true }>('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone_number, purpose }) }),
  verifyOtp: (phone_number: string, otp: string, purpose: 'signup' | 'login' | 'reset_password' = 'signup') =>
    request<{ ok: true }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone_number, otp, purpose }) }),
  setPassword: (password: string) => request<{ ok: true }>('/auth/set-password', { method: 'POST', body: JSON.stringify({ password }) }),
  setPin: (pin: string, trust_device = true) =>
    request<{ ok: true }>('/auth/set-pin', { method: 'POST', body: JSON.stringify({ pin, trust_device }) }),
  login: (phone_number: string, password: string) =>
    request<{ ok: true }>('/auth/login', { method: 'POST', body: JSON.stringify({ phone_number, password, trust_device: true }) }),
  me: () => request<User>('/me'),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  dashboard: () => request<Dashboard>('/me/dashboard'),
  uploadEvidence: (payload: FormData) => request<{ evidence_id: string; job_id: string; status: string }>('/me/evidence', { method: 'POST', body: payload }),
  rescore: () => request<{ job_id: string; status: string }>('/me/score', { method: 'POST' }),
  history: () => request<HistoryResponse>('/me/history'),
  cases: () => request<InvestigationCase[]>('/me/cases'),
  notifications: () => request<NotificationItem[]>('/me/notifications'),
  job: (jobId: string) => request<JobStatus>(`/jobs/${jobId}`),
};
