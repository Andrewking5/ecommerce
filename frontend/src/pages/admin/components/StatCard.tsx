import { CARD_BG } from '../constants';

export default function StatCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: CARD_BG }}>
      <p className="text-2xl font-bold text-ayers-gold">{value}</p>
      {sub && <p className="text-xs text-white/50 mt-0.5">{sub}</p>}
      <p className="text-[11px] text-white/35 mt-2 uppercase tracking-widest">{title}</p>
    </div>
  );
}
