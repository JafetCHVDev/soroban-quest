import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

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
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        location: "readonly",
        history: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        HTMLElement: "readonly",
        Element: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        // ES2021 globals
        globalThis: "readonly",
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
        { props: "never", children: "never" },
      ],

      // General JS quality rules
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // Prettier must be last — disables all rules that conflict with formatting
  prettierConfig,
];