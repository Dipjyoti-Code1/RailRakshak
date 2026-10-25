import {
  JourneyCreate,
  JourneyResponse,
  IncidentCreate,
  IncidentResponse,
  IncidentStatusUpdate,
  OfficerDutyCreate,
  OfficerDutyResponse,
  OfficerMatchResponse,
  SystemHealthResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token =
    localStorage.getItem('railrakshak_auth_token') ||
    localStorage.getItem('railrakshak_officer_token') ||
    'demo-authority-token';

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Authorization') && token) {
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('X-Authority-Token', token);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorBody: any = null;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }

      const msg =
        errorBody?.detail ||
        errorBody?.message ||
        `Request failed with status ${res.status}: ${res.statusText}`;
      throw new ApiError(msg, res.status, errorBody);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err.message || 'Network error occurred while connecting to RailRakshak backend.',
      0
    );
  }
}

export const api = {
  // System Health
  getHealth: () => request<SystemHealthResponse>('/api/health'),

  // Journeys
  createJourney: (data: JourneyCreate) =>
    request<JourneyResponse>('/api/journeys', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getJourney: (journeyId: string) =>
    request<JourneyResponse>(`/api/journeys/${encodeURIComponent(journeyId)}`),

  // Incidents
  createIncident: (data: IncidentCreate) =>
    request<IncidentResponse>('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  listIncidents: (params: { status?: string; category?: string; search?: string; limit?: number; skip?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.skip) query.set('skip', params.skip.toString());
    const qs = query.toString();
    return request<IncidentResponse[]>(`/api/incidents${qs ? `?${qs}` : ''}`);
  },

  getIncident: (incidentId: string) =>
    request<IncidentResponse>(`/api/incidents/${encodeURIComponent(incidentId)}`),

  updateIncidentStatus: (incidentId: string, statusUpdate: IncidentStatusUpdate) =>
    request<IncidentResponse>(`/api/incidents/${encodeURIComponent(incidentId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusUpdate)
    }),

  getPotentialOfficers: (incidentId: string) =>
    request<OfficerMatchResponse[]>(`/api/incidents/${encodeURIComponent(incidentId)}/potential-officers`),

  // Officer Duty
  registerOfficerDuty: (data: OfficerDutyCreate) =>
    request<OfficerDutyResponse>('/api/officers/duty', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  listOfficersOnDuty: (trainOrArea?: string) => {
    const query = trainOrArea ? `?train_or_area=${encodeURIComponent(trainOrArea)}` : '';
    return request<OfficerDutyResponse[]>(`/api/officers/on-duty${query}`);
  },

  // Authority Auth
  login: (username: string, password: string) =>
    request<{ access_token: string; role: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
};
