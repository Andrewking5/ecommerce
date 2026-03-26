import api from './api';

export interface HomeBanner {
  id: string;
  slug: string;
  placement: string;
  subtitle: string;
  titleWord1: string;
  titleWord2: string;
  titleColor1: string;
  titleColor2: string;
  body: string;
  ctaLabel: string;
  ctaLink: string;
  image: string;
  productImage: string | null;
  gradientColor: string;
  displayOrder: number;
  isActive: boolean;
}

const bannerService = {
  /** Get active banners, optionally filtered by placement ("home" | "collections") */
  async getActiveBanners(placement?: string): Promise<HomeBanner[]> {
    const params = placement ? `?placement=${placement}` : '';
    const { data } = await api.get(`/banners${params}`);
    return data.success ? data.data : [];
  },
  async getAllBanners(): Promise<HomeBanner[]> {
    const { data } = await api.get('/banners/admin');
    return data.success ? data.data : [];
  },
  async createBanner(banner: Partial<HomeBanner>) {
    const { data } = await api.post('/banners/admin', banner);
    return data;
  },
  async updateBanner(id: string, updates: Partial<HomeBanner>) {
    const { data } = await api.put(`/banners/admin/${id}`, updates);
    return data;
  },
  async deleteBanner(id: string) {
    const { data } = await api.delete(`/banners/admin/${id}`);
    return data;
  },
  async toggleBanner(id: string) {
    const { data } = await api.patch(`/banners/admin/${id}/toggle`);
    return data;
  },
  async reorderBanners(orderedIds: string[]) {
    const orders = orderedIds.map((id, index) => ({ id, displayOrder: index }));
    const { data } = await api.put('/banners/admin/reorder', { orders });
    return data;
  },
};

export default bannerService;
