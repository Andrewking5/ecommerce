import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Phone, Navigation, Globe, X, Map, ExternalLink } from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import { useLocalizedNavigate } from '@/src/lib/i18nRouting';

interface Dealer {
  name: string;
  address: string;
  tel: string;
  region: string;
  country: string;
  img: string;
  web: string;
  lat: number;
  lng: number;
}

const REGIONS = [
  { id: 'all', label: '全部' },
  { id: 'nearby', label: '離我最近' },
  { id: '台北', label: '台北' },
  { id: '新北', label: '新北' },
  { id: '桃園', label: '桃園' },
  { id: '新竹', label: '新竹' },
  { id: '苗栗', label: '苗栗' },
  { id: '台中', label: '台中' },
  { id: '雲林', label: '雲林' },
  { id: '台南', label: '台南' },
  { id: '高雄', label: '高雄' },
  { id: '花東宜蘭', label: '花東宜蘭' },
  { id: '澎湖', label: '澎湖' },
  { id: '海外', label: '海外' },
];

const FLAGSHIP = {
  name: 'Ayers 旗艦店',
  address: '10491 台北市中山區建國北路二段139號13樓之1',
  tel: '(02) 2505-8856',
  email: 'service@ayersguitars.com',
  line: '@868lgkhc',
  hours: '週一至週五 10:00-12:00, 14:00-19:00',
  note: '來店試琴/客製諮詢請先來電預約',
  lat: 25.0580,
  lng: 121.5370,
};

const DEALERS: Dealer[] = [
  { name: "91's Base 海馬音樂基地", address: '台北市忠孝東路四段170巷6弄10號B1', tel: '(02)2568-1191', region: '台北', country: 'TW', img: '/images/dealers/d-img-01.jpg', lat: 25.0415, lng: 121.5530, web: 'https://linktr.ee/91sbase' },
  { name: '他，在旅行 Guitar to Go', address: '台北市和平東路二段96巷8號B1', tel: '(02)8732-1497', region: '台北', country: 'TW', img: '/images/dealers/d-img-02.jpg', lat: 25.0260, lng: 121.5410, web: 'https://rink.cc/1mg7y' },
  { name: '台北原聲吉他專門店', address: '台北市忠孝東路三段216巷3弄3號', tel: '(02)2731-8777', region: '台北', country: 'TW', img: '/images/dealers/d-img-03.jpg', lat: 25.0420, lng: 121.5440, web: 'http://acousticguitar.looker.tw/' },
  { name: '金聲樂器 Kinstar Music', address: '台北市忠孝東路二段46號1F', tel: '(02)2357-6761', region: '台北', country: 'TW', img: '/images/dealers/d-img-04.jpg', lat: 25.0440, lng: 121.5330, web: 'https://www.kinstar.com.tw/' },
  { name: '世品樂器 Andrews Guitar Shop', address: '台北市羅斯福路三段283巷14弄6號B1', tel: '(02)2362-5108', region: '台北', country: 'TW', img: '/images/dealers/d-img-05.jpg', lat: 25.0195, lng: 121.5310, web: 'https://www.facebook.com/AndrewsGuitarShop/' },
  { name: '吉他好朋友', address: '台北市羅斯福路三段140巷5號', tel: '(02)7756-3979', region: '台北', country: 'TW', img: '/images/dealers/d-img-06.jpg', lat: 25.0210, lng: 121.5310, web: 'https://www.myguitarfriend.com/' },
  { name: '拯救音樂 Saving Music', address: '台北市羅斯福路四段52巷16弄2號3F', tel: '(02)2366-0159', region: '台北', country: 'TW', img: '/images/dealers/d-img-38.jpg', lat: 25.0130, lng: 121.5340, web: 'https://savingmusic.com.tw/' },
  { name: '奇想樂器 台北吉他專門店', address: '台北市復興南路一段79巷4弄2號', tel: '(02)2382-0201', region: '台北', country: 'TW', img: '/images/dealers/d-img-39.jpg', lat: 25.0430, lng: 121.5440, web: 'https://www.fantasymusic.com.tw/' },
  { name: '查克樂器行', address: '基隆市仁愛區愛三路69號', tel: '(02)2424-2217', region: '台北', country: 'TW', img: '/images/dealers/d-img-43.jpg', lat: 25.1290, lng: 121.7410, web: 'https://www.facebook.com/ZAKKMUSIC/' },
  { name: '板橋宛伶樂器', address: '新北市板橋區南門街14號2F', tel: '(02)2968-9923', region: '新北', country: 'TW', img: '/images/dealers/d-img-07.jpg', lat: 25.0120, lng: 121.4590, web: 'https://wanlingmusic.shoplineapp.com/' },
  { name: '八里昕典音樂社', address: '新北市八里區華峰一街20號', tel: '(02)2619-1556', region: '新北', country: 'TW', img: '/images/dealers/d-img-08.jpg', lat: 25.1350, lng: 121.4010, web: 'https://www.facebook.com/SinDianMusic' },
  { name: '松本樂器行', address: '新北市三峽區大觀路68.66.62號', tel: '(02)8672-5691', region: '新北', country: 'TW', img: '/images/dealers/d-img-40.jpg', lat: 24.9340, lng: 121.3690, web: 'https://matsumotomusic.com/' },
  { name: '創造音樂 CreatingMusicStudio', address: '新北市三峽區弘園街53號', tel: '0987-532-962', region: '新北', country: 'TW', img: '/images/dealers/d-img-09.jpg', lat: 24.9370, lng: 121.3720, web: 'https://www.facebook.com/creatingmusictw/' },
  { name: 'YA! 玩音樂', address: '新北市三峽區大德路216號', tel: '0986-831-208', region: '新北', country: 'TW', img: '/images/dealers/d-img-10.jpg', lat: 24.9350, lng: 121.3710, web: 'https://www.facebook.com/ya.ukulele' },
  { name: '五線譜樂器行', address: '新北市蘆洲區民權路137巷', tel: '(02)8283-3576', region: '新北', country: 'TW', img: '/images/dealers/d-img-11.jpg', lat: 25.0850, lng: 121.4730, web: 'https://www.facebook.com/groups/1158039844236131/' },
  { name: '名曲堂樂器', address: '新北市新莊區中正路175號', tel: '(02)2991-2817', region: '新北', country: 'TW', img: '/images/dealers/d-img-12.jpg', lat: 25.0360, lng: 121.4530, web: '' },
  { name: '金聲樂器 林口龜山店', address: '新北市林口區仁愛二路102號', tel: '0932-008-231', region: '新北', country: 'TW', img: '/images/dealers/d-img-13.jpg', lat: 25.0780, lng: 121.3920, web: 'https://www.kinstar.com.tw/' },
  { name: '弦音木吉他', address: '桃園市桃園區民生路162號2F', tel: '(03)347-1239', region: '桃園', country: 'TW', img: '/images/dealers/d-img-14.jpg', lat: 24.9930, lng: 121.3130, web: 'https://www.facebook.com/open.strings/' },
  { name: 'CROSS 流行音樂中心', address: '桃園市桃園區天祥三街55號1F', tel: '(03)356-1663', region: '桃園', country: 'TW', img: '/images/dealers/d-img-15.jpg', lat: 24.9960, lng: 121.3050, web: 'https://www.facebook.com/CrossMusicCenter/' },
  { name: '柏林樂器', address: '桃園市大溪區民權東路169號', tel: '(03)388-0209', region: '桃園', country: 'TW', img: '/images/dealers/d-img-16.jpg', lat: 24.8810, lng: 121.2870, web: 'https://www.facebook.com/berlinmusic1220/' },
  { name: '新竹陸比音樂樂器行', address: '新竹縣竹北市科大一路116號', tel: '(03)657-5269', region: '新竹', country: 'TW', img: '/images/dealers/d-img-17.jpg', lat: 24.8280, lng: 121.0120, web: 'http://www.lubymusicshop.com/' },
  { name: '茗詮樂器音樂中心', address: '新竹縣竹北市中華路393號', tel: '(03)656-3888', region: '新竹', country: 'TW', img: '/images/dealers/d-img-18.jpg', lat: 24.8310, lng: 121.0130, web: 'https://www.facebook.com/mich036563888/' },
  { name: '新竹音樂夢想屋', address: '新竹市東區經國路一段379巷32號1F', tel: '0920-125-812', region: '新竹', country: 'TW', img: '/images/dealers/d-img-19.jpg', lat: 24.8050, lng: 120.9720, web: '' },
  { name: '沐垶音樂', address: '新竹縣竹北市文義街65號', tel: '(03)657-0295', region: '新竹', country: 'TW', img: '/images/dealers/d-img-41.jpg', lat: 24.8290, lng: 121.0100, web: 'https://www.facebook.com/jupiter.musictw/' },
  { name: 'ERA Music 艾爾樂器', address: '苗栗市自治路422號', tel: '(03)736-6536', region: '苗栗', country: 'TW', img: '/images/dealers/d-img-20.jpg', lat: 24.5650, lng: 120.8200, web: 'https://www.facebook.com/eramusicml/' },
  { name: '鳴流樂器', address: '苗栗縣頭份市武昌街35號3F', tel: '0988-515-445', region: '苗栗', country: 'TW', img: '/images/dealers/d-img-21.jpg', lat: 24.6870, lng: 120.9020, web: 'https://realsound.tw/agshop/about-us/' },
  { name: '吉他救星-木吉他專門店', address: '台中市大里區西榮路99號', tel: '0916-152-547', region: '台中', country: 'TW', img: '/images/dealers/d-img-22.jpg', lat: 24.1060, lng: 120.6870, web: 'https://www.facebook.com/BaiTone/' },
  { name: '音拓樂器', address: '台中市北屯區大連路二段239號', tel: '(04)2247-8463', region: '台中', country: 'TW', img: '/images/dealers/d-img-23.jpg', lat: 24.1730, lng: 120.6890, web: 'https://lin.ee/IWvqSLK' },
  { name: '吉他好朋友 台中分館', address: '台中市北區中華路二段120-3號B1', tel: '(04)2208-0046', region: '台中', country: 'TW', img: '/images/dealers/d-img-24.jpg', lat: 24.1520, lng: 120.6780, web: 'https://www.myguitarfriend.com/' },
  { name: '補給站樂器', address: '台中市豐原區向陽路271號', tel: '(04)2527-1633', region: '台中', country: 'TW', img: '/images/dealers/d-img-25.jpg', lat: 24.2540, lng: 120.7180, web: 'https://www.facebook.com/supplymusic7777/' },
  { name: '立昇樂器', address: '雲林縣虎尾鎮中山路38號', tel: '(05)631-1369', region: '雲林', country: 'TW', img: '/images/dealers/d-img-26.jpg', lat: 23.7080, lng: 120.4320, web: 'https://www.listenmusical.com/' },
  { name: '高雄名人樂器 明誠店', address: '高雄市左營區明誠二路360號', tel: '(07)550-6747', region: '高雄', country: 'TW', img: '/images/dealers/d-img-27.jpg', lat: 22.6650, lng: 120.3050, web: 'https://linktr.ee/red5506747' },
  { name: '民揚樂器-岡山店 Music On', address: '高雄市岡山區民有路32號', tel: '(07)622-1195', region: '高雄', country: 'TW', img: '/images/dealers/d-img-28.jpg', lat: 22.7960, lng: 120.2960, web: 'http://www.m-y.com.tw/' },
  { name: '緻琴家音樂工作室', address: '高雄市左營區南屏路211號', tel: '0928-034-390', region: '高雄', country: 'TW', img: '/images/dealers/d-img-29.jpg', lat: 22.6620, lng: 120.3010, web: 'https://www.facebook.com/HsuanChengLuStudio' },
  { name: '諾亞樂器', address: '台南市中西區和緯路四段283號', tel: '(06)358-6915', region: '台南', country: 'TW', img: '/images/dealers/d-img-30.jpg', lat: 22.9990, lng: 120.1940, web: '' },
  { name: '愉耳樂器 YourMusic', address: '台南市永康區中華路632號', tel: '(06)303-9030', region: '台南', country: 'TW', img: '/images/dealers/d-img-31.jpg', lat: 23.0250, lng: 120.2540, web: 'https://www.yourmusic.com.tw/' },
  { name: '又昇樂器', address: '台南市東區崇學路271-3號', tel: '(06)335-5701', region: '台南', country: 'TW', img: '/images/dealers/d-img-32.jpg', lat: 22.9830, lng: 120.2230, web: 'https://www.risemusicgear.com/' },
  { name: '合音樂器行 HERE iN Music', address: '台南市永康區永大路二段1258號', tel: '(06)232-7881', region: '台南', country: 'TW', img: '/images/dealers/d-img-33.jpg', lat: 23.0230, lng: 120.2660, web: 'https://www.facebook.com/HereInMusic/' },
  { name: '唐米音樂吉他工作室', address: '台南市東區崇善十四街1巷11號', tel: '0975-566-310', region: '台南', country: 'TW', img: '/images/dealers/d-img-34.jpg', lat: 22.9770, lng: 120.2280, web: 'https://www.instagram.com/tangmi_music' },
  { name: '好牛吉他樂器', address: '宜蘭縣羅東鎮林森路123號', tel: '0980-895-882', region: '花東宜蘭', country: 'TW', img: '/images/dealers/d-img-35.jpg', lat: 24.6770, lng: 121.7670, web: 'https://www.facebook.com/monnewguitar/' },
  { name: '小宇宙音樂生活館', address: '花蓮市仁愛街25-4號', tel: '(03)835-1300', region: '花東宜蘭', country: 'TW', img: '/images/dealers/d-img-36.jpg', lat: 23.9760, lng: 121.6040, web: 'https://www.facebook.com/CosmosGuitarUkulele/' },
  { name: '爬格子樂器行', address: '澎湖縣馬公市中華路112-1號', tel: '(06)927-9959', region: '澎湖', country: 'TW', img: '/images/dealers/d-img-42.jpg', lat: 23.5660, lng: 119.5770, web: 'https://www.facebook.com/music9959/' },
  { name: '香港原音 AMHK', address: 'Rm 503, 335-339 Queen\'s Rd W, Sai Ying Pun, Hong Kong', tel: '+852-6700-3491', region: '海外', country: 'HK', img: '/images/dealers/d-img-37.jpg', lat: 22.2870, lng: 114.1370, web: 'https://amhk.shop/' },
  { name: 'Ayers Japan', address: 'Shizuoka, Hamamatsu, Wagocho 987-5, Japan', tel: 'niioka@skysonic.net', region: '海外', country: 'JP', img: '/images/dealers/dai-picture.jpg', lat: 34.7100, lng: 137.7260, web: 'https://www.ayersjp.co/' },
];

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openGoogleMapsNav(lat: number, lng: number) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
}

export default function StoreLocator() {
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [mapDealer, setMapDealer] = useState<Dealer | null>(null);
  const [showMap, setShowMap] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(t('storeLocator.geoNotSupported', '您的瀏覽器不支援定位功能'));
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setActiveRegion('nearby');
        setLocating(false);
      },
      () => {
        setLocationError(t('storeLocator.geoError', '無法取得您的位置，請確認已開啟定位權限'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [t]);

  const openDealerMap = (dealer: Dealer) => {
    setMapDealer(dealer);
    setShowMap(true);
  };

  const filteredDealers = useMemo(() => {
    let result = [...DEALERS];
    if (activeRegion !== 'all' && activeRegion !== 'nearby') {
      result = result.filter(d => d.region === activeRegion);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.address.toLowerCase().includes(q));
    }
    if (userLocation) {
      const withDist = result.map(d => ({
        ...d,
        distance: getDistanceKm(userLocation.lat, userLocation.lng, d.lat, d.lng),
      }));
      if (activeRegion === 'nearby') withDist.sort((a, b) => a.distance - b.distance);
      return withDist;
    }
    return result.map(d => ({ ...d, distance: null as number | null }));
  }, [searchQuery, activeRegion, userLocation]);

  return (
    <div className="bg-ayers-cream min-h-screen">
      {/* Hero */}
      <div className="bg-ayers-dark py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-ayers-gold mb-4">Distribution Channels</p>
            <h1 className="text-4xl md:text-6xl font-serif italic font-bold text-white mb-4">{t('storeLocator.title')}</h1>
            <p className="text-white/50 max-w-xl mx-auto text-sm">
              {t('storeLocator.subtitle', '全台 44 間授權經銷商，找到離你最近的 Ayers 體驗據點。')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-6">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-lg border border-ayers-ink/5 flex-grow">
            <Search size={18} className="text-ayers-ink/30 flex-shrink-0" />
            <input
              type="text"
              placeholder={t('storeLocator.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-grow focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={requestLocation}
            disabled={locating}
            className="bg-ayers-gold text-white p-4 rounded-2xl hover:bg-opacity-90 transition-all flex-shrink-0 shadow-lg disabled:opacity-50"
            title={t('storeLocator.locateMe', '定位我的位置')}
          >
            {locating ? <GuitarSunLoader size={18} /> : <Navigation size={18} />}
          </button>
        </div>
        {locationError && <p className="text-red-500 text-xs mt-2 text-center">{locationError}</p>}
        {userLocation && !locationError && (
          <p className="text-ayers-gold text-xs mt-2 text-center">{t('storeLocator.locationFound', '已取得您的位置')}</p>
        )}
      </div>

      {/* Region Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-wrap justify-center gap-2">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => {
                if (region.id === 'nearby' && !userLocation) { requestLocation(); return; }
                setActiveRegion(region.id);
              }}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeRegion === region.id
                  ? 'bg-ayers-gold text-white shadow-md'
                  : region.id === 'nearby'
                  ? 'bg-white border border-ayers-gold/30 text-ayers-gold hover:bg-ayers-gold hover:text-white'
                  : 'bg-white border border-ayers-ink/10 text-ayers-ink/60 hover:border-ayers-gold hover:text-ayers-gold'
              }`}
            >
              {region.id === 'nearby' ? (
                <span className="flex items-center gap-1"><Navigation size={9} />{region.label}</span>
              ) : (
                <>
                  {region.label}
                  {!['all', 'nearby'].includes(region.id) && (
                    <span className="ml-1 opacity-50">({DEALERS.filter(d => d.region === region.id).length})</span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Flagship Store */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ayers-dark text-white rounded-[2rem] p-8 md:p-10 mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-ayers-gold/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-ayers-gold" size={18} />
                </div>
                <div>
                  <span className="text-[8px] bg-ayers-gold px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Flagship</span>
                  <h2 className="text-xl font-serif italic font-bold mt-1">{FLAGSHIP.name}</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p className="flex items-start gap-2 text-white/60"><MapPin size={14} className="mt-0.5 flex-shrink-0 text-ayers-gold" />{FLAGSHIP.address}</p>
                <p className="flex items-center gap-2 text-white/60"><Phone size={14} className="flex-shrink-0 text-ayers-gold" />{FLAGSHIP.tel}</p>
                <p className="flex items-center gap-2 text-white/60"><Globe size={14} className="flex-shrink-0 text-ayers-gold" />LINE: {FLAGSHIP.line}</p>
                <p className="flex items-center gap-2 text-white/50 text-xs">{FLAGSHIP.hours} — <span className="text-ayers-gold">{FLAGSHIP.note}</span></p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <button onClick={() => openDealerMap({ name: FLAGSHIP.name, address: FLAGSHIP.address, tel: FLAGSHIP.tel, region: '台北', country: 'TW', img: '', lat: FLAGSHIP.lat, lng: FLAGSHIP.lng })} className="border border-white/20 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-ayers-gold hover:text-ayers-gold transition-all flex items-center gap-1.5">
                <Map size={12} /> {t('storeLocator.viewOnMap', '地圖')}
              </button>
              <button onClick={() => openGoogleMapsNav(FLAGSHIP.lat, FLAGSHIP.lng)} className="bg-ayers-gold text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-1.5">
                <Navigation size={12} /> {t('storeLocator.navigate', '導航')}
              </button>
              <button onClick={() => navigate('/contact', { state: { subject: 'general' } })} className="border border-white/20 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-ayers-gold hover:text-ayers-gold transition-all">
                {t('storeLocator.bookConsultation')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dealer Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('storeLocator.globalPresence')}</h2>
          <span className="text-sm text-ayers-ink/40">{filteredDealers.length} {t('storeLocator.stores', '間門市')}</span>
        </div>

        {/* Dealer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDealers.map((dealer, i) => (
            <motion.div
              key={dealer.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-ayers-ink/5 hover:shadow-xl hover:border-ayers-gold/20 transition-all group"
            >
              {/* Image - click to visit website */}
              <a
                href={dealer.web || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`block aspect-[16/10] overflow-hidden relative ${dealer.web ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={(e) => { if (!dealer.web) e.preventDefault(); }}
              >
                <img
                  src={dealer.img}
                  alt={dealer.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {dealer.distance !== null && (
                  <span className="absolute top-3 right-3 bg-ayers-dark/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {dealer.distance < 1 ? `${Math.round(dealer.distance * 1000)}m` : `${dealer.distance.toFixed(1)} km`}
                  </span>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-ayers-ink/70 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {dealer.region}
                </span>
                {dealer.web && (
                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-ayers-gold text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ExternalLink size={9} /> {t('storeLocator.visitSite', '官網')}
                  </span>
                )}
              </a>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-bold text-sm mb-2 group-hover:text-ayers-gold transition-colors">{dealer.name}</h3>
                <p className="text-xs text-ayers-ink/40 flex items-start gap-1.5 mb-3 leading-relaxed">
                  <MapPin size={11} className="mt-0.5 flex-shrink-0" />{dealer.address}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-ayers-ink/5">
                  <a
                    href={`tel:${dealer.tel.replace(/[^+\d]/g, '')}`}
                    className="text-xs text-ayers-ink/50 hover:text-ayers-gold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone size={11} />{dealer.tel}
                  </a>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDealerMap(dealer)}
                      className="text-[10px] text-ayers-ink/40 hover:text-ayers-gold flex items-center gap-1 transition-colors"
                      title={t('storeLocator.viewOnMap', '在地圖上查看')}
                    >
                      <Map size={11} />
                    </button>
                    <button
                      onClick={() => openGoogleMapsNav(dealer.lat, dealer.lng)}
                      className="bg-ayers-gold/10 text-ayers-gold hover:bg-ayers-gold hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Navigation size={10} />{t('storeLocator.navigate', '導航')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDealers.length === 0 && (
          <div className="text-center py-20 text-ayers-ink/30">
            <MapPin size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">{t('storeLocator.noResults', '找不到符合的門市')}</p>
          </div>
        )}
      </div>

      {/* Floating Map Button */}
      <button
        onClick={() => { setMapDealer(null); setShowMap(true); }}
        className="fixed bottom-8 right-8 bg-ayers-dark text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-ayers-gold transition-colors z-40"
        title={t('storeLocator.openMap', '開啟地圖')}
      >
        <Map size={22} />
      </button>

      {/* Map Overlay */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full md:w-[80vw] md:max-w-4xl h-[75vh] md:h-[70vh] md:rounded-3xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Map Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-ayers-ink/10">
                <div>
                  <h3 className="font-bold text-sm">
                    {mapDealer ? mapDealer.name : t('storeLocator.flagshipStore', 'Ayers 旗艦店')}
                  </h3>
                  <p className="text-[10px] text-ayers-ink/50">
                    {mapDealer ? mapDealer.address : FLAGSHIP.address}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openGoogleMapsNav(
                      mapDealer?.lat ?? FLAGSHIP.lat,
                      mapDealer?.lng ?? FLAGSHIP.lng
                    )}
                    className="bg-ayers-gold text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-opacity-90"
                  >
                    <Navigation size={11} /> {t('storeLocator.navigate', '導航')}
                  </button>
                  <button
                    onClick={() => setShowMap(false)}
                    className="w-9 h-9 rounded-full bg-ayers-ink/5 flex items-center justify-center hover:bg-ayers-ink/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              {/* Map */}
              <iframe
                title="Dealer Map"
                src={`https://www.google.com/maps?q=${mapDealer?.lat ?? FLAGSHIP.lat},${mapDealer?.lng ?? FLAGSHIP.lng}&z=16&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
