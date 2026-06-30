const FRONTMATTER_ARRAY_FIELDS = ['skills', 'prereqs', 'conceptsIntroduced', 'hints'];
const FRONTMATTER_NUMBER_FIELDS = ['chapter', 'order', 'xp', 'xpReward'];

function parseScalar(value) {
  const trimmed = value.trim();
  if (trimmed === '[]') return [];
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseFrontmatterBlock(block) {
  const data = {};
  const lines = block.split(/\r?\n/);
  let currentListKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(parseScalar(listItem[1]));
      continue;
    }

    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) {
      currentListKey = null;
      continue;
    }

    const [, key, rawValue] = field;
    if (rawValue === '') {
      data[key] = [];
      currentListKey = key;
    } else {
      data[key] = parseScalar(rawValue);
      currentListKey = null;
    }
  }

  return data;
}

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: source };
  return {
    data: parseFrontmatterBlock(match[1]),
    content: match[2],
  };
}

function normalizeMetadata(data) {
  const metadata = { ...data };

  for (const field of FRONTMATTER_ARRAY_FIELDS) {
    if (field in metadata) {
      metadata[field] = normalizeArray(metadata[field]);
    }
  }

  for (const field of FRONTMATTER_NUMBER_FIELDS) {
    if (metadata[field] !== undefined) {
      metadata[field] = Number(metadata[field]);
    }
  }

  if (metadata.xp !== undefined && metadata.xpReward === undefined) {
    metadata.xpReward = metadata.xp;
    delete metadata.xp;
  }

  return metadata;
}

export function parseMissionMarkdown(source) {
  const { data, content } = splitFrontmatter(source);
  const metadata = normalizeMetadata(data);

  return {
    ...metadata,
    story: content.trim(),
  };
}

export function createMissionFromMarkdown(source, overrides = {}) {
  const parsed = parseMissionMarkdown(source);
  const {
    title,
    story,
    learningGoal,
    hints = [],
    ...metadata
  } = parsed;

  return {
    ...metadata,
    ...overrides,
    i18n: {
      en: {
        title,
        story,
        learningGoal,
        hints,
      },
      ...(overrides.i18n || {}),
    },
  };
}
