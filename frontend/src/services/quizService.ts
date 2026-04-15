import api from './api';

export interface QuizAnalytics {
  total: number;
  byResult: { slug: string; label: string; count: number }[];
  byDevice: { device: string; count: number }[];
  daily: { date: string; count: number }[];
}

const quizService = {
  async trackResult(slug: string, resultKey: string): Promise<void> {
    try {
      await api.post('/quiz/results', { slug, resultKey });
    } catch {
      // Analytics errors should never interrupt the user experience
    }
  },

  async getAnalytics(): Promise<QuizAnalytics | null> {
    const { data } = await api.get('/quiz/admin/analytics');
    return data.success ? data.data : null;
  },
};

export default quizService;
