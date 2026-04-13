import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ──────────────────────────────────────
   Q1 — Cozy Room Scene Quiz
   ────────────────────────────────────── */

const question = {
  id: 1,
  text: '如果今天突然有一整天的空閒，你最想？',
  options: [
    '找一家舒服的小店坐著放鬆',
    '隨便出門走走看看城市',
    '待在房間聽歌或想事情',
    '找朋友出去玩熱鬧一下',
  ],
};

/* ---------- SVG sub-components ---------- */

/** Potted plant on shelf / floor */
function PlantPot({ x, y, size = 1, variant = 0 }: { x: number; y: number; size?: number; variant?: number }) {
  const leaves = [
    // variant 0 – round bush
    <>
      <ellipse cx={0} cy={-18} rx={12} ry={14} fill="#5a8a5c" />
      <ellipse cx={-6} cy={-22} rx={8} ry={10} fill="#6ea26e" />
      <ellipse cx={6} cy={-20} rx={7} ry={9} fill="#4e7e50" />
    </>,
    // variant 1 – tall leaf
    <>
      <path d="M0,-10 Q-8,-30 -3,-42 Q0,-46 3,-42 Q8,-30 0,-10Z" fill="#5a8a5c" />
      <path d="M0,-10 Q6,-28 4,-38 Q2,-42 0,-38 Q-4,-28 0,-10Z" fill="#6ea26e" />
    </>,
    // variant 2 – small succulent
    <>
      <ellipse cx={0} cy={-14} rx={8} ry={8} fill="#7db37d" />
      <ellipse cx={-4} cy={-18} rx={5} ry={6} fill="#5a8a5c" />
      <ellipse cx={4} cy={-16} rx={4} ry={5} fill="#8ec48e" />
    </>,
  ];

  return (
    <g transform={`translate(${x},${y}) scale(${size})`}>
      {/* pot */}
      <path d="M-8,0 L-6,-12 L6,-12 L8,0Z" fill="#c47a5a" />
      <rect x={-9} y={-12} width={18} height={3} rx={1} fill="#b06840" />
      {/* leaves */}
      {leaves[variant % 3]}
    </g>
  );
}

/** Hanging ivy from window */
function HangingIvy({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* pot */}
      <path d="M-6,0 L-4,-8 L4,-8 L6,0Z" fill="#c47a5a" />
      {/* trailing vines */}
      <path d="M-2,0 Q-10,20 -6,40 Q-2,55 -8,70" fill="none" stroke="#5a8a5c" strokeWidth={2} />
      <path d="M2,0 Q8,25 4,45 Q0,60 6,75" fill="none" stroke="#6ea26e" strokeWidth={2} />
      <path d="M0,0 Q-4,15 0,30 Q4,45 -2,58" fill="none" stroke="#4e7e50" strokeWidth={1.5} />
      {/* small leaves along vines */}
      {[15, 30, 45, 60].map((dy, i) => (
        <ellipse key={i} cx={i % 2 === 0 ? -6 : 5} cy={dy} rx={4} ry={3} fill="#6ea26e" opacity={0.8} />
      ))}
      {[20, 38, 55].map((dy, i) => (
        <ellipse key={`r${i}`} cx={i % 2 === 0 ? 4 : -3} cy={dy} rx={3} ry={2.5} fill="#5a8a5c" opacity={0.7} />
      ))}
    </g>
  );
}

/** Picture frame on wall */
function Frame({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: React.ReactNode }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2} fill="#f5f0e6" stroke="#8b7355" strokeWidth={3} />
      {children}
    </g>
  );
}

/** Sleeping cat silhouette */
function SleepingCat({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* body */}
      <ellipse cx={0} cy={0} rx={16} ry={9} fill="#e8a55a" />
      {/* head */}
      <circle cx={14} cy={-4} r={7} fill="#e8a55a" />
      {/* ears */}
      <polygon points="10,-10 13,-16 16,-10" fill="#d4944a" />
      <polygon points="16,-10 19,-16 22,-10" fill="#d4944a" />
      {/* tail */}
      <path d="M-16,0 Q-24,-4 -22,-10 Q-20,-14 -16,-10" fill="#d4944a" stroke="none" />
      {/* closed eyes */}
      <path d="M12,-5 Q14,-7 16,-5" fill="none" stroke="#8b6030" strokeWidth={1} />
      {/* stripes */}
      <path d="M-8,-6 Q-6,-10 -4,-6" fill="none" stroke="#d4944a" strokeWidth={1.5} />
      <path d="M-2,-7 Q0,-11 2,-7" fill="none" stroke="#d4944a" strokeWidth={1.5} />
      <path d="M4,-6 Q6,-10 8,-6" fill="none" stroke="#d4944a" strokeWidth={1.5} />
    </g>
  );
}

/* ---------- Main background scene ---------- */
function CozyRoomBg() {
  return (
    <svg
      viewBox="0 0 390 844"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* wood floor pattern */}
        <pattern id="woodFloor" x={0} y={0} width={80} height={20} patternUnits="userSpaceOnUse">
          <rect width={80} height={20} fill="#c49a6c" />
          <line x1={0} y1={10} x2={80} y2={10} stroke="#b8895a" strokeWidth={0.5} />
          <line x1={40} y1={0} x2={40} y2={10} stroke="#b8895a" strokeWidth={0.5} />
          <line x1={0} y1={0} x2={0} y2={20} stroke="#b8895a" strokeWidth={0.3} />
        </pattern>
        {/* rug pattern */}
        <pattern id="rugPattern" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
          <rect width={20} height={20} fill="#c4483a" />
          <rect x={4} y={4} width={12} height={12} fill="#d4785a" rx={1} />
          <rect x={7} y={7} width={6} height={6} fill="#e8c86a" rx={1} />
          <line x1={0} y1={10} x2={20} y2={10} stroke="#8b3030" strokeWidth={0.5} opacity={0.3} />
          <line x1={10} y1={0} x2={10} y2={20} stroke="#8b3030" strokeWidth={0.5} opacity={0.3} />
        </pattern>
        {/* curtain fabric */}
        <linearGradient id="curtainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5f0e6" />
          <stop offset="100%" stopColor="#e8dfd0" />
        </linearGradient>
        {/* wall gradient */}
        <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ba3b5" />
          <stop offset="100%" stopColor="#5a8fa0" />
        </linearGradient>
        {/* window light */}
        <radialGradient id="windowLight" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#fff9e6" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#fff9e6" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* ===== WALL ===== */}
      <rect width={390} height={560} fill="url(#wallGrad)" />

      {/* subtle wall texture lines */}
      {[120, 280, 400].map(yy => (
        <line key={yy} x1={0} y1={yy} x2={390} y2={yy} stroke="#5a8898" strokeWidth={0.3} opacity={0.3} />
      ))}

      {/* ===== FLOOR ===== */}
      <rect y={560} width={390} height={284} fill="url(#woodFloor)" />
      {/* baseboard */}
      <rect y={556} width={390} height={8} fill="#a07850" />

      {/* ===== WINDOW ===== */}
      <g transform="translate(250, 80)">
        {/* window frame */}
        <rect x={-55} y={0} width={110} height={200} rx={4} fill="#8b7355" />
        <rect x={-50} y={5} width={100} height={190} rx={2} fill="#d4e8f0" />
        {/* sky */}
        <rect x={-50} y={5} width={100} height={190} rx={2} fill="#b8dce8" />
        {/* light rays */}
        <rect x={-55} y={0} width={110} height={200} rx={4} fill="url(#windowLight)" />
        {/* window cross */}
        <line x1={0} y1={5} x2={0} y2={195} stroke="#8b7355" strokeWidth={4} />
        <line x1={-50} y1={100} x2={50} y2={100} stroke="#8b7355" strokeWidth={4} />
        {/* curtain left */}
        <path d="M-55,0 Q-70,50 -65,100 Q-60,150 -68,200 L-55,200Z" fill="url(#curtainGrad)" opacity={0.9} />
        <path d="M-55,0 Q-62,40 -58,80" fill="none" stroke="#d8d0c0" strokeWidth={0.5} />
        {/* curtain right */}
        <path d="M55,0 Q70,50 65,100 Q60,150 68,200 L55,200Z" fill="url(#curtainGrad)" opacity={0.9} />
        {/* curtain rod */}
        <line x1={-72} y1={-5} x2={72} y2={-5} stroke="#8b7355" strokeWidth={3} />
        <circle cx={-72} cy={-5} r={4} fill="#a07850" />
        <circle cx={72} cy={-5} r={4} fill="#a07850" />
        {/* hanging plants from rod */}
        <HangingIvy x={-30} y={-5} />
        <HangingIvy x={40} y={-5} />
      </g>

      {/* ===== SHELF on wall ===== */}
      <g transform="translate(140, 140)">
        {/* shelf board */}
        <rect x={-50} y={0} width={100} height={6} rx={1} fill="#a07850" />
        <rect x={-50} y={6} width={100} height={2} fill="#8b6838" />
        {/* books on shelf */}
        <rect x={-40} y={-25} width={8} height={25} rx={1} fill="#5a7a8a" />
        <rect x={-30} y={-20} width={7} height={20} rx={1} fill="#c47a5a" />
        <rect x={-22} y={-28} width={6} height={28} rx={1} fill="#8b9a5a" />
        <rect x={-14} y={-18} width={8} height={18} rx={1} fill="#d4a05a" />
        {/* small plants on shelf */}
        <PlantPot x={10} y={0} size={0.6} variant={2} />
        <PlantPot x={30} y={0} size={0.5} variant={0} />
      </g>

      {/* ===== PICTURE FRAMES on left wall ===== */}
      {/* frame 1 – plant illustration */}
      <Frame x={60} y={160} w={55} h={65}>
        <rect x={-22} y={-28} width={44} height={56} fill="#f0ebe0" />
        {/* simple plant illustration inside frame */}
        <line x1={0} y1={20} x2={0} y2={-5} stroke="#5a8a5c" strokeWidth={2} />
        <ellipse cx={-8} cy={-5} rx={7} ry={10} fill="#6ea26e" />
        <ellipse cx={8} cy={-8} rx={6} ry={9} fill="#5a8a5c" />
        <ellipse cx={0} cy={-12} rx={7} ry={8} fill="#7db37d" />
        {/* pot in frame illustration */}
        <path d="M-6,20 L-4,12 L4,12 L6,20Z" fill="#c47a5a" />
      </Frame>
      {/* frame 2 – abstract / small */}
      <Frame x={60} y={260} w={40} h={35}>
        <circle cx={0} cy={0} r={10} fill="#e8c86a" opacity={0.5} />
        <circle cx={-5} cy={3} r={6} fill="#d4785a" opacity={0.4} />
      </Frame>

      {/* ===== ARMCHAIR / SOFA ===== */}
      <g transform="translate(75, 480)">
        {/* back */}
        <path d="M-55,-60 Q-60,-80 -40,-85 Q0,-90 40,-85 Q60,-80 55,-60 L55,0 L-55,0Z" fill="#8b4530" />
        {/* seat cushion */}
        <ellipse cx={0} cy={-10} rx={52} ry={22} fill="#a05535" />
        {/* arm left */}
        <path d="M-55,-60 Q-70,-50 -68,-20 Q-66,10 -55,15 L-55,0Z" fill="#7a3a25" />
        {/* arm right */}
        <path d="M55,-60 Q70,-50 68,-20 Q66,10 55,15 L55,0Z" fill="#7a3a25" />
        {/* cushion detail */}
        <path d="M-30,-15 Q0,-25 30,-15" fill="none" stroke="#6a3020" strokeWidth={1} opacity={0.4} />
        {/* legs */}
        <rect x={-45} y={15} width={6} height={20} rx={2} fill="#6a3a20" />
        <rect x={40} y={15} width={6} height={20} rx={2} fill="#6a3a20" />
        {/* sleeping cat on chair */}
        <SleepingCat x={5} y={-25} />
      </g>

      {/* ===== ROUND TABLE ===== */}
      <g transform="translate(220, 560)">
        {/* table top – ellipse for perspective */}
        <ellipse cx={0} cy={-40} rx={55} ry={18} fill="#b8895a" />
        <ellipse cx={0} cy={-42} rx={52} ry={16} fill="#c49a6c" />
        {/* table leg */}
        <rect x={-4} y={-25} width={8} height={50} rx={2} fill="#a07850" />
        {/* table base */}
        <ellipse cx={0} cy={25} rx={20} ry={5} fill="#a07850" />
        {/* items on table: glasses */}
        <g transform="translate(-15, -50)">
          <circle cx={0} cy={0} r={6} fill="none" stroke="#6a6a7a" strokeWidth={1.5} />
          <circle cx={14} cy={0} r={6} fill="none" stroke="#6a6a7a" strokeWidth={1.5} />
          <line x1={6} y1={0} x2={8} y2={0} stroke="#6a6a7a" strokeWidth={1} />
          <line x1={-6} y1={0} x2={-10} y2={2} stroke="#6a6a7a" strokeWidth={1} />
          <line x1={20} y1={0} x2={24} y2={2} stroke="#6a6a7a" strokeWidth={1} />
        </g>
      </g>

      {/* ===== SMALL STOOL ===== */}
      <g transform="translate(330, 580)">
        <ellipse cx={0} cy={-15} rx={18} ry={7} fill="#c49a6c" />
        <rect x={-14} y={-8} width={4} height={30} rx={1} fill="#a07850" transform="rotate(-5, -12, -8)" />
        <rect x={10} y={-8} width={4} height={30} rx={1} fill="#a07850" transform="rotate(5, 12, -8)" />
      </g>

      {/* ===== BOOKS on floor (COZY READS) ===== */}
      <g transform="translate(310, 520)">
        <rect x={-15} y={0} width={30} height={8} rx={1} fill="#5a7a8a" />
        <rect x={-13} y={-7} width={26} height={8} rx={1} fill="#c47a5a" />
        <rect x={-14} y={-13} width={28} height={7} rx={1} fill="#8b9a5a" />
        <text x={0} y={-16} textAnchor="middle" fontSize={5} fill="#6a6a5a" fontFamily="sans-serif" letterSpacing={1} opacity={0.6}>
          COZY READS
        </text>
      </g>

      {/* ===== FLOOR PLANTS ===== */}
      <PlantPot x={360} y={500} size={0.9} variant={1} />
      <PlantPot x={25} y={555} size={0.8} variant={0} />

      {/* ===== RUG ===== */}
      <g transform="translate(195, 740)">
        {/* rug shape – perspective rectangle */}
        <path
          d="M-160,0 L-140,-45 L140,-45 L160,0 L140,35 L-140,35Z"
          fill="url(#rugPattern)"
        />
        {/* rug border */}
        <path
          d="M-160,0 L-140,-45 L140,-45 L160,0 L140,35 L-140,35Z"
          fill="none"
          stroke="#8b3030"
          strokeWidth={3}
        />
        {/* inner border */}
        <path
          d="M-145,0 L-128,-38 L128,-38 L145,0 L128,28 L-128,28Z"
          fill="none"
          stroke="#e8c86a"
          strokeWidth={2}
        />
        {/* rug decorative triangles on border */}
        {[-100, -60, -20, 20, 60, 100].map(xx => (
          <polygon key={xx} points={`${xx},-38 ${xx - 6},-45 ${xx + 6},-45`} fill="#e8c86a" opacity={0.7} />
        ))}
      </g>

      {/* ===== Ambient light overlay ===== */}
      <rect x={180} y={0} width={210} height={560} fill="url(#windowLight)" opacity={0.3} />
    </svg>
  );
}

/* ──────────────────────────────────────
   Main Quiz Component
   ────────────────────────────────────── */
export default function SoulGuitarQuiz() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#5a8fa0] flex items-center justify-center">
      {/* Background illustration */}
      <CozyRoomBg />

      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Quiz content overlay */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto px-6 py-12 flex flex-col justify-center min-h-screen">
        {/* Q number */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-[2.5rem] font-black text-[#2a2a2a] leading-none mb-2"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            Q1
          </h2>
        </motion.div>

        {/* Question text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-[1.4rem] font-bold text-[#2a2a2a] leading-snug mb-10"
          style={{ fontFamily: '"Inter", "Noto Sans TC", sans-serif' }}
        >
          {question.text}
        </motion.p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {question.options.map((opt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(i)}
                className={`
                  w-full py-3.5 px-6 rounded-full text-[0.95rem] font-medium
                  transition-all duration-200 border-2 text-left
                  ${
                    selected === i
                      ? 'bg-[#2a2a2a] text-white border-[#2a2a2a] shadow-lg'
                      : 'bg-white/85 text-[#2a2a2a] border-[#2a2a2a]/20 hover:bg-white hover:border-[#2a2a2a]/40 backdrop-blur-sm'
                  }
                `}
              >
                {opt}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Next button (appears after selection) */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex justify-center"
            >
              <button className="px-10 py-3 rounded-full bg-[#2a2a2a] text-white font-bold text-sm tracking-wider hover:bg-[#1a1a1a] transition-colors shadow-lg">
                下一題 →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
