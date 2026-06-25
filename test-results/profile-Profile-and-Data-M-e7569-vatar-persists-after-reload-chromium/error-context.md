# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile and Data Management >> editing name and avatar persists after reload
- Location: e2e\profile.spec.ts:10:3

# Error details

```
TimeoutError: page.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Edit Character Profile")')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - link "common.skipToContent" [ref=e4] [cursor=pointer]:
      - /url: "#main-content"
    - navigation "navbar.ariaMain" [ref=e5]:
      - link "navbar.ariaHome" [ref=e6] [cursor=pointer]:
        - /url: "#/"
        - generic [ref=e7]: SOROBAN QUEST
      - list [ref=e8]:
        - listitem [ref=e9]:
          - link "navbar.home" [ref=e10] [cursor=pointer]:
            - /url: "#/"
        - listitem [ref=e11]:
          - link "navbar.campaigns" [ref=e12] [cursor=pointer]:
            - /url: "#/campaigns"
        - listitem [ref=e13]:
          - link "navbar.missions" [ref=e14] [cursor=pointer]:
            - /url: "#/missions"
        - listitem [ref=e15]:
          - link "navbar.profile" [ref=e16] [cursor=pointer]:
            - /url: "#/profile"
        - listitem [ref=e17]:
          - link "navbar.journal" [ref=e18] [cursor=pointer]:
            - /url: "#/journal"
      - generic [ref=e19]:
        - button "common.selectLanguage" [ref=e21] [cursor=pointer]:
          - img [ref=e22]
          - text: EN
          - img [ref=e25]
        - button "common.toggleTheme" [ref=e27] [cursor=pointer]:
          - img [ref=e28]
        - generic [ref=e30]: 🛡️
        - generic [ref=e31]:
          - generic [ref=e32]: navbar.userProfile
          - text: Stellar Guardian
      - generic "navbar.ariaMobile" [ref=e33]:
        - link "navbar.home" [ref=e34] [cursor=pointer]:
          - /url: "#/"
        - link "navbar.campaigns" [ref=e35] [cursor=pointer]:
          - /url: "#/campaigns"
        - link "navbar.missions" [ref=e36] [cursor=pointer]:
          - /url: "#/missions"
        - link "navbar.profile" [ref=e37] [cursor=pointer]:
          - /url: "#/profile"
        - link "navbar.journal" [ref=e38] [cursor=pointer]:
          - /url: "#/journal"
        - generic [ref=e39]:
          - button "common.selectLanguage" [ref=e41] [cursor=pointer]:
            - img [ref=e42]
            - text: EN
            - img [ref=e45]
          - button "common.toggleTheme" [ref=e47] [cursor=pointer]:
            - img [ref=e48]
          - text: 🛡️Stellar Guardian
    - main [ref=e50]:
      - generic [ref=e51]:
        - generic [ref=e52]:
          - 'img "Active avatar character: 🛡️" [ref=e53]': 🛡️
          - generic [ref=e54]:
            - 'heading "Adventurer Name: Stellar Guardian" [level=1] [ref=e55]':
              - generic [ref=e56]: "Adventurer Name:"
              - text: Stellar Guardian
            - generic [ref=e57]:
              - generic [ref=e58]: "Rank Title:"
              - text: ranks.0
            - 'generic "XP progress bar: 0% complete" [ref=e59]':
              - generic [ref=e61]:
                - generic [ref=e62]: profile.xpBar.current
                - generic [ref=e63]: profile.xpBar.total
            - generic [ref=e64]:
              - button "profile.edit" [ref=e65] [cursor=pointer]
              - link "profile.viewJournal" [ref=e66] [cursor=pointer]:
                - /url: "#/journal"
          - region "Adventurer stats dashboard" [ref=e67]:
            - generic [ref=e68]:
              - generic [ref=e69]: "0"
              - generic [ref=e70]: profile.stats.missions
            - generic [ref=e71]:
              - generic [ref=e72]: "0"
              - generic [ref=e73]: profile.stats.badges
        - heading "profile.sections.badges" [level=2] [ref=e74]
        - region "Badges progression collection" [ref=e75]:
          - 'generic "Badge record: First Contract. Description: Complete your first mission. Status: Locked" [ref=e76]':
            - generic [ref=e77]: 📜
            - generic [ref=e78]:
              - heading [level=4] [ref=e79]: badges.first_contract.name
              - paragraph [ref=e80]: badges.first_contract.description
          - 'generic "Badge record: Triple Threat. Description: Complete 3 missions. Status: Locked" [ref=e81]':
            - generic [ref=e82]: ⚡
            - generic [ref=e83]:
              - heading [level=4] [ref=e84]: badges.triple_threat.name
              - paragraph [ref=e85]: badges.triple_threat.description
          - 'generic "Badge record: Five Star. Description: Complete 5 missions. Status: Locked" [ref=e86]':
            - generic [ref=e87]: 🌟
            - generic [ref=e88]:
              - heading [level=4] [ref=e89]: badges.five_star.name
              - paragraph [ref=e90]: badges.five_star.description
          - 'generic "Badge record: Completionist. Description: Complete all missions. Status: Locked" [ref=e91]':
            - generic [ref=e92]: 👑
            - generic [ref=e93]:
              - heading [level=4] [ref=e94]: badges.completionist.name
              - paragraph [ref=e95]: badges.completionist.description
          - 'generic "Badge record: Rising Star. Description: Reach level 3. Status: Locked" [ref=e96]':
            - generic [ref=e97]: 🚀
            - generic [ref=e98]:
              - heading [level=4] [ref=e99]: badges.level_3.name
              - paragraph [ref=e100]: badges.level_3.description
          - 'generic "Badge record: Stellar Guardian. Description: Reach level 5. Status: Locked" [ref=e101]':
            - generic [ref=e102]: 🛡️
            - generic [ref=e103]:
              - heading [level=4] [ref=e104]: badges.level_5.name
              - paragraph [ref=e105]: badges.level_5.description
          - 'generic "Badge record: XP Hoarder. Description: Earn 1000 XP. Status: Locked" [ref=e106]':
            - generic [ref=e107]: 💰
            - generic [ref=e108]:
              - heading [level=4] [ref=e109]: badges.xp_1000.name
              - paragraph [ref=e110]: badges.xp_1000.description
          - 'generic "Badge record: Speed Demon. Description: Complete a mission on first try. Status: Locked" [ref=e111]':
            - generic [ref=e112]: ⚡
            - generic [ref=e113]:
              - heading [level=4] [ref=e114]: badges.speed_demon.name
              - paragraph [ref=e115]: badges.speed_demon.description
        - heading "profile.sections.completedMissions" [level=2] [ref=e116]
        - region "profile.aria.completedListing" [ref=e117]:
          - status [ref=e118]: profile.noMissions
        - heading "profile.sections.data" [level=2] [ref=e119]
        - group "Game progress backup controls" [ref=e120]:
          - button "profile.data.export" [ref=e121] [cursor=pointer]
          - button "profile.data.import" [ref=e122] [cursor=pointer]
          - button "profile.data.reset" [ref=e123] [cursor=pointer]
    - contentinfo [ref=e124]:
      - generic [ref=e125]:
        - generic [ref=e126]:
          - heading "footer.platform.heading" [level=4] [ref=e127]
          - list [ref=e128]:
            - listitem [ref=e129]:
              - link "footer.platform.home" [ref=e130] [cursor=pointer]:
                - /url: "#/"
            - listitem [ref=e131]:
              - link "footer.platform.missions" [ref=e132] [cursor=pointer]:
                - /url: "#/missions"
            - listitem [ref=e133]:
              - link "footer.platform.profile" [ref=e134] [cursor=pointer]:
                - /url: "#/profile"
        - generic [ref=e135]:
          - heading "footer.resources.heading" [level=4] [ref=e136]
          - list [ref=e137]:
            - listitem [ref=e138]:
              - link "footer.resources.docs" [ref=e139] [cursor=pointer]:
                - /url: https://soroban.stellar.org
            - listitem [ref=e140]:
              - link "footer.resources.sdk" [ref=e141] [cursor=pointer]:
                - /url: https://stellar.org/developers
            - listitem [ref=e142]:
              - link "footer.resources.github" [ref=e143] [cursor=pointer]:
                - /url: https://github.com/JafetCHVDev/soroban-quest
        - generic [ref=e144]:
          - heading "footer.community.heading" [level=4] [ref=e145]
          - list [ref=e146]:
            - listitem [ref=e147]:
              - link "footer.community.discord" [ref=e148] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e149]:
              - link "footer.community.telegram" [ref=e150] [cursor=pointer]:
                - /url: "#"
      - generic [ref=e151]:
        - paragraph [ref=e152]: footer.credits.tagline
        - paragraph [ref=e153]: footer.credits.license
  - status
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { clearLocalStorageBeforePageLoad } from './utils';
  3  | 
  4  | test.describe('Profile and Data Management', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await clearLocalStorageBeforePageLoad(page);
  7  |     await page.goto('/#/profile');
  8  |   });
  9  | 
  10 |   test('editing name and avatar persists after reload', async ({ page }) => {
> 11 |     await page.click('button:has-text("Edit Character Profile")');
     |                ^ TimeoutError: page.click: Timeout 10000ms exceeded.
  12 |     await page.fill('input[placeholder="Enter name"]', 'Star Voyager');
  13 |     await page.click('button:has-text("🐉")');
  14 |     await page.click('button:has-text("Save")');
  15 | 
  16 |     // ✅ FIXED: Using toContainText to ignore the screen-reader-only accessible prefix
  17 |     await expect(page.locator('.profile-name')).toContainText('Star Voyager');
  18 |     await expect(page.locator('.profile-avatar')).toHaveText('🐉');
  19 | 
  20 |     await page.reload();
  21 |     // ✅ FIXED: Using toContainText here as well
  22 |     await expect(page.locator('.profile-name')).toContainText('Star Voyager');
  23 |     await expect(page.locator('.profile-avatar')).toHaveText('🐉');
  24 |   });
  25 | 
  26 |   test('export button is available on profile page', async ({ page }) => {
  27 |     await expect(page.locator('button:has-text("Export Progress File")')).toBeVisible();
  28 |   });
  29 | 
  30 |   test('reset button is available on profile page', async ({ page }) => {
  31 |     await expect(page.locator('button:has-text("Reset Progress")')).toBeVisible();
  32 |   });
  33 | 
  34 |   test('import button is available on profile page', async ({ page }) => {
  35 |     await expect(page.locator('button:has-text("Import Progress File")')).toBeVisible();
  36 |   });
  37 | });
```