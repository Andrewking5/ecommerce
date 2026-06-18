import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2, Lock, Search, Download, Trash2, RefreshCw,
  AlertTriangle, Edit3, Save, X,
} from 'lucide-react';
import SEO from '../components/SEO';
import memorialService, {
  type MemorialEntry, type MemorialSummary, type MemorialNotice,
} from '../services/memorialService';

/* ═══════════════════════════════════════════════════
   訃聞 — 管理頁（金鑰保護，不走電商後台）
   搜尋 / 篩選 / 統計 / 匯出 CSV / 單筆刪除 / 一鍵清空 / 編輯訃聞
   ═══════════════════════════════════════════════════ */

const KEY_STORE = 'memorial_admin_key';
const INK = '#2b2b2b';

type Filter = 'all' | 'yes' | 'no';

const NTD = (n: number) => `NT$ ${n.toLocaleString('en-US')}`;
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function MemorialManage() {
  const [key, setKey] = useState<string>(() => localStorage.getItem(KEY_STORE) || '');
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [entries, setEntries] = useState<MemorialEntry[]>([]);
  const [summary, setSummary] = useState<MemorialSummary>({ total: 0, attendingCount: 0, totalHeadcount: 0, totalGift: 0 });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async (k: string) => {
    setLoading(true);
    setAuthError('');
    try {
      const { summary, data } = await memorialService.listEntries(k);
      setEntries(data);
      setSummary(summary);
      setAuthed(true);
      localStorage.setItem(KEY_STORE, k);
      setKey(k);
    } catch (e: any) {
      if (e?.response?.status === 401) {
        setAuthError('金鑰錯誤');
        setAuthed(false);
        localStorage.removeItem(KEY_STORE);
      } else {
        setAuthError('載入失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 已存金鑰 → 自動嘗試登入
  useEffect(() => {
    if (key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter === 'yes' && e.attending !== true) return false;
      if (filter === 'no' && e.attending !== false) return false;
      if (!q) return true;
      return [e.name, e.relationship, e.phone, e.email, e.note]
        .some((v) => (v || '').toLowerCase().includes(q));
    });
  }, [entries, query, filter]);

  const handleDelete = async (e: MemorialEntry) => {
    if (!confirm(`確定刪除「${e.name}」這筆登記？`)) return;
    await memorialService.deleteEntry(e.id, key);
    load(key);
  };

  const handleClearAll = async () => {
    if (!confirm(`確定清空全部 ${summary.total} 筆登記？此動作無法復原。`)) return;
    if (!confirm('再次確認：所有資料將永久刪除，確定？')) return;
    await memorialService.clearAll(key);
    load(key);
  };

  // ── 金鑰登入畫面 ─────────────────────────
  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
        <SEO title="訃聞管理" />
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
          <Lock className="mx-auto mb-4 h-9 w-9 text-gray-400" />
          <h1 className="mb-1 text-center text-xl font-semibold text-gray-800">訃聞登記管理</h1>
          <p className="mb-6 text-center text-sm text-gray-400">請輸入管理金鑰</p>
          <form
            onSubmit={(ev) => { ev.preventDefault(); if (keyInput.trim()) load(keyInput.trim()); }}
          >
            <input
              type="password"
              autoFocus
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="管理金鑰"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
            />
            {authError && <p className="mt-3 text-center text-sm text-red-500">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white disabled:opacity-60"
              style={{ background: INK }}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '進入'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── 管理主畫面 ───────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO title="訃聞管理" />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-gray-800">弔唁登記管理</h1>
          <div className="flex gap-2">
            <button
              onClick={() => load(key)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" /> 重新整理
            </button>
            <button
              onClick={() => memorialService.exportCsv(key)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" /> 匯出 CSV
            </button>
          </div>
        </div>

        {/* 統計 */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="登記筆數" value={String(summary.total)} />
          <Stat label="出席人數（筆）" value={String(summary.attendingCount)} />
          <Stat label="出席總人數" value={String(summary.totalHeadcount)} />
          <Stat label="奠儀總額" value={NTD(summary.totalGift)} />
        </div>

        <NoticeEditor authKey={key} />

        {/* 搜尋 + 篩選 */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋姓名 / 關係 / 電話 / 備註…"
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gray-500"
            />
          </div>
          <div className="flex gap-1 rounded-lg border border-gray-300 bg-white p-1">
            {([['all', '全部'], ['yes', '出席'], ['no', '不克出席']] as const).map(([v, t]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  filter === v ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 列表 */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-gray-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center text-gray-400 shadow-sm">
            {entries.length === 0 ? '目前還沒有任何登記' : '沒有符合條件的登記'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div key={e.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-gray-800">{e.name}</span>
                      {e.relationship && <span className="text-sm text-gray-500">· {e.relationship}</span>}
                      {e.attending === true && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">
                          出席{e.headcount ? ` ${e.headcount} 位` : ''}
                        </span>
                      )}
                      {e.attending === false && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">不克出席</span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      {e.phone && <span>📞 {e.phone}</span>}
                      {e.email && <span>✉️ {e.email}</span>}
                      {e.giftAmount != null && <span className="text-gray-700">奠儀 {NTD(e.giftAmount)}</span>}
                    </div>
                    {e.note && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">{e.note}</p>}
                    <p className="mt-2 text-xs text-gray-300">{fmtTime(e.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(e)}
                    title="刪除這筆"
                    className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 危險區 — 一鍵清空 */}
        {entries.length > 0 && (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-red-700">
              <AlertTriangle className="h-4 w-4" /> 危險操作
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm text-red-600">永久刪除全部 {summary.total} 筆登記資料。</p>
              <button
                onClick={handleClearAll}
                className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                一鍵清空全部
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}

/* ── 訃聞內容編輯器 ────────────────────── */
function NoticeEditor({ authKey }: { authKey: string }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [n, setN] = useState<MemorialNotice>({});

  useEffect(() => {
    memorialService.getNotice().then((v) => v && setN(v));
  }, []);

  const set = (k: keyof MemorialNotice, v: string) => { setN((p) => ({ ...p, [k]: v })); setSaved(false); };

  const save = async () => {
    setSaving(true);
    try {
      await memorialService.saveNotice(n, authKey);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const fields: [keyof MemorialNotice, string, boolean?][] = [
    ['deceasedName', '往生者姓名'],
    ['bornDate', '生（如：1940.01.01）'],
    ['passedDate', '卒（如：2026.06.01）'],
    ['ceremonyTime', '告別式時間'],
    ['ceremonyPlace', '告別式地點'],
    ['familyName', '治喪家屬／聯絡人'],
    ['message', '訃告內文', true],
  ];

  return (
    <div className="mb-6 rounded-xl bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700"
      >
        <span className="flex items-center gap-2"><Edit3 className="h-4 w-4" /> 編輯訃聞內容（顯示於公開頁上方）</span>
        {open ? <X className="h-4 w-4 text-gray-400" /> : <span className="text-xs text-gray-400">展開</span>}
      </button>
      {open && (
        <div className="space-y-3 border-t border-gray-100 px-4 py-4">
          {fields.map(([k, label, multiline]) => (
            <div key={k}>
              <label className="mb-1 block text-xs text-gray-500">{label}</label>
              {multiline ? (
                <textarea
                  value={(n[k] as string) || ''}
                  onChange={(e) => set(k, e.target.value)}
                  className="min-h-[72px] w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                />
              ) : (
                <input
                  value={(n[k] as string) || ''}
                  onChange={(e) => set(k, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ background: INK }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 儲存
            </button>
            {saved && <span className="text-sm text-green-600">已儲存 ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
