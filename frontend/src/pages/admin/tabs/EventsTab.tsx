import { motion } from 'motion/react';
import {
  Plus, Trash2, RefreshCw, Edit, Eye, EyeOff, CalendarDays, MapPin, QrCode, Link, Copy, Check,
  ExternalLink, FileText, X, Save, ChevronDown, ChevronRight, ChevronLeft, Users, Download, AlertTriangle, BarChart3, TrendingUp, Mail, Newspaper,
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { cn } from '@/src/lib/utils';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCode } from 'react-qrcode-logo';
import eventService, { type Event as EventType, type EventAnalytics } from '@/src/services/eventService';
import quizService, { type QuizAnalytics, type QuizShareEmail } from '@/src/services/quizService';
import registrationService, { type Registration, type ReferralStats } from '@/src/services/registrationService';
import { mergeInfoContent, type InfoContent } from '@/src/data/soulGuitarInfoContent';
import { CARD_BG, CHART_PALETTE } from '../constants';
import { toLocalDatetimeValue, toSlug } from '../utils';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import EmptyChart from '../components/EmptyChart';

/* ─── Constants ─── */

const SOUL_GUITAR_INFO_DEFAULT_RULES = [
  { short: '演奏組上傳 YouTube（必須）及 Instagram / Facebook（擇一）', full: '並將影片標題命名為「參賽曲名_姓名_演奏組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。' },
  { short: '彈唱組上傳 YouTube（必須）及 Instagram / Facebook（擇一）', full: '並將影片標題命名為「參賽曲名_姓名_彈唱組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。' },
  { short: '影片彈唱前需說明', full: '「大家好我是（本名/藝名/團名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂（⚠️需與身上顏色相同），（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」' },
  { short: '影片 30~120 秒', full: '影片總時長需為 30 秒至 120 秒。' },
  { short: '直式一鏡到底', full: '錄製影像需為直式固定鏡頭一鏡到底，禁止合成、剪輯、運鏡、轉場效果。' },
  { short: '穿著指定顏色', full: '同一組別穿著顏色需相同（指定顏色為：橘色、黃色、藍色、黑色、白色或紅色其中一種）。' },
  { short: '露臉 + 完整上半身', full: '參賽者須清楚露臉、至少完整上半身得以看清楚左、右手彈奏姿勢。' },
  { short: '自選一首中/英文曲', full: '限定參賽者自選一首中文（本土語系）、英文或演奏曲目，改編曲及原創曲均可。' },
  { short: '禁止效果器 / Loop', full: '聲音呈現，只能出現收錄當下參賽者本人歌聲、畫面中彈奏的木吉他聲。禁止人聲合音效果器、Loop 錄音循環。' },
  { short: '1~5 人，至少一把鋼弦吉他', full: '禁止對嘴代彈，如不符合以上規定將取消比賽資格。' },
  { short: '影片須維持公開', full: '參賽影片須於評審期間維持公開狀態，如因刪除或隱藏導致無法評分，視同放棄資格。' },
  { short: '每支影片對應一份表單', full: '' },
  { short: 'Ayers 主辦保有最終決策權', full: '' },
];

const SOUL_GUITAR_REG_DEFAULT_RULES: Array<{ zh: string; en: string }> = [
  { zh: '演奏組上傳 YouTube（必須）及 Instagram / Facebook（擇一）　— 並將影片標題命名為「參賽曲名_姓名_演奏組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。', en: 'Instrumental Category: upload to YouTube (required) and Instagram or Facebook (one) — title the video "Song Title_Name_Instrumental Category #2026AyersSoulGuitaristCompetition". Posts must also include the hashtag #2026AyersSoulGuitaristCompetition.' },
  { zh: '彈唱組上傳 YouTube（必須）及 Instagram / Facebook（擇一）　— 並將影片標題命名為「參賽曲名_姓名_彈唱組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。', en: 'Singing & Playing Category: upload to YouTube (required) and Instagram or Facebook (one) — title the video "Song Title_Name_Singing & Playing Category #2026AyersSoulGuitaristCompetition". Posts must also include the hashtag #2026AyersSoulGuitaristCompetition.' },
  { zh: '影片彈唱前需說明　— 「大家好我是（本名/藝名/團名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂（⚠️需與身上顏色相同），（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」', en: 'Before performing, say on camera — "Hello everyone, I am (name/stage name/band). I am joining the 2026 Ayers Soul Guitarist Competition, registering for the (category). My soul is (xx) guitar soul (⚠️ must match the color worn). (One sentence for everyone.) The competition piece is (Song Title) by (Composer)."' },
  { zh: '若團體內測驗結果不一致，仍需統一穿著同一顏色。　— 同一組別穿著顏色需相同（指定顏色為：橘色、黃色、藍色、黑色、白色或紅色其中一種）。', en: 'If group members have different quiz results, they must still wear the same color. — All members of a group must wear the same designated color: orange, yellow, blue, black, white, or red.' },
  { zh: '影片 30~120 秒　— 影片總時長需為 30 秒至 120 秒。', en: 'Video length 30–120 seconds — The total video duration must be between 30 and 120 seconds.' },
  { zh: '直式一鏡到底　— 錄製影像需為直式固定鏡頭一鏡到底，禁止合成、剪輯、運鏡、轉場效果。', en: 'Vertical, single continuous take — The recording must be vertical, fixed-camera, one continuous take. Editing, compositing, camera movement, and transitions are prohibited.' },
  { zh: '露臉 + 完整上半身　— 參賽者須清楚露臉、至少完整上半身得以看清楚左、右手彈奏姿勢。', en: 'Face + full upper body visible — Participants must clearly show their face and at least their full upper body so both hands are visible while playing.' },
  { zh: '自選一首中/英文曲　— 限定參賽者自選一首中文（本土語系）、英文或演奏曲目，改編曲及原創曲均可。', en: 'One chosen piece in Chinese or English — Participants must choose one piece in Chinese (including local languages), English, or instrumental. Arrangements and original compositions are allowed.' },
  { zh: '禁止效果器 / Loop　— 聲音呈現，只能出現收錄當下參賽者本人歌聲、畫面中彈奏的木吉他聲。禁止人聲合音效果器、Loop 錄音循環。', en: "No effects / loop — Only the participant's live vocals and the acoustic guitar played on screen may appear in the audio. Vocal harmony effects and loop recording are prohibited." },
  { zh: '1~5 人，至少一把鋼弦吉他　— 禁止對嘴代彈，如不符合以上規定將取消比賽資格。', en: '1–5 participants, at least one steel-string guitar — Lip-syncing or ghost playing is prohibited. Non-compliance with any of the above rules will result in disqualification.' },
  { zh: '每人每組限參加一次。　— 各組別限報名一次，但可同時報名不同組別（如同一人可同時報名演奏組與彈唱組）。', en: 'One entry per person per category — Each category may only be entered once, but participants may enter multiple categories simultaneously (e.g., the same person may enter both Instrumental and Singing & Playing).' },
  { zh: '影片須維持公開　— 參賽影片須於評審期間維持公開狀態，如因刪除或隱藏導致無法評分，視同放棄資格。', en: 'Video must remain public — Videos must remain public throughout the judging period. Videos made private or deleted will be considered as forfeited.' },
  { zh: '所有評斷Ayers主辦官方保有最終決策權。', en: 'All judging decisions are subject to the final determination of Ayers, the organizer.' },
];

const EVENT_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-white/10 text-white/50', ACTIVE: 'bg-green-500/10 text-green-500',
  ENDED: 'bg-white/10 text-white/30', CANCELLED: 'bg-red-500/10 text-red-500',
};

const EVENT_PAGE_TYPE_LABELS: Record<string, string> = {
  MAIN: '主頁', INFO: '簡章', REGISTER: '報名', QUIZ: '測驗', LANDING: '落地頁', OTHER: '其他',
};

const EMPTY_EVENT: Partial<EventType> = {
  title: '', slug: '', description: '', coverImage: '', location: '',
  startDate: '', endDate: '', status: 'DRAFT',
  landingUrl: '', utmSource: '', utmMedium: 'qrcode', utmCampaign: '',
  couponCode: '', discountNote: '', isActive: true, eventType: 'OTHER',
};

/* ─── Quiz Analytics constants ─── */

const RESULT_COLORS: Record<string, string> = {
  fire: '#E04040', fireworks: '#FF8C42', sun: '#F5C842', glow: '#A8D060',
  wave: '#40C0E0', 'deep-sea': '#3060B0', moon: '#9080C0', 'dream-moon': '#C080A0',
};

const RESULT_EMOJI: Record<string, string> = {
  fire: '🔥', fireworks: '✨', sun: '☀️', glow: '🌟',
  wave: '🌊', 'deep-sea': '🫧', moon: '🌙', 'dream-moon': '🌙',
};

const QUIZ_CHAR_META: Record<string, { soul: string; dim: string; tag: string; city: string; music: string; compatible: string }> = {
  fire:         { soul: 'FIRE', dim: '自由', tag: '帶著能量的人',       city: '台中',   music: 'Rock / Blues / Rhythm Guitar',   compatible: '月光' },
  fireworks:    { soul: 'FIRE', dim: '故事', tag: '帶著火花的創作者',   city: '高雄',   music: 'Fingerstyle / Jazz / R&B',         compatible: '深海' },
  sun:          { soul: 'SUN',  dim: '自由', tag: '溫暖又有行動力的人', city: '台南',   music: 'Acoustic Pop / Bossa Nova',        compatible: '微光' },
  glow:         { soul: 'SUN',  dim: '故事', tag: '細膩又善解人意的人', city: '桃園',   music: 'Indie Folk / Soft Rock',           compatible: '太陽' },
  wave:         { soul: 'WAVE', dim: '自由', tag: '自由奔放的靈魂',     city: '宜蘭',   music: 'Surf / World / Reggae',            compatible: '深海' },
  'deep-sea':   { soul: 'WAVE', dim: '故事', tag: '深沉神秘的觀察者',   city: '基隆',   music: 'Post-Rock / Ambient / Jazz',       compatible: '海浪' },
  moon:         { soul: 'MOON', dim: '故事', tag: '浪漫感性的思考者',   city: '新竹',   music: 'Neo Soul / Ballad / Classical',    compatible: '火焰' },
  'dream-moon': { soul: 'MOON', dim: '自由', tag: '夢幻創意的想像家',   city: '花蓮',   music: 'Dream Pop / Shoegaze / Lo-fi',     compatible: '煙火' },
};

const SOUL_GROUP: Record<string, { label: string; emoji: string; color: string; slugs: string[] }> = {
  FIRE:  { label: '火焰系', emoji: '🔥', color: '#E04040', slugs: ['fire', 'fireworks'] },
  SUN:   { label: '太陽系', emoji: '☀️', color: '#F5C842', slugs: ['sun', 'glow'] },
  WAVE:  { label: '海浪系', emoji: '🌊', color: '#40C0E0', slugs: ['wave', 'deep-sea'] },
  MOON:  { label: '月光系', emoji: '🌙', color: '#9080C0', slugs: ['moon', 'dream-moon'] },
};

/* ─── Types ─── */

type QuizTab = 'analytics' | 'registrations' | 'emails' | 'clicks';

/* ─── StatCard ─── */

function StatCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: CARD_BG }}>
      <p className="text-2xl font-bold text-ayers-gold">{value}</p>
      {sub && <p className="text-xs text-white/50 mt-0.5">{sub}</p>}
      <p className="text-[11px] text-white/35 mt-2 uppercase tracking-widest">{title}</p>
    </div>
  );
}

/* ─── QuizFullPage ─── */

function QuizFullPage({ data, onBack, onRefresh, events, initialTab = 'analytics', onUpdateEvents }: {
  data: QuizAnalytics | null; onBack: () => void; onRefresh: () => void;
  events: EventType[]; initialTab?: QuizTab; onUpdateEvents?: (fn: (prev: EventType[]) => EventType[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<QuizTab>(initialTab);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regTotal, setRegTotal] = useState(0);
  const [regLoading, setRegLoading] = useState(false);
  const [regDetailId, setRegDetailId] = useState<string | null>(null);
  const [regEditMode, setRegEditMode] = useState(false);
  const [regEditDraft, setRegEditDraft] = useState<Partial<Registration> | null>(null);
  const [regSettingsSaving, setRegSettingsSaving] = useState(false);
  const [shareEmails, setShareEmails] = useState<QuizShareEmail[]>([]);
  const [shareEmailsTotal, setShareEmailsTotal] = useState(0);
  const [shareEmailsLoading, setShareEmailsLoading] = useState(false);
  const [shareEmailsError, setShareEmailsError] = useState('');
  const [pageStats, setPageStats] = useState<Record<string, EventAnalytics | null>>({});
  const [clicksDays, setClicksDays] = useState<7 | 30 | 0>(30);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);

  const registerEvent = events.find(e => e.slug === 'soul-guitar/register');
  const soulEvents = events.filter(e => e.slug.startsWith('soul-guitar'));

  useEffect(() => {
    if (!registerEvent) return;
    if (activeTab === 'registrations') {
      setRegLoading(true);
      registrationService.list(registerEvent.id)
        .then(({ registrations: regs, total }) => { setRegistrations(regs); setRegTotal(total); })
        .catch(() => {})
        .finally(() => setRegLoading(false));
    } else if (activeTab === 'clicks' && regTotal === 0) {
      registrationService.list(registerEvent.id)
        .then(({ total }) => setRegTotal(total))
        .catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'emails') return;
    setShareEmailsLoading(true); setShareEmailsError('');
    quizService.listShareEmails()
      .then(({ total, data }) => { setShareEmailsTotal(total); setShareEmails(data); })
      .catch((e) => setShareEmailsError(e?.response?.data?.message || e?.message || '讀取失敗'))
      .finally(() => setShareEmailsLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if ((activeTab !== 'analytics' && activeTab !== 'clicks') || soulEvents.length === 0) return;
    soulEvents.forEach(ev => {
      if (pageStats[ev.id] !== undefined) return;
      setPageStats(prev => ({ ...prev, [ev.id]: null }));
      eventService.getEventAnalytics(ev.id).then(a => setPageStats(prev => ({ ...prev, [ev.id]: a }))).catch(() => {});
    });
  }, [activeTab, soulEvents.length]);

  useEffect(() => {
    if (activeTab !== 'analytics' || !registerEvent) return;
    let cancelled = false;
    setReferralStats(null);
    registrationService.referralStats(registerEvent.id)
      .then((s) => { if (!cancelled) setReferralStats(s); })
      .catch(() => { if (!cancelled) setReferralStats({ total: 0, unknown: 0, data: [] }); });
    return () => { cancelled = true; };
  }, [activeTab, registerEvent?.id]);

  const handleClear = async () => {
    setClearing(true);
    try { await quizService.clearAll(); setConfirmClear(false); onRefresh(); } catch { /* silent */ } finally { setClearing(false); }
  };

  const handleDeleteReg = async (id: string) => {
    if (!window.confirm('確定要刪除這筆報名嗎？')) return;
    try { await registrationService.deleteOne(id); setRegistrations(prev => prev.filter(r => r.id !== id)); setRegTotal(n => n - 1); } catch { alert('刪除失敗'); }
  };

  const handleUpdateReg = async () => {
    if (!regEditDraft || !regDetailId) return;
    try {
      const updated = await registrationService.updateOne(regDetailId, regEditDraft as any);
      setRegistrations(prev => prev.map(r => r.id === regDetailId ? updated : r));
      setRegEditMode(false);
      setRegEditDraft(null);
    } catch (err: any) { alert(err?.message || '更新失敗'); }
  };

  const handleDeleteShareEmail = async (email: string, slug: string) => {
    if (!window.confirm(`確定要刪除 ${email} 嗎？`)) return;
    try { await quizService.deleteShareEmail(email, slug); setShareEmails(prev => prev.filter(r => !(r.email === email && r.slug === slug))); setShareEmailsTotal(n => n - 1); } catch { alert('刪除失敗'); }
  };

  const handleRegSettings = async (open: boolean, limit: number) => {
    if (!registerEvent) return;
    setRegSettingsSaving(true);
    try {
      const res = await registrationService.updateSettings(registerEvent.id, { registrationOpen: open, registrationLimit: limit });
      if (res.success) onUpdateEvents?.(prev => prev.map(e => e.id === registerEvent.id ? { ...e, registrationOpen: open, registrationLimit: limit } : e));
    } catch { alert('設定儲存失敗'); } finally { setRegSettingsSaving(false); }
  };

  const handleRefreshEmails = () => {
    setShareEmailsLoading(true); setShareEmailsError('');
    quizService.listShareEmails()
      .then(({ total, data }) => { setShareEmailsTotal(total); setShareEmails(data); })
      .catch(e => setShareEmailsError(e?.response?.data?.message || e?.message || '讀取失敗'))
      .finally(() => setShareEmailsLoading(false));
  };

  const total = data?.total ?? 0;
  const soulCounts = data ? Object.entries(SOUL_GROUP).map(([key, g]) => ({
    ...g, key, count: g.slugs.reduce((s, sl) => s + (data.byResult.find(r => r.slug === sl)?.count ?? 0), 0),
  })) : [];
  const freeCount  = data ? ['fire','sun','wave','dream-moon'].reduce((s, sl) => s + (data.byResult.find(r => r.slug === sl)?.count ?? 0), 0) : 0;
  const storyCount = data ? ['fireworks','glow','deep-sea','moon'].reduce((s, sl) => s + (data.byResult.find(r => r.slug === sl)?.count ?? 0), 0) : 0;
  const dailyAvg = data && data.daily.length > 0 ? (total / data.daily.length).toFixed(1) : '—';
  const tooltipStyle = { background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs"><ChevronLeft size={14} /> 活動管理</button>
          <div className="w-px h-4 bg-white/10" />
          <div>
            <h2 className="text-xl font-bold text-ayers-gold tracking-wide">🎸 吉他靈魂測驗 — 數據分析</h2>
            <p className="text-[11px] text-white/30 mt-0.5">統計所有測驗完成結果 · 共 8 種角色</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onRefresh} className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors text-xs"><RefreshCw size={13} /> 重新整理</button>
          <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all">
            <Trash2 size={12} /> 清空測試資料
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-b border-white/5 -mt-4">
        {([['analytics', '📊 測驗分析'], ['registrations', '👥 報名名單'], ['emails', '📧 抽獎 Email'], ['clicks', '📈 點擊數據']] as [QuizTab, string][]).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px',
              activeTab === tab ? 'text-ayers-gold border-ayers-gold' : 'text-white/30 hover:text-white/60 border-transparent')}>
            {label}
          </button>
        ))}
      </div>

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmClear(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-7 max-w-sm w-full mx-4 border border-red-500/20" style={{ background: CARD_BG }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0"><AlertTriangle size={18} className="text-red-400" /></div>
              <div>
                <p className="text-sm font-bold text-white">確認清空所有測驗資料？</p>
                <p className="text-xs text-white/40 mt-0.5">共 {data?.total ?? 0} 筆紀錄將永久刪除，無法復原</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClear(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">取消</button>
              <button onClick={handleClear} disabled={clearing} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-500/80 hover:bg-red-500 disabled:opacity-50 transition-all">{clearing ? '刪除中⋯' : '確認刪除'}</button>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'analytics' && (!data ? <div className="py-32 text-center"><GuitarSunLoader size={28} /></div> : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="總完成次數" value={total.toString()} />
            <StatCard title="最熱門角色" value={data.byResult[0] ? RESULT_EMOJI[data.byResult[0].slug] + ' ' + data.byResult[0].label.split(' ')[0] : '—'} sub={data.byResult[0] ? `${data.byResult[0].count} 次 (${total > 0 ? ((data.byResult[0].count/total)*100).toFixed(1) : 0}%)` : ''} />
            <StatCard title="每日平均" value={dailyAvg === '—' ? '—' : `${dailyAvg} 次`} sub="近 30 天" />
            <StatCard title="手機用戶" value={`${Math.round(((data.byDevice.find(d => d.device === 'mobile')?.count ?? 0) / Math.max(total, 1)) * 100)}%`} />
            <StatCard title="電腦用戶" value={`${Math.round(((data.byDevice.find(d => d.device === 'desktop')?.count ?? 0) / Math.max(total, 1)) * 100)}%`} />
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">靈魂類型分布</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {soulCounts.map((g) => {
                const pct = total > 0 ? (g.count / total) * 100 : 0;
                return (
                  <div key={g.key} className="rounded-2xl p-5 border border-white/5 relative overflow-hidden" style={{ background: CARD_BG }}>
                    <div className="absolute inset-0 opacity-10 rounded-2xl" style={{ background: `radial-gradient(circle at top right, ${g.color}, transparent 70%)` }} />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{g.emoji}</span>
                        <span className="text-xs font-bold" style={{ color: g.color }}>{pct.toFixed(1)}%</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{g.count}</p>
                      <p className="text-xs text-white/40 mt-1">{g.label}</p>
                      <div className="mt-3 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Card title="維度分析 — 自由型 vs 故事型">
            <div className="p-5 space-y-4">
              {[{ label: '🌊 自由型', count: freeCount, color: '#40C0E0', desc: '跟著感覺走、行動派' }, { label: '📖 故事型', count: storyCount, color: '#C080A0', desc: '有情感深度、記憶驅動' }].map((d) => {
                const pct = total > 0 ? (d.count / total) * 100 : 0;
                return (
                  <div key={d.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-white/70">{d.label} <span className="text-white/30 text-xs">· {d.desc}</span></span>
                      <span className="text-xs text-white/50">{d.count} 人 ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="bg-white/5 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} /></div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="8 種角色完整排行">
            <div className="divide-y divide-white/5">
              {data.byResult.length === 0 ? <EmptyChart icon={<BarChart3 size={40} />} message="尚無數據" /> : (
                data.byResult.map((r, i) => {
                  const pct = total > 0 ? (r.count / total) * 100 : 0;
                  const meta = QUIZ_CHAR_META[r.slug];
                  return (
                    <div key={r.slug} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <span className="text-lg font-bold w-6 text-center" style={{ color: i < 3 ? '#d4a84b' : 'rgba(255,255,255,0.15)' }}>{i + 1}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0" style={{ background: `${RESULT_COLORS[r.slug]}22`, border: `1.5px solid ${RESULT_COLORS[r.slug]}66` }}>{RESULT_EMOJI[r.slug]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white/80">{r.label}</span>
                          {meta && <span className="text-[10px] text-white/30 truncate">· {meta.tag}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden max-w-[200px]"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: RESULT_COLORS[r.slug] || '#888' }} /></div>
                          {meta && <span className="text-[10px] text-white/25 hidden sm:block">{meta.city} · {meta.music}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: RESULT_COLORS[r.slug] }}>{r.count}</p>
                        <p className="text-[10px] text-white/30">{pct.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="結果長條圖">
              {data.byResult.length === 0 ? <EmptyChart icon={<BarChart3 size={40} />} message="尚無數據" /> : (
                <div className="px-4 py-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.byResult} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="slug" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickFormatter={(v: string) => RESULT_EMOJI[v] ?? v} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#d4a84b' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} labelFormatter={(v: string) => data.byResult.find(r => r.slug === v)?.label ?? v} />
                      <Bar dataKey="count" name="完成人數" radius={[4, 4, 0, 0]}>{data.byResult.map((r) => <Cell key={r.slug} fill={RESULT_COLORS[r.slug] || '#d4a84b'} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
            <Card title="裝置分布">
              {data.byDevice.length === 0 ? <EmptyChart icon={<BarChart3 size={40} />} message="尚無數據" /> : (
                <div className="p-5 space-y-4">
                  {data.byDevice.map((d) => {
                    const pct = total > 0 ? (d.count / total) * 100 : 0;
                    const icon = d.device === 'mobile' ? '📱' : d.device === 'tablet' ? '📟' : '💻';
                    return (
                      <div key={d.device}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm text-white/70 capitalize">{icon} {d.device}</span>
                          <span className="text-xs text-white/50">{d.count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="bg-white/5 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full bg-ayers-gold/60" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card title="互動轉換 — 從測驗結果頁的下一步">
            <div className="p-5 space-y-5">
              {[
                {
                  label: '👉 點擊「了解比賽」跳轉簡章',
                  desc: '完成測驗後直接前往活動簡章',
                  count: data.brochureClicks,
                  unique: data.brochureUniqueVisitors,
                  color: '#c5a059',
                },
                {
                  label: '🔗 點擊「分享」按鈕',
                  desc: '不論是否完成分享流程',
                  count: data.shareClicks,
                  unique: data.shareUniqueVisitors,
                  color: '#818cf8',
                },
                {
                  label: '📧 分享後留 Email 抽獎',
                  desc: '已成功登記抽獎名單',
                  count: data.totalShareEmails,
                  unique: null as number | null,
                  color: '#34d399',
                },
              ].map((d) => {
                const pct = total > 0 ? (d.count / total) * 100 : 0;
                return (
                  <div key={d.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-white/70">
                        {d.label}
                        <span className="text-white/30 text-xs"> · {d.desc}</span>
                      </span>
                      <span className="text-xs text-white/50">
                        {d.count}
                        {d.unique != null && <span className="text-white/30"> ({d.unique} 不重複)</span>}
                        <span className="text-white/30"> · {pct.toFixed(1)}% 完成者</span>
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: d.color }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-white/30 mt-2">
                百分比 = 點擊數 ÷ 完成測驗總數，可估算結果頁的下一步轉換率
              </p>
            </div>
          </Card>

          <Card title="報名 — 得知本活動的管道分布">
            {referralStats === null ? (
              <div className="py-12 text-center"><Spinner /></div>
            ) : referralStats.total === 0 ? (
              <EmptyChart icon={<BarChart3 size={40} />} message="尚無報名資料" />
            ) : (
              <div className="px-4 py-4">
                <div className="flex items-center justify-between px-2 mb-3">
                  <span className="text-[11px] text-white/40">共 {referralStats.total} 筆報名</span>
                  {referralStats.unknown > 0 && (
                    <span className="text-[11px] text-white/30">{referralStats.unknown} 筆未填寫</span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={Math.max(referralStats.data.length * 36 + 40, 200)}>
                  <BarChart data={referralStats.data} layout="vertical" margin={{ top: 4, right: 32, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="source"
                      tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }}
                      width={170}
                      interval={0}
                    />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#d4a84b' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Bar dataKey="count" name="人數" fill={CHART_PALETTE[0]} radius={[0, 4, 4, 0]}>
                      {referralStats.data.map((_, i) => (
                        <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card title="每日完成趨勢（近 30 天）">
            {data.daily.length === 0 ? <EmptyChart icon={<TrendingUp size={40} />} message="近 30 天無數據" /> : (
              <div className="px-4 py-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#d4a84b' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                    <Bar dataKey="count" name="完成次數" fill="#d4a84b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

        </>
      ))}

      {/* ── Clicks tab ── */}
      {activeTab === 'clicks' && (() => {
        const infoEv  = soulEvents.find(e => e.slug === 'soul-guitar/info');
        const quizEv  = soulEvents.find(e => e.slug === 'soul-guitar');
        const regEv   = soulEvents.find(e => e.slug === 'soul-guitar/register');
        const PAGE_CFG = [
          { ev: infoEv,  color: '#c5a059', label: '活動簡章' },
          { ev: quizEv,  color: '#818cf8', label: '心理測驗' },
          { ev: regEv,   color: '#34d399', label: '活動報名' },
        ] as const;

        // funnel — all from EventClick (consistent data source / time period)
        const infoScans = infoEv ? (pageStats[infoEv.id]?.totalScans ?? null) : null;
        const quizScans = quizEv ? (pageStats[quizEv.id]?.totalScans  ?? null) : null;
        const regScans  = regEv  ? (pageStats[regEv.id]?.totalScans   ?? null) : null;
        const funnelSteps = [
          { label: '心理測驗主頁',     value: quizScans,                   color: '#818cf8' },
          { label: '完成測驗',         value: data?.total ?? null,         color: '#facc15' },
          { label: '結果頁→簡章',      value: data?.brochureClicks ?? null, color: '#c5a059' },
          { label: '活動簡章瀏覽',     value: infoScans,                   color: '#d4a84b' },
          { label: '報名頁瀏覽',       value: regScans,                    color: '#34d399' },
          { label: '成功報名',         value: regTotal,                    color: '#4ade80' },
        ];
        // bar widths relative to the max value (not always step 1)
        const funnelMax = Math.max(...funnelSteps.map(s => s.value ?? 0), 1);

        // date range filter
        const cutoff = clicksDays === 0 ? null : (() => {
          const d = new Date(); d.setDate(d.getDate() - clicksDays); return d.toISOString().slice(0, 10);
        })();
        const filterDates = (clicks: { date: string; count: number }[]) =>
          cutoff ? clicks.filter(d => d.date >= cutoff) : clicks;

        // merged daily line chart data
        const allDates = new Set<string>();
        PAGE_CFG.forEach(({ ev }) => {
          if (!ev) return;
          filterDates(pageStats[ev.id]?.dailyClicks ?? []).forEach(d => allDates.add(d.date));
        });
        const mergedDaily = Array.from(allDates).sort().map(date => {
          const row: Record<string, number | string> = { date };
          PAGE_CFG.forEach(({ ev, label }) => {
            if (!ev) return;
            const entry = filterDates(pageStats[ev.id]?.dailyClicks ?? []).find(d => d.date === date);
            row[label] = entry?.count ?? 0;
          });
          return row;
        });
        const anyMergedData = mergedDaily.length > 0;
        const tooltipStyle = { background: CARD_BG, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 };

        return (
          <div className="space-y-6">
            {/* Date range selector */}
            <div className="flex items-center gap-1 self-end justify-end">
              {([['7日', 7], ['30天', 30], ['全部', 0]] as [string, 7 | 30 | 0][]).map(([lbl, v]) => (
                <button type="button" key={v} onClick={() => setClicksDays(v)}
                  className={cn('px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                    clicksDays === v ? 'bg-ayers-gold/20 text-ayers-gold' : 'text-white/30 hover:text-white/60 hover:bg-white/5')}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4">
              {PAGE_CFG.map(({ ev, color, label }) => {
                const st = ev ? pageStats[ev.id] : undefined;
                return (
                  <div key={label} className="rounded-2xl p-5 border border-white/5" style={{ background: CARD_BG }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <p className="text-xs font-bold text-white/70 truncate">{label}</p>
                    </div>
                    {!ev || st === undefined ? <span className="text-[10px] text-white/20">—</span>
                      : st === null ? <Spinner />
                      : (
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[['掃描', st.totalScans, color], ['點擊', st.totalClicks, 'rgba(255,255,255,0.6)'], ['不重複', st.uniqueVisitors, 'rgba(255,255,255,0.3)']].map(([lbl, val, c]) => (
                            <div key={lbl as string}>
                              <p className="text-xl font-bold" style={{ color: c as string }}>{val as number}</p>
                              <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{lbl as string}</p>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
              {/* Quiz completions — QuizResult table (independent of EventClick) */}
              <div className="rounded-2xl p-5 border border-white/5" style={{ background: CARD_BG }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full shrink-0 bg-yellow-400" />
                  <p className="text-xs font-bold text-white/70">測驗完成</p>
                </div>
                <p className="text-[9px] text-white/20 mb-3">來源：QuizResult（獨立於點擊統計）</p>
                {data === null ? <Spinner /> : (
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-xl font-bold text-yellow-400">{data?.total ?? '—'}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">完成次數</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white/60">{data?.uniqueVisitors ?? '—'}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">不重複</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interaction metrics — quiz result page CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 border border-white/5" style={{ background: CARD_BG }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#c5a059' }} />
                  <p className="text-xs font-bold text-white/70">結果頁 → 點擊「了解比賽」跳轉簡章</p>
                </div>
                <p className="text-[9px] text-white/20 mb-3">來源：QuizEvent / brochure_click</p>
                {data === null ? <Spinner /> : (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xl font-bold" style={{ color: '#c5a059' }}>{data?.brochureClicks ?? '—'}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">點擊次數</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white/60">{data?.brochureUniqueVisitors ?? '—'}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">不重複</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white/40">
                        {data && data.total > 0 ? `${((data.brochureClicks / data.total) * 100).toFixed(1)}%` : '—'}
                      </p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">完成 → 簡章</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-2xl p-5 border border-white/5" style={{ background: CARD_BG }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#818cf8' }} />
                  <p className="text-xs font-bold text-white/70">結果頁 → 點擊「分享」</p>
                </div>
                <p className="text-[9px] text-white/20 mb-3">來源：QuizEvent / share_click（含後續留 Email）</p>
                {data === null ? <Spinner /> : (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xl font-bold" style={{ color: '#818cf8' }}>{data?.shareClicks ?? '—'}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">分享點擊</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white/60">{data?.shareUniqueVisitors ?? '—'}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">不重複</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold" style={{ color: '#34d399' }}>{data?.totalShareEmails ?? '—'}</p>
                      <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">留 Email 抽獎</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Funnel — all steps use EventClick page views, consistent data source */}
            <Card title="轉換漏斗 — 頁面瀏覽（同一資料來源）">
              <div className="px-6 py-5 flex flex-col gap-3">
                {funnelSteps.map((step, i) => {
                  const barPct = step.value === null ? 0 : Math.round((step.value / funnelMax) * 100);
                  const prev = funnelSteps[i - 1];
                  const cvr = i > 0 && step.value !== null && prev?.value
                    ? (step.value / prev.value) * 100
                    : null;
                  return (
                    <div key={step.label}>
                      {i > 0 && (
                        <div className="flex items-center gap-2 my-1 ml-[88px]">
                          <div className="w-px h-4 bg-white/10" />
                          {cvr !== null && (
                            <span className="text-[10px] text-white/30">
                              轉換率 <span className="font-bold" style={{ color: step.color }}>{cvr.toFixed(1)}%</span>
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/40 w-20 shrink-0 text-right leading-tight">{step.label}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${barPct}%`, background: step.color + '44', border: `1px solid ${step.color}66` }} />
                        </div>
                        <span className="text-sm font-bold w-14 shrink-0 text-right" style={{ color: step.color }}>
                          {step.value === null ? '—' : step.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-white/20 mt-2">* 頁面瀏覽數從追蹤啟用後開始累計；測驗完成數見上方摘要卡</p>
              </div>
            </Card>

            {/* Multi-line overlay chart */}
            <Card title="各頁面每日點擊趨勢（疊加比較）">
              {!anyMergedData ? <EmptyChart icon={<TrendingUp size={36} />} message="尚無每日資料" /> : (
                <div className="px-4 py-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={mergedDaily} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#d4a84b' }} itemStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                      {PAGE_CFG.map(({ label, color }) => (
                        <Line key={label} type="monotone" dataKey={label} stroke={color} strokeWidth={2}
                          dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Device breakdown per page */}
            <Card title="裝置分布 — 各頁面手機 vs 電腦">
              <div className="divide-y divide-white/5">
                {PAGE_CFG.map(({ ev, color, label }) => {
                  const st = ev ? pageStats[ev.id] : undefined;
                  if (!ev || st === null) return (
                    <div key={label} className="flex items-center gap-4 px-5 py-3">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-xs text-white/50 w-20">{label}</span>
                      <Spinner />
                    </div>
                  );
                  if (!st || st.deviceBreakdown.length === 0) return (
                    <div key={label} className="flex items-center gap-4 px-5 py-3">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-xs text-white/50 w-20">{label}</span>
                      <span className="text-[10px] text-white/20">無資料</span>
                    </div>
                  );
                  const devTotal = st.deviceBreakdown.reduce((s, d) => s + d.count, 0) || 1;
                  return (
                    <div key={label} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-xs font-bold text-white/60">{label}</span>
                        <span className="text-[10px] text-white/25 ml-auto">{devTotal} 次點擊</span>
                      </div>
                      <div className="flex gap-1 h-4 rounded-full overflow-hidden mb-2">
                        {['mobile','desktop','tablet'].map(dev => {
                          const cnt = st.deviceBreakdown.find(d => d.device === dev)?.count ?? 0;
                          const pct = (cnt / devTotal) * 100;
                          if (pct === 0) return null;
                          const devColor = dev === 'mobile' ? color : dev === 'desktop' ? color + '77' : color + '44';
                          return <div key={dev} style={{ width: `${pct}%`, background: devColor }} />;
                        })}
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        {st.deviceBreakdown.map(d => {
                          const pct = ((d.count / devTotal) * 100).toFixed(1);
                          const icon = d.device === 'mobile' ? '📱' : d.device === 'tablet' ? '📟' : '💻';
                          return (
                            <span key={d.device} className="text-[10px] text-white/40 capitalize">
                              {icon} {d.device} <span className="font-bold text-white/60">{d.count}</span> ({pct}%)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      })()}

      {/* ── Registrations tab ── */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          {!registerEvent ? <div className="py-16 text-center text-xs text-white/25 uppercase tracking-widest">找不到報名活動</div> : (
            <>
              <div className="flex flex-wrap items-center gap-4 px-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/50">報名狀態</span>
                  <button onClick={() => handleRegSettings(!registerEvent.registrationOpen, registerEvent.registrationLimit)} disabled={regSettingsSaving}
                    className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', registerEvent.registrationOpen ? 'bg-green-500' : 'bg-white/10')}>
                    <span className={cn('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', registerEvent.registrationOpen ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                  <span className={cn('text-xs font-bold', registerEvent.registrationOpen ? 'text-green-400' : 'text-white/30')}>{registerEvent.registrationOpen ? '開放中' : '已關閉'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">人數上限</span>
                  <input type="number" min={0} max={10000} defaultValue={registerEvent.registrationLimit}
                    onBlur={e => handleRegSettings(registerEvent.registrationOpen, Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-ayers-gold/40 text-center" />
                  <span className="text-[10px] text-white/25">（0 = 無限制）</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs text-white/30 tabular-nums">{regTotal} / {registerEvent.registrationLimit > 0 ? registerEvent.registrationLimit : '∞'}</span>
                  <button onClick={() => registrationService.exportCsv(registerEvent.id, `registrations-${registerEvent.id}.csv`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ayers-gold/10 hover:bg-ayers-gold/20 text-[10px] text-ayers-gold font-bold uppercase tracking-widest transition-all">
                    <Download size={11} /> 匯出 CSV
                  </button>
                </div>
              </div>
              <Card>
                {regLoading ? <div className="py-12 flex justify-center"><Spinner /></div>
                  : registrations.length === 0 ? <div className="py-12 text-center text-xs text-white/25 uppercase tracking-widest">尚無報名資料</div>
                  : (
                    <div className="flex overflow-hidden">
                      <div className={cn('overflow-x-auto', regDetailId ? 'w-1/2 border-r border-white/5' : 'w-full')}>
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 z-10" style={{ background: CARD_BG }}>
                            <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                              <th className="px-4 py-3 text-left font-medium w-8">#</th>
                              <th className="px-4 py-3 text-left font-medium">姓名</th>
                              <th className="px-4 py-3 text-left font-medium">Email</th>
                              {!regDetailId && <th className="px-4 py-3 text-left font-medium">手機</th>}
                              <th className="px-4 py-3 text-left font-medium">報名時間</th>
                              <th className="px-4 py-3 w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {registrations.map((r, i) => (
                              <tr key={r.id} onClick={() => { const next = regDetailId === r.id ? null : r.id; setRegDetailId(next); if (!next) { setRegEditMode(false); setRegEditDraft(null); } }} className={cn('transition-colors cursor-pointer group', regDetailId === r.id ? 'bg-ayers-gold/5' : 'hover:bg-white/[0.02]')}>
                                <td className="px-4 py-3 text-white/25">{i + 1}</td>
                                <td className="px-4 py-3"><p className="text-white/80 font-medium">{r.name}</p>{r.stageName && <p className="text-white/30 text-[10px]">{r.stageName}</p>}</td>
                                <td className="px-4 py-3 text-white/50 max-w-[160px] truncate">{r.email}</td>
                                {!regDetailId && <td className="px-4 py-3 text-white/50">{r.phone}</td>}
                                <td className="px-4 py-3 text-white/30 whitespace-nowrap text-[10px]">{new Date(r.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-4 py-3"><button onClick={e => { e.stopPropagation(); handleDeleteReg(r.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 size={12} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {regDetailId && (() => {
                        const dr = registrations.find(r => r.id === regDetailId);
                        if (!dr) return null;
                        const hasSoulFields = registrations.some(r => r.category || r.soulColor || r.youtube);
                        const answerKeys = Array.from(new Set(registrations.flatMap(r => r.answers ? Object.keys(r.answers) : [])));
                        return (
                          <div className="w-1/2 overflow-y-auto p-5 space-y-3 max-h-[600px]">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">詳細資料</p>
                              <div className="flex items-center gap-2">
                                {!regEditMode && <button type="button" onClick={() => { setRegEditMode(true); setRegEditDraft({ ...dr }); }} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-ayers-gold transition-all" title="編輯"><Edit size={12} /></button>}
                                <button type="button" title="關閉" onClick={() => { setRegDetailId(null); setRegEditMode(false); setRegEditDraft(null); }} className="text-white/20 hover:text-white/50 transition-colors"><X size={12} /></button>
                              </div>
                            </div>
                            {regEditMode && regEditDraft ? (
                              <div className="space-y-2">
                                {([['name', '姓名', true], ['stageName', '藝名', false], ['phone', '手機', true], ['email', 'Email', true]] as [keyof Registration, string, boolean][]).map(([key, label, required]) => (
                                  <div key={key}>
                                    <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{label}{required && ' *'}</p>
                                    <input aria-label={label} value={(regEditDraft[key] as string) ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" />
                                  </div>
                                ))}
                                {hasSoulFields && <>
                                  <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">社群帳號</p>
                                    <input aria-label="社群帳號" value={regEditDraft.socialId ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, socialId: e.target.value } : prev)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" /></div>
                                  <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">組別</p>
                                    <select aria-label="組別" value={regEditDraft.category ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, category: e.target.value || null } : prev)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all">
                                      <option value="">—</option><option value="彈唱組">彈唱組</option><option value="演奏組">演奏組</option>
                                    </select></div>
                                  <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">靈魂顏色</p>
                                    <select aria-label="靈魂顏色" value={regEditDraft.soulColor ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, soulColor: e.target.value || null } : prev)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all">
                                      <option value="">—</option>{['紅色', '橘色', '黃色', '藍色', '黑色', '白色'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select></div>
                                  <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">YouTube</p>
                                    <input aria-label="YouTube" value={regEditDraft.youtube ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, youtube: e.target.value } : prev)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" /></div>
                                  <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">FB / IG</p>
                                    <input aria-label="FB / IG" value={regEditDraft.fbIg ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, fbIg: e.target.value } : prev)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" /></div>
                                </>}
                                <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">留言</p>
                                  <textarea aria-label="留言" value={regEditDraft.message ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, message: e.target.value } : prev)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all resize-none" /></div>
                                <div className="flex gap-2 pt-1">
                                  <button type="button" onClick={handleUpdateReg} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ayers-gold/20 hover:bg-ayers-gold/30 text-xs text-ayers-gold font-bold uppercase tracking-widest transition-all"><Save size={11} /> 儲存</button>
                                  <button type="button" onClick={() => { setRegEditMode(false); setRegEditDraft(null); }} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/40 hover:text-white transition-all">取消</button>
                                </div>
                              </div>
                            ) : <>
                              {[{ label: '姓名', value: dr.name }, { label: '藝名', value: dr.stageName }, { label: '手機', value: dr.phone }, { label: 'Email', value: dr.email }].map(({ label, value }) => value ? (
                                <div key={label} className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{label}</p><p className="text-xs text-white/70">{value}</p></div>
                              ) : null)}
                              {hasSoulFields && [{ label: '社群帳號', value: dr.socialId }, { label: '組別', value: dr.category }, { label: '靈魂顏色', value: dr.soulColor }].map(({ label, value }) => value ? (
                                <div key={label} className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{label}</p><p className="text-xs text-white/70">{value}</p></div>
                              ) : null)}
                              {dr.youtube && <div className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">YouTube</p><a href={dr.youtube} target="_blank" rel="noreferrer" className="text-xs text-ayers-gold/70 hover:text-ayers-gold transition-colors truncate block">{dr.youtube}</a></div>}
                              {dr.fbIg && <div className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">FB / IG</p><a href={dr.fbIg} target="_blank" rel="noreferrer" className="text-xs text-ayers-gold/70 hover:text-ayers-gold transition-colors truncate block">{dr.fbIg}</a></div>}
                              {answerKeys.map(key => { const val = dr.answers?.[key]; return val !== undefined && val !== null && val !== '' ? (<div key={key} className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{key}</p><p className="text-xs text-white/70">{String(val)}</p></div>) : null; })}
                              {dr.message && <div className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">留言</p><p className="text-xs text-white/70 whitespace-pre-line">{dr.message}</p></div>}
                              <p className="text-[9px] text-white/20 pt-1">報名時間：{new Date(dr.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</p>
                            </>}
                          </div>
                        );
                      })()}
                    </div>
                  )}
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Emails tab ── */}
      {activeTab === 'emails' && (
        <Card title={`抽獎 Email · 共 ${shareEmailsTotal} 筆`} action={
          <div className="flex items-center gap-2">
            <button onClick={handleRefreshEmails} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors" title="重新整理"><RefreshCw size={13} /></button>
            <button onClick={() => quizService.exportShareEmailsCsv()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ayers-gold/10 hover:bg-ayers-gold/20 text-[10px] text-ayers-gold font-bold uppercase tracking-widest transition-all"><Download size={11} /> 匯出 CSV</button>
          </div>
        }>
          {shareEmailsLoading ? <div className="py-12 flex justify-center"><GuitarSunLoader size={24} /></div>
            : shareEmailsError ? <div className="py-10 text-center text-xs text-red-400/70">{shareEmailsError}</div>
            : shareEmails.length === 0 ? <div className="py-10 text-center text-xs text-white/25 uppercase tracking-widest">尚無抽獎報名資料</div>
            : (
              <table className="w-full text-xs">
                <thead className="sticky top-0 z-10" style={{ background: CARD_BG }}>
                  <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                    <th className="px-4 py-3 text-left font-medium w-8">#</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">靈魂類型</th>
                    <th className="px-4 py-3 text-left font-medium">報名時間</th>
                    <th className="px-4 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {shareEmails.map((r, i) => (
                    <tr key={`${r.email}-${r.slug}`} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white/25">{i + 1}</td>
                      <td className="px-4 py-3 text-white/70 font-medium">{r.email}</td>
                      <td className="px-4 py-3 text-white/40">{RESULT_EMOJI[r.resultKey ?? r.slug] ?? ''} {r.resultKey ? (QUIZ_CHAR_META[r.resultKey]?.soul ?? r.resultKey) : '—'}</td>
                      <td className="px-4 py-3 text-white/30 whitespace-nowrap text-[10px]">{new Date(r.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-3"><button type="button" title="刪除" onClick={() => handleDeleteShareEmail(r.email, r.slug)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </Card>
      )}
    </motion.div>
  );
}

/* ─── 簡章內容編輯器（soul-guitar/info）─── */

const CONTENT_INPUT = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold transition-all';

function CField({ label, value, onChange, area, placeholder }: { label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string }) {
  return (
    <label className="block min-w-0">
      <span className="text-[9px] text-white/30 uppercase tracking-widest">{label}</span>
      {area
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder} className={cn(CONTENT_INPUT, 'resize-none mt-1')} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(CONTENT_INPUT, 'mt-1')} />}
    </label>
  );
}

function CColorInline({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <input type="color" aria-label="顏色" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer shrink-0" />
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-label="色碼" className={cn(CONTENT_INPUT, 'w-20')} />
    </div>
  );
}

function CSection({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-ayers-gold">{title}</h4>
        {desc && <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function CList<T,>({ items, onChange, newItem, render, addLabel = '新增一項' }: {
  items: T[];
  onChange: (next: T[]) => void;
  newItem: () => T;
  render: (item: T, setItem: (v: T) => void, idx: number) => ReactNode;
  addLabel?: string;
}) {
  const move = (idx: number, dir: -1 | 1) => {
    const t = idx + dir; if (t < 0 || t >= items.length) return;
    const next = [...items]; [next[idx], next[t]] = [next[t], next[idx]]; onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.03] p-3 flex items-start gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-ayers-gold/10 text-ayers-gold text-[9px] font-bold flex items-center justify-center mt-1">{idx + 1}</span>
          <div className="flex-1 space-y-2 min-w-0">{render(item, (v) => onChange(items.map((it, i) => i === idx ? v : it)), idx)}</div>
          <div className="flex flex-col gap-1 shrink-0">
            <button type="button" title="上移" onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} className="rotate-180" /></button>
            <button type="button" title="下移" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
            <button type="button" title="刪除" onClick={() => onChange(items.filter((_, i) => i !== idx))} className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, newItem()])} className="w-full py-2 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white hover:border-white/20 text-xs flex items-center justify-center gap-1.5 transition-all"><Plus size={12} /> {addLabel}</button>
    </div>
  );
}

function InfoContentModal({ event, onClose, onSaved }: { event: EventType; onClose: () => void; onSaved: (meta: Record<string, unknown>) => void }) {
  const [draft, setDraft] = useState<InfoContent>(() => mergeInfoContent((event.metadata as { content?: unknown } | null | undefined)?.content));
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<InfoContent>) => setDraft((d) => ({ ...d, ...p }));
  const upHero = (p: Partial<InfoContent['hero']>) => setDraft((d) => ({ ...d, hero: { ...d.hero, ...p } }));
  const upPurpose = (p: Partial<InfoContent['purpose']>) => setDraft((d) => ({ ...d, purpose: { ...d.purpose, ...p } }));
  const upSteps = (p: Partial<InfoContent['steps']>) => setDraft((d) => ({ ...d, steps: { ...d.steps, ...p } }));
  const upJudges = (p: Partial<InfoContent['judges']>) => setDraft((d) => ({ ...d, judges: { ...d.judges, ...p } }));
  const upScoring = (p: Partial<InfoContent['scoring']>) => setDraft((d) => ({ ...d, scoring: { ...d.scoring, ...p } }));
  const upAwards = (p: Partial<InfoContent['awards']>) => setDraft((d) => ({ ...d, awards: { ...d.awards, ...p } }));
  const upVideo = (p: Partial<InfoContent['videoFormat']>) => setDraft((d) => ({ ...d, videoFormat: { ...d.videoFormat, ...p } }));
  const upDemo = (p: Partial<InfoContent['demoVideos']>) => setDraft((d) => ({ ...d, demoVideos: { ...d.demoVideos, ...p } }));
  const upPlaylist = (p: Partial<InfoContent['playlist']>) => setDraft((d) => ({ ...d, playlist: { ...d.playlist, ...p } }));
  const upNotes = (p: Partial<InfoContent['notes']>) => setDraft((d) => ({ ...d, notes: { ...d.notes, ...p } }));
  const upCta = (p: Partial<InfoContent['cta']>) => setDraft((d) => ({ ...d, cta: { ...d.cta, ...p } }));

  const save = async () => {
    setSaving(true);
    try {
      const mergedMeta = { ...((event.metadata as Record<string, unknown>) ?? {}), content: draft };
      const res = await eventService.updateEvent(event.id, { metadata: mergedMeta } as any);
      if (res.success) onSaved(mergedMeta);
      else alert(`儲存失敗：${res.error || '未知錯誤'}`);
    } catch { alert('儲存失敗'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]" style={{ background: CARD_BG }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">頁面內容編輯</h3>
            <p className="text-[10px] text-white/30 mt-0.5">{event.title} · 簡章頁所有區塊</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Hero */}
          <CSection title="主視覺 Hero" desc="頁首大標、日期、倒數計時、按鈕文字">
            <CField label="小標 Badge" value={draft.hero.badge} onChange={(v) => upHero({ badge: v })} />
            <div className="grid grid-cols-2 gap-2">
              <CField label="主標題 第一行" value={draft.hero.title1} onChange={(v) => upHero({ title1: v })} />
              <CField label="主標題 第二行" value={draft.hero.title2} onChange={(v) => upHero({ title2: v })} />
            </div>
            <CField label="副標說明" value={draft.hero.subtitle} onChange={(v) => upHero({ subtitle: v })} area />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <CField label="開始 標籤" value={draft.hero.startLabel} onChange={(v) => upHero({ startLabel: v })} />
              <CField label="開始 日期" value={draft.hero.startValue} onChange={(v) => upHero({ startValue: v })} />
              <CField label="截止 標籤" value={draft.hero.endLabel} onChange={(v) => upHero({ endLabel: v })} />
              <CField label="截止 日期" value={draft.hero.endValue} onChange={(v) => upHero({ endValue: v })} />
            </div>
            <CField label="倒數計時目標（ISO，例 2026-06-07T23:59:00+08:00）" value={draft.hero.countdownTarget} onChange={(v) => upHero({ countdownTarget: v })} />
            <div className="grid grid-cols-2 gap-2">
              <CField label="報名按鈕文字" value={draft.hero.registerText} onChange={(v) => upHero({ registerText: v })} />
              <CField label="測驗按鈕文字" value={draft.hero.quizText} onChange={(v) => upHero({ quizText: v })} />
            </div>
            <CField label="橘色提示 1" value={draft.hero.note1} onChange={(v) => upHero({ note1: v })} />
            <CField label="橘色提示 2" value={draft.hero.note2} onChange={(v) => upHero({ note2: v })} />
            <CField label="海報圖片路徑" value={draft.hero.poster} onChange={(v) => upHero({ poster: v })} />
          </CSection>

          {/* Info strip */}
          <CSection title="快速資訊帶" desc="頁首下方四格資訊">
            <CList items={draft.infoStrip} onChange={(v) => patch({ infoStrip: v })} newItem={() => ({ label: '', value: '' })}
              render={(it, set) => (
                <div className="grid grid-cols-2 gap-2">
                  <input value={it.label} onChange={(e) => set({ ...it, label: e.target.value })} placeholder="標籤" className={CONTENT_INPUT} />
                  <input value={it.value} onChange={(e) => set({ ...it, value: e.target.value })} placeholder="內容" className={CONTENT_INPUT} />
                </div>
              )} />
          </CSection>

          {/* Purpose */}
          <CSection title="大賽宗旨">
            <CField label="標題" value={draft.purpose.title} onChange={(v) => upPurpose({ title: v })} />
            <CField label="重點句" value={draft.purpose.lead} onChange={(v) => upPurpose({ lead: v })} />
            <CField label="內文（可換行）" value={draft.purpose.body} onChange={(v) => upPurpose({ body: v })} area />
          </CSection>

          {/* Steps */}
          <CSection title="活動參賽流程">
            <div className="grid grid-cols-2 gap-2">
              <CField label="標題" value={draft.steps.title} onChange={(v) => upSteps({ title: v })} />
              <CField label="英文副標" value={draft.steps.subtitle} onChange={(v) => upSteps({ subtitle: v })} />
            </div>
            <CList items={draft.steps.items} onChange={(v) => upSteps({ items: v })} newItem={() => ({ title: '', desc: '' })}
              render={(it, set) => (
                <>
                  <input value={it.title} onChange={(e) => set({ ...it, title: e.target.value })} placeholder="步驟標題" className={CONTENT_INPUT} />
                  <input value={it.desc} onChange={(e) => set({ ...it, desc: e.target.value })} placeholder="步驟說明" className={CONTENT_INPUT} />
                </>
              )} />
          </CSection>

          {/* Judges */}
          <CSection title="評審陣容">
            <div className="grid grid-cols-2 gap-2">
              <CField label="標題" value={draft.judges.title} onChange={(v) => upJudges({ title: v })} />
              <CField label="副標" value={draft.judges.subtitle} onChange={(v) => upJudges({ subtitle: v })} />
            </div>
            <CList items={draft.judges.items} onChange={(v) => upJudges({ items: v })} newItem={() => ({ name: '', title: '', photo: '', link: '', posClass: 'object-center' })}
              render={(it, set) => (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={it.name} onChange={(e) => set({ ...it, name: e.target.value })} placeholder="姓名" className={CONTENT_INPUT} />
                    <input value={it.title} onChange={(e) => set({ ...it, title: e.target.value })} placeholder="頭銜" className={CONTENT_INPUT} />
                  </div>
                  <input value={it.photo} onChange={(e) => set({ ...it, photo: e.target.value })} placeholder="照片路徑" className={CONTENT_INPUT} />
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input value={it.link} onChange={(e) => set({ ...it, link: e.target.value })} placeholder="連結 (IG 等)" className={CONTENT_INPUT} />
                    <select aria-label="照片對齊" value={it.posClass} onChange={(e) => set({ ...it, posClass: e.target.value })} className={cn(CONTENT_INPUT, 'bg-[#1a1a1a]')}>
                      <option value="object-center">置中</option>
                      <option value="object-top">靠上</option>
                      <option value="object-bottom">靠下</option>
                    </select>
                  </div>
                </>
              )} />
          </CSection>

          {/* Scoring */}
          <CSection title="評分標準">
            <div className="grid grid-cols-2 gap-2">
              <CField label="標題" value={draft.scoring.title} onChange={(v) => upScoring({ title: v })} />
              <CField label="英文副標" value={draft.scoring.subtitle} onChange={(v) => upScoring({ subtitle: v })} />
            </div>
            <CField label="彈唱組 標題" value={draft.scoring.singingTitle} onChange={(v) => upScoring({ singingTitle: v })} />
            <CList items={draft.scoring.singing} onChange={(v) => upScoring({ singing: v })} newItem={() => ({ label: '', desc: '', pct: 0 })}
              render={(it, set) => (
                <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2 items-center">
                  <input value={it.label} onChange={(e) => set({ ...it, label: e.target.value })} placeholder="項目" className={CONTENT_INPUT} />
                  <input value={it.desc} onChange={(e) => set({ ...it, desc: e.target.value })} placeholder="說明" className={CONTENT_INPUT} />
                  <div className="flex items-center gap-1"><input type="number" aria-label="百分比" value={it.pct} onChange={(e) => set({ ...it, pct: Number(e.target.value) })} className={cn(CONTENT_INPUT, 'w-16 text-center')} /><span className="text-white/30 text-xs">%</span></div>
                </div>
              )} />
            <CField label="演奏組 標題" value={draft.scoring.playingTitle} onChange={(v) => upScoring({ playingTitle: v })} />
            <CList items={draft.scoring.playing} onChange={(v) => upScoring({ playing: v })} newItem={() => ({ label: '', desc: '', pct: 0 })}
              render={(it, set) => (
                <div className="grid grid-cols-[1fr_1.4fr_auto] gap-2 items-center">
                  <input value={it.label} onChange={(e) => set({ ...it, label: e.target.value })} placeholder="項目" className={CONTENT_INPUT} />
                  <input value={it.desc} onChange={(e) => set({ ...it, desc: e.target.value })} placeholder="說明" className={CONTENT_INPUT} />
                  <div className="flex items-center gap-1"><input type="number" aria-label="百分比" value={it.pct} onChange={(e) => set({ ...it, pct: Number(e.target.value) })} className={cn(CONTENT_INPUT, 'w-16 text-center')} /><span className="text-white/30 text-xs">%</span></div>
                </div>
              )} />
            <CField label="備註" value={draft.scoring.note} onChange={(v) => upScoring({ note: v })} area />
          </CSection>

          {/* Awards */}
          <CSection title="獎項">
            <div className="grid grid-cols-2 gap-2">
              <CField label="標題" value={draft.awards.title} onChange={(v) => upAwards({ title: v })} />
              <CField label="副標" value={draft.awards.subtitle} onChange={(v) => upAwards({ subtitle: v })} />
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest pt-1">大獎（兩張大卡片）</p>
            <CList items={draft.awards.big} onChange={(v) => upAwards({ big: v })} newItem={() => ({ icon: '🏆', title: '', type: '', guitar: '', money: '', bonus: '', method: '', color: '#facc15' })}
              render={(it, set) => (
                <>
                  <div className="grid grid-cols-[auto_1fr] gap-2">
                    <input value={it.icon} onChange={(e) => set({ ...it, icon: e.target.value })} placeholder="圖示" className={cn(CONTENT_INPUT, 'w-14 text-center')} />
                    <input value={it.title} onChange={(e) => set({ ...it, title: e.target.value })} placeholder="獎項名稱" className={CONTENT_INPUT} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={it.type} onChange={(e) => set({ ...it, type: e.target.value })} placeholder="吉他類型" className={CONTENT_INPUT} />
                    <input value={it.guitar} onChange={(e) => set({ ...it, guitar: e.target.value })} placeholder="吉他型號" className={CONTENT_INPUT} />
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input value={it.money} onChange={(e) => set({ ...it, money: e.target.value })} placeholder="價值 NT$" className={CONTENT_INPUT} />
                    <input value={it.bonus} onChange={(e) => set({ ...it, bonus: e.target.value })} placeholder="獎金 NT$" className={CONTENT_INPUT} />
                    <CColorInline value={it.color} onChange={(c) => set({ ...it, color: c })} />
                  </div>
                  <input value={it.method} onChange={(e) => set({ ...it, method: e.target.value })} placeholder="評選方式" className={CONTENT_INPUT} />
                </>
              )} />
            <p className="text-[10px] text-white/30 uppercase tracking-widest pt-1">中獎（三張中卡片）</p>
            <CList items={draft.awards.mid} onChange={(v) => upAwards({ mid: v })} newItem={() => ({ icon: '🌟', title: '', guitar: '', extra: '', micDetail: '', money: '', method: '', color: '#c5a059' })}
              render={(it, set) => (
                <>
                  <div className="grid grid-cols-[auto_1fr] gap-2">
                    <input value={it.icon} onChange={(e) => set({ ...it, icon: e.target.value })} placeholder="圖示" className={cn(CONTENT_INPUT, 'w-14 text-center')} />
                    <input value={it.title} onChange={(e) => set({ ...it, title: e.target.value })} placeholder="獎項名稱" className={CONTENT_INPUT} />
                  </div>
                  <input value={it.guitar} onChange={(e) => set({ ...it, guitar: e.target.value })} placeholder="吉他" className={CONTENT_INPUT} />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={it.extra} onChange={(e) => set({ ...it, extra: e.target.value })} placeholder="附加（選填）" className={CONTENT_INPUT} />
                    <input value={it.micDetail} onChange={(e) => set({ ...it, micDetail: e.target.value })} placeholder="麥克風細節（選填）" className={CONTENT_INPUT} />
                  </div>
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                    <input value={it.money} onChange={(e) => set({ ...it, money: e.target.value })} placeholder="價值 NT$" className={CONTENT_INPUT} />
                    <input value={it.method} onChange={(e) => set({ ...it, method: e.target.value })} placeholder="評選方式" className={CONTENT_INPUT} />
                    <CColorInline value={it.color} onChange={(c) => set({ ...it, color: c })} />
                  </div>
                </>
              )} />
            <p className="text-[10px] text-white/30 uppercase tracking-widest pt-1">特別獎</p>
            <CList items={draft.awards.special} onChange={(v) => upAwards({ special: v })} newItem={() => ({ icon: '🏅', title: '', n: '', prize: '', note: '' })}
              render={(it, set) => (
                <>
                  <div className="grid grid-cols-[auto_1fr_auto] gap-2">
                    <input value={it.icon} onChange={(e) => set({ ...it, icon: e.target.value })} placeholder="圖示" className={cn(CONTENT_INPUT, 'w-14 text-center')} />
                    <input value={it.title} onChange={(e) => set({ ...it, title: e.target.value })} placeholder="獎項名稱" className={CONTENT_INPUT} />
                    <input value={it.n} onChange={(e) => set({ ...it, n: e.target.value })} placeholder="名額" className={cn(CONTENT_INPUT, 'w-20 text-center')} />
                  </div>
                  <input value={it.prize} onChange={(e) => set({ ...it, prize: e.target.value })} placeholder="獎品" className={CONTENT_INPUT} />
                  <input value={it.note} onChange={(e) => set({ ...it, note: e.target.value })} placeholder="說明" className={CONTENT_INPUT} />
                </>
              )} />
          </CSection>

          {/* Video format */}
          <CSection title="影片格式" desc="開頭說明改為純文字，原本的粗體標示不再顯示">
            <CField label="標題" value={draft.videoFormat.title} onChange={(v) => upVideo({ title: v })} />
            <CList items={draft.videoFormat.groups} onChange={(v) => upVideo({ groups: v })} newItem={() => ({ name: '', num: '', accent: '#f97316', ytTitle: '', hashtag: '#2026Ayers靈魂吉他手大賽' })}
              render={(it, set) => (
                <>
                  <div className="grid grid-cols-[auto_1fr_auto] gap-2">
                    <input value={it.num} onChange={(e) => set({ ...it, num: e.target.value })} placeholder="序號" className={cn(CONTENT_INPUT, 'w-14 text-center')} />
                    <input value={it.name} onChange={(e) => set({ ...it, name: e.target.value })} placeholder="組別名稱" className={CONTENT_INPUT} />
                    <CColorInline value={it.accent} onChange={(c) => set({ ...it, accent: c })} />
                  </div>
                  <input value={it.ytTitle} onChange={(e) => set({ ...it, ytTitle: e.target.value })} placeholder="YouTube 影片標題命名" className={CONTENT_INPUT} />
                  <input value={it.hashtag} onChange={(e) => set({ ...it, hashtag: e.target.value })} placeholder="Hashtag" className={CONTENT_INPUT} />
                </>
              )} />
            <CField label="開頭說明 標題" value={draft.videoFormat.openingTitle} onChange={(v) => upVideo({ openingTitle: v })} />
            <CField label="開頭說明 內容" value={draft.videoFormat.opening} onChange={(v) => upVideo({ opening: v })} area />
          </CSection>

          {/* Demo videos */}
          <CSection title="示範影片">
            <div className="grid grid-cols-2 gap-2">
              <CField label="標題" value={draft.demoVideos.title} onChange={(v) => upDemo({ title: v })} />
              <CField label="副標" value={draft.demoVideos.subtitle} onChange={(v) => upDemo({ subtitle: v })} />
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest pt-1">橫式影片（16:9）</p>
            <CField label="嵌入網址 (youtube embed)" value={draft.demoVideos.landscape.embedUrl} onChange={(v) => upDemo({ landscape: { ...draft.demoVideos.landscape, embedUrl: v } })} />
            <div className="grid grid-cols-2 gap-2">
              <CField label="標題" value={draft.demoVideos.landscape.title} onChange={(v) => upDemo({ landscape: { ...draft.demoVideos.landscape, title: v } })} />
              <CField label="說明" value={draft.demoVideos.landscape.desc} onChange={(v) => upDemo({ landscape: { ...draft.demoVideos.landscape, desc: v } })} />
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest pt-1">直式影片（9:16）</p>
            <CField label="嵌入網址 (youtube embed)" value={draft.demoVideos.portrait.embedUrl} onChange={(v) => upDemo({ portrait: { ...draft.demoVideos.portrait, embedUrl: v } })} />
            <div className="grid grid-cols-2 gap-2">
              <CField label="標題" value={draft.demoVideos.portrait.title} onChange={(v) => upDemo({ portrait: { ...draft.demoVideos.portrait, title: v } })} />
              <CField label="說明" value={draft.demoVideos.portrait.desc} onChange={(v) => upDemo({ portrait: { ...draft.demoVideos.portrait, desc: v } })} />
            </div>
          </CSection>

          {/* Playlist */}
          <CSection title="參賽者作品播放清單">
            <CField label="說明文字" value={draft.playlist.text} onChange={(v) => upPlaylist({ text: v })} />
            <CField label="按鈕文字" value={draft.playlist.buttonText} onChange={(v) => upPlaylist({ buttonText: v })} />
            <CField label="播放清單網址" value={draft.playlist.url} onChange={(v) => upPlaylist({ url: v })} />
          </CSection>

          {/* Notes */}
          <CSection title="注意事項">
            <CField label="標題" value={draft.notes.title} onChange={(v) => upNotes({ title: v })} />
            <CList items={draft.notes.items} onChange={(v) => upNotes({ items: v })} newItem={() => ''}
              render={(it, set) => (
                <input value={it} onChange={(e) => set(e.target.value)} placeholder="注意事項" className={CONTENT_INPUT} />
              )} />
          </CSection>

          {/* CTA */}
          <CSection title="頁尾 CTA / 社群">
            <CField label="標題" value={draft.cta.title} onChange={(v) => upCta({ title: v })} />
            <CField label="副標" value={draft.cta.subtitle} onChange={(v) => upCta({ subtitle: v })} />
            <div className="grid grid-cols-2 gap-2">
              <CField label="Instagram 連結" value={draft.cta.igUrl} onChange={(v) => upCta({ igUrl: v })} />
              <CField label="Facebook 連結" value={draft.cta.fbUrl} onChange={(v) => upCta({ fbUrl: v })} />
            </div>
          </CSection>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0">
          <p className="text-[10px] text-white/20">儲存後重新整理簡章頁即可看到</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">取消</button>
            <button type="button" onClick={save} disabled={saving} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 disabled:opacity-40 transition-all">
              <Save size={12} /> {saving ? '儲存中...' : '儲存內容'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── EventsTab ─── */

export default function EventsTab() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<EventType> | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewingQr, setViewingQr] = useState<EventType | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [analyticsEvent, setAnalyticsEvent] = useState<EventType | null>(null);
  const [quizData, setQuizData] = useState<QuizAnalytics | null>(null);
  const [quizFullPage, setQuizFullPage] = useState(false);
  const [quizInitialTab, setQuizInitialTab] = useState<QuizTab>('analytics');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [rulesEvent, setRulesEvent] = useState<EventType | null>(null);
  const [contentEvent, setContentEvent] = useState<EventType | null>(null);
  const [rulesItems, setRulesItems] = useState<Array<{ short: string; full: string }>>([]);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [regRulesEvent, setRegRulesEvent] = useState<EventType | null>(null);
  const [regRulesItems, setRegRulesItems] = useState<Array<{ zh: string; en: string }>>([]);
  const [regRulesSaving, setRegRulesSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [regPanelEventId, setRegPanelEventId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regTotal, setRegTotal] = useState(0);
  const [regLoading, setRegLoading] = useState(false);
  const [regSettingsSaving, setRegSettingsSaving] = useState(false);
  const [regDetailId, setRegDetailId] = useState<string | null>(null);
  const [regEditMode, setRegEditMode] = useState(false);
  const [regEditDraft, setRegEditDraft] = useState<Partial<Registration> | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try { const data = await eventService.getAllEvents(); setEvents(data); } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleToggle = async (id: string) => {
    try {
      const res = await eventService.toggleEvent(id);
      if (res.success) setEvents((prev) => prev.map((e) => e.id === id ? { ...e, isActive: !e.isActive } : e));
      else alert(`切換失敗：${res.error || '未知錯誤'}`);
    } catch (err: any) { alert(`切換失敗：${err?.response?.data?.error || err?.message || '請稍後再試'}`); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此活動？')) return;
    try {
      const res = await eventService.deleteEvent(id);
      if (res.success) setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silent */ }
  };

  const handleSave = async () => {
    if (!editingEvent) return;
    setSaving(true);
    const payload: Record<string, unknown> = {};
    const allowedKeys = ['title', 'slug', 'description', 'coverImage', 'location', 'startDate', 'endDate', 'status', 'landingUrl', 'utmSource', 'utmMedium', 'utmCampaign', 'couponCode', 'discountNote', 'isActive', 'eventType'];
    for (const key of allowedKeys) {
      if ((editingEvent as Record<string, unknown>)[key] !== undefined) payload[key] = (editingEvent as Record<string, unknown>)[key];
    }
    if (payload.startDate && typeof payload.startDate === 'string') payload.startDate = new Date(payload.startDate as string).toISOString();
    if (payload.endDate && typeof payload.endDate === 'string') payload.endDate = new Date(payload.endDate as string).toISOString();
    console.log('📤 Event save payload:', JSON.stringify(payload, null, 2));
    try {
      if (editingEvent.id) {
        const res = await eventService.updateEvent(editingEvent.id, payload);
        if (res.success) { setEvents((prev) => prev.map((e) => e.id === editingEvent.id ? { ...e, ...editingEvent } as EventType : e)); setEditingEvent(null); }
        else alert(`更新失敗：${res.message || res.error || JSON.stringify(res.details || res)}`);
      } else {
        const res = await eventService.createEvent(payload);
        if (res.success) { const slug = res.data?.slug || payload.slug; setEditingEvent(null); fetchEvents(); alert(`活動已建立！\n\n前端頁面 URL：${window.location.origin}/e/${slug}\n\n記得去設計對應的前端頁面。`); }
        else alert(`新增失敗：${res.message || res.error || JSON.stringify(res.details || res)}`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || '未知錯誤';
      const details = err?.response?.data?.details;
      console.error('Event save error:', err?.response?.data || err);
      alert(`儲存失敗：${msg}${details ? '\n' + (Array.isArray(details) ? details.join('\n') : JSON.stringify(details)) : ''}`);
    } finally { setSaving(false); }
  };

  const openSoulGuitarPage = (tab: QuizTab = 'analytics') => {
    setQuizInitialTab(tab); setQuizFullPage(true); setQuizData(null);
    quizService.getAnalytics().then(setQuizData).catch(() => {});
  };

  const handleViewAnalytics = async (event: EventType) => {
    if (event.slug.startsWith('soul-guitar')) { openSoulGuitarPage('analytics'); return; }
    setAnalyticsEvent(event); setAnalytics(null);
    try { setAnalytics(await eventService.getEventAnalytics(event.id)); } catch { /* silent */ }
  };

  const handleCopyLink = async (event: EventType) => {
    const url = `${window.location.origin}/e/${event.slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas || !viewingQr) return;
    const link = document.createElement('a');
    link.download = `${viewingQr.slug}-qrcode.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleOpenRules = (event: EventType) => {
    setRulesEvent(event);
    const saved = event.metadata?.rules;
    if (Array.isArray(saved) && saved.length > 0) setRulesItems([...saved]);
    else if (event.slug === 'soul-guitar/info') setRulesItems([...SOUL_GUITAR_INFO_DEFAULT_RULES]);
    else setRulesItems([]);
  };

  const handleSaveRules = async () => {
    if (!rulesEvent) return;
    setRulesSaving(true);
    try {
      const mergedMeta = { ...(rulesEvent.metadata ?? {}), rules: rulesItems };
      const res = await eventService.updateEvent(rulesEvent.id, { metadata: mergedMeta } as any);
      if (res.success) { setEvents((prev) => prev.map((e) => e.id === rulesEvent.id ? { ...e, metadata: mergedMeta } : e)); setRulesEvent(null); }
      else alert(`儲存失敗：${res.error || '未知錯誤'}`);
    } catch { alert('儲存失敗'); } finally { setRulesSaving(false); }
  };

  const handleMoveRule = (idx: number, dir: -1 | 1) => {
    setRulesItems((prev) => {
      const next = [...prev]; const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleOpenRegRules = (event: EventType) => {
    setRegRulesEvent(event);
    const saved = event.metadata?.regRules;
    setRegRulesItems(Array.isArray(saved) && saved.length > 0 ? [...saved] : [...SOUL_GUITAR_REG_DEFAULT_RULES]);
  };

  const handleSaveRegRules = async () => {
    if (!regRulesEvent) return;
    setRegRulesSaving(true);
    try {
      const res = await eventService.updateEvent(regRulesEvent.id, { metadata: { ...regRulesEvent.metadata, regRules: regRulesItems } } as any);
      if (res.success) { setEvents((prev) => prev.map((e) => e.id === regRulesEvent.id ? { ...e, metadata: { ...e.metadata, regRules: regRulesItems } } : e)); setRegRulesEvent(null); }
      else alert(`儲存失敗：${res.error || '未知錯誤'}`);
    } catch { alert('儲存失敗'); } finally { setRegRulesSaving(false); }
  };

  const handleMoveRegRule = (idx: number, dir: -1 | 1) => {
    setRegRulesItems((prev) => {
      const next = [...prev]; const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-TW') : '—';

  const handleOpenRegPanel = async (eventId: string) => {
    setRegPanelEventId(eventId); setRegLoading(true); setRegistrations([]); setRegDetailId(null); setRegEditMode(false); setRegEditDraft(null);
    try { const { registrations: regs, total } = await registrationService.list(eventId); setRegistrations(regs); setRegTotal(total); } catch { /* silent */ } finally { setRegLoading(false); }
  };

  const handleDeleteReg = async (id: string) => {
    if (!window.confirm('確定要刪除這筆報名嗎？')) return;
    try { await registrationService.deleteOne(id); setRegistrations((prev) => prev.filter((r) => r.id !== id)); setRegTotal((n) => n - 1); } catch { alert('刪除失敗'); }
  };

  const handleUpdateReg = async () => {
    if (!regEditDraft || !regDetailId) return;
    try {
      const updated = await registrationService.updateOne(regDetailId, regEditDraft as any);
      setRegistrations(prev => prev.map(r => r.id === regDetailId ? updated : r));
      setRegEditMode(false);
      setRegEditDraft(null);
    } catch (err: any) { alert(err?.message || '更新失敗'); }
  };

  const handleRegSettings = async (eventId: string, open: boolean, limit: number) => {
    setRegSettingsSaving(true);
    try {
      const res = await registrationService.updateSettings(eventId, { registrationOpen: open, registrationLimit: limit });
      if (res.success) setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, registrationOpen: open, registrationLimit: limit } : e));
    } catch { alert('設定儲存失敗'); } finally { setRegSettingsSaving(false); }
  };

  if (quizFullPage) {
    return <QuizFullPage data={quizData} onBack={() => setQuizFullPage(false)} onRefresh={async () => { setQuizData(null); quizService.getAnalytics().then(setQuizData).catch(() => {}); }} events={events} initialTab={quizInitialTab} onUpdateEvents={setEvents} />;
  }

  const renderEventRow = (event: EventType, sub = false) => (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-sm font-bold truncate cursor-pointer hover:text-ayers-gold transition-colors" onClick={() => window.open(`/e/${event.slug}`, '_blank')}>{event.title}</h3>
          {sub && event.slug.includes('/') && <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white/5 text-white/25">/{event.slug.split('/').slice(1).join('/')}</span>}
          <span className={cn('shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest', EVENT_STATUS_COLORS[event.status])}>{event.status}</span>
          {event.eventType && event.eventType !== 'OTHER' && <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 font-bold">{EVENT_PAGE_TYPE_LABELS[event.eventType]}</span>}
          {!event.isActive && <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-bold">隱藏</span>}
        </div>
        <div className="flex flex-wrap gap-4 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><CalendarDays size={10} /> {fmtDate(event.startDate)} — {fmtDate(event.endDate)}</span>
          {event.location && <span className="flex items-center gap-1"><MapPin size={10} /> {event.location}</span>}
          <span className="flex items-center gap-1"><QrCode size={10} /> 掃描 {event.totalScans} 次</span>
          {event.couponCode && <span className="flex items-center gap-1"><Link size={10} /> {event.couponCode}</span>}
          {event.slug.includes('register') && (
            <span className={cn('flex items-center gap-1', event.registrationOpen ? 'text-green-400' : 'text-white/25')}>
              <Users size={10} /> {event.registrationOpen ? `開放報名` : '報名關閉'}
              {event.registrationLimit > 0 && ` · 上限 ${event.registrationLimit}`}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => window.open(`/e/${event.slug}`, '_blank')} title="開啟活動頁面" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><ExternalLink size={14} /></button>
        {event.eventType === 'REGISTER' && (
          event.slug.startsWith('soul-guitar')
            ? <button onClick={() => openSoulGuitarPage('registrations')} title="報名管理" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><Users size={14} /></button>
            : <button onClick={() => handleOpenRegPanel(event.id)} title="報名管理" className={cn('p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all', regPanelEventId === event.id ? 'text-ayers-gold' : 'text-white/40 hover:text-ayers-gold')}><Users size={14} /></button>
        )}
        {event.eventType === 'QUIZ' && event.slug.startsWith('soul-guitar') && <button onClick={() => openSoulGuitarPage('emails')} title="抽獎 Email 管理" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><Mail size={14} /></button>}
        {event.eventType === 'INFO' && <button onClick={() => handleOpenRules(event)} title="編輯比賽規則" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><FileText size={14} /></button>}
        {event.slug === 'soul-guitar/info' && <button onClick={() => setContentEvent(event)} title="編輯頁面內容" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><Newspaper size={14} /></button>}
        {event.slug === 'soul-guitar/register' && <button type="button" onClick={() => handleOpenRegRules(event)} title="編輯報名條款" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><FileText size={14} /></button>}
        <button onClick={() => setViewingQr(event)} title="QR Code" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><QrCode size={14} /></button>
        <button onClick={() => handleCopyLink(event)} title="複製連結" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all">
          {copiedId === event.id ? <Check size={14} className="text-green-400" /> : <Link size={14} />}
        </button>
        <button onClick={() => handleViewAnalytics(event)} title="數據分析" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><BarChart3 size={14} /></button>
        <button onClick={() => handleToggle(event.id)} title={event.isActive ? '點擊隱藏' : '點擊顯示'} className={cn('p-2 rounded-lg transition-all', event.isActive ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20')}>
          {event.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={() => { setEditingEvent({ ...event }); setShowAdvanced(true); setSlugManuallyEdited(true); }} title="編輯" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-ayers-gold transition-all"><Edit size={14} /></button>
        <button onClick={() => handleDelete(event.id)} title="刪除" className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">{t('admin.events.title', '活動管理')}</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchEvents} className="text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
          <button onClick={() => { setEditingEvent({ ...EMPTY_EVENT }); setShowAdvanced(false); setSlugManuallyEdited(false); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all">
            <Plus size={12} /> {t('admin.events.addEvent', '新增活動')}
          </button>
        </div>
      </div>

      {/* ── Registration Panel ── */}
      {regPanelEventId && (() => {
        const regEvent = events.find(e => e.id === regPanelEventId);
        if (!regEvent) return null;
        const detailReg = regDetailId ? registrations.find(r => r.id === regDetailId) : null;
        const hasSoulFields = registrations.some(r => r.category || r.soulColor || r.youtube);
        const answerKeys = Array.from(new Set(registrations.flatMap(r => r.answers ? Object.keys(r.answers) : [])));
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setRegPanelEventId(null); setRegDetailId(null); }}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="rounded-t-2xl sm:rounded-2xl w-full max-w-4xl mx-0 sm:mx-4 flex flex-col" style={{ background: CARD_BG, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">報名管理</h3>
                  <p className="text-[10px] text-white/30 mt-0.5">{regEvent.title} · 共 {regTotal} 筆</p>
                </div>
                <button onClick={() => { setRegPanelEventId(null); setRegDetailId(null); }} className="p-2 rounded-lg hover:bg-white/5 text-white/40 transition-colors"><X size={16} /></button>
              </div>
              <div className="px-6 py-3 border-b border-white/5 flex flex-wrap items-center gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/50">報名狀態</span>
                  <button onClick={() => handleRegSettings(regEvent.id, !regEvent.registrationOpen, regEvent.registrationLimit)} disabled={regSettingsSaving}
                    className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors', regEvent.registrationOpen ? 'bg-green-500' : 'bg-white/10')}>
                    <span className={cn('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', regEvent.registrationOpen ? 'translate-x-4' : 'translate-x-0')} />
                  </button>
                  <span className={cn('text-xs font-bold', regEvent.registrationOpen ? 'text-green-400' : 'text-white/30')}>{regEvent.registrationOpen ? '開放中' : '已關閉'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">人數上限</span>
                  <input type="number" min={0} max={10000} defaultValue={regEvent.registrationLimit}
                    onBlur={e => handleRegSettings(regEvent.id, regEvent.registrationOpen, Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-ayers-gold/40 text-center" />
                  <span className="text-[10px] text-white/25">（0 = 無限制）</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs text-white/30 tabular-nums">{regTotal} / {regEvent.registrationLimit > 0 ? regEvent.registrationLimit : '∞'}</span>
                  <button onClick={() => registrationService.exportCsv(regEvent.id, `registrations-${regEvent.id}.csv`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ayers-gold/10 hover:bg-ayers-gold/20 text-[10px] text-ayers-gold font-bold uppercase tracking-widest transition-all">
                    <Download size={11} /> 匯出 CSV
                  </button>
                </div>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className={cn('overflow-y-auto', detailReg ? 'w-1/2 border-r border-white/5' : 'w-full')}>
                  {regLoading ? <div className="py-12 flex justify-center"><Spinner /></div>
                    : registrations.length === 0 ? <div className="py-12 text-center text-xs text-white/25 uppercase tracking-widest">尚無報名資料</div>
                    : (
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10" style={{ background: CARD_BG }}>
                          <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                            <th className="px-4 py-3 text-left font-medium w-8">#</th>
                            <th className="px-4 py-3 text-left font-medium">姓名</th>
                            <th className="px-4 py-3 text-left font-medium">Email</th>
                            {!detailReg && <th className="px-4 py-3 text-left font-medium">手機</th>}
                            <th className="px-4 py-3 text-left font-medium">報名時間</th>
                            <th className="px-4 py-3 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {registrations.map((r, i) => (
                            <tr key={r.id} onClick={() => { const next = regDetailId === r.id ? null : r.id; setRegDetailId(next); if (!next) { setRegEditMode(false); setRegEditDraft(null); } }} className={cn('transition-colors cursor-pointer group', regDetailId === r.id ? 'bg-ayers-gold/5' : 'hover:bg-white/[0.02]')}>
                              <td className="px-4 py-3 text-white/25">{i + 1}</td>
                              <td className="px-4 py-3"><p className="text-white/80 font-medium">{r.name}</p>{r.stageName && <p className="text-white/30 text-[10px]">{r.stageName}</p>}</td>
                              <td className="px-4 py-3 text-white/50 max-w-[160px] truncate">{r.email}</td>
                              {!detailReg && <td className="px-4 py-3 text-white/50">{r.phone}</td>}
                              <td className="px-4 py-3 text-white/30 whitespace-nowrap text-[10px]">{new Date(r.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="px-4 py-3"><button onClick={e => { e.stopPropagation(); handleDeleteReg(r.id); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all"><Trash2 size={12} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
                {detailReg && (
                  <div className="w-1/2 overflow-y-auto p-5 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">詳細資料</p>
                      <div className="flex items-center gap-2">
                        {!regEditMode && <button type="button" onClick={() => { setRegEditMode(true); setRegEditDraft({ ...detailReg }); }} className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-ayers-gold transition-all" title="編輯"><Edit size={12} /></button>}
                        <button type="button" title="關閉" onClick={() => { setRegDetailId(null); setRegEditMode(false); setRegEditDraft(null); }} className="text-white/20 hover:text-white/50 transition-colors"><X size={12} /></button>
                      </div>
                    </div>
                    {regEditMode && regEditDraft ? (
                      <div className="space-y-2">
                        {([['name', '姓名', true], ['stageName', '藝名', false], ['phone', '手機', true], ['email', 'Email', true]] as [keyof Registration, string, boolean][]).map(([key, label, required]) => (
                          <div key={key}>
                            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{label}{required && ' *'}</p>
                            <input aria-label={label} value={(regEditDraft[key] as string) ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" />
                          </div>
                        ))}
                        {hasSoulFields && <>
                          <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">社群帳號</p>
                            <input aria-label="社群帳號" value={regEditDraft.socialId ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, socialId: e.target.value } : prev)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" /></div>
                          <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">組別</p>
                            <select aria-label="組別" value={regEditDraft.category ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, category: e.target.value || null } : prev)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all">
                              <option value="">—</option><option value="彈唱組">彈唱組</option><option value="演奏組">演奏組</option>
                            </select></div>
                          <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">靈魂顏色</p>
                            <select aria-label="靈魂顏色" value={regEditDraft.soulColor ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, soulColor: e.target.value || null } : prev)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all">
                              <option value="">—</option>{['紅色', '橘色', '黃色', '藍色', '黑色', '白色'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select></div>
                          <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">YouTube</p>
                            <input aria-label="YouTube" value={regEditDraft.youtube ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, youtube: e.target.value } : prev)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" /></div>
                          <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">FB / IG</p>
                            <input aria-label="FB / IG" value={regEditDraft.fbIg ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, fbIg: e.target.value } : prev)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all" /></div>
                        </>}
                        <div><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">留言</p>
                          <textarea aria-label="留言" value={regEditDraft.message ?? ''} onChange={e => setRegEditDraft(prev => prev ? { ...prev, message: e.target.value } : prev)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold/40 transition-all resize-none" /></div>
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={handleUpdateReg} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ayers-gold/20 hover:bg-ayers-gold/30 text-xs text-ayers-gold font-bold uppercase tracking-widest transition-all"><Save size={11} /> 儲存</button>
                          <button type="button" onClick={() => { setRegEditMode(false); setRegEditDraft(null); }} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/40 hover:text-white transition-all">取消</button>
                        </div>
                      </div>
                    ) : <>
                      {[{ label: '姓名', value: detailReg.name }, { label: '藝名', value: detailReg.stageName }, { label: '手機', value: detailReg.phone }, { label: 'Email', value: detailReg.email }].map(({ label, value }) => value ? (
                        <div key={label} className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{label}</p><p className="text-xs text-white/70">{value}</p></div>
                      ) : null)}
                      {hasSoulFields && [{ label: '社群帳號', value: detailReg.socialId }, { label: '組別', value: detailReg.category }, { label: '靈魂顏色', value: detailReg.soulColor }].map(({ label, value }) => value ? (
                        <div key={label} className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{label}</p><p className="text-xs text-white/70">{value}</p></div>
                      ) : null)}
                      {detailReg.youtube && <div className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">YouTube</p><a href={detailReg.youtube} target="_blank" rel="noreferrer" className="text-xs text-ayers-gold/70 hover:text-ayers-gold transition-colors truncate block">{detailReg.youtube}</a></div>}
                      {detailReg.fbIg && <div className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">FB / IG</p><a href={detailReg.fbIg} target="_blank" rel="noreferrer" className="text-xs text-ayers-gold/70 hover:text-ayers-gold transition-colors truncate block">{detailReg.fbIg}</a></div>}
                      {answerKeys.map(key => { const val = detailReg.answers?.[key]; return val !== undefined && val !== null && val !== '' ? (<div key={key} className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{key}</p><p className="text-xs text-white/70">{String(val)}</p></div>) : null; })}
                      {detailReg.message && <div className="rounded-xl bg-white/[0.03] px-4 py-3"><p className="text-[9px] text-white/25 uppercase tracking-widest mb-1">留言</p><p className="text-xs text-white/70 whitespace-pre-line">{detailReg.message}</p></div>}
                      <p className="text-[9px] text-white/20 pt-1">報名時間：{new Date(detailReg.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</p>
                    </>}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ── Rules Editor Modal ── */}
      {rulesEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRulesEvent(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]" style={{ background: CARD_BG }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div><h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">比賽規則編輯</h3><p className="text-[10px] text-white/30 mt-0.5">{rulesEvent.title}</p></div>
              <button onClick={() => setRulesEvent(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {rulesItems.length === 0 && <p className="text-center text-white/20 text-xs py-8">尚無規則，點擊下方「新增規則」開始</p>}
              {rulesItems.map((rule, idx) => (
                <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-ayers-gold/10 text-ayers-gold text-[9px] font-bold flex items-center justify-center mt-1">{idx + 1}</span>
                    <div className="flex-1 space-y-2 min-w-0">
                      <input value={rule.short} onChange={(e) => setRulesItems((prev) => prev.map((r, i) => i === idx ? { ...r, short: e.target.value } : r))} placeholder="規則標題（粗體）"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-ayers-gold transition-all" />
                      <input value={rule.full} onChange={(e) => setRulesItems((prev) => prev.map((r, i) => i === idx ? { ...r, full: e.target.value } : r))} placeholder="規則說明（選填，灰色補充文字）"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50 focus:outline-none focus:border-ayers-gold transition-all" />
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" title="上移" onClick={() => handleMoveRule(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} className="rotate-180" /></button>
                      <button type="button" title="下移" onClick={() => handleMoveRule(idx, 1)} disabled={idx === rulesItems.length - 1} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
                      <button type="button" title="刪除" onClick={() => setRulesItems((prev) => prev.filter((_, i) => i !== idx))} className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setRulesItems((prev) => [...prev, { short: '', full: '' }])} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white hover:border-white/20 text-xs flex items-center justify-center gap-1.5 transition-all">
                <Plus size={12} /> 新增規則
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0">
              <p className="text-[10px] text-white/20">共 {rulesItems.length} 條規則</p>
              <div className="flex gap-3">
                <button onClick={() => setRulesEvent(null)} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">取消</button>
                <button onClick={handleSaveRules} disabled={rulesSaving} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 disabled:opacity-40 transition-all">
                  <Save size={12} /> {rulesSaving ? '儲存中...' : '儲存規則'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Reg Rules Editor Modal ── */}
      {regRulesEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRegRulesEvent(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]" style={{ background: CARD_BG }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div><h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">報名條款編輯</h3><p className="text-[10px] text-white/30 mt-0.5">{regRulesEvent.title}</p></div>
              <button type="button" onClick={() => setRegRulesEvent(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {regRulesItems.length === 0 && <p className="text-center text-white/20 text-xs py-8">尚無條款，點擊下方「新增」開始</p>}
              {regRulesItems.map((rule, idx) => (
                <div key={idx} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-ayers-gold/10 text-ayers-gold text-[9px] font-bold flex items-center justify-center mt-1">{idx + 1}</span>
                    <div className="flex-1 space-y-2 min-w-0">
                      <textarea aria-label="中文" value={rule.zh} rows={2} onChange={(e) => setRegRulesItems((prev) => prev.map((r, i) => i === idx ? { ...r, zh: e.target.value } : r))} placeholder="中文條款"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-ayers-gold transition-all resize-none" />
                      <textarea aria-label="English" value={rule.en} rows={2} onChange={(e) => setRegRulesItems((prev) => prev.map((r, i) => i === idx ? { ...r, en: e.target.value } : r))} placeholder="English translation"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/50 focus:outline-none focus:border-ayers-gold transition-all resize-none" />
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" title="上移" onClick={() => handleMoveRegRule(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} className="rotate-180" /></button>
                      <button type="button" title="下移" onClick={() => handleMoveRegRule(idx, 1)} disabled={idx === regRulesItems.length - 1} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
                      <button type="button" title="刪除" onClick={() => setRegRulesItems((prev) => prev.filter((_, i) => i !== idx))} className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setRegRulesItems((prev) => [...prev, { zh: '', en: '' }])} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white hover:border-white/20 text-xs flex items-center justify-center gap-1.5 transition-all">
                <Plus size={12} /> 新增條款
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0">
              <p className="text-[10px] text-white/20">共 {regRulesItems.length} 條</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setRegRulesEvent(null)} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">取消</button>
                <button type="button" onClick={handleSaveRegRules} disabled={regRulesSaving} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 disabled:opacity-40 transition-all">
                  <Save size={12} /> {regRulesSaving ? '儲存中...' : '儲存條款'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 簡章內容編輯 Modal ── */}
      {contentEvent && (
        <InfoContentModal
          event={contentEvent}
          onClose={() => setContentEvent(null)}
          onSaved={(meta) => { setEvents((prev) => prev.map((e) => e.id === contentEvent.id ? { ...e, metadata: meta as unknown as EventType['metadata'] } : e)); setContentEvent(null); }}
        />
      )}

      {/* ── QR Code Modal ── */}
      {viewingQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewingQr(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-8 max-w-md w-full mx-4 text-center" style={{ background: CARD_BG }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold mb-2">{viewingQr.title}</h3>
            <p className="text-[10px] text-white/40 mb-6">推薦碼：{viewingQr.referralCode}</p>
            <div ref={qrRef} className="inline-block p-4 bg-white rounded-xl mb-4">
              <QRCode value={`${window.location.origin}/e/${viewingQr.slug}`} size={220} bgColor="#ffffff" fgColor="#1a1a1a" qrStyle="dots" eyeRadius={8} ecLevel="H" logoImage="/images/ayers-logo.svg" logoWidth={60} logoHeight={33} logoOpacity={1} logoPadding={2} logoPaddingStyle="circle" removeQrCodeBehindLogo />
            </div>
            <p className="text-[10px] text-white/30 mb-4 break-all font-mono">{`${window.location.origin}/e/${viewingQr.slug}`}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDownloadQr} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all"><Download size={12} /> 下載 PNG</button>
              <button onClick={() => handleCopyLink(viewingQr)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all">
                {copiedId === viewingQr.id ? <><Check size={12} /> 已複製</> : <><Copy size={12} /> 複製連結</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Analytics Modal ── */}
      {analyticsEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAnalyticsEvent(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-8 max-w-lg w-full mx-4" style={{ background: CARD_BG }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ayers-gold">{analyticsEvent.title} — 數據分析</h3>
              <button onClick={() => setAnalyticsEvent(null)} className="text-white/30 hover:text-white"><X size={14} /></button>
            </div>
            {!analytics ? <div className="py-10 text-center"><GuitarSunLoader size={24} /></div> : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[{ label: '掃描次數', v: analytics.totalScans }, { label: '點擊次數', v: analytics.totalClicks }, { label: '不重複訪客', v: analytics.uniqueVisitors }].map(({ label, v }) => (
                    <div key={label} className="rounded-xl p-4 bg-white/5 text-center"><p className="text-2xl font-bold text-ayers-gold">{v}</p><p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{label}</p></div>
                  ))}
                </div>
                {analytics.deviceBreakdown.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">裝置分佈</h4>
                    <div className="flex gap-3">
                      {analytics.deviceBreakdown.map((d) => (
                        <div key={d.device} className="flex-1 rounded-xl p-3 bg-white/5 text-center"><p className="text-lg font-bold">{d.count}</p><p className="text-[10px] text-white/40 capitalize">{d.device}</p></div>
                      ))}
                    </div>
                  </div>
                )}
                {analytics.dailyClicks.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">每日點擊</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={analytics.dailyClicks}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} />
                        <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} />
                        <Tooltip contentStyle={{ background: '#1e160d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 11 }} />
                        <Bar dataKey="count" fill="#c5a059" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Edit / Create Form ── */}
      {editingEvent && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card title={editingEvent.id ? '編輯活動' : '新增活動'} action={<button onClick={() => setEditingEvent(null)} className="text-white/30 hover:text-white transition-colors"><X size={14} /></button>}>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-white/40 mb-1.5">活動名稱 <span className="text-red-400">*</span></label>
                  <input type="text" value={editingEvent.title || ''} onChange={(e) => { const title = e.target.value; const autoSlug = !slugManuallyEdited ? toSlug(title) : editingEvent.slug; const autoUtmCampaign = !showAdvanced ? toSlug(title) : editingEvent.utmCampaign; setEditingEvent(p => p ? { ...p, title, slug: autoSlug, utmCampaign: autoUtmCampaign } : p); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：2026 春季吉他展" />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">開始日期 <span className="text-red-400">*</span></label>
                  <input type="datetime-local" value={toLocalDatetimeValue(editingEvent.startDate)} onChange={(e) => setEditingEvent(p => p ? { ...p, startDate: e.target.value } : p)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1.5">結束日期 <span className="text-red-400">*</span></label>
                  <input type="datetime-local" value={toLocalDatetimeValue(editingEvent.endDate)} onChange={(e) => setEditingEvent(p => p ? { ...p, endDate: e.target.value } : p)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-white/40 mb-1.5">活動描述 <span className="text-red-400">*</span></label>
                  <textarea value={editingEvent.description || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, description: e.target.value } : p)} rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all resize-none" placeholder="簡述活動內容..." />
                </div>
              </div>

              {!showAdvanced && (editingEvent.slug || editingEvent.utmCampaign) && (
                <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
                  <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">自動產生</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-white/40">
                    {editingEvent.slug && <span>Slug：<span className="font-mono text-white/60">{editingEvent.slug}</span></span>}
                    <span>UTM Medium：<span className="font-mono text-white/60">qrcode</span></span>
                    {editingEvent.utmCampaign && <span>UTM Campaign：<span className="font-mono text-white/60">{editingEvent.utmCampaign}</span></span>}
                    <span>狀態：<span className="text-white/60">草稿</span></span>
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">
                <ChevronDown size={12} className={cn('transition-transform', showAdvanced && 'rotate-180')} />
                {showAdvanced ? '收起進階選項' : '展開進階選項（Slug、圖片、地點、UTM、優惠券⋯）'}
              </button>

              {showAdvanced && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 overflow-hidden">
                  <div>
                    <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">詳細設定</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">Slug（網址識別碼）</label>
                        <input type="text" value={editingEvent.slug || ''} onChange={(e) => { setSlugManuallyEdited(true); setEditingEvent(p => p ? { ...p, slug: e.target.value } : p); }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all font-mono" placeholder="自動由名稱產生" />
                        <p className="text-[9px] text-white/20 mt-1">留空或不修改將由活動名稱自動產生</p>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">狀態</label>
                        <select value={editingEvent.status || 'DRAFT'} onChange={(e) => setEditingEvent(p => p ? { ...p, status: e.target.value as EventType['status'] } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all">
                          <option value="DRAFT" className="bg-[#1e160d]">草稿</option>
                          <option value="ACTIVE" className="bg-[#1e160d]">啟用</option>
                          <option value="ENDED" className="bg-[#1e160d]">已結束</option>
                          <option value="CANCELLED" className="bg-[#1e160d]">已取消</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">頁面類型</label>
                        <select value={editingEvent.eventType || 'OTHER'} onChange={(e) => setEditingEvent(p => p ? { ...p, eventType: e.target.value as EventType['eventType'] } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all">
                          {Object.entries(EVENT_PAGE_TYPE_LABELS).map(([val, label]) => <option key={val} value={val} className="bg-[#1e160d]">{label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">活動地點</label>
                        <input type="text" value={editingEvent.location || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, location: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：台北世貿中心" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">封面圖片 URL</label>
                        <input type="text" value={editingEvent.coverImage || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, coverImage: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">QR Code 與引流設定</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">自訂導向網址</label>
                        <input type="text" value={editingEvent.landingUrl || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, landingUrl: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="留空則導向活動頁面" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">UTM Source</label>
                        <input type="text" value={editingEvent.utmSource || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, utmSource: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：flyer, poster, social" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">UTM Medium</label>
                        <input type="text" value={editingEvent.utmMedium || 'qrcode'} onChange={(e) => setEditingEvent(p => p ? { ...p, utmMedium: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="預設：qrcode" />
                        <p className="text-[9px] text-white/20 mt-1">預設為 qrcode</p>
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">UTM Campaign</label>
                        <input type="text" value={editingEvent.utmCampaign || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, utmCampaign: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="自動由名稱產生" />
                        <p className="text-[9px] text-white/20 mt-1">留空將由活動名稱自動產生</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">優惠券關聯</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">優惠碼</label>
                        <input type="text" value={editingEvent.couponCode || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, couponCode: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all font-mono" placeholder="例：SPRING2026" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-white/40 mb-1.5">優惠說明</label>
                        <input type="text" value={editingEvent.discountNote || ''} onChange={(e) => setEditingEvent(p => p ? { ...p, discountNote: e.target.value } : p)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ayers-gold transition-all" placeholder="例：全館 9 折優惠" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setEditingEvent(null); setShowAdvanced(false); setSlugManuallyEdited(false); }} className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">取消</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 disabled:opacity-40 transition-all">
                  <Save size={12} /> {saving ? '儲存中...' : '儲存'}
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── Events List ── */}
      {loading ? <Spinner /> : events.length === 0 ? (
        <div className="py-16 text-center"><CalendarDays size={40} className="mx-auto text-white/10 mb-3" /><p className="text-xs text-white/30 uppercase tracking-widest">尚無活動</p></div>
      ) : (() => {
        const groupMap = new Map<string, EventType[]>();
        for (const e of events) {
          const key = e.slug.split('/')[0];
          if (!groupMap.has(key)) groupMap.set(key, []);
          groupMap.get(key)!.push(e);
        }
        return (
          <div className="space-y-4">
            {[...groupMap.entries()].map(([parentKey, groupEvents]) => {
              if (groupEvents.length === 1) {
                const event = groupEvents[0];
                return <Card key={event.id}><div className="p-5">{renderEventRow(event)}</div></Card>;
              }
              const isCollapsed = collapsedGroups.has(parentKey);
              const totalScans = groupEvents.reduce((s, e) => s + (e.totalScans || 0), 0);
              const mainEvent = groupEvents.find(e => e.slug === parentKey);
              const groupLabel = mainEvent?.title ?? parentKey;
              return (
                <div key={parentKey} className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: CARD_BG }}>
                  <button type="button" onClick={() => setCollapsedGroups(prev => { const next = new Set(prev); next.has(parentKey) ? next.delete(parentKey) : next.add(parentKey); return next; })}
                    className="w-full flex items-center justify-between px-5 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2">
                      {isCollapsed ? <ChevronRight size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{groupLabel}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/25">{groupEvents.length} 頁</span>
                    </div>
                    <span className="text-[10px] text-white/25 flex items-center gap-1"><QrCode size={10} /> 共掃描 {totalScans} 次</span>
                  </button>
                  {!isCollapsed && (
                    <div className="divide-y divide-white/[0.04]">
                      {groupEvents.map(event => <div key={event.id} className="px-5 py-4">{renderEventRow(event, true)}</div>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
    </>
  );
}
