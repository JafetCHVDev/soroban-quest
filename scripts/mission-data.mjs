import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { parseMissionMarkdown } from '../src/systems/missionParser.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

function evaluateDataModule(relativePath, exportName, replacements = []) {
  const filename = path.join(root, relativePath);
  let source = fs.readFileSync(filename, 'utf8');
  for (const [pattern, replacement] of replacements) {
    source = source.replace(pattern, replacement);
  }
  source = source
    .replace(/^export\s+(?=const|function|let|var|class)/gm, '')
    .concat(`\n;globalThis.__result = ${exportName};`);

  const context = { console, globalThis: {}, parseMissionMarkdown };
  vm.runInNewContext(source, context, { filename });
  return context.globalThis.__result;
}

export function loadMissions() {
  const authoredDirectory = path.join(root, 'src/data/missions/authored');
  const authoredFiles = (fs.existsSync(authoredDirectory) ? fs.readdirSync(authoredDirectory) : [])
    .filter((name) => name.endsWith('.json'));
  const authoredMissions = authoredFiles.map((name) => JSON.parse(
    fs.readFileSync(path.join(authoredDirectory, name), 'utf8'),
  ));
  const coreMissions = evaluateDataModule('src/data/missions.js', 'missions', [
    [/^const authoredMissions = Object\.values\([\s\S]*?\);/m, `const authoredMissions = ${JSON.stringify(authoredMissions)};`],
  ]);
  const locales = loadMissionLocales();
  return coreMissions.map((mission) => ({
    ...mission,
    i18n: Object.fromEntries(
      Object.entries(locales)
        .filter(([, content]) => content[mission.id])
        .map(([locale, content]) => [locale, content[mission.id]]),
    ),
  }));
}

export function loadMissionLocales() {
  const locales = {};
  for (const locale of ['en', 'es', 'fr', 'ja', 'zh-CN']) {
    const replacements = [];
    if (locale === 'en') {
      const markdown = JSON.stringify(fs.readFileSync(path.join(root, 'src/data/missions/hello-soroban.md'), 'utf8'));
      replacements.push(
        [/^import helloSorobanMarkdown from .*?;$/m, `const helloSorobanMarkdown = ${markdown};`],
        [/^import \{ parseMissionMarkdown \} from .*?;$/m, ''],
      );
    }
    locales[locale] = evaluateDataModule(`src/data/missions/i18n/${locale}.js`, 'missionLocale', replacements);
    const authoredDirectory = path.join(root, `src/data/missions/authored/i18n/${locale}`);
    if (fs.existsSync(authoredDirectory)) {
      for (const filename of fs.readdirSync(authoredDirectory).filter((name) => name.endsWith('.json'))) {
        const missionId = filename.slice(0, -'.json'.length);
        locales[locale][missionId] = JSON.parse(
          fs.readFileSync(path.join(authoredDirectory, filename), 'utf8'),
        );
      }
    }
  }
  return locales;
}

export function loadCampaigns() {
  return evaluateDataModule('src/data/campaigns.js', 'campaigns');
}
