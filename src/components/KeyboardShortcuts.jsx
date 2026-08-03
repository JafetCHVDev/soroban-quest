import React from 'react';
import { useTranslation } from '../i18n/useTranslation';
import './KeyboardShortcuts.css';

const SHORTCUT_SECTIONS = [
  {
    titleKey: 'shortcuts.sections.navigation',
    shortcuts: [
      { key: 'Ctrl/Cmd + 1', labelKey: 'shortcuts.nav.home' },
      { key: 'Ctrl/Cmd + 2', labelKey: 'shortcuts.nav.campaigns' },
      { key: 'Ctrl/Cmd + 3', labelKey: 'shortcuts.nav.missions' },
      { key: 'Ctrl/Cmd + 4', labelKey: 'shortcuts.nav.profile' },
      { key: 'Ctrl/Cmd + 5', labelKey: 'shortcuts.nav.journal' },
    ],
  },
  {
    titleKey: 'shortcuts.sections.editor',
    shortcuts: [
      { key: 'Ctrl/Cmd + Enter', labelKey: 'shortcuts.editor.runTests' },
      { key: 'Ctrl/Cmd + Shift + R', labelKey: 'shortcuts.editor.resetTemplate' },
      { key: 'Ctrl/Cmd + Shift + S', labelKey: 'shortcuts.editor.showSolution' },
      { key: 'Ctrl/Cmd + /', labelKey: 'shortcuts.editor.toggleHints' },
      { key: 'Ctrl/Cmd + Shift + H', labelKey: 'shortcuts.editor.toggleTheme' },
    ],
  },
  {
    titleKey: 'shortcuts.sections.general',
    shortcuts: [
      { key: '? or Ctrl/Cmd + K', labelKey: 'shortcuts.general.openModal' },
      { key: 'Escape', labelKey: 'shortcuts.general.closeModal' },
    ],
  },
];

export default function KeyboardShortcuts({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="shortcuts-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="shortcuts-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <div className="shortcuts-header-title">
            <span className="shortcuts-icon">⌨️</span>
            <h2>{t('shortcuts.title')}</h2>
          </div>
          <button
            type="button"
            className="shortcuts-close-btn"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <p className="shortcuts-subtitle">{t('shortcuts.subtitle')}</p>

        <div className="shortcuts-sections-grid">
          {SHORTCUT_SECTIONS.map((section, idx) => (
            <div key={idx} className="shortcuts-section">
              <h3 className="shortcuts-section-title">{t(section.titleKey)}</h3>
              <ul className="shortcuts-list">
                {section.shortcuts.map((item, sIdx) => (
                  <li key={sIdx} className="shortcut-item">
                    <span className="shortcut-label">{t(item.labelKey)}</span>
                    <kbd className="shortcut-keys">{item.key}</kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
