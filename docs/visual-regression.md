# Visual Regression Testing

Soroban Quest uses [Playwright](https://playwright.dev/) screenshot comparison to catch unintentional visual changes before they reach production.

## How It Works

1. **Baseline snapshots** – PNG files stored in `e2e/snapshots/` and committed to the repository.  
2. **Each CI run** – Playwright renders every main page, takes a screenshot, and compares it pixel-by-pixel against the baseline.  
3. **Failure** – If any page differs beyond the configured threshold, the job fails and a visual diff report is uploaded as a GitHub Actions artifact.

```
e2e/
├── snapshots/                  ← Committed baseline PNGs
│   └── visual-regression.spec.ts/
│       └── visual-chromium/
│           ├── home.png
│           ├── missions.png
│           └── ...
├── visual-regression.spec.ts   ← Test definitions
└── utils.ts
```

---

## Running Locally

### Prerequisites

```bash
# Install Playwright browsers (one-time)
npx playwright install --with-deps chromium
```

### Compare against existing baselines

```bash
npm run test:visual
```

This starts the dev server automatically and runs all visual tests against the stored snapshots.

### Regenerate baseline snapshots

> [!IMPORTANT]
> Only run this after an **intentional** UI change. The updated PNGs must be reviewed and committed.

```bash
npm run test:visual:update
```

Playwright re-renders every page and overwrites the `e2e/snapshots/` files. Review the diffs with your normal `git diff` / image viewer, then commit:

```bash
git add e2e/snapshots/
git commit -m "chore: update visual regression baselines for <feature>"
```

---

## Configuring Thresholds

Two environment variables control sensitivity:

| Variable | Default | Description |
|---|---|---|
| `SNAPSHOT_THRESHOLD` | `0.1` | Per-pixel colour difference (0 = exact, 1 = any colour accepted) |
| `SNAPSHOT_MAX_DIFF` | `0.005` | Max fraction of pixels allowed to differ (0.005 = 0.5 %) |

Override for a single run:

```bash
SNAPSHOT_THRESHOLD=0.15 SNAPSHOT_MAX_DIFF=0.01 npm run test:visual
```

Or set persistent values in the GitHub Actions repo/environment settings (`Settings → Secrets and variables → Actions → Variables`).

---

## CI Integration

The workflow `.github/workflows/e2e.yml` runs **two parallel jobs** on every push and pull request:

| Job | Script | Purpose |
|---|---|---|
| `e2e` | `npm run test:e2e` | Functional Playwright tests |
| `visual-regression` | `npm run test:visual` | Screenshot comparison |

### Viewing failure diffs

When `visual-regression` fails, GitHub Actions uploads two artifacts:

- **`visual-regression-diffs`** – `test-results/` folder containing side-by-side expected/actual/diff images for every failing test.  
- **`visual-regression-report`** – Full Playwright HTML report with embedded screenshots.

Download them from the **Actions → <run> → Artifacts** panel.

---

## Updating Snapshots via GitHub Actions

For changes committed directly on GitHub (e.g. a Dependabot PR), you can regenerate baselines without checking out locally:

1. Go to **Actions → E2E & Visual Regression Tests → Run workflow**.
2. Set **"Regenerate baseline snapshots and open a PR"** to `true`.
3. Click **Run workflow**.

The `update-snapshots` job will regenerate all PNGs and open a pull request (`chore/update-visual-snapshots`) for review.

---

## Pages Under Test

| Test name | Route | Viewports |
|---|---|---|
| Home | `/` | Desktop (1280×900), Mobile (375×812) |
| Mission Map | `/#/missions` | Desktop, Mobile |
| Campaigns | `/#/campaigns` | Desktop |
| Profile | `/#/profile` | Desktop |
| Journal | `/#/journal` | Desktop |
| Skill Tree | `/#/skills` | Desktop |
| Mission Detail | `/#/mission/hello-soroban` | Desktop |
| 404 | `/#/does-not-exist` | Desktop |

---

## Troubleshooting

### "No existing snapshots found"

You need to generate the baseline snapshots first:

```bash
npm run test:visual:update
git add e2e/snapshots/
git commit -m "chore: add initial visual regression baselines"
```

### Tests are flaky due to animations

The Playwright config already passes `--force-prefers-reduced-motion` to Chrome to disable CSS animations. If a third-party component ignores this flag, add a `waitForTimeout(400)` call in the spec or use `page.emulateMedia({ reducedMotion: 'reduce' })`.

### Screenshot differs only in font rendering

Font anti-aliasing can vary between OS and GPU configurations. To reduce noise:

- Run tests on Linux (the same OS used in CI) whenever possible.
- Increase `SNAPSHOT_THRESHOLD` to `0.15` for font-heavy pages.
- Use `--disable-gpu` (already applied in the `visual-chromium` project).
