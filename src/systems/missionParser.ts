const FRONTMATTER_ARRAY_FIELDS = [
  "skills",
  "prereqs",
  "conceptsIntroduced",
  "hints",
];
const FRONTMATTER_NUMBER_FIELDS = [
  "chapter",
  "order",
  "xp",
  "xpReward",
];

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "[]") return [];
  return trimmed.replace(/^['"]|['"]$/g, "");
}

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

interface FrontmatterData {
  [key: string]: unknown;
}

function parseFrontmatterBlock(block: string): FrontmatterData {
  const data: FrontmatterData = {};
  const lines = block.split(/\r?\n/);
  let currentListKey: string | null = null;

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
    if (rawValue === "") {
      data[key] = [];
      currentListKey = key;
    } else {
      data[key] = parseScalar(rawValue);
      currentListKey = null;
    }
  }

  return data;
}

interface ParsedMarkdown {
  data: FrontmatterData;
  content: string;
}

function splitFrontmatter(source: string): ParsedMarkdown {
  const match = source.match(
    /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/
  );
  if (!match)
    return { data: {}, content: source };
  return {
    data: parseFrontmatterBlock(match[1]),
    content: match[2],
  };
}

function normalizeMetadata(data: FrontmatterData): FrontmatterData {
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

  if (
    metadata.xp !== undefined &&
    metadata.xpReward === undefined
  ) {
    metadata.xpReward = metadata.xp;
    delete metadata.xp;
  }

  return metadata;
}

export function parseMissionMarkdown(source: string): FrontmatterData {
  const { data, content } = splitFrontmatter(source);
  const metadata = normalizeMetadata(data);

  return {
    ...metadata,
    story: content.trim(),
  };
}

interface I18nData {
  [key: string]: {
    title?: unknown;
    story?: unknown;
    learningGoal?: unknown;
    hints?: unknown[];
  };
}

export function createMissionFromMarkdown(
  source: string,
  overrides: FrontmatterData = {}
): FrontmatterData {
  const parsed = parseMissionMarkdown(source);
  const {
    title,
    story,
    learningGoal,
    hints = [],
    ...metadata
  } = parsed;

  const i18n: I18nData = {
    en: {
      title,
      story,
      learningGoal,
      hints: hints as unknown[],
    },
    ...(overrides.i18n || {}),
  };

  return {
    ...metadata,
    ...overrides,
    i18n,
  };
}
