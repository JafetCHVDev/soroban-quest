import { describe, expect, it } from 'vitest';
import { createMissionFromMarkdown, parseMissionMarkdown } from '../missionParser.js';
import { getMissionById } from '../missionLoader.js';

const markdown = `---
id: sample-mission
chapter: 2
order: 3
difficulty: intermediate
xp: 250
skills:
  - storage
  - auth
prereqs:
  - hello-soroban
title: Sample Mission
learningGoal: Parse a mission from Markdown
hints:
  - First hint
  - Second hint
---

# Sample Mission

Use **frontmatter** metadata and Markdown body content.
`;

describe('missionParser', () => {
  it('extracts frontmatter metadata and Markdown body content', () => {
    const mission = parseMissionMarkdown(markdown);

    expect(mission).toMatchObject({
      id: 'sample-mission',
      chapter: 2,
      order: 3,
      difficulty: 'intermediate',
      xpReward: 250,
      skills: ['storage', 'auth'],
      prereqs: ['hello-soroban'],
      title: 'Sample Mission',
      learningGoal: 'Parse a mission from Markdown',
      hints: ['First hint', 'Second hint'],
    });
    expect(mission.story).toContain('# Sample Mission');
    expect(mission.story).toContain('**frontmatter**');
  });

  it('creates a render-ready mission object with localized English content', () => {
    const mission = createMissionFromMarkdown(markdown, {
      template: 'contract template',
      checks: [{ type: 'balanced_braces' }],
    });

    expect(mission.i18n.en.title).toBe('Sample Mission');
    expect(mission.i18n.en.story).toContain('Use **frontmatter**');
    expect(mission.template).toBe('contract template');
    expect(mission.checks).toEqual([{ type: 'balanced_braces' }]);
  });

  it('loads the migrated hello-soroban mission from Markdown metadata', () => {
    const mission = getMissionById('hello-soroban', 'en');

    expect(mission.title).toBe('The First Contract');
    expect(mission.story).toContain('# The Awakening');
    expect(mission.learningGoal).toBe('Create your first Soroban smart contract with a hello function');
    expect(mission.skills).toEqual(['contract', 'contractimpl', 'Env', 'Symbol', 'Vec']);
    expect(mission.hints).toHaveLength(3);
  });
});
