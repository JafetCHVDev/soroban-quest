import { describe, it, expect, vi, afterEach } from "vitest";
import { runTests } from "../testRunner.js";

describe("testRunner", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts pure Rust fundamentals missions without Soroban SDK markers", async () => {
    vi.useFakeTimers();

    const mission = {
      chapter: 0,
      checks: [{ type: "contains_pattern", pattern: "let value = 42;" }],
    };

    const code = `
      fn fundamentals_demo() {
        let value = 42;
      }
    `;

    const resultPromise = runTests(code, mission);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.allPassed).toBe(true);
  });

  it("still requires Soroban markers for later chapters", async () => {
    vi.useFakeTimers();

    const mission = {
      chapter: 1,
      checks: [],
    };

    const code = `
      fn fundamentals_demo() {
        let value = 42;
      }
    `;

    const resultPromise = runTests(code, mission);
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.allPassed).toBe(false);
    expect(result.results[1].message).toContain("Soroban SDK");
  });
});
