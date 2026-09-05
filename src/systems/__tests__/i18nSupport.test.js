import { describe, expect, it } from 'vitest';
import en from '../../i18n/locales/en.json';
import { SUPPORTED_LANGS } from '../../i18n/languageBridge.js';
import zhCN from '../../i18n/locales/zh-CN.json';

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
