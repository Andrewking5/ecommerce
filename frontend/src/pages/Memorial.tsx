import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import memorialService, { type MemorialNotice } from '../services/memorialService';

/* ═══════════════════════════════════════════════════
   訃聞 — 親友弔唁登記（公開頁）
   獨立全螢幕頁面，無站台導覽列／頁尾。莊重雅緻的追思版面。
   ═══════════════════════════════════════════════════ */

const INK = '#3a352f';
const GOLD = '#b08d57';

interface FormState {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  attending: 'yes' | 'no' | '';
  headcount: string;
  giftAmount: string;
  note: string;
}

const EMPTY: FormState = {
  name: '', relationship: '', phone: '', email: '', address: '',
  attending: '', headcount: '', giftAmount: '', note: '',
};

/** 菊花紋飾（傳統追思花卉）— 純線稿 SVG */
function Chrysanthemum({ className = '' }: { className?: string }) {
  const petals = Array.from({ length: 12 });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g stroke={GOLD} strokeWidth="1.3" opacity="0.85">
        {petals.map((_, i) => (
          <ellipse key={`o${i}`} cx="50" cy="26" rx="6.4" ry="17"
            transform={`rotate(${i * 30} 50 50)`} fill="#ffffff" />
        ))}
      </g>
      <g stroke={GOLD} strokeWidth="1.1" opacity="0.7">
        {petals.map((_, i) => (
          <ellipse key={`i${i}`} cx="50" cy="35" rx="5" ry="12"
            transform={`rotate(${i * 30 + 15} 50 50)`} fill="#fbf6ec" />
        ))}
      </g>
      <circle cx="50" cy="50" r="6.5" fill="#ecdfc6" stroke={GOLD} strokeWidth="1.1" />
    </svg>
  );
}

/** 細緻分隔線（中央菱形） */
function Divider() {
  return (
    <div className="my-8 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${GOLD}66)` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD, opacity: 0.6 }} />
      <span className="h-px w-16" style={{ backgroundImage: `linear-gradient(to left, transparent, ${GOLD}66)` }} />
    </div>
  );
}

export default function Memorial() {
  const [notice, setNotice] = useState<MemorialNotice | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    memorialService.getNotice().then(setNotice);
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('請填寫姓名');
      return;
    }
    if (!form.address.trim()) {
      setError('請填寫地址');
      return;
    }
    setSubmitting(true);
    try {
      await memorialService.submitEntry({
        name: form.name.trim(),
        relationship: form.relationship.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim(),
        attending: form.attending === 'yes' ? true : form.attending === 'no' ? false : null,
        headcount: form.attending === 'yes' && form.headcount ? Number(form.headcount) : null,
        giftAmount: form.giftAmount ? Number(form.giftAmount) : null,
        note: form.note.trim() || undefined,
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError('您（相同姓名與電話）已登記過了，無需重複填寫，感謝您的心意 🙏');
      } else {
        setError('送出失敗，請稍後再試一次');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-[#e3dccf] bg-[#fdfbf7] px-4 py-3 text-[15px] text-[#3a352f] outline-none transition placeholder:text-gray-400 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/20';
  const labelCls = 'mb-1.5 block text-sm font-medium text-[#6b6253]';

  const hasNotice = !!(notice?.ceremonyTime || notice?.ceremonyPlace || notice?.message || notice?.familyName);

  return (
    <div
      className="min-h-screen w-full"
      style={{ color: INK, background: 'linear-gradient(180deg,#f8f5ef 0%,#efe8da 100%)' }}
    >
      <SEO title="追思弔唁登記" description="親友追思弔唁登記" />

      <div className="mx-auto max-w-xl px-5 py-12 sm:py-16">
        {/* ── 訃聞內容 ───────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center"
        >
          <Chrysanthemum className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />

          <p className="mt-5 text-xs tracking-[0.5em] text-[#b08d57]">追 思 紀 念</p>

          <h1 className="mt-3 font-serif text-[2rem] font-semibold leading-tight tracking-wide sm:text-[2.5rem]">
            {notice?.deceasedName ? (
              <>{notice.deceasedName}<span className="ml-1 text-[0.6em] font-normal text-[#6b6253]"> 女士 千古</span></>
            ) : '追思紀念'}
          </h1>

          {(notice?.bornDate || notice?.passedDate) && (
            <p className="mt-3 text-[15px] tracking-wide text-[#8a8070]">
              {notice?.bornDate && <span>{notice.bornDate}</span>}
              {notice?.bornDate && notice?.passedDate && <span className="mx-2 text-[#b08d57]">—</span>}
              {notice?.passedDate && <span>{notice.passedDate}</span>}
            </p>
          )}

          {hasNotice && (
            <div className="mx-auto mt-7 max-w-md rounded-2xl border border-[#ece3d3] bg-white/70 px-6 py-6 text-[15px] leading-loose text-[#5c5347] shadow-[0_2px_20px_rgba(176,141,87,0.08)] backdrop-blur-sm">
              {notice?.message && <p className="mb-3 whitespace-pre-wrap text-center">{notice.message}</p>}
              <div className="space-y-1.5">
                {notice?.ceremonyTime && (
                  <p className="flex justify-center gap-2"><span className="text-[#a89a82]">告別式時間</span>{notice.ceremonyTime}</p>
                )}
                {notice?.ceremonyPlace && (
                  <p className="flex justify-center gap-2"><span className="text-[#a89a82]">告別式地點</span>{notice.ceremonyPlace}</p>
                )}
              </div>
              {notice?.familyName && (
                <p className="mt-4 text-right text-[#8a8070]">{notice.familyName} 　敬啟</p>
              )}
            </div>
          )}
        </motion.header>

        <Divider />

        {/* ── 登記表單 / 完成狀態 ─────────────── */}
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#ece3d3] bg-white px-6 py-14 text-center shadow-[0_4px_30px_rgba(176,141,87,0.1)]"
          >
            <CheckCircle className="mx-auto mb-4 h-14 w-14" style={{ color: GOLD }} />
            <h2 className="font-serif text-2xl font-semibold">已收到您的心意</h2>
            <p className="mt-3 leading-relaxed text-[#6b6253]">
              感謝您撥冗前來追思與關懷，<br />謹代表家屬向您致上謝意。
            </p>
            <button
              onClick={() => { setForm(EMPTY); setDone(false); }}
              className="mt-8 text-sm text-[#a89a82] underline underline-offset-4 transition hover:text-[#6b6253]"
            >
              再填一筆
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-[#ece3d3] bg-white px-6 py-8 shadow-[0_4px_30px_rgba(176,141,87,0.1)] sm:px-8"
          >
            <p className="-mt-1 mb-1 text-center text-sm text-[#a89a82]">
              敬請留下您的資訊，以表追思之意
            </p>

            <div>
              <label className={labelCls}>姓名 <span className="text-[#b08d57]">*</span></label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="您的姓名"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className={labelCls}>與往生者關係</label>
              <input
                className={inputCls}
                value={form.relationship}
                onChange={(e) => set('relationship', e.target.value)}
                placeholder="例如：孫子、好友、晚輩…"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>聯絡電話</label>
                <input
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="手機或市話"
                  inputMode="tel"
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="electronic@mail.com"
                  inputMode="email"
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>地址 <span className="text-[#b08d57]">*</span></label>
              <input
                className={inputCls}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="您的聯絡地址"
                required
              />
            </div>

            <div>
              <label className={labelCls}>是否出席告別式</label>
              <div className="flex gap-3">
                {([['yes', '出席'], ['no', '不克出席']] as const).map(([val, txt]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('attending', form.attending === val ? '' : val)}
                    className={`flex-1 rounded-xl border px-4 py-3 text-[15px] transition ${
                      form.attending === val
                        ? 'border-[#b08d57] bg-[#b08d57] text-white shadow-sm'
                        : 'border-[#e3dccf] bg-[#fdfbf7] text-[#6b6253] hover:border-[#cbb791]'
                    }`}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {form.attending === 'yes' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className={labelCls}>出席人數</label>
                <input
                  className={inputCls}
                  value={form.headcount}
                  onChange={(e) => set('headcount', e.target.value.replace(/\D/g, ''))}
                  placeholder="含您本人共幾位"
                  inputMode="numeric"
                />
              </motion.div>
            )}

            <div>
              <label className={labelCls}>奠儀／白包金額（選填）</label>
              <input
                className={inputCls}
                value={form.giftAmount}
                onChange={(e) => set('giftAmount', e.target.value.replace(/\D/g, ''))}
                placeholder="新台幣，僅供家屬記帳"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className={labelCls}>追思留言（選填）</label>
              <textarea
                className={`${inputCls} min-h-[96px] resize-y`}
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                placeholder="想對家屬或往生者說的話…"
              />
            </div>

            {error && <p className="text-center text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-medium tracking-wide text-white transition hover:brightness-110 disabled:opacity-60"
              style={{ background: INK }}
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> 送出中…</>
              ) : (
                '送出追思'
              )}
            </button>
          </motion.form>
        )}

        <p className="mt-10 text-center text-xs leading-relaxed text-[#a89a82]">
          您填寫的資訊僅供治喪家屬聯繫與記錄之用
        </p>
        <p className="mt-3 text-center">
          <a
            href="/e/memorial/manage"
            className="text-[11px] text-[#c8bca5] underline-offset-2 transition hover:text-[#8a8070] hover:underline"
          >
            家屬管理登入
          </a>
        </p>
      </div>
    </div>
  );
}
