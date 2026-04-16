import api from './api';

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  stageName: string | null;
  phone: string;
  email: string;
  socialId: string;
  category: string;
  soulColor: string;
  youtube: string;
  fbIg: string;
  rulesOk: boolean;
  message: string | null;
  createdAt: string;
}

export interface RegistrationStatus {
  open: boolean;
  count: number;
  limit: number;
  full: boolean;
}

export interface RegistrationPayload {
  name: string;
  stageName?: string;
  phone: string;
  email: string;
  socialId: string;
  category: '彈唱組' | '演奏組';
  soulColor: string;
  youtube: string;
  fbIg: string;
  rulesOk: boolean;
  message?: string;
}

const registrationService = {
  // ── Public ──

  async getStatus(eventSlug: string): Promise<RegistrationStatus | null> {
    const { data } = await api.get(`/registrations/status/${eventSlug}`);
    return data.success ? data.data : null;
  },

  async submit(eventSlug: string, payload: RegistrationPayload): Promise<{ id: string }> {
    const { data } = await api.post(`/registrations/${eventSlug}`, payload);
    if (!data.success) throw new Error(data.error || '報名失敗');
    return data.data;
  },

  // ── Admin ──

  async list(eventId: string): Promise<{ registrations: Registration[]; total: number }> {
    const { data } = await api.get(`/registrations/admin/${eventId}`);
    return { registrations: data.data ?? [], total: data.total ?? 0 };
  },

  exportUrl(eventId: string): string {
    return `${api.defaults.baseURL}/registrations/admin/${eventId}/export`;
  },

  async deleteOne(id: string): Promise<void> {
    await api.delete(`/registrations/admin/${id}`);
  },

  async updateSettings(eventId: string, settings: { registrationOpen?: boolean; registrationLimit?: number }) {
    const { data } = await api.patch(`/registrations/admin/${eventId}/settings`, settings);
    return data;
  },
};

export default registrationService;
