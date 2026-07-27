import React, { RefObject } from "react";
import { Globe, ChevronDown } from "lucide-react";

export interface LanguageOption {
  code: string;
  name: string;
}

export interface LanguageSelectorProps {
  idSuffix?: string;
  langRef?: RefObject<HTMLDivElement | null>;
  langOpen: boolean;
  setLangOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleLanguageChange: (langCode: string) => void;
  language: string;
  languages: LanguageOption[];
  t: (key: string) => string;
}

export default function LanguageSelector({
  idSuffix = "desktop",
  langRef,
  langOpen,
  setLangOpen,
  handleLanguageChange,
  language,
  languages,
  t,
}: LanguageSelectorProps) {
  const currentLang =
    languages.find((l) => l.code === language) || languages[0];

  return (
    <div className="language-selector" ref={idSuffix === "desktop" ? (langRef as any) : null}>
      <button
        type="button"
        className="btn-ghost language-selector-trigger"
        aria-haspopup="listbox"
        aria-expanded={langOpen}
        aria-label={t("common.selectLanguage")}
        title={t("common.selectLanguage")}
        onClick={() => setLangOpen((v) => !v)}
      >
        <Globe size={18} />
        <span className="language-selector-code">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {langOpen && (
        <ul
          className="language-selector-menu"
          role="listbox"
          aria-label={t("common.selectLanguage")}
        >
          {languages.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === language}
                className={`language-selector-option ${
                  lang.code === language ? "active" : ""
                }`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="language-selector-option-code">
                  {lang.code.toUpperCase()}
                </span>
                <span className="language-selector-option-name">
                  {lang.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}