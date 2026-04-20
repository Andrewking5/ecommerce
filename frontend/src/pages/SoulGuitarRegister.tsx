import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import SEO from '../components/SEO';
import registrationService from '../services/registrationService';

/* ═══════════════════════════════════════════════════
   2026 Ayers 靈魂吉他手大賽 — 報名頁
   ═══════════════════════════════════════════════════ */

const GOLD = '#c5a059';
const DARK = '#111827';
const EVENT_SLUG = 'soul-guitar/register';

const SIX_COLORS = [
  { label: '紅色', hex: '#ef4444', entry: '紅色' },
  { label: '橘色', hex: '#f97316', entry: '橘色' },
  { label: '黃色', hex: '#facc15', entry: '黃色' },
  { label: '藍色', hex: '#3b82f6', entry: '藍色' },
  { label: '黑色', hex: '#1a1a1a', entry: '黑色' },
  { label: '白色', hex: '#f5f5f5', entry: '白色' },
];

const RULES_YES = '是 yes';
const RULES_NO =
  '不了解. 請在下一題留言提出問題，我們盡快回覆你. Not exactly sure. (Feel free to ask any question at following space.)';

const SOCIAL_PLATFORMS = [
  { id: 'LINE',      label: 'LINE',      placeholder: 'LINE ID 或電話' },
  { id: 'Instagram', label: 'Instagram', placeholder: '@yourname' },
  { id: 'Facebook',  label: 'Facebook',  placeholder: 'FB 名稱或網址' },
  { id: 'WhatsApp',  label: 'WhatsApp',  placeholder: '+886 9xx xxx xxx' },
  { id: 'WeChat',    label: 'WeChat',    placeholder: 'WeChat ID' },
  { id: 'Telegram',  label: 'Telegram',  placeholder: '@username' },
  { id: 'X',         label: 'X (Twitter)', placeholder: '@username' },
];

function Strip() {
  return (
    <div className="flex h-1.5">
      {['#3b82f6', '#ef4444', '#facc15', '#f97316', '#1a1a1a', '#f5f5f5'].map((c, i) => (
        <div key={i} className="flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

interface FormState {
  name: string;
  stageName: string;
  phone: string;
  email: string;
  socialPlatform: string;
  socialId: string;
  category: '' | '彈唱組' | '演奏組';
  soulColor: string;
  youtube: string;
  fbIg: string;
  copyright: boolean;
  rulesOk: '' | typeof RULES_YES | typeof RULES_NO;
  message: string;
}

const INITIAL: FormState = {
  name: '',
  stageName: '',
  phone: '',
  email: '',
  socialPlatform: 'LINE',
  socialId: '',
  category: '',
  soulColor: '',
  youtube: '',
  fbIg: '',
  copyright: false,
  rulesOk: '',
  message: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-white/80 mb-2">
      {children}
      {required && <span className="ml-1 text-red-400">*</span>}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all ${
        error
          ? 'border-red-500/60 focus:ring-red-500/30'
          : 'border-white/10 focus:border-white/30 focus:ring-white/10'
      }`}
    />
  );
}

export default function SoulGuitarRegister() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [regOpen, setRegOpen] = useState<boolean | null>(null); // null = loading
  const [regCount, setRegCount] = useState(0);
  const [regLimit, setRegLimit] = useState(200);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    registrationService.getStatus(EVENT_SLUG).then((s) => {
      if (s) { setRegOpen(s.open); setRegCount(s.count); setRegLimit(s.limit); }
      else setRegOpen(false);
    }).catch(() => setRegOpen(false));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: false }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, boolean>> = {};
    if (!form.name.trim()) e.name = true;
    if (!form.phone.trim()) e.phone = true;
    if (!form.email.trim() || !form.email.includes('@')) e.email = true;
    if (!form.socialPlatform) e.socialPlatform = true;
    if (!form.socialId.trim()) e.socialId = true;
    if (!form.category) e.category = true;
    if (!form.soulColor) e.soulColor = true;
    if (!form.youtube.trim()) e.youtube = true;
    if (!form.fbIg.trim()) e.fbIg = true;
    if (!form.copyright) e.copyright = true;
    if (!form.rulesOk) e.rulesOk = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      await registrationService.submit(EVENT_SLUG, {
        name:      form.name.trim(),
        stageName: form.stageName.trim() || undefined,
        phone:     form.phone.trim(),
        email:     form.email.trim(),
        socialId:  `${form.socialPlatform}: ${form.socialId.trim()}`,
        category:  form.category as '彈唱組' | '演奏組',
        soulColor: form.soulColor,
        youtube:   form.youtube.trim(),
        fbIg:      form.fbIg.trim(),
        rulesOk:   form.rulesOk === RULES_YES,
        message:   form.message.trim() || undefined,
      });
      setStatus('success');
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.details?.[0] ||
        err?.response?.data?.message ||
        err?.response?.data?.error;
      setErrorMsg(serverMsg || '送出失敗，請稍後再試。');
      setStatus('error');
    }
  }

  // ── 報名未開放 ──
  if (regOpen === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: DARK }}>
        <Loader2 size={28} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (!regOpen) {
    const isFull = regLimit > 0 && regCount >= regLimit;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-white" style={{ backgroundColor: DARK }}>
        <Strip />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-md py-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-white/5">
            <Lock size={32} className="text-white/30" />
          </div>
          <h2 className="text-2xl font-black mb-3">{isFull ? '報名已額滿' : '報名尚未開放'}</h2>
          <p className="text-white/40 text-sm mb-8">
            {isFull
              ? `本次比賽報名人數已達上限（${regLimit} 位），感謝大家踴躍報名！`
              : '報名尚未開始，請關注 Ayers 官方粉絲專頁以取得最新消息。'}
          </p>
          <a href="/e/soul-guitar/info"
            className="px-6 py-3 rounded-full text-sm font-bold border border-white/10 text-white/50 hover:bg-white/5 transition-colors">
            查看活動簡章
          </a>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-white"
        style={{ backgroundColor: DARK }}
      >
        <Strip />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center max-w-md py-20"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #e8b86d)` }}
          >
            <CheckCircle size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-black mb-3">報名成功！</h2>
          <p className="text-white/50 mb-2 leading-relaxed">
            感謝你的報名，請留意信箱是否收到確認通知。
          </p>
          <p className="text-white/30 text-sm mb-10">
            比賽期間如有任何問題，歡迎透過 Facebook / LINE 聯繫我們。
          </p>
          <div className="flex gap-3">
            <a
              href="/e/soul-guitar/info"
              className="px-6 py-3 rounded-full text-sm font-bold border border-white/10 text-white/60 hover:bg-white/5 transition-colors"
            >
              查看活動簡章
            </a>
            <a
              href="/e/soul-guitar"
              className="px-6 py-3 rounded-full text-sm font-bold text-white hover:brightness-110 transition-all"
              style={{ background: `linear-gradient(135deg, #f97316, #ef4444)` }}
            >
              心理測驗
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: DARK }}>
      <SEO
        title="立即報名 | 2026 Ayers 靈魂吉他手大賽"
        description="填寫報名表單，完成 2026 Ayers 靈魂吉他手大賽報名。獎項總價值超過 NT$200,000！"
      />

      <Strip />

      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <img
          src="/images/ayers-logo.svg"
          alt="Ayers"
          className="h-5 mx-auto brightness-0 invert opacity-40 mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-black mb-2">報名表單</h1>
        <p className="text-white/30 text-sm">
          2026 Ayers 靈魂吉他手大賽 · 報名上限 200 位
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <a
            href="/e/soul-guitar/info"
            className="text-xs font-medium hover:underline transition-colors"
            style={{ color: GOLD }}
          >
            活動簡章 →
          </a>
          <span className="text-white/15">|</span>
          <a
            href="/e/soul-guitar"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            心理測驗
          </a>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        {/* Error banner */}
        <AnimatePresence>
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-red-400"
            >
              <AlertCircle size={16} className="shrink-0" />
              {errorMsg || '送出失敗，請稍後再試。'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* ── Section: 個人資訊 ── */}
          <SectionTitle>個人資訊</SectionTitle>

          {/* 姓名 */}
          <Field>
            <Label required>姓名 Name</Label>
            <p className="text-xs text-white/25 mb-2">真實姓名 Real Name</p>
            <Input
              value={form.name}
              onChange={(v) => set('name', v)}
              placeholder="請輸入真實姓名"
              error={errors.name}
            />
            {errors.name && <FieldError />}
          </Field>

          {/* 藝名 */}
          <Field>
            <Label>藝名／樂團名 Stage / Band Name</Label>
            <Input
              value={form.stageName}
              onChange={(v) => set('stageName', v)}
              placeholder="（選填）"
            />
          </Field>

          {/* 手機 */}
          <Field>
            <Label required>手機號碼 Phone Number</Label>
            <p className="text-xs text-white/25 mb-2">
              外籍人士須加上國際區碼 International code is needed if not a Taiwan number
            </p>
            <Input
              value={form.phone}
              onChange={(v) => set('phone', v)}
              placeholder="+886 9xx xxx xxx"
              type="tel"
              error={errors.phone}
            />
            {errors.phone && <FieldError />}
          </Field>

          {/* Email */}
          <Field>
            <Label required>電子信箱 E-mail</Label>
            <p className="text-xs text-white/25 mb-2">
              比賽期間請隨時注意是否有重要通知，吉他折價券以此 E-mail 發送
            </p>
            <Input
              value={form.email}
              onChange={(v) => set('email', v)}
              placeholder="your@email.com"
              type="email"
              error={errors.email}
            />
            {errors.email && <FieldError />}
          </Field>

          {/* 社群帳號 */}
          <Field>
            <Label required>最常使用的帳號</Label>
            <p className="text-xs text-white/25 mb-3">
              選擇平台後輸入你的 ID，比賽期間我們以此聯絡你
            </p>
            {/* Platform pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SOCIAL_PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { set('socialPlatform', p.id); set('socialId', ''); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.socialPlatform === p.id
                      ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a059]/10'
                      : 'border-white/15 text-white/40 hover:border-white/25 hover:text-white/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {/* ID input */}
            <Input
              value={form.socialId}
              onChange={(v) => set('socialId', v)}
              placeholder={SOCIAL_PLATFORMS.find((p) => p.id === form.socialPlatform)?.placeholder ?? '帳號 ID'}
              error={errors.socialId}
            />
            {errors.socialId && <FieldError />}
          </Field>

          {/* ── Section: 參賽資訊 ── */}
          <SectionTitle>參賽資訊</SectionTitle>

          {/* 組別 */}
          <Field>
            <Label required>參賽組別</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {(['彈唱組', '演奏組'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set('category', opt)}
                  className={`py-4 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.category === opt
                      ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a059]/10'
                      : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.category && <FieldError text="請選擇組別" />}
          </Field>

          {/* 靈魂顏色 */}
          <Field>
            <Label required>靈魂顏色</Label>
            <p className="text-xs text-white/25 mb-3">
              請與參賽影片中穿著的顏色相同
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {SIX_COLORS.map((c) => {
                const selected = form.soulColor === c.entry;
                return (
                  <button
                    key={c.entry}
                    type="button"
                    onClick={() => set('soulColor', c.entry)}
                    className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-white/60 bg-white/5'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border-2"
                      style={{
                        backgroundColor: c.hex,
                        borderColor: selected ? 'white' : c.label === '白色' ? '#666' : c.hex,
                      }}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        selected ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.soulColor && <FieldError text="請選擇靈魂顏色" />}
          </Field>

          {/* ── Section: 影片連結 ── */}
          <SectionTitle>影片連結</SectionTitle>

          {/* YouTube */}
          <Field>
            <Label required>YouTube 影片網址</Label>
            <p className="text-xs text-white/25 mb-2">必須上傳至 YouTube</p>
            <Input
              value={form.youtube}
              onChange={(v) => set('youtube', v)}
              placeholder="https://www.youtube.com/watch?v=..."
              error={errors.youtube}
            />
            {errors.youtube && <FieldError />}
          </Field>

          {/* FB / IG */}
          <Field>
            <Label required>Facebook 或 Instagram 影片網址</Label>
            <p className="text-xs text-white/25 mb-2">FB 或 IG 擇一上傳</p>
            <Input
              value={form.fbIg}
              onChange={(v) => set('fbIg', v)}
              placeholder="https://www.instagram.com/p/..."
              error={errors.fbIg}
            />
            {errors.fbIg && <FieldError />}
          </Field>

          {/* ── Section: 同意條款 ── */}
          <SectionTitle>同意條款</SectionTitle>

          {/* 版權同意 */}
          <Field>
            <button
              type="button"
              onClick={() => set('copyright', !form.copyright)}
              className={`w-full flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-all ${
                form.copyright
                  ? 'border-[#c5a059]/50 bg-[#c5a059]/5'
                  : errors.copyright
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                  form.copyright ? 'border-[#c5a059] bg-[#c5a059]' : 'border-white/30'
                }`}
              >
                {form.copyright && (
                  <svg viewBox="0 0 10 8" className="w-3 h-3" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-white/60 leading-relaxed">
                參賽者須自行確認參賽曲目之版權使用無虞，並同意主辦單位得使用參賽影片作為本活動相關宣傳及活動使用。
                <span className="block mt-1 text-white/30 text-xs">
                  Participants must ensure the copyright of their selected piece is properly cleared, and agree that the organizer may use the submitted video for promotional purposes.
                </span>
              </span>
            </button>
            {errors.copyright && <FieldError text="請勾選同意版權條款" />}
          </Field>

          {/* 規則確認 */}
          <Field>
            <Label required>是否了解參賽 12 點注意事項？</Label>
            <p className="text-xs text-white/25 mb-3">
              參加比賽者同意本規定之效力
            </p>

            {/* 規則內容 */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-3 max-h-64 overflow-y-auto space-y-3 text-xs text-white/50 leading-relaxed">
              {[
                { zh: '演奏組參賽者須將影片上傳至 ①YouTube（必須）及 ②Instagram / Facebook（擇一），並將影片標題命名為「參賽曲名_姓名_演奏組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。', en: 'Participants in the Instrumental Category must upload their video to ① YouTube (required) and ② Instagram or Facebook, titled "Song Title_Name_Instrumental Category #2026AyersSoulGuitaristCompetition". Posts must include the hashtag #2026AyersSoulGuitaristCompetition.' },
                { zh: '彈唱組參賽者須將影片上傳至 ①YouTube（必須）及 ②Instagram / Facebook（擇一），並將影片標題命名為「參賽曲名_姓名_彈唱組 #2026Ayers靈魂吉他手大賽」。Instagram / Facebook 貼文亦須加上 #2026Ayers靈魂吉他手大賽。', en: 'Participants in the Singing & Playing Category must upload their video to ① YouTube (required) and ② Instagram or Facebook, titled "Song Title_Name_Singing & Playing Category #2026AyersSoulGuitaristCompetition". Posts must include the hashtag #2026AyersSoulGuitaristCompetition.' },
                { zh: '影片彈唱前需說明：「大家好我是（本名/藝名/團名），今天來參加2026Ayers靈魂吉他手大賽，報名（演奏組/彈唱組），我的靈魂是（xx）吉他魂（⚠️需與身上顏色相同），（想帶給大家的一句話）。比賽曲目是（創作者）的（歌名）。」', en: 'Before performing, participants must say: "Hello everyone, I am (name/stage name/band). I am joining the 2026 Ayers Soul Guitarist Competition, registering for the (category). My soul is (xx) guitar soul (⚠️ must match the color worn). (One sentence for everyone.) The competition piece is (Song Title) by (Composer)."' },
                { zh: '影片總時長需為 30 秒至 120 秒。', en: 'The total video duration must be between 30 and 120 seconds.' },
                { zh: '錄製影像需為直式固定鏡頭一鏡到底，禁止合成、剪輯、運鏡、轉場效果，可在影片上加字幕。', en: 'The recording must be vertical, fixed-camera, one continuous take. Editing, compositing, camera movement, and transitions are prohibited. Subtitles may be added.' },
                { zh: '同一組別穿著顏色需相同（指定顏色為：橘色、黃色、藍色、黑色、白色或紅色其中一種）。', en: 'All participants in a group must wear the same designated color: orange, yellow, blue, black, white, or red.' },
                { zh: '參賽者須清楚露臉、至少完整上半身得以看清楚左、右手彈奏姿勢。', en: 'Participants must clearly show their face and full upper body so both hands are visible.' },
                { zh: '限定參賽者自選一首中文（本土語系）、英文或演奏曲目，改編曲及原創曲均可。', en: 'Participants must choose one piece in Chinese, English, or instrumental. Arrangements and original compositions are allowed.' },
                { zh: '聲音呈現，只能出現收錄當下參賽者本人歌聲、畫面中彈奏的木吉他聲。禁止人聲合音效果器、Loop 錄音循環。', en: 'Only the live vocals and acoustic guitar played on screen may appear in the audio. Vocal harmony effects and loop recording are prohibited.' },
                { zh: '限 1~5 人參賽，至少出現一把鋼弦木吉他。禁止對嘴代彈，如不符合以上規定將取消比賽資格。', en: '1–5 participants per entry, with at least one steel-string acoustic guitar. Lip-syncing or ghost playing is prohibited. Non-compliance results in disqualification.' },
                { zh: '參賽影片須於評審期間維持公開狀態，如因刪除或隱藏導致無法評分，視同放棄資格。', en: 'Videos must remain public during the judging period. Videos made private or deleted will be considered as forfeited.' },
                { zh: '所有評斷 Ayers 主辦官方保有最終決策權。', en: 'All judging decisions are subject to the final determination of Ayers, the organizer.' },
              ].map((r, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5" style={{ backgroundColor: '#c5a05920', color: GOLD }}>{i + 1}</span>
                  <div>
                    <p className="text-white/60">{r.zh}</p>
                    <p className="mt-0.5 text-white/25">{r.en}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <RadioOption
                selected={form.rulesOk === RULES_YES}
                onClick={() => set('rulesOk', RULES_YES)}
                label="是，我已了解並同意  Yes, I understand and agree"
              />
              <RadioOption
                selected={form.rulesOk === RULES_NO}
                onClick={() => set('rulesOk', RULES_NO)}
                label="不了解 — 請在下方留言提問，我們盡快回覆  Not sure — I'll ask below"
              />
            </div>
            {errors.rulesOk && <FieldError text="請選擇是否了解規則" />}
          </Field>

          {/* 留言 */}
          <Field>
            <Label>想對我們說的話</Label>
            <p className="text-xs text-white/25 mb-2">
              （選填）如有任何問題，歡迎在此留言
            </p>
            <textarea
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              placeholder="可在此提問或留言…"
              rows={3}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all resize-none"
            />
          </Field>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full py-4 rounded-xl text-base font-black text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
              style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  送出中…
                </>
              ) : (
                '立即報名'
              )}
            </button>
            <p className="text-center text-xs text-white/20 mt-3">
              報名上限 200 位 · 額滿為止
            </p>
          </div>
        </div>
      </form>

      <Strip />

      {/* Footer */}
      <footer className="py-6 text-center">
        <img
          src="/images/ayers-logo.svg"
          alt="Ayers"
          className="h-4 mx-auto brightness-0 invert opacity-10 mb-2"
        />
        <p className="text-[9px] text-white/10">&copy; 2026 Ayers Guitars. All rights reserved.</p>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4">
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: GOLD }}>
        {children}
      </h2>
      <div className="mt-2 h-px bg-white/[0.06]" />
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function FieldError({ text = '此欄位為必填' }: { text?: string }) {
  return <p className="mt-1.5 text-xs text-red-400">{text}</p>;
}

function RadioOption({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-[#c5a059]/50 bg-[#c5a059]/5'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <div
        className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
          selected ? 'border-[#c5a059]' : 'border-white/30'
        }`}
      >
        {selected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />}
      </div>
      <span className={`text-sm ${selected ? 'text-white/80' : 'text-white/40'}`}>{label}</span>
    </button>
  );
}
