import { describe, it, expect } from 'vitest';
import { getCertificateFilename } from '../CampaignCertificate.jsx';

describe('getCertificateFilename', () => {
  it('generates a clean slug for English campaign titles', () => {
    const filename = getCertificateFilename('Chapter 1: The Awakening', 'chapter-1-awakening');
    expect(filename).toBe('soroban-quest-certificate-chapter-1-the-awakening.png');
  });

  it('preserves normalized letters for accented Spanish campaign titles', () => {
    const filename = getCertificateFilename('Capítulo 1: El Despertar', 'chapter-1-awakening');
    expect(filename).toBe('soroban-quest-certificate-capitulo-1-el-despertar.png');
  });

  it('preserves normalized letters for accented French campaign titles', () => {
    const filename = getCertificateFilename("Chapitre 1 : L'Éveil", 'chapter-1-awakening');
    expect(filename).toBe('soroban-quest-certificate-chapitre-1-leveil.png');
  });

  it('falls back to campaignId when Japanese campaign title strips to empty or very short slug', () => {
    // Japanese title has only non-ASCII characters and a numeral "1"
    const filename = getCertificateFilename('チャプター1: 目覚めの刻', 'chapter-1-awakening');
    expect(filename).toBe('soroban-quest-certificate-chapter-1-awakening.png');
  });

  it('falls back to campaignId when Chinese campaign title strips to empty or very short slug', () => {
    const filename = getCertificateFilename('第1章：觉醒', 'chapter-1-awakening');
    expect(filename).toBe('soroban-quest-certificate-chapter-1-awakening.png');
  });

  it('falls back to "campaign" when both title and campaignId are empty', () => {
    const filename = getCertificateFilename('', '');
    expect(filename).toBe('soroban-quest-certificate-campaign.png');
  });
});
