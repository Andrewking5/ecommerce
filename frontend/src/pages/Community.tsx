import { motion } from 'motion/react';
import { Play, Instagram, Youtube, Music, Heart, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ARTISTS_DATA = [
  {
    nameKey: 'community.artist1Name',
    nameFallback: 'PiA 吳蓓雅',
    roleKey: 'community.artist1Role',
    roleFallback: '品牌代言人・創作歌手',
    descKey: 'community.artist1Desc',
    descFallback: '金曲獎入圍創作歌手，以細膩的嗓音與獨特的創作風格深受樂迷喜愛。',
    modelKey: 'community.artist1Model',
    modelFallback: 'L-oo8 Wild Cat',
    img: '/images/artists/pia.png',
    social: { ig: 'https://www.instagram.com/pia_music/', yt: 'https://www.youtube.com/@PiAbandTV' },
  },
  {
    nameKey: 'community.artist2Name',
    nameFallback: 'Cindy Ukulele 葉馨婷',
    roleKey: 'community.artist2Role',
    roleFallback: 'Uluru 品牌代言人・烏克麗麗老師',
    descKey: 'community.artist2Desc',
    descFallback: '國際烏克麗麗評審，致力推廣烏克麗麗音樂教育，演奏足跡遍及海內外。',
    modelKey: 'community.artist2Model',
    modelFallback: 'Uluru Ukulele',
    img: '/images/artists/cindy-ukulele.png',
    social: { ig: 'https://www.instagram.com/cindyukulele/', yt: 'https://www.youtube.com/@cindyukulele-5075' },
  },
  {
    nameKey: 'community.artist3Name',
    nameFallback: '吉他情侶 Guitar Couple',
    roleKey: 'community.artist3Role',
    roleFallback: '合作樂團・指彈 + Smooth Jazz',
    descKey: 'community.artist3Desc',
    descFallback: '由 AJ 與許琦娟組成的夫妻音樂組合，以指彈吉他結合 Smooth Jazz 風格，帶來溫暖動人的演出。',
    modelKey: 'community.artist3Model',
    modelFallback: 'Ayers Custom',
    img: '/images/artists/guitar-couple.png',
    social: { ig: 'https://www.instagram.com/guitarcoupletw/', yt: 'https://www.youtube.com/@guitarcouple2024' },
  },
  {
    nameKey: 'community.artist4Name',
    nameFallback: '樓梯的熊 Stairs Bear',
    roleKey: 'community.artist4Role',
    roleFallback: '合作歌手・抖音 & IG 人氣創作者',
    descKey: 'community.artist4Desc',
    descFallback: '擁有抖音 11 萬＋、IG 8 萬粉絲的人氣音樂創作者，以溫暖歌聲與吉他彈唱圈粉無數。',
    modelKey: 'community.artist4Model',
    modelFallback: 'Premium 09 Special 全可可波羅',
    img: '/images/artists/stairs-bear.png',
    social: { ig: 'https://www.instagram.com/stairs_bear/', yt: 'https://www.youtube.com/@musicbear7.11' },
  },
];

const USER_GALLERY = [
  { user: 'D09 Wave', img: '/images/products/wave/d09-wave-front.png' },
  { user: 'L05 Light', img: '/images/products/light/l05-light-front.png' },
  { user: 'AC-EP Sun', img: '/images/products/sun/ac-ep-front.png' },
  { user: 'Manako III', img: '/images/products/uluru/manako-iii-front.png' },
];

export default function Community() {
  const { t } = useTranslation();
  return (
    <div className="bg-ayers-dark min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/products/sun/a06-autumn-sun-detail.jpg"
            alt={t('community.title', 'Ayers Artist Gallery & Community')}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ayers-dark via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif italic font-bold mb-6">{t('community.title', 'Ayers Artist Gallery & Community')}</h1>
            <p className="text-xl text-white/70 font-light tracking-wide">{t('community.subtitle', 'Hear the stories. Feel the sound. Join the family.')}</p>
          </motion.div>
        </div>
      </section>

      {/* Professional Artists */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold uppercase tracking-[0.3em] mb-16">{t('community.artistsTitle', 'Professional Artists & Performances')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {ARTISTS_DATA.map((artist, i) => (
              <motion.div
                key={artist.nameKey}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6">
                  <img
                    src={artist.img}
                    alt={t(artist.nameKey, artist.nameFallback)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                      <Play className="text-white fill-current ml-1" size={24} />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{t(artist.nameKey, artist.nameFallback)}</h3>
                <p className="text-xs text-ayers-gold font-semibold mb-1">{t(artist.roleKey, artist.roleFallback)}</p>
                <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">{t(artist.modelKey, artist.modelFallback)}</p>
                <p className="text-sm text-white/50 leading-relaxed mb-4">{t(artist.descKey, artist.descFallback)}</p>
                <div className="flex space-x-4">
                  {artist.social.ig && (
                    <a href={artist.social.ig} target="_blank" rel="noopener noreferrer">
                      <Instagram size={16} className="text-white/60 hover:text-white transition-colors" />
                    </a>
                  )}
                  {artist.social.yt && (
                    <a href={artist.social.yt} target="_blank" rel="noopener noreferrer">
                      <Youtube size={16} className="text-white/60 hover:text-white transition-colors" />
                    </a>
                  )}
                  {'music' in artist.social && artist.social.music && (
                    <Music size={16} className="text-white/60 hover:text-white transition-colors" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Gallery */}
      <section className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-[0.3em] mb-4">{t('community.galleryTitle', 'User Gallery: Your Ayers Story')}</h2>
              <p className="text-white/50">{t('community.galleryDesc', 'Share your moments with us! Tag @ayersguitar to be featured.')}</p>
            </div>
            <button className="bg-ayers-gold text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all">
              {t('community.uploadStory', 'Upload Your Story')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {USER_GALLERY.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-square rounded-2xl overflow-hidden"
              >
                <img
                  src={item.img}
                  alt={item.user}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <p className="text-xs font-bold mb-2">{item.user}</p>
                  <div className="flex space-x-4">
                    <button className="flex items-center space-x-1 text-[10px] uppercase font-bold tracking-widest hover:text-ayers-gold">
                      <Heart size={12} /> <span>{t('community.like', 'Like')}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-[10px] uppercase font-bold tracking-widest hover:text-ayers-gold">
                      <Share2 size={12} /> <span>{t('community.share', 'Share')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
