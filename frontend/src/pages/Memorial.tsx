import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Loader2, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import memorialService, { type MemorialNotice } from '../services/memorialService';

/* ═══════════════════════════════════════════════════
   訃聞 — 親友弔唁登記（公開頁）
   獨立全螢幕頁面，無站台導覽列／頁尾。
   ═══════════════════════════════════════════════════ */

const INK = '#2b2b2b';
const PAPER = '#f5f3ee';
const ACCENT = '#6b7280';

interface FormState {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  attending: 'yes' | 'no' | '';
  headcount: string;
  giftAmount: string;
  note: string;
}

const EMPTY: FormState = {
  name: '', relationship: '', phone: '', email: '',
  attending: '', headcount: '', giftAmount: '', note: '',
};

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
    setSubmitting(true);
    try {
      await memorialService.submitEntry({
        name: form.name.trim(),
        relationship: form.relationship.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        attending: form.attending === 'yes' ? true : form.attending === 'no' ? false : null,
        headcount: form.attending === 'yes' && form.headcount ? Number(form.headcount) : null,
        giftAmount: form.giftAmount ? Number(form.giftAmount) : null,
        note: form.note.trim() || undefined,
      });
      setDone(true);
    } catch {
      setError('送出失敗，請稍後再試一次');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-800 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-400';
  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <div className="min-h-screen w-full" style={{ background: PAPER, color: INK }}>
      <SEO title="追思弔唁登記" description="親友追思弔唁登記" />

      <div className="mx-auto max-w-xl px-5 py-10 sm:py-14">
        {/* ── 訃聞內容 ───────────────────────── */}
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm tracking-[0.4em] text-gray-400">敬 輓</p>
          <h1 className="font-serif text-3xl font-semibold tracking-wide sm:text-4xl">
            {notice?.deceasedName ? `${notice.deceasedName} 追思` : '追思紀念'}
          </h1>

          {(notice?.bornDate || notice?.passedDate) && (
            <p className="mt-3 text-[15px] text-gray-500">
              {notice?.bornDate && <span>生於 {notice.bornDate}</span>}
              {notice?.bornDate && notice?.passedDate && <span className="mx-2">·</span>}
              {notice?.passedDate && <span>卒於 {notice.passedDate}</span>}
            </p>
          )}

          {(notice?.ceremonyTime || notice?.ceremonyPlace || notice?.message || notice?.familyName) && (
            <div className="mx-auto mt-6 max-w-md space-y-1.5 rounded-2xl bg-white/70 px-6 py-5 text-[15px] leading-relaxed text-gray-600 shadow-sm">
              {notice?.message && <p className="whitespace-pre-wrap">{notice.message}</p>}
              {notice?.ceremonyTime && (
                <p><span className="text-gray-400">告別式時間　</span>{notice.ceremonyTime}</p>
              )}
              {notice?.ceremonyPlace && (
                <p><span className="text-gray-400">告別式地點　</span>{notice.ceremonyPlace}</p>
              )}
              {notice?.familyName && (
                <p className="pt-1 text-right text-gray-500">{notice.familyName} 　敬啟</p>
              )}
            </div>
          )}
        </header>

        {/* ── 登記表單 / 完成狀態 ─────────────── */}
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm"
          >
            <CheckCircle className="mx-auto mb-4 h-14 w-14" style={{ color: ACCENT }} />
            <h2 className="font-serif text-2xl font-semibold">已收到您的心意</h2>
            <p className="mt-3 text-gray-500">感謝您的追思與關懷。</p>
            <button
              onClick={() => { setForm(EMPTY); setDone(false); }}
              className="mt-8 text-sm text-gray-400 underline underline-offset-4 hover:text-gray-600"
            >
              再填一筆
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl bg-white px-6 py-8 shadow-sm"
          >
            <p className="-mt-1 mb-2 text-center text-sm text-gray-400">
              請留下您的資訊，以表追思之意
            </p>

            <div>
              <label className={labelCls}>姓名 <span className="text-red-400">*</span></label>
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
                placeholder="例如：好友、同事、晚輩…"
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
              <label className={labelCls}>是否出席告別式</label>
              <div className="flex gap-3">
                {([['yes', '出席'], ['no', '不克出席']] as const).map(([val, txt]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => set('attending', form.attending === val ? '' : val)}
                    className={`flex-1 rounded-lg border px-4 py-3 text-[15px] transition ${
                      form.attending === val
                        ? 'border-gray-700 bg-gray-700 text-white'
                        : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {form.attending === 'yes' && (
              <div>
                <label className={labelCls}>出席人數</label>
                <input
                  className={inputCls}
                  value={form.headcount}
                  onChange={(e) => set('headcount', e.target.value.replace(/\D/g, ''))}
                  placeholder="含您本人共幾位"
                  inputMode="numeric"
                />
              </div>
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
              <label className={labelCls}>備註 / 留言</label>
              <textarea
                className={`${inputCls} min-h-[88px] resize-y`}
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                placeholder="想對家屬或往生者說的話…"
              />
            </div>

            {error && <p className="text-center text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-[15px] font-medium text-white transition disabled:opacity-60"
              style={{ background: INK }}
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> 送出中…</>
              ) : (
                <><Heart className="h-4 w-4" /> 送出</>
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          您填寫的資訊僅供治喪家屬聯繫與記錄之用
        </p>
      </div>
    </div>
  );
}
