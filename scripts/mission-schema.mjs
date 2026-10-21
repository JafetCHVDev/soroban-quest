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

export const CAMPAIGN_REQUIRED_FIELDS = ['id', 'heroImage', 'chapterNumber', 'missionIds', 'requiredLevel', 'color'];
const CAMPAIGN_LOCALE_FIELDS = ['title', 'description', 'lore'];

function validateCampaignLocale(locale, path, errors) {
  if (!locale || typeof locale !== 'object' || Array.isArray(locale)) {
    addError(errors, path, 'must be an object');
    return;
  }

  for (const field of CAMPAIGN_LOCALE_FIELDS) {
    if (!isNonEmptyString(locale[field])) {
      addError(errors, `${path}.${field}`, 'must be a non-empty string');
    }
  }
}

export function validateCampaign(campaign, path = 'campaign', missionIds) {
  const errors = [];

  if (!campaign || typeof campaign !== 'object' || Array.isArray(campaign)) {
    return [`${path}: must be an object`];
  }

  const missing = CAMPAIGN_REQUIRED_FIELDS.filter((field) => campaign[field] === undefined);
  missing.forEach((field) => addError(errors, path, `missing required field '${field}'`));
  const has = (field) => !missing.includes(field);

  const id = typeof campaign.id === 'string' ? campaign.id : '';
  if (has('id') && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    addError(errors, `${path}.id`, 'must be a URL-safe kebab-case identifier');
  }
  for (const field of ['heroImage', 'color']) {
    if (has(field) && !isNonEmptyString(campaign[field])) {
      addError(errors, `${path}.${field}`, 'must be a non-empty string');
    }
  }
  for (const field of ['chapterNumber', 'requiredLevel']) {
    if (has(field) && (!Number.isInteger(campaign[field]) || campaign[field] < 1)) {
      addError(errors, `${path}.${field}`, 'must be a positive integer');
    }
  }
  if (has('missionIds')) {
    if (
      !Array.isArray(campaign.missionIds) ||
      campaign.missionIds.length === 0 ||
      campaign.missionIds.some((id) => !isNonEmptyString(id))
    ) {
      addError(errors, `${path}.missionIds`, 'must be a non-empty array of mission ids');
    } else {
      const seen = new Set();
      for (const missionId of campaign.missionIds) {
        if (seen.has(missionId)) {
          addError(errors, `${path}.missionIds`, `duplicate mission '${missionId}'`);
        } else if (missionIds && !missionIds.has(missionId)) {
          addError(errors, `${path}.missionIds`, `unknown mission '${missionId}'`);
        }
        seen.add(missionId);
      }
    }
  }

  if (!campaign.i18n || typeof campaign.i18n !== 'object' || Array.isArray(campaign.i18n)) {
    addError(errors, `${path}.i18n`, 'must be an object');
  } else {
    // Required locales must exist; any additional locale that is present must be complete.
    const locales = new Set([...LOCALES, ...Object.keys(campaign.i18n)]);
    for (const locale of locales) {
      validateCampaignLocale(campaign.i18n[locale], `${path}.i18n.${locale}`, errors);
    }
  }

  return errors;
}

export function validateCampaignCollection(campaigns, missionIds) {
  const errors = [];
  if (!Array.isArray(campaigns)) return ['campaigns: must be an array'];

  const ids = new Map();
  const chapters = new Map();
  campaigns.forEach((campaign, index) => {
    const path = `campaigns[${index}]`;
    errors.push(...validateCampaign(campaign, path, missionIds));
    if (campaign?.id) {
      if (ids.has(campaign.id)) {
        addError(errors, `${path}.id`, `duplicates campaigns[${ids.get(campaign.id)}]`);
      }
      ids.set(campaign.id, index);
    }
    const chapterNumber = campaign?.chapterNumber;
    if (Number.isInteger(chapterNumber) && chapterNumber >= 1) {
      if (chapters.has(chapterNumber)) {
        const first = chapters.get(chapterNumber);
        addError(errors, `${path}.chapterNumber`, `duplicates campaigns[${first}]`);
        return;
      }
      chapters.set(chapterNumber, index);
      if (chapterNumber !== index + 1) {
        addError(
          errors,
          `${path}.chapterNumber`,
          `expected ${index + 1} (chapter numbers must be sequential starting at 1)`,
        );
      }
    }
  });

  return errors;
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
