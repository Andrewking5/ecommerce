import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { useLocalizedNavigate as useNavigate } from '@/src/lib/i18nRouting';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import { GuitarSunLoader } from '../components/guitar';
import eventService, { type Event } from '../services/eventService';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

function EventStatusBadge({ event }: { event: Event }) {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (now < start) {
    return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400">即將開始</span>;
  }
  if (now >= start && now <= end) {
    return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400">進行中</span>;
  }
  return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/40">已結束</span>;
}

export default function Events() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await eventService.getActiveEvents();
        setEvents(data);
      } catch { /* silent */ } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="bg-ayers-cream min-h-screen">
      <SEO
        title={t('events.title', '活動與推廣')}
        description={t('events.description', '探索 Ayers Guitars 最新活動、展覽與限定推廣。')}
      />

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-ayers-dark text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-ayers-dark/80 to-ayers-dark" />
        <div className="relative z-10 text-center max-w-4xl px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-mono uppercase tracking-[0.4em] text-ayers-gold mb-6"
          >
            Events &amp; Promotions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif italic font-bold mb-4"
          >
            {t('events.title', '活動與推廣')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 font-light"
          >
            {t('events.subtitle', '發現 Ayers 精彩活動，獲取獨家優惠')}
          </motion.p>
        </div>
      </section>

      {/* Event List */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <GuitarSunLoader size={48} />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar size={48} className="mx-auto text-ayers-ink/20 mb-4" />
              <p className="text-ayers-ink/50 text-lg">{t('events.noEvents', '目前沒有進行中的活動')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate(`/events/${event.slug}`)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-ayers-ink/5"
                >
                  {/* Cover Image */}
                  {event.coverImage && (
                    <div className="relative h-56 overflow-hidden">
                      <OptimizedImage
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <EventStatusBadge event={event} />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {!event.coverImage && (
                      <div className="mb-3">
                        <EventStatusBadge event={event} />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-ayers-ink mb-2 group-hover:text-ayers-gold transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-ayers-ink/60 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-ayers-ink/50">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {formatDate(event.startDate)} — {formatDate(event.endDate)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {event.couponCode && (
                      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-ayers-gold/5 border border-ayers-gold/20">
                        <Tag size={13} className="text-ayers-gold" />
                        <span className="text-xs font-bold text-ayers-gold">
                          {event.discountNote || `優惠碼：${event.couponCode}`}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-ayers-gold uppercase tracking-widest group-hover:gap-2 transition-all">
                      {t('events.viewDetail', '查看詳情')} <ArrowRight size={12} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
