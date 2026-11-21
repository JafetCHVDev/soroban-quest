/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import en from '../../i18n/locales/en.json';
import { SUPPORTED_LANGS } from '../../i18n/languageBridge.js';
import zhCN from '../../i18n/locales/zh-CN.json';
import ja from '../../i18n/locales/ja.json';
import React, { useContext } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LanguageContext, LanguageProvider } from '../../i18n/index';

function getLeafKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? getLeafKeys(child, path)
      : [path];
  });
}

function getTranslationKeys(locale) {
  return getLeafKeys(locale).filter((key) => !key.startsWith('languages.'));
}

describe('zh-CN localization support', () => {
  it('registers the locale in the supported language list', () => {
    expect(SUPPORTED_LANGS).toContain('zh-CN');
  });

  it('loads the Chinese locale file with the expected structure', () => {
    expect(zhCN).toBeTruthy();
    expect(zhCN.languages).toBeTruthy();
    expect(zhCN.languages['zh-CN']).toBe('简体中文');
    expect(typeof zhCN.common.selectLanguage).toBe('string');
  });

  it('matches the English locale leaf-key structure', () => {
    expect(getTranslationKeys(zhCN).sort()).toEqual(getTranslationKeys(en).sort());
  });
});

describe('Japanese localization support', () => {
  it('registers ja, exposes 日本語, and persists a Japanese selection', () => {
    expect(SUPPORTED_LANGS).toContain('ja');
    expect(ja.languages.ja).toBe('日本語');

    function LanguageOptions() {
      const { language, languages, setLanguage } = useContext(LanguageContext);
      return React.createElement(
        'div',
        null,
        React.createElement('span', { 'data-testid': 'active-language' }, language),
        React.createElement(
          'ul',
          null,
          languages.map((option) =>
            React.createElement('li', { key: option.code }, option.name),
          ),
        ),
        React.createElement(
          'button',
          { type: 'button', onClick: () => setLanguage('ja') },
          'select Japanese',
        ),
      );
    }

    render(React.createElement(LanguageProvider, null, React.createElement(LanguageOptions)));
    expect(screen.getByText('日本語')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'select Japanese' }));
    expect(screen.getByTestId('active-language').textContent).toBe('ja');
    expect(localStorage.getItem('soroban_quest_lang')).toBe('ja');
  });
});
