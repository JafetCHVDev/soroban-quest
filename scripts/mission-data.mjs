import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createMissionFromMarkdown } from '../src/systems/missionParser.js';

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

  const context = { console, globalThis: {}, createMissionFromMarkdown };
  vm.runInNewContext(source, context, { filename });
  return context.globalThis.__result;
}

export function loadMissions() {
  const markdown = JSON.stringify(fs.readFileSync(path.join(root, 'src/data/missions/hello-soroban.md'), 'utf8'));
  const authoredDirectory = path.join(root, 'src/data/missions/authored');
  const authoredFiles = (fs.existsSync(authoredDirectory) ? fs.readdirSync(authoredDirectory) : [])
    .filter((name) => name.endsWith('.json'));
  const authoredMissions = authoredFiles.map((name) => JSON.parse(
    fs.readFileSync(path.join(authoredDirectory, name), 'utf8'),
  ));
  return evaluateDataModule('src/data/missions.js', 'missions', [
    [/^import helloSorobanMarkdown from .*?;$/m, `const helloSorobanMarkdown = ${markdown};`],
    [/^import \{ createMissionFromMarkdown \} from .*?;$/m, ''],
    [/^import enLocale from .*?;$/m, 'const enLocale = {};'],
    [/^import esLocale from .*?;$/m, 'const esLocale = {};'],
    [/^const authoredMissions = Object\.values\([\s\S]*?\);/m, `const authoredMissions = ${JSON.stringify(authoredMissions)};`],
  ]);
}

export function loadLocales() {
  return {
    en: JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/locales/en.json'), 'utf8')),
    es: JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/locales/es.json'), 'utf8')),
  };
}

export function loadCampaigns() {
  return evaluateDataModule('src/data/campaigns.js', 'campaigns');
}
