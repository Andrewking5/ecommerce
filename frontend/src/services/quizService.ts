import api from './api';

/** 每個素材的版面設定 */
export interface AssetConfig {
  w: number;   // 寬度 % (相對於容器)
  mt: number;  // 上邊距 px（流式素材）或 top %（charRight 絕對定位）
  x: number;   // 左右偏移 px（流式素材）或 right %（charRight 絕對定位）
  y: number;   // 上下偏移 px（translateY，不影響排版）
  z: number;   // z-index
}

export type AssetKey =
  | 'heroCard'
  | 'textSave' | 'textScroll' | 'textChance'
  | 'char' | 'charRight'
  | 'personalityCard' | 'cityCard' | 'textGuess'
  | 'textSound' | 'titleAyers'
  | 'guitar1' | 'guitar2' | 'btnUnlock1' | 'btnUnlock2'
  | 'textHeard' | 'titleMusic'
  | 'tag1' | 'tag2' | 'tag3' | 'tag4'
  | 'textContest' | 'poster' | 'charType'
  | 'btnShare' | 'btnRetry' | 'btnContest';

export type LayoutConfig = Record<AssetKey, AssetConfig>;

// 快捷建立 AssetConfig
const a = (w: number, mt: number, x = 0, y = 0, z = 1): AssetConfig => ({ w, mt, x, y, z });

export const DEFAULT_LAYOUT: LayoutConfig = {
  heroCard:        a(100, 43),           // full width — assets are pre-sized by designer
  textSave:        a(75,  12),           // mt-3
  textScroll:      a(80,  16),           // mt-4
  textChance:      a(90,  20),           // mt-5
  char:            a(76,  16, 0, 0, 0),  // mt-4; z=0（在裝飾圖下層）
  charRight:       a(14,  24, 0, 0, 10), // mt=top%, x=right%, z=10（絕對定位）
  personalityCard: a(100, 32),           // mt-8
  cityCard:        a(100, 32),           // mt-8
  textGuess:       a(50,  20),           // mt-5
  textSound:       a(85,  40),           // mt-10
  titleAyers:      a(80,  40),           // mt-10
  guitar1:         a(100,  0),           // 吉他圖1（grid cell 內 full width）
  guitar2:         a(100,  0),           // 吉他圖2
  btnUnlock1:      a(90,   8),           // 解鎖按鈕1
  btnUnlock2:      a(90,   8),           // 解鎖按鈕2
  textHeard:       a(85,  32),           // mt-8
  titleMusic:      a(75,  32),           // mt-8
  tag1:            a(100, 16),           // 標籤1（含 titleMusic→tags 間距）
  tag2:            a(100,  0),
  tag3:            a(100,  0),
  tag4:            a(100,  0),
  textContest:     a(85,  12),           // mt-3
  poster:          a(85,  24),           // mt-6
  charType:        a(65,   0),           // 在 flex 容器內，mt 由容器控制
  btnShare:        a(49,   0),           // 分享按鈕（flex row 內約 49%）
  btnRetry:        a(49,   0),           // 再測一次
  btnContest:      a(100, 16),           // 前往比賽（mt-4 from gap）
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

  async saveLayout(slug: string, config: LayoutConfig, editKey?: string): Promise<void> {
    await api.put(`/quiz/admin/layout/${slug}`, config, {
      headers: editKey ? { 'X-Quiz-Key': editKey } : {},
    });
  },
};

export default quizService;
