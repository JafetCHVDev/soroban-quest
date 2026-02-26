import { describe, it, expect } from "vitest";
import { validateCode } from "../codeValidator.js";

describe("codeValidator", () => {
  describe("has_function", () => {
    it("passes when function is present", () => {
      const code = `
                pub fn my_function(x: i32) -> i32 {
                    x + 1
                }
            `;
      const checks = [{ type: "has_function", name: "my_function" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when function is missing", () => {
      const code = `
                pub fn other_function(x: i32) -> i32 {
                    x + 1
                }
            `;
      const checks = [{ type: "has_function", name: "my_function" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });

    it("validates function parameters", () => {
      const code = `
                pub fn my_function(x: i32, y: i32) -> i32 {
                    x + y
                }
            `;
      const checks = [
        {
          type: "has_function",
          name: "my_function",
          params: ["x: i32", "y: i32"],
        },
      ];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });
  });

  describe("has_attribute", () => {
    it("passes when attribute is present", () => {
      const code = `
                #[contract]
                pub struct MyContract {
                    value: i32,
                }
            `;
      const checks = [{ type: "has_attribute", attribute: "contract" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when attribute is missing", () => {
      const code = `
                pub struct MyContract {
                    value: i32,
                }
            `;
      const checks = [{ type: "has_attribute", attribute: "contract" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });
  });

  describe("returns_type", () => {
    it("passes when function returns correct type", () => {
      const code = `
                pub fn calculate() -> i32 {
                    42
                }
            `;
      const checks = [
        { type: "returns_type", function: "calculate", returnType: "i32" },
      ];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when function returns wrong type", () => {
      const code = `
                pub fn calculate() -> String {
                    "hello".to_string()
                }
            `;
      const checks = [
        { type: "returns_type", function: "calculate", returnType: "i32" },
      ];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });
  });

  describe("contains_pattern", () => {
    it("passes when pattern is present", () => {
      const code = `
                let x = 5;
                println!("{}", x);
            `;
      const checks = [{ type: "contains_pattern", pattern: "println!" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when pattern is absent", () => {
      const code = `
                let x = 5;
            `;
      const checks = [{ type: "contains_pattern", pattern: "println!" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });
  });

  describe("no_pattern", () => {
    it("passes when forbidden pattern is absent", () => {
      const code = `
                let x = 5;
                x + 1
            `;
      const checks = [{ type: "no_pattern", pattern: "println!" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when forbidden pattern is present", () => {
      const code = `
                let x = 5;
                println!("{}", x);
            `;
      const checks = [{ type: "no_pattern", pattern: "println!" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });
  });

  describe("storage_operation", () => {
    it("passes when storage set operation is present", () => {
      const code = `
                env.storage().instance().set(&key, &value);
            `;
      const checks = [{ type: "storage_operation", operation: "set" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when storage operation is missing", () => {
      const code = `
                let x = 5;
            `;
      const checks = [{ type: "storage_operation", operation: "set" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });
  });

  describe("balanced_braces", () => {
    it("passes when braces are balanced", () => {
      const code = `
                fn test() {
                    if true {
                        let x = 1;
                    }
                }
            `;
      const checks = [{ type: "balanced_braces" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when braces are unbalanced", () => {
      const code = `
                fn test() {
                    if true {
                        let x = 1;
                }
            `;
      const checks = [{ type: "balanced_braces" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });
  });

  describe("has_import", () => {
    it("passes when import is present", () => {
      const code = `
                use soroban_sdk::{contract, contractimpl, vec, Vec};
                #[contract]
                pub struct MyContract;
            `;
      const checks = [{ type: "has_import", module: "soroban_sdk" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(true);
    });

    it("fails when import is missing", () => {
      const code = `
                #[contract]
                pub struct MyContract;
            `;
      const checks = [{ type: "has_import", module: "soroban_sdk" }];
      const result = validateCode(code, checks);
      expect(result.passed).toBe(false);
    });
  });
});
