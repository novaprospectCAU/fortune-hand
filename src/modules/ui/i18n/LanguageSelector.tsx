/**
 * Language Selector Component
 */

import { useI18n } from './I18nContext';
import type { Language } from './translations';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18n();

  const handleChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => handleChange('en')}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          language === 'en'
            ? 'bg-primary text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => handleChange('ko')}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          language === 'ko'
            ? 'bg-primary text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        title="한국어"
      >
        KO
      </button>
    </div>
  );
}
