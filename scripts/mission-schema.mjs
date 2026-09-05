export const CHECK_TYPES = [
  'contains_pattern',
  'has_function',
  'returns_type',
  'has_attribute',
  'uses_type',
  'storage_operation',
  'no_pattern',
  'has_struct',
  'balanced_braces',
  'has_import',
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const STORAGE_OPERATIONS = ['get', 'set', 'has', 'remove'];
const LOCALES = ['en', 'es'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function addError(errors, path, message) {
  errors.push(`${path}: ${message}`);
}

function validateLocale(locale, path, errors) {
  if (!locale || typeof locale !== 'object' || Array.isArray(locale)) {
    addError(errors, path, 'must be an object');
    return;
  }

  for (const field of ['title', 'story', 'learningGoal']) {
    if (!isNonEmptyString(locale[field])) {
      addError(errors, `${path}.${field}`, 'must be a non-empty string');
    }
  }

  if (typeof locale.hints === 'string' && locale.hints.startsWith('missions.')) return;
  if (!Array.isArray(locale.hints) || locale.hints.length === 0) {
    addError(errors, `${path}.hints`, 'must be a non-empty array');
  } else if (locale.hints.some((hint) => !isNonEmptyString(hint))) {
    addError(errors, `${path}.hints`, 'must contain only non-empty strings');
  }
}

function validateCheck(check, path, errors) {
  if (!check || typeof check !== 'object' || Array.isArray(check)) {
    addError(errors, path, 'must be an object');
    return;
  }

  if (!CHECK_TYPES.includes(check.type)) {
    addError(errors, `${path}.type`, `must be one of: ${CHECK_TYPES.join(', ')}`);
    return;
  }

  const requiredStrings = {
    contains_pattern: ['pattern'],
    no_pattern: ['pattern'],
    has_function: ['name'],
    returns_type: ['function', 'returnType'],
    has_attribute: ['attribute'],
    uses_type: ['typeName'],
    has_struct: ['name'],
    has_import: ['module'],
  };

  for (const field of requiredStrings[check.type] || []) {
    if (!isNonEmptyString(check[field])) {
      addError(errors, `${path}.${field}`, 'must be a non-empty string');
    }
  }

  if (check.type === 'has_function' && check.params !== undefined) {
    if (!Array.isArray(check.params) || check.params.some((param) => !isNonEmptyString(param))) {
      addError(errors, `${path}.params`, 'must be an array of non-empty strings');
    }
  }

  if (check.type === 'storage_operation' && !STORAGE_OPERATIONS.includes(check.operation)) {
    addError(errors, `${path}.operation`, `must be one of: ${STORAGE_OPERATIONS.join(', ')}`);
  }

  for (const field of ['message', 'description']) {
    if (check[field] !== undefined && typeof check[field] !== 'string') {
      addError(errors, `${path}.${field}`, 'must be a string when provided');
    }
  }
}

export function validateMission(mission, path = 'mission') {
  const errors = [];

  if (!mission || typeof mission !== 'object' || Array.isArray(mission)) {
    return [`${path}: must be an object`];
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(mission.id || '')) {
    addError(errors, `${path}.id`, 'must be a URL-safe kebab-case identifier');
  }
  if (!mission.standalone && (!Number.isInteger(mission.chapter) || mission.chapter < 1)) {
    addError(errors, `${path}.chapter`, 'must be a positive integer');
  }
  if (!Number.isInteger(mission.order) || mission.order < 1) {
    addError(errors, `${path}.order`, 'must be a positive integer');
  }
  if (!DIFFICULTIES.includes(mission.difficulty)) {
    addError(errors, `${path}.difficulty`, `must be one of: ${DIFFICULTIES.join(', ')}`);
  }
  if (!Number.isInteger(mission.xpReward) || mission.xpReward < 1) {
    addError(errors, `${path}.xpReward`, 'must be a positive integer');
  }
  if (!isNonEmptyString(mission.template)) addError(errors, `${path}.template`, 'must be a non-empty string');
  if (!isNonEmptyString(mission.solution)) addError(errors, `${path}.solution`, 'must be a non-empty string');
  if (!Array.isArray(mission.checks) || mission.checks.length === 0) {
    addError(errors, `${path}.checks`, 'must be a non-empty array');
  } else {
    mission.checks.forEach((check, index) => validateCheck(check, `${path}.checks[${index}]`, errors));
  }
  if (!Array.isArray(mission.conceptsIntroduced) || mission.conceptsIntroduced.some((item) => !isNonEmptyString(item))) {
    addError(errors, `${path}.conceptsIntroduced`, 'must be an array of strings');
  }
  for (const field of ['skills', 'prereqs']) {
    if (mission[field] !== undefined && (!Array.isArray(mission[field]) || mission[field].some((item) => !isNonEmptyString(item)))) {
      addError(errors, `${path}.${field}`, 'must be an array of strings when provided');
    }
  }

  if (!mission.i18n || typeof mission.i18n !== 'object') {
    addError(errors, `${path}.i18n`, 'must be an object');
  } else {
    for (const locale of LOCALES) validateLocale(mission.i18n[locale], `${path}.i18n.${locale}`, errors);
  }

  return errors;
}

export function validateMissionCollection(missions) {
  const errors = [];
  if (!Array.isArray(missions)) return ['missions: must be an array'];

  const ids = new Map();
  const orders = new Map();
  missions.forEach((mission, index) => {
    errors.push(...validateMission(mission, `missions[${index}]`));
    if (mission?.id) {
      if (ids.has(mission.id)) addError(errors, `missions[${index}].id`, `duplicates missions[${ids.get(mission.id)}]`);
      ids.set(mission.id, index);
    }
    if (Number.isInteger(mission?.order)) {
      if (orders.has(mission.order)) addError(errors, `missions[${index}].order`, `duplicates missions[${orders.get(mission.order)}]`);
      orders.set(mission.order, index);
    }
  });

  return { errors, ids: new Set(ids.keys()) };
}

export function validateMissionLocaleKeys(missions, locales) {
  const errors = [];
  for (const [index, mission] of missions.entries()) {
    for (const locale of LOCALES) {
      const fields = mission?.i18n?.[locale];
      for (const field of ['title', 'story', 'learningGoal', 'hints']) {
        const value = fields?.[field];
        if (typeof value !== 'string' || !value.startsWith('missions.')) continue;
        const resolved = value.split('.').reduce((current, part) => current?.[part], locales?.[locale]);
        if (resolved === undefined) {
          errors.push(`missions[${index}].i18n.${locale}.${field}: missing locale key '${value}'`);
        } else if (field === 'hints' && (!Array.isArray(resolved) || resolved.length === 0)) {
          errors.push(`missions[${index}].i18n.${locale}.${field}: locale key '${value}' must resolve to a non-empty array`);
        }
      }
    }
  }
  return errors;
}
