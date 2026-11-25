import { expect, it } from 'vitest';

it('fails intentionally to verify the CI unit-test gate', () => {
  expect(true).toBe(false);
});
