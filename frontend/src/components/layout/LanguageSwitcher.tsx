import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from '@/i18n/config';
import { Globe } from 'lucide-react';

const languageNames: Record<SupportedLanguage, string> = {
  'en': 'English',
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  'ja': '日本語',
};

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  // 安全获取当前语言
  const currentLanguage = (i18n.language || DEFAULT_LANGUAGE) as SupportedLanguage;
  const displayLanguage = SUPPORTED_LANGUAGES.includes(currentLanguage) 
    ? currentLanguage 
    : DEFAULT_LANGUAGE;

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    try {
      await changeLanguage(lang);
      setIsOpen(false);
      
      // 更新 URL 路径
      const currentPath = window.location.pathname;
      // 移除当前语言前缀
      let pathWithoutLang = currentPath;
      for (const supportedLang of SUPPORTED_LANGUAGES) {
        if (currentPath.startsWith(`/${supportedLang}/`)) {
          pathWithoutLang = currentPath.slice(`/${supportedLang}/`.length);
          break;
        } else if (currentPath === `/${supportedLang}`) {
          pathWithoutLang = '';
          break;
        }
      }
      
      // 构建新路径
      const newPath = lang === DEFAULT_LANGUAGE
        ? (pathWithoutLang || '/')
        : `/${lang}${pathWithoutLang ? `/${pathWithoutLang}` : ''}`;
      
      navigate(newPath, { replace: true });
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg hover:bg-gray-100"
        aria-label="Change language"
        type="button"
      >
        <Globe size={18} className="flex-shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">
          {languageNames[displayLanguage] || 'English'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                  currentLanguage === lang
                    ? 'bg-brand-blue/10 text-brand-blue font-medium'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                {languageNames[lang]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

