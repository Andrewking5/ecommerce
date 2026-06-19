import { Request, Response } from 'express';
import { prisma } from '../app';

/**
 * 訃聞系統 controller。
 * 公開：提交弔唁登記、讀取訃聞內容。
 * 管理：列表 / 匯出 / 刪除 / 清空 / 編輯訃聞內容 — 以 x-memorial-key 金鑰保護
 *       （刻意不走電商後台登入，獨立金鑰即可使用）。
 */

const NOTICE_KEY = 'notice';

/** 驗證管理金鑰；未通過時回 401 並回傳 false。 */
function checkKey(req: Request, res: Response): boolean {
  const secret = process.env.MEMORIAL_KEY || 'ayers-memorial';
  const provided = req.headers['x-memorial-key'];
  if (provided !== secret) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

/** CSV 欄位跳脫（含逗號 / 引號 / 換行時用雙引號包起來）。 */
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

interface EntryInput {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  attending?: boolean | null;
  headcount?: number | string | null;
  giftAmount?: number | string | null;
  note?: string;
}

/** 轉成正整數或 null。 */
function toIntOrNull(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export class MemorialController {
  /** POST /api/memorial/entries — 親友提交弔唁登記（公開，無需金鑰） */
  static async submitEntry(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as EntryInput;
      const name = (body.name || '').trim();
      if (!name) {
        res.status(400).json({ success: false, error: '姓名為必填' });
        return;
      }
      if (name.length > 100) {
        res.status(400).json({ success: false, error: '姓名過長' });
        return;
      }
      const address = (body.address || '').trim();
      if (!address) {
        res.status(400).json({ success: false, error: '地址為必填' });
        return;
      }

      await prisma.memorialEntry.create({
        data: {
          name,
          relationship: (body.relationship || '').trim() || null,
          phone: (body.phone || '').trim() || null,
          email: (body.email || '').trim() || null,
          address,
          attending: typeof body.attending === 'boolean' ? body.attending : null,
          headcount: toIntOrNull(body.headcount),
          giftAmount: toIntOrNull(body.giftAmount),
          note: (body.note || '').trim() || null,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to submit memorial entry:', error);
      res.status(500).json({ success: false, error: '送出失敗，請稍後再試' });
    }
  }

  /** GET /api/memorial/entries — 列出所有登記（金鑰保護），?format=csv 匯出 */
  static async listEntries(req: Request, res: Response): Promise<void> {
    if (!checkKey(req, res)) return;
    try {
      const { format } = req.query as { format?: string };

      const rows = await prisma.memorialEntry.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'csv') {
        const header = '姓名,與往生者關係,電話,Email,地址,是否出席,人數,奠儀金額,備註,登記時間';
        const lines = rows.map((r) =>
          [
            r.name,
            r.relationship ?? '',
            r.phone ?? '',
            r.email ?? '',
            r.address ?? '',
            r.attending === true ? '出席' : r.attending === false ? '不克出席' : '',
            r.headcount ?? '',
            r.giftAmount ?? '',
            r.note ?? '',
            r.createdAt.toISOString(),
          ].map(csvCell).join(',')
        );
        const csv = [header, ...lines].join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="memorial-entries.csv"');
        // 前置 UTF-8 BOM，讓 Excel（中文 Windows 預設 Big5）正確顯示中文
        res.send(String.fromCharCode(0xfeff) + csv);
        return;
      }

      const summary = {
        total: rows.length,
        attendingCount: rows.filter((r) => r.attending === true).length,
        totalHeadcount: rows.reduce((s, r) => s + (r.attending === true ? r.headcount ?? 0 : 0), 0),
        totalGift: rows.reduce((s, r) => s + (r.giftAmount ?? 0), 0),
      };

      res.json({ success: true, summary, data: rows });
    } catch (error) {
      console.error('Failed to list memorial entries:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch' });
    }
  }

  /** PUT /api/memorial/entries/:id — 更新單筆（金鑰保護） */
  static async updateEntry(req: Request, res: Response): Promise<void> {
    if (!checkKey(req, res)) return;
    try {
      const { id } = req.params;
      const body = req.body as EntryInput;
      const name = (body.name || '').trim();
      if (!name) {
        res.status(400).json({ success: false, error: '姓名為必填' });
        return;
      }
      if (name.length > 100) {
        res.status(400).json({ success: false, error: '姓名過長' });
        return;
      }

      await prisma.memorialEntry.update({
        where: { id },
        data: {
          name,
          relationship: (body.relationship || '').trim() || null,
          phone: (body.phone || '').trim() || null,
          email: (body.email || '').trim() || null,
          address: (body.address || '').trim() || null,
          attending: typeof body.attending === 'boolean' ? body.attending : null,
          headcount: toIntOrNull(body.headcount),
          giftAmount: toIntOrNull(body.giftAmount),
          note: (body.note || '').trim() || null,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Failed to update memorial entry:', error);
      res.status(500).json({ success: false, error: 'Failed to update' });
    }
  }

  /** DELETE /api/memorial/entries/:id — 刪除單筆（金鑰保護） */
  static async deleteEntry(req: Request, res: Response): Promise<void> {
    if (!checkKey(req, res)) return;
    try {
      const { id } = req.params;
      await prisma.memorialEntry.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete memorial entry:', error);
      res.status(500).json({ success: false, error: 'Failed to delete' });
    }
  }

  /** DELETE /api/memorial/entries — 清空全部（金鑰保護） */
  static async clearEntries(req: Request, res: Response): Promise<void> {
    if (!checkKey(req, res)) return;
    try {
      const { count } = await prisma.memorialEntry.deleteMany();
      res.json({ success: true, deleted: count });
    } catch (error) {
      console.error('Failed to clear memorial entries:', error);
      res.status(500).json({ success: false, error: 'Failed to clear' });
    }
  }

  /** GET /api/memorial/notice — 讀取訃聞內容（公開） */
  static async getNotice(_req: Request, res: Response): Promise<void> {
    try {
      const row = await prisma.memorialConfig.findUnique({ where: { key: NOTICE_KEY } });
      res.json({ success: true, data: row?.value ?? null });
    } catch (error) {
      console.error('Failed to get memorial notice:', error);
      res.status(500).json({ success: false, error: 'Failed to get notice' });
    }
  }

  /** PUT /api/memorial/notice — 編輯訃聞內容（金鑰保護） */
  static async saveNotice(req: Request, res: Response): Promise<void> {
    if (!checkKey(req, res)) return;
    try {
      const value = req.body;
      if (!value || typeof value !== 'object') {
        res.status(400).json({ success: false, error: 'Invalid data' });
        return;
      }
      await prisma.memorialConfig.upsert({
        where: { key: NOTICE_KEY },
        update: { value },
        create: { key: NOTICE_KEY, value },
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to save memorial notice:', error);
      res.status(500).json({ success: false, error: 'Failed to save notice' });
    }
  }
}
