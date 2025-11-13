import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { User, Mail, Phone, Calendar, MapPin, Package } from 'lucide-react';

const Profile: React.FC = () => {
  const { t } = useTranslation('common');
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container-apple py-12">
        <div className="text-center">
          <h2 className="heading-2 mb-4">{t('profile:pleaseLogin', { defaultValue: 'Please log in to view your profile' })}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container-apple py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="heading-1 mb-8">{t('profile:myProfile', { defaultValue: 'My Profile' })}</h1>

        <Card className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-text-secondary">{user.role}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail size={20} className="text-text-tertiary" />
              <div>
                <p className="text-sm text-text-tertiary">{t('profile:email', { defaultValue: 'Email' })}</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center space-x-4">
                <Phone size={20} className="text-text-tertiary" />
                <div>
                  <p className="text-sm text-text-tertiary">{t('profile:phone', { defaultValue: 'Phone' })}</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <Calendar size={20} className="text-text-tertiary" />
              <div>
                <p className="text-sm text-text-tertiary">{t('profile:memberSince', { defaultValue: 'Member since' })}</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <Button variant="outline" className="w-full">
              {t('common:buttons.edit')} {t('profile:myProfile', { defaultValue: 'Profile' })}
            </Button>
          </div>
        </Card>

        {/* 快捷功能 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Link to="/user/addresses">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin size={24} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">地址管理</h3>
                  <p className="text-sm text-gray-600">管理收货地址</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/user/orders">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package size={24} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">我的订单</h3>
                  <p className="text-sm text-gray-600">查看订单历史</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;


