import { loadCampaigns, loadMissions } from './mission-data.mjs';
import {
  getTranslationCoverage,
  validateCampaignCollection,
  validateMissionCollection,
} from './mission-schema.mjs';

const missions = loadMissions();
const result = validateMissionCollection(missions);
const missionIds = result.ids;
result.errors.push(...validateCampaignCollection(loadCampaigns(), missionIds));

const coverage = getTranslationCoverage(missions, loadCampaigns());
console.log('Translation coverage:');
for (const [locale, { missions: m, campaigns: c }] of Object.entries(coverage)) {
  console.log(`  ${locale.padEnd(6)} missions ${m.translated}/${m.total}, campaigns ${c.translated}/${c.total}`);
  if (m.missing.length > 0) console.log(`         missing missions: ${m.missing.join(', ')}`);
  if (c.missing.length > 0) console.log(`         missing campaigns: ${c.missing.join(', ')}`);
}

if (result.errors.length > 0) {
  console.error(`Mission validation failed with ${result.errors.length} error(s):`);
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Mission validation passed: ${missions.length} missions and ${loadCampaigns().length} campaigns.`);
}
