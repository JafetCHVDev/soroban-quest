import { describe, expect, it, beforeEach } from 'vitest';
import {
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  getActiveLanguage,
  setActiveLanguage,
  onLanguageChange,
  type SupportedLang,
} from '../languageBridge';

describe('languageBridge', () => {
  beforeEach(() => {
    setActiveLanguage('en');
  });

  it('includes zh-CN in SUPPORTED_LANGS and DEFAULT_LANG is en', () => {
    expect(SUPPORTED_LANGS).toContain('zh-CN');
    expect(SUPPORTED_LANGS).toEqual(['en', 'es', 'fr', 'zh-CN', 'ja']);
    expect(DEFAULT_LANG).toBe('en');
  });

  it('accepts zh-CN at the type level and runtime level in setActiveLanguage', () => {
    const lang: SupportedLang = 'zh-CN';
    setActiveLanguage(lang);
    expect(getActiveLanguage()).toBe('zh-CN');
  });

  it('notifies listeners when switching to zh-CN', () => {
    const notifications: SupportedLang[] = [];
    const unsubscribe = onLanguageChange((changedLang) => {
      notifications.push(changedLang);
    });

    setActiveLanguage('zh-CN');
    expect(notifications).toEqual(['zh-CN']);

    unsubscribe();
    setActiveLanguage('ja');
    expect(notifications).toEqual(['zh-CN']);
  });
});
