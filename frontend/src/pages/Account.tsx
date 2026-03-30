import { motion } from 'motion/react';
import { User, Package, Heart, Bookmark, MapPin, LogOut, ChevronRight, Save, Palette, Plus, Edit2, Trash2, Star, X, ShoppingCart, FileDown } from 'lucide-react';
import { GuitarSunLoader } from '@/src/components/guitar';
import { cn } from '@/src/lib/utils';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useLocalizedNavigate as useNavigate } from '@/src/lib/i18nRouting';
import { useAuth } from '@/src/contexts/AuthContext';
import orderService, { type Order } from '@/src/services/orderService';
import userService from '@/src/services/userService';
import addressService, { type Address, type AddressInput } from '@/src/services/addressService';
import { useWishlist } from '@/src/contexts/WishlistContext';
import { useCartContext } from '@/src/contexts/CartContext';
import { LocalizedLink as Link } from '@/src/lib/i18nRouting';

const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'account.statusPending',
  PROCESSING: 'account.statusProcessing',
  SHIPPED: 'account.statusShipped',
  DELIVERED: 'account.statusDelivered',
  CANCELLED: 'account.statusCancelled',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  PROCESSING: 'bg-blue-500/10 text-blue-600',
  SHIPPED: 'bg-indigo-500/10 text-indigo-600',
  DELIVERED: 'bg-green-500/10 text-green-600',
  CANCELLED: 'bg-red-500/10 text-red-600',
};

export default function Account() {
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const emptyAddressForm: AddressInput = {
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Taiwan',
    isDefault: false,
  };
  const [addressForm, setAddressForm] = useState<AddressInput>(emptyAddressForm);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Populate profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      setOrdersLoading(true);
      orderService.getUserOrders({ page: 1, limit: 5 })
        .then((res) => {
          if (res.success) {
            setOrders(res.data.orders);
          }
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  // Fetch addresses when addresses tab is active
  useEffect(() => {
    if (activeTab === 'addresses' && isAuthenticated) {
      fetchAddresses();
    }
  }, [activeTab, isAuthenticated]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await addressService.getAddresses();
      if (res.success) {
        setAddresses(res.data);
      }
    } catch {
      // address fetch failed silently — UI shows empty state
    } finally {
      setAddressesLoading(false);
    }
  };

  const openAddressModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        recipientName: address.recipientName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressForm(emptyAddressForm);
    }
    setAddressMessage(null);
    setShowAddressModal(true);
  };

  const handleAddressSave = async () => {
    setAddressSaving(true);
    setAddressMessage(null);
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress.id, addressForm);
      } else {
        await addressService.createAddress(addressForm);
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err: any) {
      setAddressMessage({ type: 'error', text: err.response?.data?.message || t('account.addressSaveFailed') });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleAddressDelete = async (id: string) => {
    try {
      await addressService.deleteAddress(id);
      fetchAddresses();
    } catch {
      // delete failed silently — address remains in list
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      fetchAddresses();
    } catch {
      // set default failed silently
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleTabClick = (id: string) => {
    if (id === 'logout') {
      handleLogout();
      return;
    }
    setActiveTab(id);
    setProfileMessage(null);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await userService.updateProfile(profileForm);
      if (res.success) {
        const updatedUser = (res as any).data || (res as any).user;
        if (updatedUser) {
          updateUser(updatedUser);
        }
        setProfileMessage({ type: 'success', text: t('account.profileUpdated') });
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.response?.data?.message || t('account.profileUpdateFailed') });
    } finally {
      setProfileSaving(false);
    }
  };

  const menuItems = [
    { id: 'profile', icon: <User size={20} />, label: t('account.myProfile') },
    { id: 'orders', icon: <Package size={20} />, label: t('account.orderHistory') },
    { id: 'wishlist', icon: <Bookmark size={20} />, label: t('account.wishlist', '願望清單') },
    { id: 'saved', icon: <Heart size={20} />, label: t('account.savedDesigns') },
    { id: 'addresses', icon: <MapPin size={20} />, label: t('account.addresses') },
    { id: 'logout', icon: <LogOut size={20} />, label: t('account.logOut') },
  ];

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="bg-ayers-cream min-h-screen py-12 flex items-center justify-center">
        <GuitarSunLoader size={32} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-ayers-cream min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group",
                  activeTab === item.id ? "bg-white shadow-md text-ayers-ink" : "text-ayers-ink/40 hover:bg-white/50 hover:text-ayers-ink"
                )}
              >
                <span className={cn(activeTab === item.id ? "text-ayers-gold" : "group-hover:text-ayers-gold transition-colors")}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-ayers-gold rounded-full" />}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="flex-grow space-y-12">
            {/* My Profile Tab */}
            {activeTab === 'profile' && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-serif italic font-bold mb-8">{t('account.myProfile')}</h2>
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-ayers-ink/5 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                        {t('account.firstName')}
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                        {t('account.lastName')}
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                      {t('account.email')}
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 bg-ayers-cream/50 text-ayers-ink/60 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                      {t('account.phone')}
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                      placeholder={t('account.phonePlaceholder')}
                    />
                  </div>

                  {profileMessage && (
                    <p className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      profileMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {profileMessage.text}
                    </p>
                  )}

                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="bg-ayers-dark text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all flex items-center disabled:opacity-50"
                  >
                    {profileSaving ? (
                      <GuitarSunLoader size={14} className="mr-2" />
                    ) : (
                      <Save size={14} className="mr-2" />
                    )}
                    {t('account.saveChanges')}
                  </button>
                </div>
              </motion.section>
            )}

            {/* Order History Tab */}
            {activeTab === 'orders' && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-serif italic font-bold mb-8">{t('account.orderHistory')}</h2>

                {ordersLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <GuitarSunLoader size={32} />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-ayers-ink/5 text-center">
                    <Package size={48} className="mx-auto text-ayers-ink/20 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-ayers-ink/40">{t('account.noOrders')}</p>
                    <p className="text-xs text-ayers-ink/40 mt-2">{t('account.noOrdersDesc')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order, i) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2rem] shadow-sm border border-ayers-ink/5 overflow-hidden"
                      >
                        <div className="h-2 bg-ayers-gold" />
                        <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                          <div className="space-y-4 flex-grow">
                            <div className="flex items-center space-x-4 flex-wrap gap-2">
                              <h3 className="text-xl font-bold">
                                Order #{order.id.substring(0, 8).toUpperCase()}
                              </h3>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                STATUS_COLORS[order.status] || 'bg-gray-500/10 text-gray-500'
                              )}>
                                {STATUS_LABEL_KEYS[order.status] ? t(STATUS_LABEL_KEYS[order.status]) : order.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold uppercase tracking-widest opacity-60">
                              <p>{t('account.date')}: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              <p>{t('account.total')}: NT$ {Number(order.totalAmount).toLocaleString()}</p>
                            </div>
                            {order.orderItems.length > 0 && (
                              <p className="text-xs text-ayers-ink/50">
                                {order.orderItems.map((item) => item.product?.name || 'Product').join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => orderService.downloadInvoice(order.id)}
                              className="p-3.5 rounded-full border border-ayers-ink/10 text-ayers-ink/40 hover:text-ayers-gold hover:border-ayers-gold/30 transition-all"
                              title={t('invoice.download', 'Download Invoice')}
                            >
                              <FileDown size={16} />
                            </button>
                            <button className="bg-ayers-dark text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all flex items-center">
                              {t('account.viewDetails')} <ChevronRight size={14} className="ml-2" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <WishlistTab />
            )}

            {/* Saved Designs Tab */}
            {activeTab === 'saved' && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-4xl font-serif italic font-bold mb-8">{t('account.savedDesigns')}</h2>
                <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-ayers-ink/5 text-center">
                  <div className="w-20 h-20 rounded-full bg-ayers-gold/10 flex items-center justify-center mx-auto mb-6">
                    <Palette size={32} className="text-ayers-gold" />
                  </div>
                  <p className="text-lg font-bold text-ayers-ink/70 mb-2">{t('account.noSavedDesigns')}</p>
                  <p className="text-sm text-ayers-ink/40 max-w-sm mx-auto leading-relaxed">
                    {t('account.noSavedDesignsDesc')}
                  </p>
                  <button
                    onClick={() => navigate('/customizer')}
                    className="mt-8 bg-ayers-dark text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all inline-flex items-center"
                  >
                    {t('account.openCustomLab')} <ChevronRight size={14} className="ml-2" />
                  </button>
                </div>
              </motion.section>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-serif italic font-bold">{t('account.addresses')}</h2>
                  <button
                    onClick={() => openAddressModal()}
                    className="bg-ayers-dark text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all flex items-center"
                  >
                    <Plus size={14} className="mr-2" />
                    {t('account.addAddress')}
                  </button>
                </div>

                {addressesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <GuitarSunLoader size={32} />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-ayers-ink/5 text-center">
                    <div className="w-20 h-20 rounded-full bg-ayers-gold/10 flex items-center justify-center mx-auto mb-6">
                      <MapPin size={32} className="text-ayers-gold" />
                    </div>
                    <p className="text-lg font-bold text-ayers-ink/70 mb-2">{t('account.noAddresses')}</p>
                    <p className="text-sm text-ayers-ink/40 max-w-sm mx-auto leading-relaxed">
                      {t('account.noAddressesDesc')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {addresses.map((addr, i) => (
                      <motion.div
                        key={addr.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2rem] shadow-sm border border-ayers-ink/5 overflow-hidden"
                      >
                        {addr.isDefault && <div className="h-2 bg-ayers-gold" />}
                        <div className="p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                          <div className="space-y-3 flex-grow">
                            <div className="flex items-center space-x-3 flex-wrap gap-2">
                              <h3 className="text-xl font-bold">{addr.recipientName}</h3>
                              {addr.isDefault && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-ayers-gold/10 text-ayers-gold">
                                  {t('account.defaultAddress')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">{addr.phone}</p>
                            <p className="text-sm text-ayers-ink/70 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 && <>, {addr.addressLine2}</>}
                              <br />
                              {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
                              <br />
                              {addr.country}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefault(addr.id)}
                                className="p-3 rounded-full border border-ayers-ink/10 text-ayers-ink/40 hover:text-ayers-gold hover:border-ayers-gold transition-all"
                                title={t('account.setAsDefault')}
                              >
                                <Star size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => openAddressModal(addr)}
                              className="p-3 rounded-full border border-ayers-ink/10 text-ayers-ink/40 hover:text-ayers-gold hover:border-ayers-gold transition-all"
                              title={t('account.editAddress')}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleAddressDelete(addr.id)}
                              className="p-3 rounded-full border border-ayers-ink/10 text-ayers-ink/40 hover:text-red-500 hover:border-red-500 transition-all"
                              title={t('account.deleteAddress')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Address Modal */}
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                      <div className="p-8 border-b border-ayers-ink/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold uppercase tracking-widest">
                          {editingAddress ? t('account.editAddress') : t('account.addAddress')}
                        </h3>
                        <button
                          onClick={() => setShowAddressModal(false)}
                          className="p-2 rounded-full hover:bg-ayers-cream transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                              {t('account.recipientName')}
                            </label>
                            <input
                              type="text"
                              value={addressForm.recipientName}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, recipientName: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                              {t('account.phone')}
                            </label>
                            <input
                              type="tel"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                            {t('account.addressLine1')}
                          </label>
                          <input
                            type="text"
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                            {t('account.addressLine2')}
                          </label>
                          <input
                            type="text"
                            value={addressForm.addressLine2}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                            placeholder={t('account.addressLine2Placeholder')}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                              {t('account.city')}
                            </label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                              {t('account.state')}
                            </label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                              {t('account.postalCode')}
                            </label>
                            <input
                              type="text"
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-ayers-ink/60 mb-2">
                              {t('account.country')}
                            </label>
                            <input
                              type="text"
                              value={addressForm.country}
                              onChange={(e) => setAddressForm((prev) => ({ ...prev, country: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl border border-ayers-ink/10 focus:outline-none focus:border-ayers-gold transition-colors text-sm"
                            />
                          </div>
                        </div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                            className="w-4 h-4 rounded border-ayers-ink/20 text-ayers-gold focus:ring-ayers-gold"
                          />
                          <span className="text-xs font-bold uppercase tracking-widest text-ayers-ink/60">
                            {t('account.setAsDefault')}
                          </span>
                        </label>

                        {addressMessage && (
                          <p className={cn(
                            "text-xs font-bold uppercase tracking-widest",
                            addressMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                          )}>
                            {addressMessage.text}
                          </p>
                        )}

                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => setShowAddressModal(false)}
                            className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-ayers-ink/10 hover:bg-ayers-cream transition-all"
                          >
                            {t('account.cancel')}
                          </button>
                          <button
                            onClick={handleAddressSave}
                            disabled={addressSaving}
                            className="bg-ayers-dark text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all flex items-center disabled:opacity-50"
                          >
                            {addressSaving ? (
                              <GuitarSunLoader size={14} className="mr-2" />
                            ) : (
                              <Save size={14} className="mr-2" />
                            )}
                            {t('account.saveAddress')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function WishlistTab() {
  const { t } = useTranslation();
  const { wishlistItems, isLoading, toggle } = useWishlist();
  const { addToCart } = useCartContext();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-20">
        <GuitarSunLoader size={32} />
      </motion.section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-4xl font-serif italic font-bold mb-8">{t('account.wishlist', '願望清單')}</h2>

      {wishlistItems.length === 0 ? (
        <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-ayers-ink/5 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <Bookmark size={32} className="text-red-400" />
          </div>
          <p className="text-lg font-bold text-ayers-ink/70 mb-2">
            {t('account.noWishlistItems', '願望清單是空的')}
          </p>
          <p className="text-sm text-ayers-ink/40 max-w-sm mx-auto leading-relaxed">
            {t('account.noWishlistItemsDesc', '收藏喜愛的吉他，方便日後查看。')}
          </p>
          <button
            onClick={() => navigate('/collections')}
            className="mt-8 bg-ayers-dark text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all inline-flex items-center"
          >
            {t('account.browseGuitars', '瀏覽吉他')} <ChevronRight size={14} className="ml-2" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-sm border border-ayers-ink/5 overflow-hidden group"
            >
              <Link to={`/product/${item.product.id}`}>
                <div className="aspect-[3/4] bg-[#1a1714] relative overflow-hidden">
                  <img
                    src={item.product.images?.[0] || '/images/placeholder.svg'}
                    alt={item.product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  {!item.product.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-widest">
                        {t('collections.soldOut', 'Sold Out')}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-5">
                <Link to={`/product/${item.product.id}`}>
                  <h3 className="text-sm font-serif italic font-bold text-ayers-ink group-hover:text-ayers-gold transition-colors mb-1">
                    {item.product.name}
                  </h3>
                </Link>
                {item.product.category && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ayers-gold/50 mb-2">
                    {item.product.category.name}
                  </p>
                )}
                <p className="text-sm font-bold text-ayers-ink/70 mb-4">
                  NT${Number(item.product.price).toLocaleString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addToCart({
                        productId: item.product.id,
                        name: item.product.name,
                        price: Number(item.product.price),
                        image: item.product.images?.[0] || '',
                      });
                    }}
                    disabled={item.product.stock <= 0}
                    className="flex-1 bg-ayers-ink text-white py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-ayers-gold transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={13} />
                    {t('collections.addToCart', '加入購物車')}
                  </button>
                  <button
                    onClick={() => toggle(item.product.id)}
                    className="p-2.5 rounded-xl border border-ayers-ink/10 text-ayers-ink/40 hover:text-red-500 hover:border-red-200 transition-all"
                    title={t('wishlist.remove', '從願望清單移除')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
