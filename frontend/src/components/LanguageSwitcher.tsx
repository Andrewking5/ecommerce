import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { languages } from '@/src/i18n/config';
import { useLanguagePrefix, stripLangPrefix } from '@/src/lib/i18nRouting';

interface LanguageSwitcherProps {
  isDark?: boolean;
}

export default function LanguageSwitcher({ isDark = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = useLanguagePrefix();

  const current = languages.find((l) => l.code === i18n.language) ?? languages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (langCode: string) => {
    // Get the current path without lang prefix, then rebuild with new lang
    const strippedPath = stripLangPrefix(location.pathname);
    const newPath = `/${langCode}${strippedPath}${location.search}${location.hash}`;
    i18n.changeLanguage(langCode);
    navigate(newPath);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center space-x-1.5 hover:opacity-70 transition-opacity text-sm",
          isDark ? "text-white" : "text-ayers-ink"
        )}
        aria-label="Switch language"
      >
        <Globe size={18} />
        <span className="text-xs font-medium tracking-wide">{current.short}</span>
      </button>

      {open && (
        <div className={cn(
          "absolute right-0 top-full mt-2 py-1 rounded-lg shadow-xl border min-w-[140px] z-50 animate-in fade-in slide-in-from-top-2 duration-150",
          isDark
            ? "bg-ayers-dark border-white/10"
            : "bg-white border-ayers-ink/10"
        )}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between",
                isDark
                  ? "hover:bg-white/10 text-white/80 hover:text-white"
                  : "hover:bg-ayers-ink/5 text-ayers-ink/70 hover:text-ayers-ink",
                currentLang === lang.code && "font-semibold text-ayers-gold"
              )}
            >
              <span>{lang.label}</span>
              <span className="text-[10px] opacity-50">{lang.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
