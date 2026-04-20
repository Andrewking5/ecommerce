import { CARD_BG } from '../constants';

export default function Card({ title, action, children }: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: CARD_BG }}>
      {title && (
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/35">{title}</h3>
          {action}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
