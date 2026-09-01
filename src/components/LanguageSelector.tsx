import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import type { LanguageOption } from '../types/i18n';

/**
 * LanguageSelector component props
 */
interface LanguageSelectorProps {
  /** Suffix to distinguish desktop/mobile selector instances */
  idSuffix?: string;
  /** Reference to the selector container element */
  langRef?: React.RefObject<HTMLDivElement>;
  /** Whether the language dropdown is open */
  langOpen: boolean;
  /** Callback to toggle language dropdown */
  setLangOpen: (_open: boolean | ((_prev: boolean) => boolean)) => void;
  /** Callback when language is changed */
  handleLanguageChange: (_code: string) => void;
  /** Current language code */
  language: string;
  /** Available language options */
  languages: LanguageOption[];
  /** Translation function */
  t: (_key: string) => string;
}

/**
 * LanguageSelector component
 * Displays a dropdown menu for selecting the application language with accessibility support
 *
 * @param {LanguageSelectorProps} props - Component props
 * @returns {React.ReactElement} Language selector dropdown
 */
export default function LanguageSelector({
  idSuffix = 'desktop',
  langRef,
  langOpen,
  setLangOpen,
  handleLanguageChange,
  language,
  languages,
  t,
}: LanguageSelectorProps): React.ReactElement {
  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="language-selector" ref={idSuffix === 'desktop' ? langRef : null}>
      <button
        type="button"
        className="btn-ghost language-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        aria-label={t('common.selectLanguage')}
        title={t('common.selectLanguage')}
        onClick={() => setLangOpen((v) => !v)}
      >
        <Globe size={18} />
        <span className="language-selector-code">{currentLang.code.toUpperCase()}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {langOpen && (
        <ul
          className="language-selector-menu"
          role="listbox"
          aria-label={t('common.selectLanguage')}
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === language}
                className={`language-selector-option ${lang.code === language ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="language-selector-option-code">{lang.code.toUpperCase()}</span>
                <span className="language-selector-option-name">{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
