import { vi } from 'vitest';

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  defaults: { baseURL: 'http://localhost:3001/api' },
};

export default mockApi;
