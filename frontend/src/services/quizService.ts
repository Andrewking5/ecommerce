import api from './api';

export interface LayoutConfig {
  // Hero card
  heroW: number; heroMt: number;
  // Character animation
  charW: number;
  // Left decoration
  leftW: number; leftTop: number; leftLeft: number;
  // Right decoration
  rightW: number; rightTop: number; rightRight: number;
  // Text / card widths
  textSaveW: number; textScrollW: number; textChanceW: number;
  personalityW: number; cityW: number;
  textGuessW: number; textSoundW: number; textHeardW: number;
  titleAyersW: number; titleMusicW: number;
  tagsW: number; textContestW: number; posterW: number; charTypeW: number;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  heroW: 80, heroMt: 10,
  charW: 76,
  leftW: 15, leftTop: 21, leftLeft: 0,
  rightW: 14, rightTop: 24, rightRight: 0,
  textSaveW: 75, textScrollW: 80, textChanceW: 90,
  personalityW: 100, cityW: 100,
  textGuessW: 50, textSoundW: 85, textHeardW: 85,
  titleAyersW: 80, titleMusicW: 75,
  tagsW: 100, textContestW: 85, posterW: 85, charTypeW: 65,
};

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

  async clearAll(): Promise<number> {
    const { data } = await api.delete('/quiz/admin/results');
    return data.success ? data.deleted : 0;
  },

  async getLayout(slug: string): Promise<LayoutConfig | null> {
    try {
      const { data } = await api.get(`/quiz/layout/${slug}`);
      return data.success ? data.data : null;
    } catch { return null; }
  },

  async saveLayout(slug: string, config: LayoutConfig): Promise<void> {
    await api.put(`/quiz/admin/layout/${slug}`, config);
  },
};

export default quizService;
