import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCampaigns, loadLocales, loadMissions } from './mission-data.mjs';
import { validateMission, validateMissionCollection, validateMissionLocaleKeys } from './mission-schema.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const missions = loadMissions();
const result = validateMissionCollection(missions);
const missionIds = result.ids;
result.errors.push(...validateMissionLocaleKeys(missions, loadLocales()));

for (const [index, campaign] of loadCampaigns().entries()) {
  if (!Array.isArray(campaign.missionIds)) {
    result.errors.push(`campaigns[${index}].missionIds: must be an array`);
    continue;
  }
  for (const missionId of campaign.missionIds) {
    if (!missionIds.has(missionId)) {
      result.errors.push(`campaigns[${index}].missionIds: unknown mission '${missionId}'`);
    }
  }
}

const authoredDirectory = path.join(root, 'src/data/missions/authored');
if (fs.existsSync(authoredDirectory)) {
  for (const filename of fs.readdirSync(authoredDirectory).filter((name) => name.endsWith('.json'))) {
    const filePath = path.join(authoredDirectory, filename);
    try {
      const draft = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      result.errors.push(...validateMission(draft, filename));
    } catch (error) {
      result.errors.push(`${filename}: invalid JSON (${error.message})`);
    }
  }
}

if (result.errors.length > 0) {
  console.error(`Mission validation failed with ${result.errors.length} error(s):`);
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Mission validation passed: ${missions.length} missions and ${loadCampaigns().length} campaigns.`);
}
