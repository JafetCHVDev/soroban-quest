import { loadCampaigns, loadMissions } from './mission-data.mjs';
import {
  validateCampaignCollection,
  validateMissionCollection,
} from './mission-schema.mjs';

const missions = loadMissions();
const result = validateMissionCollection(missions);
const missionIds = result.ids;

result.errors.push(...validateCampaignCollection(loadCampaigns(), missionIds));

if (result.errors.length > 0) {
  console.error(`Mission validation failed with ${result.errors.length} error(s):`);
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Mission validation passed: ${missions.length} missions and ${loadCampaigns().length} campaigns.`);
}
