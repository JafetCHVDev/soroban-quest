// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SCRIPT = resolve(__dirname, '../check-duplicates.mjs');

function runIn(cwd) {
  return spawnSync(process.execPath, [SCRIPT], { cwd, encoding: 'utf8' });
}

describe('check-duplicates', () => {
  let dir;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'dup-check-'));
    mkdirSync(join(dir, 'src', 'systems'), { recursive: true });
    writeFileSync(join(dir, 'src', 'systems', 'only.ts'), 'export {};\n');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('passes when no .js/.ts pair exists', () => {
    const result = runIn(dir);
    expect(result.status).toBe(0);
  });

  it('fails and names the pair when a .js/.ts pair is introduced', () => {
    writeFileSync(join(dir, 'src', 'systems', 'dup.js'), 'export {};\n');
    writeFileSync(join(dir, 'src', 'systems', 'dup.ts'), 'export {};\n');

    const result = runIn(dir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('src/systems/dup.js');
    expect(result.stderr).toContain('src/systems/dup.ts');
  });

  it('also flags a .jsx/.tsx pair', () => {
    writeFileSync(join(dir, 'src', 'Widget.jsx'), 'export {};\n');
    writeFileSync(join(dir, 'src', 'Widget.tsx'), 'export {};\n');

    expect(runIn(dir).status).toBe(1);
  });
});
