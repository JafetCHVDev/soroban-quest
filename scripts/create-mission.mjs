import fs from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const match = process.argv[index].match(/^--([^=]+)(?:=(.*))?$/);
  if (match) args.set(match[1], match[2] ?? process.argv[++index]);
}

const rl = readline.createInterface({ input, output });
async function ask(name, question, fallback = '') {
  if (args.has(name)) return args.get(name);
  const answer = await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `);
  return answer.trim() || fallback;
}

try {
  const id = await ask('id', 'Mission id', 'new-mission');
  const chapter = Number(await ask('chapter', 'Chapter', '1'));
  const order = Number(await ask('order', 'Order', '1'));
  const difficulty = await ask('difficulty', 'Difficulty (beginner, intermediate, advanced)', 'beginner');
  const xpReward = Number(await ask('xp', 'XP reward', '100'));
  const title = await ask('title', 'English title', 'New Mission');
  const spanishTitle = await ask('es-title', 'Spanish title', 'Nueva misión');
  const localeContent = {
    en: { title, story: '# Mission story\n\nWrite the English story here.', learningGoal: 'Describe the learning outcome.', hints: ['Add the first hint.'] },
    es: { title: spanishTitle, story: '# Historia de la misión\n\nEscribe aquí la historia en español.', learningGoal: 'Describe el resultado de aprendizaje.', hints: ['Añade la primera pista.'] },
  };
  const mission = {
    id,
    chapter,
    order,
    difficulty,
    xpReward,
    i18n: {
      en: { title: `missions.${id}.title`, story: `missions.${id}.story`, learningGoal: `missions.${id}.learningGoal`, hints: `missions.${id}.hints` },
      es: { title: `missions.${id}.title`, story: `missions.${id}.story`, learningGoal: `missions.${id}.learningGoal`, hints: `missions.${id}.hints` },
    },
    template: '// Starter Soroban code goes here',
    solution: '// Reference Soroban solution goes here',
    checks: [{ type: 'balanced_braces', message: 'Keep braces balanced' }],
    conceptsIntroduced: ['add-concept'],
  };

  const directory = path.join(root, 'src/data/missions/authored');
  await fs.mkdir(directory, { recursive: true });
  const outputPath = path.join(directory, `${id}.json`);
  const markdownPath = path.join(directory, `${id}.md`);
  await fs.writeFile(outputPath, `${JSON.stringify(mission, null, 2)}\n`);
  await fs.writeFile(markdownPath, `---\nid: ${id}\nchapter: ${chapter}\norder: ${order}\ndifficulty: ${difficulty}\nxp: ${xpReward}\nskills:\n  - add-concept\ntitle: ${title}\nlearningGoal: Describe the learning outcome.\nhints:\n  - Add the first hint.\n---\n\n# Mission story\n\nWrite the English story here.\n`);
  for (const locale of ['en', 'es']) {
    const localePath = path.join(root, `src/i18n/locales/${locale}.json`);
    const dictionary = JSON.parse(await fs.readFile(localePath, 'utf8'));
    dictionary.missions ??= {};
    dictionary.missions[id] = localeContent[locale];
    await fs.writeFile(localePath, `${JSON.stringify(dictionary, null, 2)}\n`);
  }
  console.log(`Created ${path.relative(root, outputPath)}`);
  console.log(`Created ${path.relative(root, markdownPath)}`);
  console.log('Edit the JSON i18n.en and i18n.es blocks, then run npm run mission:validate.');
} finally {
  rl.close();
}
