import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'desktop' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // 確保語言保存到 localStorage
    localStorage.setItem('i18nextLng', languageCode);
    setIsOpen(false);
  };

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 手機版樣式
  if (variant === 'mobile') {
    return (
      <div className="w-full">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors duration-200 rounded-lg"
          aria-label="Change language"
        >
          <div className="flex items-center space-x-3">
            <Globe size={20} />
            <span className="text-base font-medium">{currentLanguage.nativeName}</span>
          </div>
          <span className="text-sm text-text-tertiary">{currentLanguage.name}</span>
        </button>

        {isOpen && (
          <div className="mt-2 space-y-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${
                  i18n.language === language.code
                    ? 'bg-brand-blue/10 text-brand-blue font-medium'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{language.nativeName}</span>
                  <span className="text-sm text-text-tertiary">{language.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 桌面版樣式
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg hover:bg-gray-50"
        aria-label="Change language"
      >
        <Globe size={18} />
        <span className="hidden sm:inline text-sm font-medium">{currentLanguage.nativeName}</span>
        <span className="sm:hidden text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 ${
                    i18n.language === language.code
                      ? 'bg-brand-blue/10 text-brand-blue font-medium'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{language.nativeName}</span>
                    <span className="text-xs text-text-tertiary mt-0.5">{language.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

