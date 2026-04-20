import api from './api';

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  email: string;
  stageName: string | null;
  socialId: string | null;
  category: string | null;
  soulColor: string | null;
  youtube: string | null;
  fbIg: string | null;
  rulesOk: boolean;
  message: string | null;
  answers: Record<string, unknown> | null;
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
  phone: string;
  email: string;
  stageName?: string;
  socialId?: string;
  category?: string;
  soulColor?: string;
  youtube?: string;
  fbIg?: string;
  rulesOk?: boolean;
  message?: string;
  answers?: Record<string, unknown>;
}

const registrationService = {
  // ── Public ──

  async getStatus(eventSlug: string): Promise<RegistrationStatus | null> {
    const { data } = await api.get(`/registrations/status/${eventSlug}`);
    return data.success ? data.data : null;
  },

  async submit(eventSlug: string, payload: RegistrationPayload): Promise<{ id: string }> {
    const { data } = await api.post(`/registrations/submit/${eventSlug}`, payload);
    if (!data.success) throw new Error(data.error || '報名失敗');
    return data.data;
  },

  // ── Admin ──

  async list(eventId: string): Promise<{ registrations: Registration[]; total: number }> {
    const { data } = await api.get(`/registrations/admin/${eventId}`);
    return { registrations: data.data ?? [], total: data.total ?? 0 };
  },

  async exportCsv(eventId: string, filename: string): Promise<void> {
    const res = await api.get(`/registrations/admin/${eventId}/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  async deleteOne(id: string): Promise<void> {
    await api.delete(`/registrations/admin/${id}`);
  },

  async updateSettings(eventId: string, settings: { registrationOpen?: boolean; registrationLimit?: number }) {
    const { data } = await api.patch(`/registrations/admin/${eventId}/settings`, settings);
    return data;
  },

  // TODO: TEMP TEST — delete this method when email is confirmed working
  async testEmail(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const { data } = await api.post('/registrations/admin/test-email', { email });
    return data;
  },
};

export default registrationService;
