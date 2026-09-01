import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runTests } from "../testRunner.js";
import * as codeValidator from "../codeValidator.js";

describe("testRunner system", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Phase 1 - Syntax Validation", () => {
    it("fails syntax check when code is empty", async () => {
      const result = await runTests("", { checks: [] });
      expect(result.results[0]).toEqual({
        phase: "syntax",
        label: "🔍 Checking syntax...",
        passed: false,
        message: "✗ Code is empty — write your contract!",
      });
      expect(result.allPassed).toBe(false);
    });

    it("fails syntax check when braces are unbalanced (missing closing brace)", async () => {
      const result = await runTests("fn test() {", { checks: [] });
      expect(result.results[0]).toEqual({
        phase: "syntax",
        label: "🔍 Checking syntax...",
        passed: false,
        message: "✗ Unbalanced braces: missing }",
      });
      expect(result.allPassed).toBe(false);
    });

    it("fails syntax check when braces are unbalanced (unexpected closing brace)", async () => {
      const result = await runTests("fn test() }", { checks: [] });
      expect(result.results[0]).toEqual({
        phase: "syntax",
        label: "🔍 Checking syntax...",
        passed: false,
        message: "✗ Unexpected closing brace }",
      });
      expect(result.allPassed).toBe(false);
    });

    it("fails syntax check when parentheses are unbalanced (missing closing paren)", async () => {
      const result = await runTests("fn test(", { checks: [] });
      expect(result.results[0]).toEqual({
        phase: "syntax",
        label: "🔍 Checking syntax...",
        passed: false,
        message: "✗ Unbalanced parentheses",
      });
      expect(result.allPassed).toBe(false);
    });

    it("fails syntax check when parentheses are unbalanced (unexpected closing paren)", async () => {
      const result = await runTests("fn test)", { checks: [] });
      expect(result.results[0]).toEqual({
        phase: "syntax",
        label: "🔍 Checking syntax...",
        passed: false,
        message: "✗ Unexpected closing parenthesis )",
      });
      expect(result.allPassed).toBe(false);
    });

    it("passes syntax check for well-formed code", async () => {
      const validCode = `
        use soroban_sdk::contractimpl;
        pub fn hello() {}
      `;
      const result = await runTests(validCode, { checks: [] });
      expect(result.results[0]).toEqual({
        phase: "syntax",
        label: "🔍 Checking syntax...",
        passed: true,
        message: "✓ Basic syntax looks good",
      });
    });
  });

  describe("Phase 2 - Structural Validation", () => {
    it("fails structural check when no function definitions are found", async () => {
      const codeNoFn = `
        // soroban_sdk usage but no function
        use soroban_sdk::Env;
      `;
      const result = await runTests(codeNoFn, { checks: [] });
      expect(result.results[1]).toEqual({
        phase: "structure",
        label: "🏗️ Validating structure...",
        passed: false,
        message: "✗ No function definitions found",
      });
      expect(result.allPassed).toBe(false);
    });

    it("fails structural check when no Soroban markers are present", async () => {
      const codeNoSoroban = `
        pub fn regular_rust_fn() {
            let x = 1 + 1;
        }
      `;
      const result = await runTests(codeNoSoroban, { checks: [] });
      expect(result.results[1]).toEqual({
        phase: "structure",
        label: "🏗️ Validating structure...",
        passed: false,
        message:
          "✗ No Soroban SDK usage detected — this should be a Soroban contract",
      });
      expect(result.allPassed).toBe(false);
    });

    it("passes structural check when function definition and Soroban markers exist", async () => {
      const validStructure = `
        use soroban_sdk::contractimpl;
        pub fn hello() {}
      `;
      const result = await runTests(validStructure, { checks: [] });
      expect(result.results[1]).toEqual({
        phase: "structure",
        label: "🏗️ Validating structure...",
        passed: true,
        message: "✓ Contract structure validated",
      });
    });
  });

  describe("Phase 3 - Mission-specific Checks", () => {
    it("executes mission checks in sequence after syntax and structure pass", async () => {
      const code = `
        #[contract]
        pub struct HelloContract;
        #[contractimpl]
        impl HelloContract {
            pub fn hello(env: Env) -> Symbol {
                Symbol::new(&env, "hello")
            }
        }
      `;

      const mission = {
        checks: [
          {
            type: "has_function",
            name: "hello",
            message: "Must define hello function",
          },
          {
            type: "has_attribute",
            attribute: "contract",
            message: "Must have contract attribute",
          },
        ],
      };

      const result = await runTests(code, mission);

      // Should have 1 syntax, 1 structure, and 2 mission checks (total 4)
      expect(result.results).toHaveLength(4);
      expect(result.results[2]).toMatchObject({
        phase: "test",
        label: "🧪 Test 1/2",
        passed: true,
      });
      expect(result.results[3]).toMatchObject({
        phase: "test",
        label: "🧪 Test 2/2",
        passed: true,
      });
      expect(result.allPassed).toBe(true);
    });

    it("formats failed mission checks correctly", async () => {
      const code = `
        use soroban_sdk::contractimpl;
        pub fn hello() {}
      `;

      const mission = {
        checks: [
          {
            type: "has_function",
            name: "missing_fn",
            message: "Function missing_fn was not found",
          },
        ],
      };

      const result = await runTests(code, mission);

      expect(result.results[2]).toMatchObject({
        phase: "test",
        label: "🧪 Test 1/1",
        passed: false,
      });
      expect(result.allPassed).toBe(false);
      expect(result.passedCount).toBe(2); // syntax and structure passed, test failed
      expect(result.totalCount).toBe(3);
    });
  });

  describe("Early Termination", () => {
    it("skips subsequent phases when Phase 1 (syntax) fails", async () => {
      const spyValidateCode = vi.spyOn(codeValidator, "validateCode");

      const invalidSyntaxCode = "pub fn broken({";
      const mission = {
        checks: [{ type: "has_function", name: "broken" }],
      };

      const result = await runTests(invalidSyntaxCode, mission);

      // Should contain ONLY the syntax result
      expect(result.results).toHaveLength(1);
      expect(result.results[0].phase).toBe("syntax");
      expect(result.results[0].passed).toBe(false);

      // validateCode should NOT be called
      expect(spyValidateCode).not.toHaveBeenCalled();

      // Return status checks
      expect(result.allPassed).toBe(false);
      expect(result.passedCount).toBe(0);
      expect(result.totalCount).toBe(1);
      expect(result.summary).toBe("❌ 0/1 checks passed. Keep trying!");
    });
  });

  describe("Async behavior and timing", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("handles delays properly using fake timers", async () => {
      const spyValidateCode = vi.spyOn(codeValidator, "validateCode");

      const code = `
        use soroban_sdk::contractimpl;
        pub fn hello() {}
      `;
      const mission = {
        checks: [{ type: "has_function", name: "hello" }],
      };

      const testPromise = runTests(code, mission);

      // Advance timers past delay(300), delay(300), delay(200), delay(300)
      await vi.advanceTimersByTimeAsync(1500);

      const result = await testPromise;

      expect(spyValidateCode).toHaveBeenCalledWith(code, mission.checks);
      expect(result.allPassed).toBe(true);
      expect(result.results).toHaveLength(3);
    });
  });

  describe("Return Format and Summary", () => {
    it("returns correct success summary structure when all checks pass", async () => {
      const code = `
        use soroban_sdk::contractimpl;
        pub fn hello() {}
      `;
      const mission = { checks: [] };

      const result = await runTests(code, mission);

      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("allPassed", true);
      expect(result).toHaveProperty("passedCount", 2);
      expect(result).toHaveProperty("totalCount", 2);
      expect(result.summary).toBe("🎉 All 2 checks passed! Mission complete!");
    });

    it("returns correct failure summary structure when any check fails", async () => {
      const code = `
        use soroban_sdk::contractimpl;
        // no function defined
      `;
      const mission = { checks: [] };

      const result = await runTests(code, mission);

      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("allPassed", false);
      expect(result).toHaveProperty("passedCount", 1);
      expect(result).toHaveProperty("totalCount", 2);
      expect(result.summary).toBe("❌ 1/2 checks passed. Keep trying!");
    });

    it("handles mission without checks or undefined mission safely", async () => {
      const code = `
        use soroban_sdk::contractimpl;
        pub fn hello() {}
      `;

      const resultNoMission = await runTests(code);
      expect(resultNoMission.allPassed).toBe(true);
      expect(resultNoMission.totalCount).toBe(2);

      const resultNullChecks = await runTests(code, { checks: null });
      expect(resultNullChecks.allPassed).toBe(true);
      expect(resultNullChecks.totalCount).toBe(2);
    });
  });
});
