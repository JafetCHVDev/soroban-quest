import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  // Base JS recommended rules
  js.configs.recommended,

  // Main config for JS/JSX files
  {
    files: ["**/*.{js,jsx}"],

    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },

    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        // Browser globals
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      react: {
        // Auto-detect React version
        version: "detect",
      },
    },

    rules: {
      // React recommended rules
      ...reactPlugin.configs.recommended.rules,

      // React Hooks rules (enforced as errors)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React-specific tweaks
      "react/react-in-jsx-scope": "off",      
      "react/prop-types": "warn",             
      "react/jsx-no-target-blank": "error",    
      "react/self-closing-comp": "warn",       
      "react/jsx-curly-brace-presence": [      
        "warn", "never"
      ],

      // General JS quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // Prettier must be last — disables all rules that conflict with formatting
  prettierConfig,
];