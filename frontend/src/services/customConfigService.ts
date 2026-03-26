import api from './api';

export interface CommunityConfig {
  id: string;
  title: string;
  selections: Record<string, string>;
  uploads: Record<string, string> | null;   // custom image URLs, e.g. {"inlayTop": "/uploads/custom/xxx.jpg"}
  thumbnail: string | null;
  totalPrice: number;
  likes: number;
  liked: boolean;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const customConfigService = {
  async getPublicConfigs(params?: {
    page?: number;
    limit?: number;
    sort?: 'likes' | 'latest';
  }): Promise<PaginatedResponse<CommunityConfig>> {
    const { data } = await api.get('/custom-configs/public', { params });
    return data.success ? data : { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  },

  async getMyConfigs(): Promise<CommunityConfig[]> {
    const { data } = await api.get('/custom-configs/mine');
    return data.success ? data.data : [];
  },

  async createConfig(config: {
    title: string;
    selections: Record<string, string>;
    uploads?: Record<string, string> | null;
    thumbnail?: string | null;
    totalPrice: number;
    isPublic?: boolean;
  }) {
    const { data } = await api.post('/custom-configs', config);
    return data;
  },

  async updateConfig(id: string, updates: Partial<{
    title: string;
    selections: Record<string, string>;
    uploads: Record<string, string> | null;
    thumbnail: string | null;
    totalPrice: number;
    isPublic: boolean;
  }>) {
    const { data } = await api.put(`/custom-configs/${id}`, updates);
    return data;
  },

  async deleteConfig(id: string) {
    const { data } = await api.delete(`/custom-configs/${id}`);
    return data;
  },

  async toggleLike(id: string): Promise<{ liked: boolean }> {
    const { data } = await api.post(`/custom-configs/${id}/like`);
    return data.success ? data.data : { liked: false };
  },

  // Upload the 3D canvas screenshot and return URL
  async uploadThumbnail(canvas: HTMLCanvasElement): Promise<string | null> {
    try {
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      );
      if (!blob) return null;

      const formData = new FormData();
      formData.append('image', blob, `custom-config-${Date.now()}.jpg`);

      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.success ? data.data[0]?.url : null;
    } catch {
      return null;
    }
  },
};

export default customConfigService;
