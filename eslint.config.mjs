import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

const ignoresConfig = {
  ignores: ["build/**", "vendor/**", "var/**", "public/**"],
};

/*
  ===== IMPORTANT =====

  Many of these rules use "warn" severity levels. This is to reduce the amount of critical errors
  during adoption of the linting system. Once the initial lint errors are fixed, most should be
  elevated to "error"s.

  ===== IMPORTANT =====
*/

export default defineConfig([
  ignoresConfig,
  js.configs.recommended,
  pluginReact.configs.flat.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-key": [
        // Should be elevated to "error"
        "warn",
        {
          checkFragmentShorthand: true,
          warnOnDuplicates: true,
        },
      ],

      // Should be elevated to "error"
      "react/no-array-index-key": "warn",

      "react/checked-requires-onchange-or-readonly": "warn",

      // This should be enabled at same time all lint errors are fixed.
      // It currently creates too many errors and is annoying to work with.
      // "react/jsx-filename-extension": [
      //   "error",
      //   {
      //     allow: "as-needed",
      //   },
      // ],

      "react-hooks/set-state-in-effect": "warn",

      "no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
