import { apiClient } from './api';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    publicId: string;
  };
}

export interface UploadMultipleResponse {
  success: boolean;
  message: string;
  data: Array<{
    url: string;
    publicId: string;
  }>;
}

export const uploadApi = {
  // 上传单张图片
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.success && response.data?.url) {
      return response.data.url;
    }
    throw new Error(response.message || '上传失败');
  },

  // 上传多张图片
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post<UploadMultipleResponse>('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.success && response.data) {
      return response.data.map((item) => item.url);
    }
    throw new Error(response.message || '上传失败');
  },
};

