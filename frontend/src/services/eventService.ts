import api from './api';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  referralCode: string;
  landingUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  couponCode: string | null;
  discountNote: string | null;
  totalScans: number;
  uniqueVisitors: number;
  isActive: boolean;
  metadata?: { rules?: Array<{ short: string; full: string }> } | null;
  createdAt: string;
  updatedAt: string;
  _count?: { clicks: number };
}

export interface EventAnalytics {
  totalClicks: number;
  totalScans: number;
  uniqueVisitors: number;
  deviceBreakdown: { device: string; count: number }[];
  dailyClicks: { date: string; count: number }[];
}

const eventService = {
  // ── Public ──
  async getActiveEvents(): Promise<Event[]> {
    const { data } = await api.get('/events');
    return data.success ? data.data : [];
  },

  async getEventBySlug(slug: string): Promise<Event | null> {
    const { data } = await api.get(`/events/slug/${slug}`);
    return data.success ? data.data : null;
  },

  async trackClick(code: string): Promise<{ redirectUrl: string } | null> {
    const { data } = await api.get(`/events/r/${code}`);
    return data.success ? data : null;
  },

  // ── Admin ──
  async getAllEvents(): Promise<Event[]> {
    const { data } = await api.get('/events/admin');
    return data.success ? data.data : [];
  },

  async getEventById(id: string): Promise<Event | null> {
    const { data } = await api.get(`/events/admin/${id}`);
    return data.success ? data.data : null;
  },

  async createEvent(event: Partial<Event>) {
    const { data } = await api.post('/events/admin', event);
    return data;
  },

  async updateEvent(id: string, updates: Partial<Event>) {
    const { data } = await api.put(`/events/admin/${id}`, updates);
    return data;
  },

  async deleteEvent(id: string) {
    const { data } = await api.delete(`/events/admin/${id}`);
    return data;
  },

  async toggleEvent(id: string) {
    const { data } = await api.patch(`/events/admin/${id}/toggle`);
    return data;
  },

  async getEventAnalytics(id: string): Promise<EventAnalytics | null> {
    const { data } = await api.get(`/events/admin/${id}/analytics`);
    return data.success ? data.data : null;
  },
};

export default eventService;
