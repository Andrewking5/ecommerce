import api from './api';

/** 訃聞內容（彈性 JSON，欄位皆選填） */
export interface MemorialNotice {
  deceasedName?: string;   // 往生者姓名
  bornDate?: string;       // 生（日期文字）
  passedDate?: string;     // 卒（日期文字）
  ceremonyTime?: string;   // 告別式時間
  ceremonyPlace?: string;  // 告別式地點
  familyName?: string;     // 治喪家屬／聯絡人
  message?: string;        // 自由文字（訃告內文）
}

/** 一筆弔唁登記 */
export interface MemorialEntry {
  id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  attending: boolean | null;
  headcount: number | null;
  giftAmount: number | null;
  note: string | null;
  createdAt: string;
}

export interface MemorialSummary {
  total: number;
  attendingCount: number;
  totalHeadcount: number;
  totalGift: number;
}

/** 親友提交表單時的輸入 */
export interface MemorialEntryInput {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  attending?: boolean | null;
  headcount?: number | null;
  giftAmount?: number | null;
  note?: string;
}

const keyHeader = (key: string) => ({ headers: { 'X-Memorial-Key': key } });

const memorialService = {
  // ── 公開 ──────────────────────────────
  async submitEntry(input: MemorialEntryInput): Promise<void> {
    await api.post('/memorial/entries', input);
  },

  async getNotice(): Promise<MemorialNotice | null> {
    try {
      const { data } = await api.get('/memorial/notice');
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  },

  // ── 管理（需金鑰）──────────────────────
  async listEntries(key: string): Promise<{ summary: MemorialSummary; data: MemorialEntry[] }> {
    const { data } = await api.get('/memorial/entries', keyHeader(key));
    return {
      summary: data.summary ?? { total: 0, attendingCount: 0, totalHeadcount: 0, totalGift: 0 },
      data: data.data ?? [],
    };
  },

  async deleteEntry(id: string, key: string): Promise<void> {
    await api.delete(`/memorial/entries/${id}`, keyHeader(key));
  },

  async clearAll(key: string): Promise<number> {
    const { data } = await api.delete('/memorial/entries', keyHeader(key));
    return data.success ? data.deleted : 0;
  },

  async saveNotice(notice: MemorialNotice, key: string): Promise<void> {
    await api.put('/memorial/notice', notice, keyHeader(key));
  },

  async exportCsv(key: string, filename = 'memorial-entries.csv'): Promise<void> {
    const res = await api.get('/memorial/entries?format=csv', {
      ...keyHeader(key),
      responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

export default memorialService;
