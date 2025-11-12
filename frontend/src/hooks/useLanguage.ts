import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type SupportedLanguage } from '@/i18n/config';
import { userApi } from '@/services/users';

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();

  /**
   * 更改语言
   */
  const changeLanguage = async (lang: SupportedLanguage) => {
    // 验证语言代码
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Unsupported language: ${lang}, falling back to ${DEFAULT_LANGUAGE}`);
      lang = DEFAULT_LANGUAGE;
    }

    // 更新 i18n
    await i18n.changeLanguage(lang);

    // 如果用户已登录，同步到后端
    if (isAuthenticated && user) {
      try {
        await userApi.updateLanguage({ preferredLanguage: lang });
      } catch (error) {
        console.error('Failed to update language preference:', error);
        // 不显示错误提示，因为本地已更新
      }
    }
  };

  /**
   * 初始化语言（从用户偏好或浏览器设置）
   */
  const initializeLanguage = async () => {
    // 优先级：
    // 1. 用户账户中的语言偏好（如果已登录）
    // 2. localStorage 中的语言偏好
    // 3. 浏览器语言设置
    // 4. 默认语言

    if (isAuthenticated && user?.preferredLanguage) {
      const userLang = user.preferredLanguage as SupportedLanguage;
      if (SUPPORTED_LANGUAGES.includes(userLang)) {
        await i18n.changeLanguage(userLang);
        return;
      }
    }

    // i18next 的 LanguageDetector 会自动处理 localStorage 和浏览器语言
    // 这里只需要确保语言是支持的
    const currentLang = i18n.language as SupportedLanguage;
    if (!SUPPORTED_LANGUAGES.includes(currentLang)) {
      await i18n.changeLanguage(DEFAULT_LANGUAGE);
    }
  };

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
    initializeLanguage,
  };
};

