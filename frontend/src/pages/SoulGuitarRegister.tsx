import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Loader2, Lock, Edit, Save, X, Plus, Trash2, ChevronDown } from 'lucide-react';
import SEO from '../components/SEO';
import registrationService from '../services/registrationService';
import eventService, { type Event as EventType } from '../services/eventService';

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

const COUNTRY_CODES = [
  { code: '+886', flag: '🇹🇼', name: '台灣 Taiwan' },
  { code: '+86',  flag: '🇨🇳', name: '中國 China' },
  { code: '+852', flag: '🇭🇰', name: '香港 Hong Kong' },
  { code: '+853', flag: '🇲🇴', name: '澳門 Macau' },
  { code: '+65',  flag: '🇸🇬', name: '新加坡 Singapore' },
  { code: '+60',  flag: '🇲🇾', name: '馬來西亞 Malaysia' },
  { code: '+81',  flag: '🇯🇵', name: '日本 Japan' },
  { code: '+82',  flag: '🇰🇷', name: '韓國 Korea' },
  { code: '+1',   flag: '🇺🇸', name: '美國 USA / Canada' },
  { code: '+44',  flag: '🇬🇧', name: '英國 UK' },
  { code: '+61',  flag: '🇦🇺', name: '澳洲 Australia' },
  { code: '+49',  flag: '🇩🇪', name: '德國 Germany' },
  { code: '+33',  flag: '🇫🇷', name: '法國 France' },
  { code: '+63',  flag: '🇵🇭', name: '菲律賓 Philippines' },
  { code: '+66',  flag: '🇹🇭', name: '泰國 Thailand' },
  { code: '+84',  flag: '🇻🇳', name: '越南 Vietnam' },
  { code: '+62',  flag: '🇮🇩', name: '印尼 Indonesia' },
];

const SOCIAL_PLATFORMS = [
  { id: 'LINE',      label: 'LINE',      placeholder: 'LINE ID 或電話' },
  { id: 'Instagram', label: 'Instagram', placeholder: '@yourname' },
  { id: 'Facebook',  label: 'Facebook',  placeholder: 'FB 名稱或網址' },
  { id: 'WhatsApp',  label: 'WhatsApp',  placeholder: '+886 9xx xxx xxx' },
  { id: 'WeChat',    label: 'WeChat',    placeholder: 'WeChat ID' },
  { id: 'Telegram',  label: 'Telegram',  placeholder: '@username' },
  { id: 'X',         label: 'X (Twitter)', placeholder: '@username' },
];

const REFERRAL_SOURCES = [
  'Ayers 官方社群平台（IG）',
  'Ayers 官方社群平台（FB）',
  'Ayers 官網',
  'Ayers 合作經銷商',
  '親友介紹',
  '海馬 91 譜',
  'YouTube 白懂影片',
  '心理測驗',
  '其他',
] as const;

const REFERRAL_OTHER = '其他';

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
  countryCode: string;
  phone: string;
  email: string;
  socialPlatform: string;
  socialId: string;
  referralSource: '' | typeof REFERRAL_SOURCES[number];
  referralSourceOther: string;
  category: '' | '彈唱組' | '演奏組';
  soulColor: string;
  youtube: string;
  fbIg: string;
  handsVisible: boolean;
  copyright: boolean;
  rulesOk: '' | typeof RULES_YES | typeof RULES_NO;
  message: string;
}

const INITIAL: FormState = {
  name: '',
  stageName: '',
  countryCode: '+886',
  phone: '',
  email: '',
  socialPlatform: 'LINE',
  socialId: '',
  referralSource: '',
  referralSourceOther: '',
  category: '',
  soulColor: '',
  youtube: '',
  fbIg: '',
  handsVisible: false,
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

const RULES_DEFAULT: Array<{ zh: string; en: string }> = [
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

export default function SoulGuitarRegister() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [regOpen, setRegOpen] = useState<boolean | null>(null); // null = loading
  const [regCount, setRegCount] = useState(0);
  const [regLimit, setRegLimit] = useState(200);
  const [errorMsg, setErrorMsg] = useState('');
  const [eventData, setEventData] = useState<EventType | null>(null);
  const [rules, setRules] = useState<Array<{ zh: string; en: string }>>(RULES_DEFAULT);

  // ?edit mode — admin only
  const isEditMode = new URLSearchParams(window.location.search).has('edit');
  const [editItems, setEditItems] = useState<Array<{ zh: string; en: string }>>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaved, setEditSaved] = useState(false);

  useEffect(() => {
    registrationService.getStatus(EVENT_SLUG).then((s) => {
      if (s) { setRegOpen(s.open); setRegCount(s.count); setRegLimit(s.limit); }
      else setRegOpen(false);
    }).catch(() => setRegOpen(false));
    eventService.getEventBySlug(EVENT_SLUG).then((event) => {
      if (event) {
        setEventData(event);
        if (event.referralCode) eventService.trackClick(event.referralCode).catch(() => {});
        const saved = event.metadata?.regRules;
        if (Array.isArray(saved) && saved.length > 0) {
          setRules(saved);
          if (isEditMode) setEditItems([...saved]);
        } else if (isEditMode) {
          setEditItems([...RULES_DEFAULT]);
        }
      }
    }).catch(() => {});
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
    if (!form.referralSource) e.referralSource = true;
    if (form.referralSource === REFERRAL_OTHER && !form.referralSourceOther.trim()) e.referralSourceOther = true;
    if (!form.category) e.category = true;
    if (!form.soulColor) e.soulColor = true;
    if (!form.youtube.trim()) e.youtube = true;
    if (!form.fbIg.trim()) e.fbIg = true;
    if (!form.handsVisible) e.handsVisible = true;
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
      const referralSourceFinal =
        form.referralSource === REFERRAL_OTHER && form.referralSourceOther.trim()
          ? `其他：${form.referralSourceOther.trim()}`
          : form.referralSource;

      await registrationService.submit(EVENT_SLUG, {
        name:      form.name.trim(),
        stageName: form.stageName.trim() || undefined,
        phone:     `${form.countryCode} ${form.phone.trim()}`,
        email:     form.email.trim(),
        socialId:  `${form.socialPlatform}: ${form.socialId.trim()}`,
        category:  form.category as '彈唱組' | '演奏組',
        soulColor: form.soulColor,
        youtube:   form.youtube.trim(),
        fbIg:      form.fbIg.trim(),
        rulesOk:   form.rulesOk === RULES_YES,
        message:   form.message.trim() || undefined,
        answers:   { 得知管道: referralSourceFinal },
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
            感謝你的報名，確認通知與專屬優惠券已寄送至您的信箱，請記得查收。
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
            <PhoneInput
              countryCode={form.countryCode}
              onCountryChange={(v) => set('countryCode', v)}
              value={form.phone}
              onChange={(v) => set('phone', v)}
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

          {/* 如何得知此活動 */}
          <Field>
            <Label required>如何得知此活動 How did you hear about us?</Label>
            <p className="text-xs text-white/25 mb-3">
              請選擇一項，協助我們了解您是從哪個管道得知本次比賽
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REFERRAL_SOURCES.map((src) => {
                const selected = form.referralSource === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      set('referralSource', src);
                      if (src !== REFERRAL_OTHER) set('referralSourceOther', '');
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm transition-all ${
                      selected
                        ? 'border-[#c5a059]/50 bg-[#c5a059]/5 text-white/85'
                        : 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    <div
                      className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        selected ? 'border-[#c5a059]' : 'border-white/30'
                      }`}
                    >
                      {selected && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GOLD }} />}
                    </div>
                    <span>{src}</span>
                  </button>
                );
              })}
            </div>
            {form.referralSource === REFERRAL_OTHER && (
              <div className="mt-3">
                <Input
                  value={form.referralSourceOther}
                  onChange={(v) => set('referralSourceOther', v)}
                  placeholder="請說明（例如：YouTube 影片、學校老師…）"
                  error={errors.referralSourceOther}
                />
                {errors.referralSourceOther && <FieldError text="請填寫其他來源" />}
              </div>
            )}
            {errors.referralSource && <FieldError text="請選擇一項" />}
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

          {/* 雙手入鏡示範照片 */}
          <Field>
            <div className="rounded-xl border border-white/10 bg-white/3 overflow-hidden">
              <div className="px-4 pt-4 pb-3">
                <p className="text-xs font-bold text-white/70 tracking-wide mb-1">影片拍攝示範</p>
                <p className="text-xs text-white/35">1 人 / 3 人 / 5 人 示範圖</p>
              </div>
              <div className="grid grid-cols-3 gap-0.5 px-0.5 pb-0.5">
                {[
                  { src: '/images/events/video-example-1.jpg', label: '1 人' },
                  { src: '/images/events/video-example-3.jpg', label: '3 人' },
                  { src: '/images/events/video-example-5.jpg', label: '5 人' },
                ].map(({ src, label }) => (
                  <div key={label} className="relative aspect-9/16 overflow-hidden rounded-sm bg-white/5">
                    <img src={src} alt={label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 py-1 text-center">
                      <span className="text-[10px] font-semibold text-white/70">{label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 flex items-start gap-2 border-t border-white/6 mt-0.5">
                <span className="shrink-0 text-base leading-none mt-0.5">⚠️</span>
                <p className="text-xs font-semibold leading-relaxed text-ayers-gold">
                  參賽正確影像參考：影片中彈奏的左右手與所有成員臉部都需入鏡，避免產生假彈、假唱的疑慮。
                  <span className="block mt-0.5 font-normal text-white/35">
                    Both hands and the faces of all members must be visible in the video to avoid any disputes over authentic playing or singing.
                  </span>
                </p>
              </div>
            </div>
          </Field>

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

          {/* 雙手入鏡確認 */}
          <Field>
            <button
              type="button"
              onClick={() => set('handsVisible', !form.handsVisible)}
              className={`w-full flex items-start gap-3 text-left p-4 rounded-xl border-2 transition-all ${
                form.handsVisible
                  ? 'border-[#c5a059]/50 bg-[#c5a059]/5'
                  : errors.handsVisible
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                  form.handsVisible ? 'border-ayers-gold bg-ayers-gold' : 'border-white/30'
                }`}
              >
                {form.handsVisible && (
                  <svg viewBox="0 0 10 8" className="w-3 h-3" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-white/60 leading-relaxed">
                我了解影片中彈奏的左右手與所有成員臉部都需入鏡，避免產生假彈、假唱的疑慮。
                <span className="block mt-1 text-white/30 text-xs">
                  I understand that both hands and the faces of all members must be visible in the video to avoid any disputes over authentic playing or singing.
                </span>
              </span>
            </button>
            {errors.handsVisible && <FieldError text="請勾選確認雙手入鏡規定" />}
          </Field>

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
            <Label required>是否了解參賽 13 點注意事項？</Label>
            <p className="text-xs text-white/25 mb-3">
              參加比賽者同意本規定之效力
            </p>

            {/* 規則內容 */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-3 max-h-64 overflow-y-auto space-y-3 text-xs text-white/50 leading-relaxed">
              {rules.map((r, i) => (
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

      {/* ── ?edit 模式：條款編輯器 ── */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl mx-0 sm:mx-4 flex flex-col" style={{ background: '#1a1a1a', maxHeight: '90vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: GOLD }}>條款編輯</h3>
                <p className="text-[10px] text-white/30 mt-0.5">共 {editItems.length} 條 · 儲存後立即生效</p>
              </div>
              <a href={window.location.pathname} title="關閉編輯器" className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-colors"><X size={16} /></a>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {editItems.length === 0 && <p className="text-center text-white/20 text-xs py-8">尚無條款，點擊下方「新增」開始</p>}
              {editItems.map((rule, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center mt-1" style={{ backgroundColor: '#c5a05920', color: GOLD }}>{idx + 1}</span>
                    <div className="flex-1 space-y-2 min-w-0">
                      <textarea aria-label="中文" value={rule.zh} rows={2} onChange={e => setEditItems(prev => prev.map((r, i) => i === idx ? { ...r, zh: e.target.value } : r))} placeholder="中文條款"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-yellow-500/40 transition-all resize-none" />
                      <textarea aria-label="English" value={rule.en} rows={2} onChange={e => setEditItems(prev => prev.map((r, i) => i === idx ? { ...r, en: e.target.value } : r))} placeholder="English translation"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/40 focus:outline-none focus:border-yellow-500/40 transition-all resize-none" />
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" title="上移" onClick={() => setEditItems(prev => { const n = [...prev]; if (idx > 0) [n[idx], n[idx-1]] = [n[idx-1], n[idx]]; return n; })} disabled={idx === 0} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} className="rotate-180" /></button>
                      <button type="button" title="下移" onClick={() => setEditItems(prev => { const n = [...prev]; if (idx < n.length-1) [n[idx], n[idx+1]] = [n[idx+1], n[idx]]; return n; })} disabled={idx === editItems.length - 1} className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white disabled:opacity-20 transition-all"><ChevronDown size={12} /></button>
                      <button type="button" title="刪除" onClick={() => setEditItems(prev => prev.filter((_, i) => i !== idx))} className="p-1 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setEditItems(prev => [...prev, { zh: '', en: '' }])} className="w-full py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white hover:border-white/20 text-xs flex items-center justify-center gap-1.5 transition-all">
                <Plus size={12} /> 新增條款
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 shrink-0">
              <button type="button" onClick={() => setEditItems([...RULES_DEFAULT])} className="text-[10px] text-white/30 hover:text-white transition-colors">重置為預設</button>
              <button type="button" disabled={editSaving} onClick={async () => {
                if (!eventData) return;
                setEditSaving(true);
                try {
                  await eventService.updateEvent(eventData.id, { metadata: { ...eventData.metadata, regRules: editItems } } as any);
                  setRules([...editItems]);
                  setEditSaved(true);
                  setTimeout(() => setEditSaved(false), 2000);
                } catch { alert('儲存失敗，請確認已登入管理員帳號'); } finally { setEditSaving(false); }
              }} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 transition-all" style={{ background: GOLD, color: '#000' }}>
                <Save size={12} /> {editSaved ? '已儲存！' : editSaving ? '儲存中...' : '儲存條款'}
              </button>
            </div>
          </div>
        </div>
      )}
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

function PhoneInput({
  countryCode,
  onCountryChange,
  value,
  onChange,
  error,
}: {
  countryCode: string;
  onCountryChange: (v: string) => void;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex gap-2" ref={ref}>
      {/* Country dropdown trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-1.5 h-full px-3 py-3 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
            error
              ? 'border-red-500/60 bg-white/6 text-white'
              : 'border-white/10 bg-white/6 text-white hover:border-white/25'
          }`}
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-white/70">{selected.code}</span>
          <svg className={`w-3 h-3 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 mt-1 w-56 rounded-xl border border-white/10 bg-[#1c2333] shadow-xl overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {COUNTRY_CODES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onCountryChange(c.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/6 ${
                    c.code === countryCode ? 'text-ayers-gold' : 'text-white/60'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-white/30 text-xs">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Number input */}
      <div className="flex-1 flex flex-col gap-1.5">
        <input
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(e) => {
            let v = e.target.value.trim();
            if (v.startsWith(countryCode)) v = v.slice(countryCode.length).trimStart();
            if (v.startsWith('0')) v = v.slice(1);
            onChange(v);
          }}
          placeholder="912 345 678"
          autoComplete="tel-national"
          className={`w-full bg-white/6 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-red-500/60 focus:ring-red-500/30'
              : 'border-white/10 focus:border-white/30 focus:ring-white/10'
          }`}
        />
        {value ? (
          <p className="text-[11px] pl-1 text-white/35 tracking-wide">
            完整號碼：<span className="text-white/55 font-mono">{countryCode} {value}</span>
          </p>
        ) : (
          <p className="text-[11px] text-white/20 pl-1">不需要加 0，例：912 345 678</p>
        )}
      </div>
    </div>
  );
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
