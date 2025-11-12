import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-apple py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-semibold text-text-primary">Store</span>
            </div>
            <p className="text-text-secondary text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('navigation.products')}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('navigation.about')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">{t('footer.customerService')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/help"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('footer.shippingInfo')}
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('footer.returns')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm"
                >
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-text-tertiary text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


