import { useState, Suspense, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Center, Bounds, Points, PointMaterial } from '@react-three/drei';
import { ChevronRight, ChevronLeft, Check, ShoppingCart, Eye, Compass, Maximize2, X, Upload, Link2, Camera, Heart, Users, ArrowRight } from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import { cn } from '@/src/lib/utils';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import customConfigService, { type CommunityConfig } from '@/src/services/customConfigService';

// ═════════════════════════════════════════════════════════════════════════════
// Web Audio — Lightweight procedural sounds for haptic feedback
// Uses AudioContext lazy init (created on first user gesture)
// ═════════════════════════════════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Short percussive knock — played on option select */
function playKnock() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/** Soft step sound — played on stage navigation */
function playStepSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(500 + Math.random() * 200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

/** Guitar chord strum — played on completion/summary */
function playChord() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const notes = [82.4, 110, 146.8, 196, 246.9, 329.6]; // E2 A2 D3 G3 B3 E4
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.04;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.5);
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// STAGES — 10 steps matching Ayers official customizer (USD pricing)
// 1.桶身 2.木材 3.琴頭/弦鈕 4.指板 5.音孔環 6.琴橋/弦釘
// 7.鑲嵌 8.包邊/滾線 9.漆面 10.拾音器
// ═════════════════════════════════════════════════════════════════════════════

interface Option {
  id: string; nameKey: string; descKey: string; add: number;
  swatch?: string; hex?: string; grad?: string; img?: string;
  upload?: boolean; // option that requires image upload
}
interface Field { key: string; labelKey: string; options: Option[]; forTypes?: string[]; multi?: boolean }
interface Stage {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  camera: { distance: number; azimuth: number; elevation: number; focus: [number, number, number] };
  ambient: { color: string; glow: string; intensity: number }; // stage atmosphere
  fields: Field[];
}

// Base body shape price in USD (all shapes are US$1,800)
const BASE_PRICE_USD = 1800;

// Ayers official image base URL
const AYERS_IMG = 'https://ayersguitars.com/images/customize';

const STAGES: Stage[] = [
  // ── Step 1: 桶身 Body Shape ──────────────────────────────────────────────
  {
    id: 'body', titleKey: 'customizer.stageBody', subtitleKey: 'customizer.stageBodySub',
    icon: '🎸',
    camera: { distance: 3.5, azimuth: 0.6, elevation: 0.2, focus: [0, 0, 0] },
    ambient: { color: 'rgba(30,45,80,0.06)', glow: 'rgba(60,90,160,0.04)', intensity: 0.5 },
    fields: [
      { key: 'type', labelKey: 'customizer.guitarType', options: [
        { id: 'steel', nameKey: 'customizer.opt.steelString', descKey: 'customizer.desc.steelString', add: 0 },
        { id: '12string', nameKey: 'customizer.opt.12string', descKey: 'customizer.desc.12string', add: 600 },
        { id: 'travel', nameKey: 'customizer.opt.travel', descKey: 'customizer.desc.travel', add: 500 },
      ]},
      { key: 'shape', labelKey: 'customizer.bodyShape', forTypes: ['steel', '12string'], options: [
        { id: 'dreadnought', nameKey: 'customizer.opt.dreadnought', descKey: 'customizer.desc.dreadnought', add: 0, img: `${AYERS_IMG}/body_shapes/d.png` },
        { id: 'auditorium', nameKey: 'customizer.opt.auditorium', descKey: 'customizer.desc.auditorium', add: 0, img: `${AYERS_IMG}/body_shapes/a.png` },
        { id: 'orchestra', nameKey: 'customizer.opt.orchestra', descKey: 'customizer.desc.orchestra', add: 0, img: `${AYERS_IMG}/body_shapes/o.png` },
        { id: 'sj', nameKey: 'customizer.opt.sj', descKey: 'customizer.desc.sj', add: 0, img: `${AYERS_IMG}/body_shapes/sj.png` },
        { id: 'l00', nameKey: 'customizer.opt.l00', descKey: 'customizer.desc.l00', add: 0, img: `${AYERS_IMG}/body_shapes/l-00.png` },
        { id: 'jumbo', nameKey: 'customizer.opt.jumbo', descKey: 'customizer.desc.jumbo', add: 0, img: `${AYERS_IMG}/body_shapes/j.png` },
      ]},
      { key: 'shape', labelKey: 'customizer.bodyShape', forTypes: ['travel'], options: [
        { id: 'travel-d', nameKey: 'customizer.opt.travelD', descKey: 'customizer.desc.travelD', add: 0, img: `${AYERS_IMG}/body_shapes/td.png` },
        { id: 'travel-a', nameKey: 'customizer.opt.travelA', descKey: 'customizer.desc.travelA', add: 0, img: `${AYERS_IMG}/body_shapes/ta.png` },
        { id: 'travel-o', nameKey: 'customizer.opt.travelO', descKey: 'customizer.desc.travelO', add: 0, img: `${AYERS_IMG}/body_shapes/to.png` },
      ]},
      { key: 'bodyFeature', labelKey: 'customizer.bodyFeature', multi: true, options: [
        { id: 'cutaway', nameKey: 'customizer.opt.cutaway', descKey: 'customizer.desc.cutaway', add: 100 },
        { id: 'lefty', nameKey: 'customizer.opt.lefty', descKey: 'customizer.desc.lefty', add: 200 },
        { id: 'bevel', nameKey: 'customizer.opt.bevel', descKey: 'customizer.desc.bevel', add: 100 },
      ]},
    ],
  },
  // ── Step 2: 木材 Wood ────────────────────────────────────────────────────
  {
    id: 'wood', titleKey: 'customizer.stageWood', subtitleKey: 'customizer.stageWoodSub',
    icon: '🪵',
    camera: { distance: 2.8, azimuth: 0.05, elevation: 0.1, focus: [0, 0, 0] },
    ambient: { color: 'rgba(80,50,25,0.07)', glow: 'rgba(140,90,40,0.05)', intensity: 0.6 },
    fields: [
      { key: 'top', labelKey: 'customizer.topWood', options: [
        { id: 'sitka', nameKey: 'customizer.opt.sitka', descKey: 'customizer.desc.sitka', add: 0, img: `${AYERS_IMG}/top_woods/01.png` },
        { id: 'cedar', nameKey: 'customizer.opt.cedar', descKey: 'customizer.desc.cedar', add: 0, img: `${AYERS_IMG}/top_woods/02.png` },
        { id: 'engelmann', nameKey: 'customizer.opt.engelmann', descKey: 'customizer.desc.engelmann', add: 100, img: `${AYERS_IMG}/top_woods/03.png` },
        { id: 'alpine', nameKey: 'customizer.opt.alpine', descKey: 'customizer.desc.alpine', add: 250, img: `${AYERS_IMG}/top_woods/04.png` },
        { id: 'adirondack', nameKey: 'customizer.opt.adirondack', descKey: 'customizer.desc.adirondack', add: 400, img: `${AYERS_IMG}/top_woods/05.png` },
        { id: 'torrefied-adi', nameKey: 'customizer.opt.torrefiedAdi', descKey: 'customizer.desc.torrefiedAdi', add: 500, img: `${AYERS_IMG}/top_woods/06.png` },
        { id: 'koa-4a-t', nameKey: 'customizer.opt.koa4aTop', descKey: 'customizer.desc.koa4aTop', add: 2500, img: `${AYERS_IMG}/top_woods/07.png` },
        { id: 'koa-5a-t', nameKey: 'customizer.opt.koa5aTop', descKey: 'customizer.desc.koa5aTop', add: 3300, img: `${AYERS_IMG}/top_woods/08.png` },
      ]},
      { key: 'back', labelKey: 'customizer.backSides', options: [
        { id: 'africa-mah', nameKey: 'customizer.opt.africaMah', descKey: 'customizer.desc.africaMah', add: 0, img: `${AYERS_IMG}/back_woods/01.png` },
        { id: 'angkor-mah', nameKey: 'customizer.opt.angkorMah', descKey: 'customizer.desc.angkorMah', add: 150, img: `${AYERS_IMG}/back_woods/02.png` },
        { id: 'asian-acacia', nameKey: 'customizer.opt.asianAcacia', descKey: 'customizer.desc.asianAcacia', add: 150, img: `${AYERS_IMG}/back_woods/15.png` },
        { id: 'africa-walnut', nameKey: 'customizer.opt.africaWalnut', descKey: 'customizer.desc.africaWalnut', add: 220, img: `${AYERS_IMG}/back_woods/03.png` },
        { id: 'german-maple', nameKey: 'customizer.opt.germanMaple', descKey: 'customizer.desc.germanMaple', add: 350, img: `${AYERS_IMG}/back_woods/04.png` },
        { id: 'indian-rw', nameKey: 'customizer.opt.indianRw', descKey: 'customizer.desc.indianRw', add: 450, img: `${AYERS_IMG}/back_woods/05.png` },
        { id: 'flame-maple', nameKey: 'customizer.opt.flameMaple', descKey: 'customizer.desc.flameMaple', add: 550, img: `${AYERS_IMG}/back_woods/06.png` },
        { id: 'viet-rw', nameKey: 'customizer.opt.vietRw', descKey: 'customizer.desc.vietRw', add: 700, img: `${AYERS_IMG}/back_woods/07.png` },
        { id: 'na-walnut', nameKey: 'customizer.opt.naWalnut', descKey: 'customizer.desc.naWalnut', add: 800, img: `${AYERS_IMG}/back_woods/08.png` },
        { id: 'cocobolo', nameKey: 'customizer.opt.cocobolo', descKey: 'customizer.desc.cocobolo', add: 1100, img: `${AYERS_IMG}/back_woods/09.png` },
        { id: 'ziricote', nameKey: 'customizer.opt.ziricote', descKey: 'customizer.desc.ziricote', add: 1400, img: `${AYERS_IMG}/back_woods/10.png` },
        { id: 'mada-ebony', nameKey: 'customizer.opt.madaEbony', descKey: 'customizer.desc.madaEbony', add: 1500, img: `${AYERS_IMG}/back_woods/11.png` },
        { id: 'koa-4a', nameKey: 'customizer.opt.koa4a', descKey: 'customizer.desc.koa4a', add: 1900, img: `${AYERS_IMG}/back_woods/12.png` },
        { id: 'koa-5a', nameKey: 'customizer.opt.koa5a', descKey: 'customizer.desc.koa5a', add: 2700, img: `${AYERS_IMG}/back_woods/13.png` },
        { id: 'braz-rw', nameKey: 'customizer.opt.brazRw', descKey: 'customizer.desc.brazRw', add: 6500, img: `${AYERS_IMG}/back_woods/14.png` },
      ]},
    ],
  },
  // ── Step 3: 琴頭 / 弦鈕 Head & Tuners ───────────────────────────────────
  {
    id: 'head', titleKey: 'customizer.stageHead', subtitleKey: 'customizer.stageHeadSub',
    icon: '🎯',
    camera: { distance: 2.2, azimuth: -0.2, elevation: 0.3, focus: [0, 0.5, 0] },
    ambient: { color: 'rgba(50,55,65,0.06)', glow: 'rgba(160,170,190,0.04)', intensity: 0.45 },
    fields: [
      { key: 'headShape', labelKey: 'customizer.headShape', options: [
        { id: 'vintage-h', nameKey: 'customizer.opt.vintageHead', descKey: 'customizer.desc.vintageHead', add: 0, img: `${AYERS_IMG}/heads/01.png` },
        { id: 'premium-h', nameKey: 'customizer.opt.premiumHead', descKey: 'customizer.desc.premiumHead', add: 0, img: `${AYERS_IMG}/heads/02.png` },
        { id: '20th-h', nameKey: 'customizer.opt.20thHead', descKey: 'customizer.desc.20thHead', add: 0, img: `${AYERS_IMG}/heads/03.png` },
      ]},
      { key: 'headPatch', labelKey: 'customizer.headPatch', options: [
        { id: 'none-hp', nameKey: 'customizer.opt.noHeadPatch', descKey: 'customizer.desc.noHeadPatch', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'mahogany-hp', nameKey: 'customizer.opt.mahHp', descKey: 'customizer.desc.mahHp', add: 0, img: `${AYERS_IMG}/head_patch/01.png` },
        { id: 'walnut-hp', nameKey: 'customizer.opt.walnutHp', descKey: 'customizer.desc.walnutHp', add: 25, img: `${AYERS_IMG}/head_patch/02.png` },
        { id: 'rosewood-hp', nameKey: 'customizer.opt.rosewoodHp', descKey: 'customizer.desc.rosewoodHp', add: 25, img: `${AYERS_IMG}/head_patch/03.png` },
        { id: 'ebony-hp', nameKey: 'customizer.opt.ebonyHp', descKey: 'customizer.desc.ebonyHp', add: 60, img: `${AYERS_IMG}/head_patch/04.png` },
        { id: 'viet-rw-hp', nameKey: 'customizer.opt.vietRwHp', descKey: 'customizer.desc.vietRwHp', add: 60, img: `${AYERS_IMG}/head_patch/05.png` },
        { id: 'flame-maple-hp', nameKey: 'customizer.opt.flameMapleHp', descKey: 'customizer.desc.flameMapleHp', add: 70, img: `${AYERS_IMG}/head_patch/06.png` },
        { id: 'cocobolo-hp', nameKey: 'customizer.opt.cocoboloHp', descKey: 'customizer.desc.cocoboloHp', add: 95, img: `${AYERS_IMG}/head_patch/07.png` },
        { id: 'flame-koa-hp', nameKey: 'customizer.opt.flameKoaHp', descKey: 'customizer.desc.flameKoaHp', add: 95, img: `${AYERS_IMG}/head_patch/08.png` },
      ]},
      { key: 'tuner', labelKey: 'customizer.tuners', options: [
        { id: 'gotoh301-s', nameKey: 'customizer.opt.gotoh301s', descKey: 'customizer.desc.gotoh301s', add: 0, img: `${AYERS_IMG}/tuners/01.png` },
        { id: 'gotoh301-g', nameKey: 'customizer.opt.gotoh301g', descKey: 'customizer.desc.gotoh301g', add: 40, img: `${AYERS_IMG}/tuners/02.png` },
        { id: 'gotoh510-g', nameKey: 'customizer.opt.gotoh510g', descKey: 'customizer.desc.gotoh510g', add: 80, img: `${AYERS_IMG}/tuners/03.png` },
      ]},
    ],
  },
  // ── Step 4: 指板 Fingerboard ─────────────────────────────────────────────
  {
    id: 'fingerboard', titleKey: 'customizer.stageFingerboard', subtitleKey: 'customizer.stageFingerboardSub',
    icon: '🎹',
    camera: { distance: 2.5, azimuth: 0.1, elevation: 0.35, focus: [0, 0.2, 0] },
    ambient: { color: 'rgba(40,25,55,0.06)', glow: 'rgba(100,60,140,0.04)', intensity: 0.5 },
    fields: [
      { key: 'fbStyle', labelKey: 'customizer.fbStyle', options: [
        { id: 'vintage-fb', nameKey: 'customizer.opt.vintageFb', descKey: 'customizer.desc.vintageFb', add: 0, img: `${AYERS_IMG}/fingerboards/01.png` },
        { id: 'premium-fb', nameKey: 'customizer.opt.premiumFb', descKey: 'customizer.desc.premiumFb', add: 0, img: `${AYERS_IMG}/fingerboards/02.png` },
        { id: '20th-fb', nameKey: 'customizer.opt.20thFb', descKey: 'customizer.desc.20thFb', add: 0, img: `${AYERS_IMG}/fingerboards/03.png` },
      ]},
    ],
  },
  // ── Step 5: 音孔環 Rosette ───────────────────────────────────────────────
  {
    id: 'rosette', titleKey: 'customizer.stageRosette', subtitleKey: 'customizer.stageRosetteSub',
    icon: '⭕',
    camera: { distance: 2.0, azimuth: 0.05, elevation: 0.15, focus: [0, -0.3, 0] },
    ambient: { color: 'rgba(20,60,50,0.07)', glow: 'rgba(40,140,110,0.05)', intensity: 0.55 },
    fields: [
      { key: 'rosette', labelKey: 'customizer.rosette', options: [
        { id: 'green-aba', nameKey: 'customizer.opt.greenAbalone', descKey: 'customizer.desc.greenAbalone', add: 0, img: `${AYERS_IMG}/rossettes/01.png` },
        { id: 'rw-aba', nameKey: 'customizer.opt.rwAbalone', descKey: 'customizer.desc.rwAbalone', add: 0, img: `${AYERS_IMG}/rossettes/02.png` },
        { id: 'purf-aba', nameKey: 'customizer.opt.purfAbalone', descKey: 'customizer.desc.purfAbalone', add: 0, img: `${AYERS_IMG}/rossettes/03.png` },
        { id: 'purf-mah', nameKey: 'customizer.opt.purfMah', descKey: 'customizer.desc.purfMah', add: 0, img: `${AYERS_IMG}/rossettes/04.png` },
        { id: 'rw-maple', nameKey: 'customizer.opt.rwMaple', descKey: 'customizer.desc.rwMaple', add: 0, img: `${AYERS_IMG}/rossettes/05.png` },
        { id: 'aba-mango', nameKey: 'customizer.opt.abaMango', descKey: 'customizer.desc.abaMango', add: 60, img: `${AYERS_IMG}/rossettes/06.png` },
      ]},
    ],
  },
  // ── Step 6: 琴橋 / 弦釘 Bridge & Pins ───────────────────────────────────
  {
    id: 'bridge', titleKey: 'customizer.stageBridge', subtitleKey: 'customizer.stageBridgeSub',
    icon: '🔩',
    camera: { distance: 2.0, azimuth: 0.1, elevation: 0.2, focus: [0, -0.5, 0] },
    ambient: { color: 'rgba(55,40,25,0.06)', glow: 'rgba(120,85,50,0.04)', intensity: 0.5 },
    fields: [
      { key: 'bridgeStyle', labelKey: 'customizer.bridgeStyle', options: [
        { id: 'vintage-br', nameKey: 'customizer.opt.vintageBridge', descKey: 'customizer.desc.vintageBridge', add: 0, img: `${AYERS_IMG}/bridges/01.png` },
        { id: 'premium-br', nameKey: 'customizer.opt.premiumBridge', descKey: 'customizer.desc.premiumBridge', add: 0, img: `${AYERS_IMG}/bridges/02.png` },
        { id: '20th-br', nameKey: 'customizer.opt.20thBridge', descKey: 'customizer.desc.20thBridge', add: 0, img: `${AYERS_IMG}/bridges/03.png` },
      ]},
      { key: 'bridgePins', labelKey: 'customizer.bridgePins', options: [
        { id: 'bone-pin', nameKey: 'customizer.opt.bonePin', descKey: 'customizer.desc.bonePin', add: 100, img: `${AYERS_IMG}/pins/01.png` },
        { id: 'ebony-pin', nameKey: 'customizer.opt.ebonyPin', descKey: 'customizer.desc.ebonyPin', add: 100, img: `${AYERS_IMG}/pins/02.png` },
        { id: 'maple-pin', nameKey: 'customizer.opt.maplePin', descKey: 'customizer.desc.maplePin', add: 110, img: `${AYERS_IMG}/pins/03.png` },
        { id: 'cocobolo-pin', nameKey: 'customizer.opt.cocoboloPin', descKey: 'customizer.desc.cocoboloPin', add: 110, img: `${AYERS_IMG}/pins/04.png` },
      ]},
    ],
  },
  // ── Step 7: 鑲嵌 Inlays ─────────────────────────────────────────────────
  {
    id: 'inlay', titleKey: 'customizer.stageInlay', subtitleKey: 'customizer.stageInlaySub',
    icon: '✨',
    camera: { distance: 2.2, azimuth: 0.15, elevation: 0.45, focus: [0, -0.2, 0] },
    ambient: { color: 'rgba(60,50,70,0.06)', glow: 'rgba(180,150,220,0.05)', intensity: 0.55 },
    fields: [
      { key: 'inlayMaterial', labelKey: 'customizer.inlayMaterial', options: [
        { id: 'none-im', nameKey: 'customizer.opt.noInlayMat', descKey: 'customizer.desc.noInlayMat', add: 0 },
        { id: 'wood-im', nameKey: 'customizer.opt.woodInlay', descKey: 'customizer.desc.woodInlay', add: 0, swatch: '#7a4522' },
        { id: 'shell-im', nameKey: 'customizer.opt.shellInlay', descKey: 'customizer.desc.shellInlay', add: 0, grad: 'from-emerald-400/40 via-sky-400/30 to-purple-400/40' },
      ]},
      { key: 'inlayTop', labelKey: 'customizer.inlayTop', options: [
        { id: 'none-it', nameKey: 'customizer.opt.noInlayTop', descKey: 'customizer.desc.noInlayTop', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'sun', nameKey: 'customizer.opt.sunInlay', descKey: 'customizer.desc.sunInlay', add: 150, img: `${AYERS_IMG}/inlay_top_wood/sun.png` },
        { id: 'moon', nameKey: 'customizer.opt.moonInlay', descKey: 'customizer.desc.moonInlay', add: 150, img: `${AYERS_IMG}/inlay_top_wood/moon.png` },
        { id: 'custom-it', nameKey: 'customizer.opt.customInlayTop', descKey: 'customizer.desc.customInlayTop', add: 250, upload: true, img: `${AYERS_IMG}/personalization.png` },
      ]},
      { key: 'inlayFb', labelKey: 'customizer.inlayFb', options: [
        { id: 'none-ifb', nameKey: 'customizer.opt.noInlayFb', descKey: 'customizer.desc.noInlayFb', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'vine', nameKey: 'customizer.opt.vineInlay', descKey: 'customizer.desc.vineInlay', add: 350, img: `${AYERS_IMG}/inlay_fingerboards/01.png` },
        { id: 'sakura', nameKey: 'customizer.opt.sakuraInlay', descKey: 'customizer.desc.sakuraInlay', add: 350, img: `${AYERS_IMG}/inlay_fingerboards/02.png` },
        { id: 'custom-ifb', nameKey: 'customizer.opt.customInlayFb', descKey: 'customizer.desc.customInlayFb', add: 90, upload: true, img: `${AYERS_IMG}/personalization.png` },
      ]},
      { key: 'inlayHead', labelKey: 'customizer.inlayHead', options: [
        { id: 'none-ih', nameKey: 'customizer.opt.noInlayHead', descKey: 'customizer.desc.noInlayHead', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'cat', nameKey: 'customizer.opt.catInlay', descKey: 'customizer.desc.catInlay', add: 350, img: `${AYERS_IMG}/inlay_head/cat.png` },
        { id: 'custom-ih', nameKey: 'customizer.opt.customInlayHead', descKey: 'customizer.desc.customInlayHead', add: 120, upload: true, img: `${AYERS_IMG}/personalization.png` },
      ]},
      { key: 'inlayMarks', labelKey: 'customizer.inlayMarks', options: [
        { id: 'none-mk', nameKey: 'customizer.opt.noMarks', descKey: 'customizer.desc.noMarks', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'dots-mk', nameKey: 'customizer.opt.dotMarks', descKey: 'customizer.desc.dotMarks', add: 0, img: `${AYERS_IMG}/inlay_mark/01.png` },
        { id: 'star-mk', nameKey: 'customizer.opt.starMarks', descKey: 'customizer.desc.starMarks', add: 100, img: `${AYERS_IMG}/inlay_mark/02.png` },
        { id: 'diamond-mk', nameKey: 'customizer.opt.diamondMarks', descKey: 'customizer.desc.diamondMarks', add: 100, img: `${AYERS_IMG}/inlay_mark/03.png` },
        { id: 'sig-mk', nameKey: 'customizer.opt.signatureMarks', descKey: 'customizer.desc.signatureMarks', add: 100, img: `${AYERS_IMG}/inlay_mark/04.png` },
        { id: 'custom-mk', nameKey: 'customizer.opt.customMarks', descKey: 'customizer.desc.customMarks', add: 90, upload: true, img: `${AYERS_IMG}/personalization.png` },
      ]},
    ],
  },
  // ── Step 8: 包邊 / 滾線 Binding & Purfling ──────────────────────────────
  {
    id: 'binding', titleKey: 'customizer.stageBinding', subtitleKey: 'customizer.stageBindingSub',
    icon: '🔲',
    camera: { distance: 2.6, azimuth: 0.3, elevation: 0.25, focus: [0, -0.1, 0] },
    ambient: { color: 'rgba(45,35,20,0.06)', glow: 'rgba(110,90,55,0.04)', intensity: 0.5 },
    fields: [
      { key: 'binding', labelKey: 'customizer.binding', options: [
        { id: 'none-bd', nameKey: 'customizer.opt.noBinding', descKey: 'customizer.desc.noBinding', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'mah-bd', nameKey: 'customizer.opt.mahBinding', descKey: 'customizer.desc.mahBinding', add: 0, img: `${AYERS_IMG}/bindings/01.png` },
        { id: 'palisander-bd', nameKey: 'customizer.opt.palisanderBd', descKey: 'customizer.desc.palisanderBd', add: 35, img: `${AYERS_IMG}/bindings/02.png` },
        { id: 'rw-bd', nameKey: 'customizer.opt.rwBinding', descKey: 'customizer.desc.rwBinding', add: 25, img: `${AYERS_IMG}/bindings/03.png` },
        { id: 'viet-rw-bd', nameKey: 'customizer.opt.vietRwBd', descKey: 'customizer.desc.vietRwBd', add: 45, img: `${AYERS_IMG}/bindings/04.png` },
        { id: 'ebony-bd', nameKey: 'customizer.opt.ebonyBd', descKey: 'customizer.desc.ebonyBd', add: 55, img: `${AYERS_IMG}/bindings/05.png` },
        { id: 'flame-maple-bd', nameKey: 'customizer.opt.flameMapleBd', descKey: 'customizer.desc.flameMapleBd', add: 70, img: `${AYERS_IMG}/bindings/06.png` },
        { id: 'flame-koa-bd', nameKey: 'customizer.opt.flameKoaBd', descKey: 'customizer.desc.flameKoaBd', add: 90, img: `${AYERS_IMG}/bindings/07.png` },
      ]},
      { key: 'purfling', labelKey: 'customizer.purfling', options: [
        { id: 'none-pf', nameKey: 'customizer.opt.noPurfling', descKey: 'customizer.desc.noPurfling', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'palisander-pf', nameKey: 'customizer.opt.palisanderPf', descKey: 'customizer.desc.palisanderPf', add: 60, img: `${AYERS_IMG}/punflings/01.png` },
        { id: 'maple-pf', nameKey: 'customizer.opt.maplePf', descKey: 'customizer.desc.maplePf', add: 65, img: `${AYERS_IMG}/punflings/02.png` },
        { id: 'rw-pf', nameKey: 'customizer.opt.rwPf', descKey: 'customizer.desc.rwPf', add: 65, img: `${AYERS_IMG}/punflings/03.png` },
        { id: 'viet-rw-pf', nameKey: 'customizer.opt.vietRwPf', descKey: 'customizer.desc.vietRwPf', add: 80, img: `${AYERS_IMG}/punflings/04.png` },
        { id: 'acacia-pf', nameKey: 'customizer.opt.acaciaPf', descKey: 'customizer.desc.acaciaPf', add: 80, img: `${AYERS_IMG}/punflings/05.png` },
        { id: 'green-aba-pf', nameKey: 'customizer.opt.greenAbaPf', descKey: 'customizer.desc.greenAbaPf', add: 95, img: `${AYERS_IMG}/punflings/06.png` },
        { id: 'white-aba-pf', nameKey: 'customizer.opt.whiteAbaPf', descKey: 'customizer.desc.whiteAbaPf', add: 95, img: `${AYERS_IMG}/punflings/07.png` },
        { id: 'flame-koa-pf', nameKey: 'customizer.opt.flameKoaPf', descKey: 'customizer.desc.flameKoaPf', add: 140, img: `${AYERS_IMG}/punflings/08.png` },
      ]},
    ],
  },
  // ── Step 9: 漆面 Finish ──────────────────────────────────────────────────
  {
    id: 'finish', titleKey: 'customizer.stageFinish', subtitleKey: 'customizer.stageFinishSub',
    icon: '🎨',
    camera: { distance: 3.8, azimuth: 0.4, elevation: 0.15, focus: [0, 0, 0] },
    ambient: { color: 'rgba(80,65,30,0.08)', glow: 'rgba(197,160,89,0.06)', intensity: 0.7 },
    fields: [
      { key: 'finish', labelKey: 'customizer.finishType', options: [
        { id: 'gloss', nameKey: 'customizer.opt.gloss', descKey: 'customizer.desc.gloss', add: 0, img: `${AYERS_IMG}/paints/01.png` },
        { id: 'satin', nameKey: 'customizer.opt.satin', descKey: 'customizer.desc.satin', add: 0, img: `${AYERS_IMG}/paints/02.png` },
        { id: 'open', nameKey: 'customizer.opt.openPore', descKey: 'customizer.desc.openPore', add: 0, img: `${AYERS_IMG}/paints/03.png` },
      ]},
    ],
  },
  // ── Step 10: 拾音器 Electronics ──────────────────────────────────────────
  {
    id: 'electronics', titleKey: 'customizer.stageElectronics', subtitleKey: 'customizer.stageElectronicsSub',
    icon: '🔌',
    camera: { distance: 3.2, azimuth: -0.3, elevation: 0.2, focus: [0, -0.3, 0] },
    ambient: { color: 'rgba(70,45,15,0.07)', glow: 'rgba(180,120,40,0.05)', intensity: 0.6 },
    fields: [
      { key: 'pickup', labelKey: 'customizer.pickup', options: [
        { id: 'none-pu', nameKey: 'customizer.opt.noPickup', descKey: 'customizer.desc.noPickup', add: 0, img: `${AYERS_IMG}/none.png` },
        { id: 'supernatural', nameKey: 'customizer.opt.supernatural', descKey: 'customizer.desc.supernatural', add: 250, img: `${AYERS_IMG}/electronics/02.png` },
        { id: 'rare-earth', nameKey: 'customizer.opt.rareEarth', descKey: 'customizer.desc.rareEarth', add: 310, img: `${AYERS_IMG}/electronics/03.png` },
        { id: 'ellipse', nameKey: 'customizer.opt.ellipse', descKey: 'customizer.desc.ellipse', add: 330, img: `${AYERS_IMG}/electronics/01.png` },
      ]},
    ],
  },
];

/** Filter stage fields based on selected guitar type */
function getVisibleFields(stage: Stage, guitarType: string): Field[] {
  return stage.fields.filter(f => !f.forTypes || f.forTypes.includes(guitarType));
}

// ═════════════════════════════════════════════════════════════════════════════
// 3D — Car-game style camera rig
// ═════════════════════════════════════════════════════════════════════════════

/** Spherical coords → cartesian, looking at a focus point */
function sphericalToVec3(radius: number, phi: number, theta: number, target: THREE.Vector3) {
  return new THREE.Vector3(
    target.x + radius * Math.sin(phi) * Math.sin(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.cos(theta),
  );
}

/**
 * CameraRig — cinematic camera inspired by car customization games.
 * - Smooth spring transitions between stage angles
 * - Mouse parallax (subtle camera follow on cursor)
 * - Idle breathing drift when not interacting
 * - Zoom punch on selection change
 * - Drag-to-orbit with soft return
 * - Summary mode: slow showcase orbit
 */
function CameraRig({
  stageCamera,
  showSummary,
  selectionPulse,
  freeOrbit,
}: {
  stageCamera: { distance: number; azimuth: number; elevation: number; focus: [number, number, number] };
  showSummary: boolean;
  selectionPulse: number;
  freeOrbit: boolean;
}) {
  const { camera, gl } = useThree();
  const lookAt = useRef(new THREE.Vector3(...stageCamera.focus));
  const lookAtTarget = useRef(new THREE.Vector3(...stageCamera.focus));

  // Current & target spherical (radius, phi=polar from Y, theta=azimuth)
  const cur = useRef({ r: stageCamera.distance, phi: Math.PI / 2 - stageCamera.elevation, theta: stageCamera.azimuth });
  const tgt = useRef({ ...cur.current });

  // Interaction state
  const mouse = useRef({ x: 0, y: 0 });
  const drag = useRef({ active: false, startX: 0, startY: 0, offsetTheta: 0, offsetPhi: 0 });
  const dragOffset = useRef({ theta: 0, phi: 0 });
  const idleTimer = useRef(0);
  const time = useRef(0);
  const punch = useRef(0);
  const lastPulse = useRef(selectionPulse);

  // Mouse parallax
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (drag.current.active) {
        const dx = (e.clientX - drag.current.startX) * 0.005;
        const dy = (e.clientY - drag.current.startY) * 0.003;
        dragOffset.current.theta = drag.current.offsetTheta + dx;
        dragOffset.current.phi = THREE.MathUtils.clamp(drag.current.offsetPhi - dy, -0.4, 0.4);
        idleTimer.current = 0;
      }
    };
    const onDown = (e: MouseEvent) => {
      drag.current.active = true;
      drag.current.startX = e.clientX;
      drag.current.startY = e.clientY;
      drag.current.offsetTheta = dragOffset.current.theta;
      drag.current.offsetPhi = dragOffset.current.phi;
    };
    const onUp = () => { drag.current.active = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      tgt.current.r = THREE.MathUtils.clamp(tgt.current.r + e.deltaY * 0.005, 2, 12);
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    // Touch support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        drag.current.active = true;
        drag.current.startX = e.touches[0].clientX;
        drag.current.startY = e.touches[0].clientY;
        drag.current.offsetTheta = dragOffset.current.theta;
        drag.current.offsetPhi = dragOffset.current.phi;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current.active && e.touches.length === 1) {
        const dx = (e.touches[0].clientX - drag.current.startX) * 0.005;
        const dy = (e.touches[0].clientY - drag.current.startY) * 0.003;
        dragOffset.current.theta = drag.current.offsetTheta + dx;
        dragOffset.current.phi = THREE.MathUtils.clamp(drag.current.offsetPhi - dy, -0.4, 0.4);
        idleTimer.current = 0;
      }
    };
    const onTouchEnd = () => { drag.current.active = false; };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [gl]);

  // Update target on stage change
  useEffect(() => {
    if (freeOrbit) return; // Skip auto-camera in free orbit mode
    if (showSummary) {
      tgt.current = { r: 4.0, phi: Math.PI / 2 - 0.2, theta: cur.current.theta };
      lookAtTarget.current.set(0, 0, 0);
    } else {
      tgt.current = {
        r: stageCamera.distance,
        phi: Math.PI / 2 - stageCamera.elevation,
        theta: stageCamera.azimuth,
      };
      lookAtTarget.current.set(...stageCamera.focus);
      // Reset drag offset on stage change for a clean sweep
      dragOffset.current = { theta: 0, phi: 0 };
    }
  }, [stageCamera, showSummary, freeOrbit]);

  useFrame((_, dt) => {
    time.current += dt;
    idleTimer.current += dt;

    // Selection zoom punch
    if (selectionPulse !== lastPulse.current) {
      punch.current = 0.5;
      lastPulse.current = selectionPulse;
    }
    punch.current *= 1 - Math.min(dt * 6, 1); // fast decay

    // Spring lerp factor — faster for radius (snappy), slower for angles (cinematic)
    const aLerp = 1 - Math.pow(0.04, dt); // ~3.2x/sec — smooth angular transition
    const rLerp = 1 - Math.pow(0.02, dt); // ~3.9x/sec — snappier zoom

    // Soft return of drag offset when idle > 4s (skip in free orbit)
    if (!drag.current.active && idleTimer.current > 4 && !freeOrbit) {
      const returnSpeed = 1 - Math.pow(0.3, dt);
      dragOffset.current.theta *= 1 - returnSpeed;
      dragOffset.current.phi *= 1 - returnSpeed;
    }

    // Summary auto-orbit (skip in free orbit)
    if (showSummary && !freeOrbit) {
      tgt.current.theta += dt * 0.25;
    }

    // Converge
    cur.current.r += (tgt.current.r - punch.current - cur.current.r) * rLerp;
    cur.current.phi += (tgt.current.phi - cur.current.phi) * aLerp;
    cur.current.theta += (tgt.current.theta - cur.current.theta) * aLerp;

    // Idle breathing drift
    const breath = {
      theta: Math.sin(time.current * 0.25) * 0.015 + Math.sin(time.current * 0.11) * 0.008,
      phi: Math.sin(time.current * 0.18 + 1.5) * 0.008,
      r: Math.sin(time.current * 0.12) * 0.04,
    };

    // Mouse parallax (subtle — like car games)
    const parallax = {
      theta: mouse.current.x * 0.06,
      phi: mouse.current.y * 0.03,
    };

    // Smoothly move lookAt focus point towards target
    lookAt.current.lerp(lookAtTarget.current, aLerp);

    // Final spherical
    const finalR = cur.current.r + breath.r;
    const finalPhi = THREE.MathUtils.clamp(
      cur.current.phi + breath.phi + parallax.phi + dragOffset.current.phi,
      0.3, Math.PI - 0.3,
    );
    const finalTheta = cur.current.theta + breath.theta + parallax.theta + dragOffset.current.theta;

    // Position
    const pos = sphericalToVec3(finalR, finalPhi, finalTheta, lookAt.current);
    camera.position.copy(pos);
    camera.lookAt(lookAt.current);
  });

  return null;
}

// ═════════════════════════════════════════════════════════════════════════════
// Model mapping with LOD (Level of Detail) support
//
// GLB file naming convention:
//   /models/guitar-{shape}.glb       — standard
//   /models/guitar-{shape}c.glb      — cutaway variant
//   /models/guitar-{shape}-low.glb   — low-poly LOD (mobile)
//
// Currently available: guitar-a.glb, guitar-ac.glb
// Add new .glb files to /public/models/ as they become ready.
// ═════════════════════════════════════════════════════════════════════════════

/** Maps body shape IDs to their model file basename */
const SHAPE_MODEL_MAP: Record<string, string> = {
  dreadnought: 'guitar-a',    // Fallback until guitar-d.glb is ready
  auditorium:  'guitar-a',
  orchestra:   'guitar-a',    // Fallback until guitar-o.glb
  sj:          'guitar-a',    // Fallback until guitar-sj.glb
  'l-00':      'guitar-a',    // Fallback until guitar-l00.glb
  jumbo:       'guitar-a',    // Fallback until guitar-j.glb
};

/** Available models on disk — prevents 404 fetch attempts */
const AVAILABLE_MODELS = new Set([
  '/models/guitar-a.glb',
  '/models/guitar-ac.glb',
]);

function getModelUrl(shape: string, bodyFeature: string): string {
  const features = bodyFeature ? bodyFeature.split(',') : [];
  const hasCutaway = features.includes('cutaway');
  const basename = SHAPE_MODEL_MAP[shape] || 'guitar-a';
  const idealUrl = hasCutaway ? `/models/${basename}c.glb` : `/models/${basename}.glb`;
  // Use shape-specific model if available, otherwise fall back
  return AVAILABLE_MODELS.has(idealUrl) ? idealUrl : (hasCutaway ? '/models/guitar-ac.glb' : '/models/guitar-a.glb');
}

/** LOD: detect if device should use simplified model */
function useShouldUseLowLOD(): boolean {
  const [isLow, setIsLow] = useState(false);
  useEffect(() => {
    // Use low LOD on mobile or devices with < 4GB RAM
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const lowMemory = 'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
    const lowCores = navigator.hardwareConcurrency < 4;
    setIsLow(isMobile || lowMemory || lowCores);
  }, []);
  return isLow;
}

// Preload both available models
useGLTF.preload('/models/guitar-a.glb');
useGLTF.preload('/models/guitar-ac.glb');

// ═════════════════════════════════════════════════════════════════════════════
// Part-based material mapping
// Each mesh in the .glb is named (Top, Back, Sides, Neck, Fingerboard, etc.)
// We map each part to a material config based on the user's selections
// ═════════════════════════════════════════════════════════════════════════════

interface PartMaterialConfig {
  color: string;
  roughness: number;
  metalness: number;
  /** Diffuse texture path (e.g., "/textures/sitka-diffuse.jpg") */
  map?: string;
  /** Normal map path */
  normalMap?: string;
  /** Roughness map path */
  roughnessMap?: string;
}

interface PartMaterials {
  [meshName: string]: PartMaterialConfig;
}

// Wood texture paths — add files to /public/textures/ as they become available
// If a texture file doesn't exist, the material falls back to flat color
const WOOD_TEXTURES: Record<string, { map?: string; normalMap?: string; roughnessMap?: string }> = {
  // Example: when texture files are added, uncomment:
  // 'sitka':    { map: '/textures/sitka-diffuse.jpg', normalMap: '/textures/wood-normal.jpg' },
  // 'rosewood': { map: '/textures/rosewood-diffuse.jpg', normalMap: '/textures/wood-normal.jpg' },
};

// Wood color references (used as base color, blended with textures when available)
const WOOD_COLORS: Record<string, string> = {
  // Top woods (面板)
  'sitka':       '#e8d5b0',  // Sitka Spruce — 淺黃白
  'adirondack':  '#f0debb',  // Adirondack — 更白更亮
  'cedar':       '#c8956c',  // Western Red Cedar — 紅棕
  'engelmann':   '#eedfc4',  // Engelmann — 奶白
  'mahogany-t':  '#8b5e3c',  // Mahogany top — 紅褐
  // Back/sides woods (背側板)
  'rosewood':    '#3d2216',  // Indian Rosewood — 深紫褐
  'mahogany':    '#6b3a2a',  // Mahogany — 紅褐
  'maple':       '#e2c992',  // Flame Maple — 淺金
  'koa':         '#8b6335',  // Hawaiian Koa — 金褐
  'cocobolo':    '#5c2a1a',  // Cocobolo — 深紅褐
  'brazilian':   '#2e1610',  // Brazilian Rosewood — 極深褐
  // Neck
  'mahogany-n':  '#7a4430',
  'maple-n':     '#d9c089',
  'cedar-n':     '#a07050',
  // Fingerboard
  'rosewood-f':  '#2a1208',  // Rosewood — 深褐近黑
  'ebony':       '#1a1008',  // Ebony — 近黑
  'maple-f':     '#d4b87a',  // Maple — 淺色
};

// Hardware color references
const HARDWARE_COLORS: Record<string, { color: string; metalness: number; roughness: number }> = {
  'chrome':  { color: '#c0c0c0', metalness: 0.9, roughness: 0.15 },
  'gold':    { color: '#d4a849', metalness: 0.85, roughness: 0.2 },
  'black':   { color: '#1a1a1a', metalness: 0.8, roughness: 0.25 },
  'gotoh':   { color: '#b8b8b8', metalness: 0.92, roughness: 0.1 },
};

function buildPartMaterials(selections: Record<string, string>): PartMaterials {
  const topKey = selections.top || 'sitka';
  const backKey = selections.back || 'rosewood';
  const neckKey = selections.neck || 'mahogany-n';
  const fbKey = selections.fingerboard || 'rosewood-f';

  const top = WOOD_COLORS[topKey] || '#e8d5b0';
  const back = WOOD_COLORS[backKey] || '#3d2216';
  const neck = WOOD_COLORS[neckKey] || '#7a4430';
  const fb = WOOD_COLORS[fbKey] || '#2a1208';
  const hw = HARDWARE_COLORS[selections.tuner] || HARDWARE_COLORS.chrome;

  const topTex = WOOD_TEXTURES[topKey] || {};
  const backTex = WOOD_TEXTURES[backKey] || {};
  const neckTex = WOOD_TEXTURES[neckKey] || {};
  const fbTex = WOOD_TEXTURES[fbKey] || {};

  return {
    Top:         { color: top, roughness: 0.35, metalness: 0, ...topTex },
    Back:        { color: back, roughness: 0.4, metalness: 0, ...backTex },
    Sides:       { color: back, roughness: 0.4, metalness: 0, ...backTex },
    Neck:        { color: neck, roughness: 0.45, metalness: 0, ...neckTex },
    Fingerboard: { color: fb, roughness: 0.3, metalness: 0, ...fbTex },
    Headstock:   { color: neck, roughness: 0.4, metalness: 0, ...neckTex },
    Bridge:      { color: fb, roughness: 0.35, metalness: 0, ...fbTex },
    BridgePins:  { color: fb, roughness: 0.3, metalness: 0 },
    Nut:         { color: '#f5f0e0', roughness: 0.4, metalness: 0 },
    Saddle:      { color: '#f5f0e0', roughness: 0.4, metalness: 0 },
    Tuners:      { color: hw.color, roughness: hw.roughness, metalness: hw.metalness },
    Strings:     { color: '#c0b090', roughness: 0.3, metalness: 0.6 },
    Rosette:     { color: '#2a6a5a', roughness: 0.25, metalness: 0.3 },
    Binding:     { color: '#f5f0e0', roughness: 0.3, metalness: 0 },
    Inlays:      { color: '#e8e0d0', roughness: 0.2, metalness: 0.2 },
    Pickguard:   { color: '#1a1208', roughness: 0.5, metalness: 0 },
  };
}

function Guitar({ selections, glow, modelUrl, lowLOD }: { selections: Record<string, string>; glow: boolean; modelUrl: string; lowLOD: boolean }) {
  const { scene } = useGLTF(modelUrl);
  const matsRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map());

  // Helper: load texture with caching (returns null if path undefined)
  const loadTexture = useCallback((path?: string): THREE.Texture | null => {
    if (!path) return null;
    if (textureCache.current.has(path)) return textureCache.current.get(path)!;
    const tex = textureLoader.load(path);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.flipY = false;
    textureCache.current.set(path, tex);
    return tex;
  }, [textureLoader]);

  // Animate glow
  useFrame((_, dt) => {
    const t = glow ? 0.12 : 0;
    matsRef.current.forEach(m => {
      m.emissiveIntensity += (t - m.emissiveIntensity) * dt * 4;
    });
  });

  // Apply per-part materials
  useEffect(() => {
    const parts = buildPartMaterials(selections);
    const map = new Map<string, THREE.MeshStandardMaterial>();

    scene.traverse((ch) => {
      if (ch instanceof THREE.Mesh) {
        const name = ch.name;
        const partKey = Object.keys(parts).find(k =>
          name.toLowerCase().includes(k.toLowerCase())
        );
        const cfg = partKey ? parts[partKey] : parts.Top;

        // LOD: skip normal maps and roughness maps on low-end devices
        const diffuseMap = loadTexture(cfg.map);
        const normalMap = lowLOD ? null : loadTexture(cfg.normalMap);
        const roughnessMap = lowLOD ? null : loadTexture(cfg.roughnessMap);

        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(cfg.color),
          roughness: cfg.roughness,
          metalness: cfg.metalness,
          emissive: new THREE.Color('#c5a059'),
          emissiveIntensity: 0,
          side: THREE.DoubleSide,
          ...(diffuseMap ? { map: diffuseMap } : {}),
          ...(normalMap ? { normalMap } : {}),
          ...(roughnessMap ? { roughnessMap } : {}),
        });

        ch.material = mat;
        ch.castShadow = !lowLOD; // Skip shadow casting on low-end
        map.set(name, mat);
      }
    });

    matsRef.current = map;

    return () => {
      // Dispose materials on cleanup
      map.forEach(m => m.dispose());
    };
  }, [scene, selections, lowLOD, loadTexture]);

  const isLefty = (selections.bodyFeature || '').split(',').includes('lefty');

  return <primitive object={scene} scale={[isLefty ? -1 : 1, 1, 1]} />;
}

// ═════════════════════════════════════════════════════════════════════════════
// Floating gold dust particles — subtle workshop atmosphere
// ═════════════════════════════════════════════════════════════════════════════
function DustParticles({ count = 80, ambientColor }: { count?: number; ambientColor: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random positions in a large sphere around the guitar
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) - 1;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  // Store per-particle drift speeds
  const drifts = useMemo(() => {
    const d = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      d[i * 3] = (Math.random() - 0.5) * 0.15;     // x drift
      d[i * 3 + 1] = 0.02 + Math.random() * 0.06;  // y drift (slowly rising)
      d[i * 3 + 2] = (Math.random() - 0.5) * 0.15; // z drift
    }
    return d;
  }, [count]);

  useFrame((_, dt) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += drifts[i * 3] * dt;
      pos[i * 3 + 1] += drifts[i * 3 + 1] * dt;
      pos[i * 3 + 2] += drifts[i * 3 + 2] * dt;
      // Reset particle when it drifts too far up
      if (pos[i * 3 + 1] > 6) {
        pos[i * 3 + 1] = -4;
        pos[i * 3] = (Math.random() - 0.5) * 12;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={ambientColor}
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function AnimPrice({ value, size = 'default' }: { value: number; size?: 'default' | 'large' }) {
  const [d, setD] = useState(value);
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);
  const mv = useMotionValue(value);
  const sp = useSpring(mv, { stiffness: 80, damping: 25 });
  useEffect(() => { mv.set(value); }, [value, mv]);
  useEffect(() => sp.on('change', v => setD(Math.round(v))), [sp]);

  // Gold flash when price changes
  useEffect(() => {
    if (value !== prevValue.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      prevValue.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  const isPremium = value >= 5000;

  return (
    <span className={cn(
      'transition-all duration-300 inline-flex items-center gap-1',
      flash && 'animate-[priceFlash_0.4s_ease-out]',
      isPremium && size === 'large' && 'bg-gradient-to-r from-ayers-gold via-yellow-300 to-ayers-gold bg-clip-text text-transparent',
    )}>
      US${d.toLocaleString()}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// URL Share — encode/decode selections to URL params
// ═════════════════════════════════════════════════════════════════════════════
const DEFAULT_SELECTIONS: Record<string, string> = {
  type: 'steel', shape: 'auditorium', bodyFeature: '',
  top: 'sitka', back: 'africa-mah',
  headShape: 'vintage-h', headPatch: 'none-hp', tuner: 'gotoh301-s',
  fbStyle: 'vintage-fb', rosette: 'green-aba',
  bridgeStyle: 'vintage-br', bridgePins: 'bone-pin',
  inlayMaterial: 'none-im', inlayTop: 'none-it', inlayFb: 'none-ifb',
  inlayHead: 'none-ih', inlayMarks: 'dots-mk',
  binding: 'none-bd', purfling: 'none-pf',
  finish: 'gloss', pickup: 'none-pu',
};

function encodeSelectionsToURL(selections: Record<string, string>): string {
  const params = new URLSearchParams();
  // Only encode non-default values to keep URL short
  for (const [k, v] of Object.entries(selections)) {
    if (v && v !== DEFAULT_SELECTIONS[k]) params.set(k, v);
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function decodeSelectionsFromURL(): Record<string, string> | null {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return null;
  const result = { ...DEFAULT_SELECTIONS };
  for (const [k, v] of params.entries()) {
    if (k in result) result[k] = v;
  }
  return result;
}

// ═════════════════════════════════════════════════════════════════════════════
// Summary — group stages into sections for rich display
// ═════════════════════════════════════════════════════════════════════════════
const SUMMARY_SECTIONS = [
  { titleKey: 'customizer.sectionAppearance', stageIds: ['body'] },
  { titleKey: 'customizer.sectionWood', stageIds: ['wood', 'fingerboard'] },
  { titleKey: 'customizer.sectionHardware', stageIds: ['head', 'rosette', 'bridge', 'inlay'] },
  { titleKey: 'customizer.sectionFinishing', stageIds: ['binding', 'finish', 'electronics'] },
];

// ═════════════════════════════════════════════════════════════════════════════
// Community Gallery — fetches from API
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

export default function Customizer() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    return decodeSelectionsFromURL() || { ...DEFAULT_SELECTIONS };
  });
  const [sent, setSent] = useState(false);
  const [glow, setGlow] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectionPulse, setSelectionPulse] = useState(0);
  const [freeOrbit, setFreeOrbit] = useState(false);
  const [mobileFullscreen3D, setMobileFullscreen3D] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lowLOD = useShouldUseLowLOD();
  const [linkCopied, setLinkCopied] = useState(false);
  const [screenshotting, setScreenshotting] = useState(false);
  const [stageBlur, setStageBlur] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [communityConfigs, setCommunityConfigs] = useState<CommunityConfig[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [specSheetOpen, setSpecSheetOpen] = useState(false);

  // Detect mobile (< lg breakpoint)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Fetch community configs when gallery opens
  useEffect(() => {
    if (!galleryOpen) return;
    let cancelled = false;
    setGalleryLoading(true);
    customConfigService.getPublicConfigs({ sort: 'likes', limit: 30 })
      .then(res => { if (!cancelled) setCommunityConfigs(res.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setGalleryLoading(false); });
    return () => { cancelled = true; };
  }, [galleryOpen]);

  const stage = STAGES[step];
  const isLast = step === STAGES.length - 1;
  const guitarType = selections.type;

  // Get visible fields for current stage (filtered by guitar type)
  const visibleFields = getVisibleFields(stage, guitarType);

  // Calculate price — memoized for performance
  const price = useMemo(() => {
    return BASE_PRICE_USD + STAGES.flatMap(s => getVisibleFields(s, guitarType)).reduce((sum, f) => {
      if (f.multi) {
        const selected = (selections[f.key] || '').split(',').filter(Boolean);
        return sum + f.options.filter(o => selected.includes(o.id)).reduce((s, o) => s + o.add, 0);
      }
      const opt = f.options.find(o => o.id === selections[f.key]);
      return sum + (opt?.add || 0);
    }, 0);
  }, [selections, guitarType]);

  // Lens blur on step change
  useEffect(() => {
    setStageBlur(true);
    const t = setTimeout(() => setStageBlur(false), 500);
    return () => clearTimeout(t);
  }, [step]);

  // Toggle for multi-select fields (bodyFeature): click toggles on/off
  const toggleMulti = (key: string, val: string) => {
    playKnock();
    setSelections(prev => {
      const current = prev[key] ? prev[key].split(',').filter(Boolean) : [];
      const next = current.includes(val)
        ? current.filter(v => v !== val)
        : [...current, val];
      return { ...prev, [key]: next.join(',') };
    });
    setSelectionPulse(p => p + 1);
  };

  const set = (key: string, val: string) => {
    playKnock();
    setSelections(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'type') {
        next.shape = val === 'travel' ? 'travel-d' : 'auditorium';
      }
      return next;
    });
    setSelectionPulse(p => p + 1);
  };

  const goToStep = useCallback((s: number) => {
    playStepSound();
    setShowSummary(false);
    setStep(s);
  }, []);

  // Helper: check if a value is selected (works for both single and multi)
  const isSelected = (key: string, val: string) => {
    const v = selections[key] || '';
    return v === val || v.split(',').includes(val);
  };

  // Share link
  const shareLink = useCallback(() => {
    const url = encodeSelectionsToURL(selections);
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [selections]);

  // Screenshot
  const takeScreenshot = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    setScreenshotting(true);
    requestAnimationFrame(() => {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `ayers-custom-guitar-${Date.now()}.png`;
        a.click();
      } catch { /* canvas tainted */ }
      setTimeout(() => setScreenshotting(false), 1500);
    });
  }, []);

  // Apply a community config — loads all selections + custom image URLs
  const applyConfig = useCallback((config: CommunityConfig) => {
    const sel = typeof config.selections === 'object' ? config.selections as Record<string, string> : {};
    // Merge with defaults to ensure all keys are present
    setSelections({ ...DEFAULT_SELECTIONS, ...sel });
    setStep(0);
    setShowSummary(false);
    setGalleryOpen(false);
    setSelectionPulse(p => p + 1);
    // Note: config.uploads contains server URLs for custom images (e.g. inlay designs)
    // These URLs are already hosted on the server — no local file needed
  }, []);

  // Toggle like on a community config (optimistic update + API)
  const toggleLike = useCallback((id: string) => {
    setCommunityConfigs(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
    customConfigService.toggleLike(id).catch(() => {
      // Revert on error
      setCommunityConfigs(prev => prev.map(c =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      ));
    });
  }, []);

  // Config summary line: "Auditorium · Sitka + Indian Rosewood · Gloss"
  const configLine = useMemo(() => {
    const findName = (key: string) => {
      for (const s of STAGES) {
        for (const f of s.fields) {
          const opt = f.options.find(o => o.id === selections[f.key] && f.key === key);
          if (opt) return t(opt.nameKey);
        }
      }
      return '';
    };
    return t('customizer.configSummaryLine', {
      shape: findName('shape'),
      top: findName('top'),
      back: findName('back'),
      finish: findName('finish'),
    });
  }, [selections, t]);

  // Share config to community gallery (screenshot + save to API)
  const shareToGallery = useCallback(async () => {
    setSharing(true);
    try {
      const canvas = document.querySelector('canvas');
      let thumbnailUrl: string | null = null;
      if (canvas) {
        thumbnailUrl = await customConfigService.uploadThumbnail(canvas);
      }
      const title = window.prompt(t('customizer.sharePromptTitle'), configLine) || configLine;
      if (!title) { setSharing(false); return; }

      await customConfigService.createConfig({
        title,
        selections,
        thumbnail: thumbnailUrl,
        totalPrice: price,
        isPublic: true,
      });
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {
      // User may not be logged in
    } finally {
      setSharing(false);
    }
  }, [selections, price, configLine, t]);

  return (
    <div className={cn(
      'fixed inset-0 bg-[#0c0c0e] text-white overflow-hidden',
      // When mobile fullscreen 3D, raise above the Navbar (z-50)
      mobileFullscreen3D ? 'z-[60]' : 'z-10',
      // Mobile: flex column layout to split 3D and panel; Desktop: block (overlay style)
      // pt-20 accounts for the fixed navbar (h-20) on mobile
      !mobileFullscreen3D && 'flex flex-col pt-20 lg:pt-0 lg:block',
    )}>
      {/* ── Ambient atmosphere — transitions per stage ─────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-[1800ms] ease-in-out"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 55% 40%, ${stage.ambient.color}, transparent 70%),
            radial-gradient(ellipse 60% 50% at 30% 70%, ${stage.ambient.glow}, transparent 60%)
          `,
        }}
      />
      {/* Breathing glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none animate-[ambientPulse_6s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 60% 45%, ${stage.ambient.glow}, transparent 60%)`,
        }}
      />

      {/* ── 3D Area ───────────────────────────────────────────────────────── */}
      {/* Mobile: fixed height zone (40vh) or fullscreen; Desktop: absolute fill */}
      <div className={cn(
        'relative',
        mobileFullscreen3D
          ? 'fixed inset-0 z-50'                      // Mobile fullscreen 3D
          : 'flex-[3] min-h-0 lg:absolute lg:inset-0 lg:h-auto lg:flex-auto',  // Mobile 6:4 (flex 3:2) | Desktop full
      )}>
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-[#0c0c0e]"><GuitarSunLoader size={40} text="Loading 3D..." /></div>}>
          <Canvas
            className={cn('absolute inset-0 transition-[filter] duration-500', stageBlur && 'blur-[2px]')}
            camera={{ fov: 40, position: [0, 0, 6] }}
            dpr={isMobile ? [1, 1] : [1, 2]}
            shadows={!isMobile}
          >
            <fog attach="fog" args={['#0c0c0e', 14, 28]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 5, 4]} intensity={1} color="#fff5e6" castShadow={!isMobile} />
            <directionalLight position={[-3, 4, -3]} intensity={0.25} color="#c5a059" />
            <spotLight position={[0, 7, 1]} intensity={0.5} angle={0.5} penumbra={1} color="#ffe4b5" />
            <Bounds fit clip observe margin={1.1}>
              <Center>
                <Guitar selections={selections} glow={glow} modelUrl={getModelUrl(selections.shape, selections.bodyFeature)} lowLOD={lowLOD} />
              </Center>
            </Bounds>
            {!lowLOD && <ContactShadows position={[0, -2.5, 0]} opacity={0.25} scale={14} blur={2.5} far={8} />}
            <Environment preset="studio" />
            {!lowLOD && <DustParticles count={isMobile ? 30 : 60} ambientColor="#c5a059" />}
            <CameraRig stageCamera={stage.camera} showSummary={showSummary} selectionPulse={selectionPulse} freeOrbit={freeOrbit || mobileFullscreen3D} />
          </Canvas>
        </Suspense>

        {/* Mobile: tap to expand overlay (only in split mode) */}
        {!mobileFullscreen3D && (
          <button
            onClick={() => setMobileFullscreen3D(true)}
            className="absolute inset-0 z-10 lg:hidden"
            aria-label="Expand 3D preview"
          >
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Maximize2 size={10} className="text-ayers-gold" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">{t('customizer.dragHint')}</span>
            </div>
          </button>
        )}

        {/* Mobile fullscreen: close button */}
        {mobileFullscreen3D && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setMobileFullscreen3D(false)}
            className="absolute top-5 right-5 z-[60] flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-3 rounded-full border border-white/15 lg:hidden"
          >
            <X size={16} className="text-white/80" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">{t('customizer.back')}</span>
          </motion.button>
        )}
      </div>

      {/* ── Title ─────────────────────────────────────────────────────────── */}
      {!mobileFullscreen3D && (
        <div className="absolute top-[5.25rem] left-4 lg:top-5 lg:left-5 z-20 pointer-events-none">
          <h1 className="text-sm lg:text-3xl font-serif italic font-bold">{t('customizer.title')} <span className="text-ayers-gold">{t('customizer.titleAccent')}</span></h1>
        </div>
      )}

      {/* ── Price (top-right) ─────────────────────────────────────────────── */}
      {!mobileFullscreen3D && (
        <div className="absolute top-[5.25rem] right-14 lg:top-5 lg:right-5 z-20 pointer-events-none text-right">
          <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/25">{t('customizer.estimated')}</p>
          <p className="text-base lg:text-2xl font-serif italic font-bold text-ayers-gold"><AnimPrice value={price} size="large" /></p>
        </div>
      )}

      {/* ── Step Progress ────────────────────────────────────────────────── */}
      {!mobileFullscreen3D && (
        <>
          {/* Desktop: full dot progress bar */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 hidden lg:flex items-center gap-1">
            {STAGES.map((s, i) => (
              <button key={s.id} onClick={() => goToStep(i)} className="group flex items-center">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all',
                  i === step && !showSummary ? 'bg-ayers-gold text-[#0c0c0e] scale-110' :
                  i < step ? 'bg-ayers-gold/20 text-ayers-gold' : 'bg-white/5 text-white/30 group-hover:bg-white/10'
                )}>
                  {i < step ? <Check size={10} strokeWidth={3} /> : s.icon}
                </div>
                {i < STAGES.length - 1 && <div className={cn('w-8 h-px mx-0.5', i < step ? 'bg-ayers-gold/30' : 'bg-white/10')} />}
              </button>
            ))}
            <div className="w-8 h-px mx-0.5 bg-white/10" />
            <button onClick={() => { playStepSound(); setShowSummary(true); }} className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-[10px] transition-all',
              showSummary ? 'bg-ayers-gold text-[#0c0c0e] scale-110' : 'bg-white/5 text-white/30 hover:bg-white/10'
            )}>📋</button>
          </div>

          {/* Mobile: vertical progress dots on the right side of 3D area */}
          <div className="absolute right-3 top-3 z-20 flex lg:hidden flex-col items-center gap-1 bg-black/40 backdrop-blur-md py-2.5 px-1.5 rounded-2xl border border-white/[0.06]">
            <span className="text-[8px] font-bold text-ayers-gold/70 mb-0.5">
              {showSummary ? '📋' : `${step + 1}`}
            </span>
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goToStep(i)}
                className={cn(
                  'w-2 rounded-full transition-all duration-300',
                  i === step && !showSummary ? 'h-4 bg-ayers-gold' :
                  i < step ? 'h-2 bg-ayers-gold/30' : 'h-2 bg-white/10'
                )}
              />
            ))}
            <button
              onClick={() => { playStepSound(); setShowSummary(true); }}
              className={cn('w-2 rounded-full transition-all duration-300', showSummary ? 'h-4 bg-ayers-gold' : 'h-2 bg-white/10')}
            />
          </div>

          {/* Mobile: floating step label at bottom of 3D area */}
          {!showSummary && (
            <div className="absolute bottom-1 left-0 right-0 z-20 flex lg:hidden justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.06]">
                <span className="text-[10px]">{stage.icon}</span>
                <span className="text-[9px] font-bold text-ayers-gold/80">{step + 1}/{STAGES.length}</span>
                <span className="text-[10px] font-semibold text-white/70">{t(stage.titleKey)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Options Panel ─────────────────────────────────────────────────── */}
      {/* Mobile: flex-1 fills remaining space below 3D; Desktop: absolute side panel */}
      {!mobileFullscreen3D && (
        <motion.div
          className="flex-[2] min-h-0 z-30 lg:absolute lg:bottom-4 lg:left-auto lg:right-4 lg:w-[360px] lg:top-16 lg:flex-auto"
        >
        <div className="bg-[#111]/92 backdrop-blur-2xl border-t border-white/[0.04] lg:border lg:rounded-2xl flex flex-col h-full lg:max-h-[calc(100vh-80px)] overflow-hidden">

          <AnimatePresence mode="wait">
            {showSummary ? (
              /* ── Rich Summary View ──── */
              <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1 overflow-hidden">
                {/* Header + config description */}
                <div className="px-5 py-3 border-b border-white/[0.04] flex-shrink-0">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em]">{t('customizer.summaryTitle')}</h2>
                  <p className="text-[9px] text-white/30 mt-1 leading-relaxed">{configLine}</p>
                  <div className="w-5 h-0.5 bg-ayers-gold mt-2" />
                </div>

                {/* Mobile: button to open fullscreen spec sheet */}
                <div className="flex-1 min-h-0 flex flex-col lg:hidden px-5 py-3">
                  <button
                    onClick={() => setSpecSheetOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] active:bg-white/[0.08] transition-colors"
                  >
                    <Eye size={14} className="text-ayers-gold/70" />
                    <span className="text-[12px] font-bold uppercase tracking-wider text-white/70">{t('customizer.viewAllSpecs', '查看完整規格')}</span>
                    <ChevronRight size={14} className="text-white/30" />
                  </button>
                </div>

                {/* Desktop: inline sectioned list (unchanged) */}
                <div className="overflow-y-auto flex-1 px-5 py-2 space-y-3 hidden lg:block">
                  {SUMMARY_SECTIONS.map(section => {
                    const sectionStages = STAGES.filter(s => section.stageIds.includes(s.id));
                    const sectionFields = sectionStages.flatMap(s => getVisibleFields(s, guitarType));
                    if (sectionFields.length === 0) return null;
                    return (
                      <div key={section.titleKey}>
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-ayers-gold/40">{t(section.titleKey)}</span>
                        <div className="mt-1.5 space-y-1">
                          {sectionFields.map(f => {
                            if (f.multi) {
                              const selectedIds = (selections[f.key] || '').split(',').filter(Boolean);
                              const selectedOpts = f.options.filter(o => selectedIds.includes(o.id));
                              if (selectedOpts.length === 0) return null;
                              return selectedOpts.map(opt => (
                                <div key={opt.id} className="flex items-center gap-2.5 py-1">
                                  <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 text-[10px]">✓</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-white/70 font-medium">{t(opt.nameKey)}</p>
                                    <p className="text-[8px] text-white/20">{t(f.labelKey)}</p>
                                  </div>
                                  {opt.add > 0 && <span className="text-[8px] text-ayers-gold/40">+US${opt.add.toLocaleString()}</span>}
                                </div>
                              ));
                            }
                            const opt = f.options.find(o => o.id === selections[f.key]);
                            if (!opt) return null;
                            return (
                              <div key={f.key} className="flex items-center gap-2.5 py-1">
                                {opt.img ? (
                                  <div className="w-7 h-7 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                                    <img src={opt.img} alt="" className="w-full h-full object-contain" />
                                  </div>
                                ) : opt.swatch ? (
                                  <div className="w-7 h-7 rounded-md flex-shrink-0 ring-1 ring-white/10" style={{ backgroundColor: opt.swatch }} />
                                ) : (
                                  <div className="w-7 h-7 rounded-md bg-white/5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] text-white/70 font-medium">{t(opt.nameKey)}</p>
                                  <p className="text-[8px] text-white/20">{t(f.labelKey)}</p>
                                </div>
                                {opt.add > 0 && <span className="text-[8px] text-ayers-gold/40">+US${opt.add.toLocaleString()}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer: price + actions */}
                <div className="px-5 py-3 border-t border-white/[0.04] flex-shrink-0 bg-black/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white/25">{t('customizer.total')}</span>
                    <span className="text-xl font-serif italic font-bold text-ayers-gold"><AnimPrice value={price} size="large" /></span>
                  </div>

                  {/* Share & Screenshot row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <motion.button
                      onClick={shareLink}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.06] text-[8px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 hover:border-white/10 transition-all"
                    >
                      {linkCopied ? <><Check size={10} className="text-emerald-400" /> {t('customizer.linkCopied')}</> : <><Link2 size={10} /> {t('customizer.shareLink')}</>}
                    </motion.button>
                    <motion.button
                      onClick={takeScreenshot}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/[0.06] text-[8px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 hover:border-white/10 transition-all"
                    >
                      {screenshotting ? <><Check size={10} className="text-emerald-400" /> {t('customizer.screenshotSaved')}</> : <><Camera size={10} /> {t('customizer.screenshot')}</>}
                    </motion.button>
                    <motion.button
                      onClick={shareToGallery}
                      disabled={sharing || shared}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[8px] font-bold uppercase tracking-wider transition-all',
                        shared
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : 'border-ayers-gold/20 text-ayers-gold/60 hover:text-ayers-gold hover:border-ayers-gold/40 hover:bg-ayers-gold/[0.04]',
                      )}
                    >
                      {shared ? <><Check size={10} /> {t('customizer.sharedToGallery')}</> :
                       sharing ? <><img src="/images/ayers/guitar-sun.png" alt="" className="w-3 h-3 animate-[spin_1s_linear_infinite]" /> {t('customizer.sharingToGallery')}</> :
                       <><Users size={10} /> {t('customizer.shareToGallery')}</>}
                    </motion.button>
                  </div>

                  {/* Back + Add to Cart */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { playStepSound(); setShowSummary(false); setStep(STAGES.length - 1); }}
                      className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider text-white/50 hover:bg-white/5 transition-all"
                    >
                      <ChevronLeft size={12} /> {t('customizer.back')}
                    </button>
                    <motion.button
                      onClick={() => { playChord(); setSent(true); setTimeout(() => setSent(false), 3000); }}
                      disabled={sent}
                      whileTap={{ scale: 0.98 }}
                      className={cn('flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 transition-all', sent ? 'bg-emerald-500 text-white' : 'bg-ayers-gold text-[#0c0c0e]')}
                    >
                      {sent ? <><Check size={12} strokeWidth={3} /> {t('customizer.addedToCart')}</> : <>{t('customizer.addToCart')} <ShoppingCart size={10} /></>}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ── Stage Options ──── */
              <motion.div key={stage.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1 overflow-hidden">
                {/* Stage Header — hidden on mobile (shown as floating label above panel), visible on desktop */}
                <div className="hidden lg:flex px-5 py-3 border-b border-white/[0.04] flex-shrink-0 items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ayers-gold/50">{t('customizer.step', { current: step + 1, total: STAGES.length })}</span>
                    <h2 className="text-sm font-bold">{stage.icon} {t(stage.titleKey)} <span className="text-white/30 font-normal text-xs">{t(stage.subtitleKey)}</span></h2>
                  </div>
                </div>

                {/* Options */}
                <div className="overflow-y-auto flex-1 overscroll-contain">
                  {visibleFields.map((field) => (
                    <div key={field.key} className="border-b border-white/[0.02]">
                      <div className="px-5 pt-4 pb-2">
                        <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">{t(field.labelKey)}</span>
                      </div>
                      <div className="px-5 pb-4 space-y-1.5">
                        {field.options.map((opt, i) => (
                          <div key={opt.id} className="space-y-1">
                            <motion.button
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03, duration: 0.25 }}
                              onClick={() => field.multi ? toggleMulti(field.key, opt.id) : set(field.key, opt.id)}
                              onMouseEnter={() => setGlow(true)}
                              onMouseLeave={() => setGlow(false)}
                              className={cn(
                                'w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group',
                                isSelected(field.key, opt.id) ? 'bg-ayers-gold/[0.06] ring-1 ring-ayers-gold/20' : 'hover:bg-white/[0.02]'
                              )}
                            >
                              {/* Visual indicator */}
                              {opt.img ? (
                                <div className={cn('w-11 h-11 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 transition-all', isSelected(field.key, opt.id) ? 'ring-1 ring-ayers-gold/40' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80')}>
                                  <img src={opt.img} alt={t(opt.nameKey)} className="w-full h-full object-contain" />
                                </div>
                              ) : opt.swatch ? (
                                <div className={cn('w-8 h-8 rounded-md flex-shrink-0 transition-all', isSelected(field.key, opt.id) ? 'ring-2 ring-ayers-gold/50 scale-105' : 'ring-1 ring-white/10')} style={{ backgroundColor: opt.swatch }} />
                              ) : opt.grad ? (
                                <div className={cn('w-8 h-8 rounded-md flex-shrink-0 bg-gradient-to-br transition-all', opt.grad, isSelected(field.key, opt.id) ? 'ring-2 ring-ayers-gold/50' : 'ring-1 ring-white/5')} />
                              ) : null}

                              <div className="flex-1 min-w-0 text-left">
                                <p className={cn('text-[13px] font-semibold leading-tight', isSelected(field.key, opt.id) ? 'text-ayers-gold' : 'text-white/70')}>{t(opt.nameKey)}</p>
                                <p className="text-[10px] text-white/30 mt-0.5">{t(opt.descKey)}</p>
                              </div>

                              {opt.add > 0 && <span className="text-[9px] font-bold text-ayers-gold/50 bg-ayers-gold/[0.06] px-2 py-1 rounded-md flex-shrink-0">+US${opt.add.toLocaleString()}</span>}

                              {isSelected(field.key, opt.id) && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-ayers-gold flex items-center justify-center flex-shrink-0">
                                  <Check size={11} strokeWidth={3} className="text-[#0c0c0e]" />
                                </motion.div>
                              )}
                            </motion.button>
                            {/* Upload button for custom design options */}
                            {opt.upload && selections[field.key] === opt.id && (
                              <motion.label
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 ml-8 px-3 py-2 rounded-lg border border-dashed border-ayers-gold/20 bg-ayers-gold/[0.03] cursor-pointer hover:border-ayers-gold/40 transition-all"
                              >
                                <Upload size={12} className="text-ayers-gold/50" />
                                <span className="text-[9px] text-white/40">{t('customizer.uploadDesign')}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && file.size <= 1024 * 1024) {
                                    // TODO: handle file upload to server
                                  }
                                }} />
                              </motion.label>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="px-5 py-3 border-t border-white/[0.04] flex-shrink-0 bg-black/30 flex items-center gap-2">
                  <button
                    onClick={() => goToStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className={cn('flex items-center gap-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all', step === 0 ? 'text-white/15' : 'text-white/50 hover:bg-white/5')}
                  >
                    <ChevronLeft size={12} /> {t('customizer.back')}
                  </button>
                  <button
                    onClick={() => { playStepSound(); if (isLast) setShowSummary(true); else setStep(step + 1); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-ayers-gold text-[#0c0c0e] text-[10px] font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-ayers-gold/20 transition-all"
                  >
                    {isLast ? t('customizer.reviewConfig') : t('customizer.next')} <ChevronRight size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      )}

      {/* ── Mobile Fullscreen Spec Sheet ─────────────────────────────── */}
      <AnimatePresence>
        {specSheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col bg-[#0c0c0e]/98 backdrop-blur-xl lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.06] flex-shrink-0">
              <div>
                <h2 className="text-sm font-bold">{t('customizer.summaryTitle')}</h2>
                <p className="text-[10px] text-white/30 mt-0.5">{configLine}</p>
              </div>
              <button
                onClick={() => setSpecSheetOpen(false)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X size={16} className="text-white/70" />
              </button>
            </div>

            {/* Scrollable spec list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5">
              {SUMMARY_SECTIONS.map(section => {
                const sectionStages = STAGES.filter(s => section.stageIds.includes(s.id));
                const sectionFields = sectionStages.flatMap(s => getVisibleFields(s, guitarType));
                if (sectionFields.length === 0) return null;
                return (
                  <div key={section.titleKey}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ayers-gold/50">{t(section.titleKey)}</span>
                    <div className="mt-2 space-y-1.5">
                      {sectionFields.map(f => {
                        if (f.multi) {
                          const selectedIds = (selections[f.key] || '').split(',').filter(Boolean);
                          const selectedOpts = f.options.filter(o => selectedIds.includes(o.id));
                          if (selectedOpts.length === 0) return null;
                          return selectedOpts.map(opt => (
                            <div key={opt.id} className="flex items-center gap-3 py-1.5">
                              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-white/80 font-medium">{t(opt.nameKey)}</p>
                                <p className="text-[10px] text-white/25">{t(f.labelKey)}</p>
                              </div>
                              {opt.add > 0 && <span className="text-[10px] text-ayers-gold/50 font-bold">+US${opt.add.toLocaleString()}</span>}
                            </div>
                          ));
                        }
                        const opt = f.options.find(o => o.id === selections[f.key]);
                        if (!opt) return null;
                        return (
                          <div key={f.key} className="flex items-center gap-3 py-1.5">
                            {opt.img ? (
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                <img src={opt.img} alt="" className="w-full h-full object-contain" />
                              </div>
                            ) : opt.swatch ? (
                              <div className="w-9 h-9 rounded-lg flex-shrink-0 ring-1 ring-white/10" style={{ backgroundColor: opt.swatch }} />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-white/80 font-medium">{t(opt.nameKey)}</p>
                              <p className="text-[10px] text-white/25">{t(f.labelKey)}</p>
                            </div>
                            {opt.add > 0 && <span className="text-[10px] text-ayers-gold/50 font-bold">+US${opt.add.toLocaleString()}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom: total + close */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex-shrink-0 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/25">{t('customizer.total')}</span>
                <p className="text-xl font-serif italic font-bold text-ayers-gold"><AnimPrice value={price} size="large" /></p>
              </div>
              <button
                onClick={() => setSpecSheetOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-[11px] font-bold uppercase tracking-wider text-white/70 active:bg-white/15 transition-colors"
              >
                {t('customizer.close', '關閉')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Community Gallery — Sun Icon Trigger + Drawer ──────────────── */}
      {!mobileFullscreen3D && (
        <>
          {/* Sun icon button — desktop: bottom-left area; mobile: left of 3D zone */}
          <motion.button
            onClick={() => setGalleryOpen(o => !o)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'fixed z-40 group',
              // Desktop: left side, vertically centered
              'lg:left-5 lg:top-1/2 lg:-translate-y-1/2',
              // Mobile: bottom-left corner above the panel
              'left-3 bottom-[calc(40%+8px)] lg:bottom-auto',
            )}
            title={t('customizer.communityGallery')}
          >
            <div className={cn(
              'relative w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-300',
              galleryOpen
                ? 'bg-ayers-gold/20 ring-2 ring-ayers-gold/40 shadow-lg shadow-ayers-gold/20'
                : 'bg-black/50 backdrop-blur-xl ring-1 ring-white/[0.08] hover:ring-ayers-gold/20 hover:bg-black/70',
            )}>
              <img
                src="/images/ayers/guitar-sun.png"
                alt=""
                className={cn(
                  'w-7 h-7 lg:w-8 lg:h-8 select-none transition-all duration-500',
                  galleryOpen ? 'animate-[spin_4s_linear_infinite] brightness-125' : 'opacity-60 group-hover:opacity-100',
                )}
                draggable={false}
              />
              {/* Notification badge */}
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-ayers-gold text-[8px] font-bold text-[#0c0c0e] flex items-center justify-center">
                {communityConfigs.length}
              </span>
            </div>
            {/* Tooltip — desktop only */}
            <span className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-white/50 px-3 py-1.5 rounded-full border border-white/[0.06] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <Users size={9} className="inline mr-1.5 -mt-px" />{t('customizer.communityGallery')}
            </span>
          </motion.button>

          {/* Gallery drawer overlay */}
          <AnimatePresence>
            {galleryOpen && (
              <>
                {/* Backdrop — click to close */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setGalleryOpen(false)}
                  className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
                />

                {/* Drawer — Desktop: left panel; Mobile: bottom sheet */}
                <motion.div
                  initial={isMobile ? { y: '100%' } : { x: '-100%', opacity: 0 }}
                  animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
                  exit={isMobile ? { y: '100%' } : { x: '-100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className={cn(
                    'fixed z-40 flex flex-col overflow-hidden',
                    // Mobile: bottom sheet (top-24 = 6rem, clears navbar h-20 + gap)
                    'inset-x-0 bottom-0 top-24 rounded-t-2xl',
                    // Desktop: left side panel
                    'lg:inset-x-auto lg:left-20 lg:top-[5.5rem] lg:bottom-4 lg:w-[320px] lg:rounded-2xl',
                  )}
                  style={{
                    background: 'rgba(17,17,17,0.95)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Handle bar — mobile only */}
                  <div className="flex justify-center pt-2 pb-0 lg:hidden">
                    <div className="w-8 h-1 rounded-full bg-white/20" />
                  </div>

                  {/* Header */}
                  <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                      <img src="/images/ayers/guitar-sun.png" alt="" className="w-5 h-5 animate-[spin_6s_linear_infinite]" draggable={false} />
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-[0.12em]">{t('customizer.communityGallery')}</h2>
                        <p className="text-[8px] text-white/30 mt-0.5">{t('customizer.communityDesc')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setGalleryOpen(false)}
                      className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {/* Cards list */}
                  <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-2.5">
                    {galleryLoading && (
                      <div className="flex items-center justify-center py-12">
                        <GuitarSunLoader size={32} text={t('customizer.galleryLoading')} />
                      </div>
                    )}
                    {!galleryLoading && communityConfigs.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <img src="/images/ayers/guitar-sun.png" alt="" className="w-10 h-10 opacity-20 mb-3" />
                        <p className="text-[11px] text-white/30">{t('customizer.galleryEmpty')}</p>
                        <p className="text-[9px] text-white/15 mt-1">{t('customizer.galleryEmptyHint')}</p>
                      </div>
                    )}
                    {communityConfigs.map((config, i) => (
                      <motion.div
                        key={config.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="group relative bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/[0.04] hover:border-ayers-gold/10 transition-all overflow-hidden"
                      >
                        {/* Thumbnail + info row */}
                        <div className="flex items-center gap-3 p-3">
                          {/* Thumbnail */}
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {config.thumbnail ? (
                              <img src={config.thumbnail} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                            ) : (
                              <img src="/images/ayers/guitar-sun.png" alt="" className="w-7 h-7 opacity-30" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-white/80 truncate">{config.title}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {config.author.avatar ? (
                                <img src={config.author.avatar} alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-ayers-gold/15 text-[7px] font-bold text-ayers-gold flex items-center justify-center flex-shrink-0">
                                  {config.author.name[0] || '?'}
                                </span>
                              )}
                              <span className="text-[9px] text-white/30 truncate">{config.author.name}</span>
                            </div>
                          </div>

                          {/* Like button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleLike(config.id); }}
                            className="flex flex-col items-center gap-0.5 flex-shrink-0"
                          >
                            <Heart
                              size={14}
                              className={cn(
                                'transition-all',
                                config.liked ? 'fill-red-400 text-red-400' : 'text-white/20 hover:text-red-400/60'
                              )}
                            />
                            <span className="text-[8px] text-white/25">{config.likes}</span>
                          </button>
                        </div>

                        {/* Apply button */}
                        <button
                          onClick={() => applyConfig(config)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-white/[0.03] text-[9px] font-bold uppercase tracking-wider text-white/30 hover:text-ayers-gold hover:bg-ayers-gold/[0.04] transition-all"
                        >
                          {t('customizer.applyConfig')} <ArrowRight size={10} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-white/[0.04] flex-shrink-0 bg-black/30">
                    <p className="text-[8px] text-white/20 text-center">{t('customizer.communityFooter')}</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Bottom hint + Free Orbit Toggle (desktop only) ────────────── */}
      <div className="absolute bottom-4 left-5 z-20 hidden lg:flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div key={showSummary ? 'sum' : stage.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 bg-black/30 backdrop-blur-lg px-3 py-1.5 rounded-full border border-white/[0.05] pointer-events-none">
            <span className="text-[9px] font-bold uppercase tracking-wider text-ayers-gold/50">{showSummary ? t('customizer.overview') : `${stage.icon} ${t(stage.titleKey)}`}</span>
            <span className="w-px h-2 bg-white/10" />
            <span className="text-[8px] text-white/20">{t('customizer.dragHint')}</span>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setFreeOrbit(f => !f)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-lg text-[9px] font-bold uppercase tracking-wider transition-all',
            freeOrbit
              ? 'bg-ayers-gold/10 border-ayers-gold/30 text-ayers-gold'
              : 'bg-black/30 border-white/[0.05] text-white/30 hover:text-white/50 hover:border-white/10'
          )}
        >
          {freeOrbit ? <><Eye size={10} /> {t('customizer.freeOrbit')}</> : <><Compass size={10} /> {t('customizer.guidedMode')}</>}
        </button>
        {freeOrbit && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setFreeOrbit(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-lg border border-white/[0.05] text-[8px] font-bold uppercase tracking-wider text-white/25 hover:text-white/50 transition-all"
          >
            {t('customizer.backToGuided')}
          </motion.button>
        )}
      </div>
    </div>
  );
}
