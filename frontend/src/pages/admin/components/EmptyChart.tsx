export default function EmptyChart({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="h-56 flex flex-col items-center justify-center">
      <div className="text-white/8 mb-3">{icon}</div>
      <p className="text-[10px] uppercase tracking-widest text-white/25">{message}</p>
    </div>
  );
}
