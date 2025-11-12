import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from '@/i18n/config';

/**
 * 本地化导航 Hook
 * 自动在路径前添加语言前缀
 */
export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { locale } = useParams<{ locale?: string }>();
  const { i18n } = useTranslation();

  /**
   * 获取当前语言代码
   */
  const getCurrentLocale = (): SupportedLanguage => {
    // 优先使用 URL 中的语言代码
    if (locale && SUPPORTED_LANGUAGES.includes(locale as SupportedLanguage)) {
      return locale as SupportedLanguage;
    }
    // 否则使用 i18n 的当前语言
    const currentLang = i18n.language as SupportedLanguage;
    return SUPPORTED_LANGUAGES.includes(currentLang) ? currentLang : DEFAULT_LANGUAGE;
  };

  /**
   * 本地化导航
   * @param path 路径（不需要包含语言前缀）
   * @param options 导航选项
   */
  const localizedNavigate = (
    path: string,
    options?: { replace?: boolean; state?: any }
  ) => {
    const currentLocale = getCurrentLocale();
    
    // 如果路径已经包含语言前缀，直接使用
    if (SUPPORTED_LANGUAGES.some(lang => path.startsWith(`/${lang}/`) || path === `/${lang}`)) {
      navigate(path, options);
      return;
    }

    // 移除开头的斜杠（如果有）
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // 默认语言（英文）可以不显示语言前缀
    const fullPath = currentLocale === DEFAULT_LANGUAGE
      ? `/${cleanPath}`
      : `/${currentLocale}/${cleanPath}`;

    navigate(fullPath, options);
  };

  /**
   * 切换语言并保持当前路径
   */
  const navigateWithLanguage = (newLang: SupportedLanguage, currentPath?: string) => {
    const path = currentPath || window.location.pathname;
    
    // 移除当前语言前缀
    let cleanPath = path;
    for (const lang of SUPPORTED_LANGUAGES) {
      if (path.startsWith(`/${lang}/`)) {
        cleanPath = path.slice(`/${lang}/`.length);
        break;
      } else if (path === `/${lang}`) {
        cleanPath = '';
        break;
      }
    }

    // 如果路径以 / 开头，移除它
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.slice(1);
    }

    // 构建新路径
    const newPath = newLang === DEFAULT_LANGUAGE
      ? (cleanPath ? `/${cleanPath}` : '/')
      : (cleanPath ? `/${newLang}/${cleanPath}` : `/${newLang}`);

    navigate(newPath, { replace: true });
  };

  return {
    navigate: localizedNavigate,
    navigateWithLanguage,
    currentLocale: getCurrentLocale(),
  };
};

