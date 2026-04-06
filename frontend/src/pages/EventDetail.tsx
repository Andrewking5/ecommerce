import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Tag, Share2, Download, Copy, Check } from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import { GuitarSunLoader } from '../components/guitar';
import eventService, { type Event } from '../services/eventService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
}

export default function EventDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const data = await eventService.getEventBySlug(slug);
        setEvent(data);
        // Track visit if coming from QR scan (referral code in URL)
        if (data?.referralCode) {
          eventService.trackClick(data.referralCode).catch(() => {});
        }
      } catch { /* silent */ } finally { setLoading(false); }
    })();
  }, [slug]);

  const getQrUrl = () => {
    if (!event) return '';
    const base = window.location.origin;
    const lang = document.location.pathname.split('/')[1] || 'zh-TW';
    let url = `${base}/${lang}/events/${event.slug}`;
    const params = new URLSearchParams();
    if (event.utmSource) params.set('utm_source', event.utmSource);
    if (event.utmMedium) params.set('utm_medium', event.utmMedium);
    if (event.utmCampaign) params.set('utm_campaign', event.utmCampaign);
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getQrUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${event?.slug || 'event'}-qrcode.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (!event) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: event.description, url: getQrUrl() });
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ayers-cream">
        <GuitarSunLoader size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ayers-cream">
        <p className="text-ayers-ink/50 text-lg">{t('events.notFound', '找不到此活動')}</p>
      </div>
    );
  }

  const now = new Date();
  const isOngoing = now >= new Date(event.startDate) && now <= new Date(event.endDate);
  const isUpcoming = now < new Date(event.startDate);

  return (
    <div className="bg-ayers-cream min-h-screen">
      <SEO title={event.title} description={event.description} />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-end overflow-hidden bg-ayers-dark text-white">
        {event.coverImage && (
          <div className="absolute inset-0">
            <OptimizedImage
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover opacity-40"
              priority
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ayers-dark via-ayers-dark/60 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {isOngoing && (
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/20 text-green-400 mb-4">
                進行中
              </span>
            )}
            {isUpcoming && (
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 mb-4">
                即將開始
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-serif italic font-bold mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <Calendar size={15} />
                {formatDate(event.startDate)} — {formatDate(event.endDate)}
              </span>
              {event.location && (
                <span className="flex items-center gap-2">
                  <MapPin size={15} />
                  {event.location}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Description */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-ayers-ink mb-6">{t('events.aboutEvent', '活動詳情')}</h2>
                <div className="prose prose-lg max-w-none text-ayers-ink/70 whitespace-pre-line leading-relaxed">
                  {event.description}
                </div>

                {/* Coupon */}
                {event.couponCode && (
                  <div className="mt-10 p-6 rounded-2xl bg-ayers-gold/5 border border-ayers-gold/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} className="text-ayers-gold" />
                      <h3 className="text-sm font-bold text-ayers-gold uppercase tracking-widest">
                        {t('events.exclusiveOffer', '活動限定優惠')}
                      </h3>
                    </div>
                    {event.discountNote && (
                      <p className="text-sm text-ayers-ink/60 mb-3">{event.discountNote}</p>
                    )}
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-ayers-gold/10 border border-ayers-gold/30">
                      <span className="text-lg font-mono font-bold text-ayers-ink tracking-wider">{event.couponCode}</span>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(event.couponCode!);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="text-ayers-gold hover:text-ayers-gold/70 transition-colors"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: QR Code & Share */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-28 space-y-6"
              >
                {/* QR Code Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-ayers-ink/5 text-center">
                  <h3 className="text-sm font-bold text-ayers-ink uppercase tracking-widest mb-4">
                    {t('events.scanQr', '掃描 QR Code')}
                  </h3>
                  <div ref={qrRef} className="inline-block p-3 bg-white rounded-xl">
                    <QRCode
                      value={getQrUrl()}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#1a1a1a"
                      qrStyle="dots"
                      eyeRadius={8}
                      ecLevel="H"
                      logoImage="/images/ayers-logo.svg"
                      logoWidth={55}
                      logoHeight={30}
                      logoOpacity={1}
                      logoPadding={2}
                      logoPaddingStyle="circle"
                      removeQrCodeBehindLogo
                    />
                  </div>
                  <p className="text-[10px] text-ayers-ink/40 mt-3">
                    {t('events.qrHint', '掃描此 QR Code 分享活動連結')}
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleDownloadQr}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-ayers-ink text-white text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-ink/80 transition-all"
                    >
                      <Download size={12} /> {t('events.downloadQr', '下載')}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-ayers-gold text-black text-[10px] font-bold uppercase tracking-widest hover:bg-ayers-gold/90 transition-all"
                    >
                      <Share2 size={12} /> {t('events.share', '分享')}
                    </button>
                  </div>
                </div>

                {/* Copy Link */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-ayers-ink/5">
                  <h3 className="text-xs font-bold text-ayers-ink/50 uppercase tracking-widest mb-3">
                    {t('events.referralLink', '推廣連結')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getQrUrl()}
                      className="flex-1 bg-ayers-cream/50 border border-ayers-ink/10 rounded-lg px-3 py-2 text-[11px] text-ayers-ink/60 truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 p-2 rounded-lg bg-ayers-ink/5 hover:bg-ayers-ink/10 transition-colors text-ayers-ink/60"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
