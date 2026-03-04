// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint/config'

export default defineConfig({
  ignores: ["dist", "node_modules"],

  files: ["**/*.{js,jsx}"],

  extends: [
    js.configs.recommended,
    react.configs.flat.recommended,
    reactHooks.configs.flat.recommended,
    reactRefresh.configs.vite,
  ],

  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: globals.browser,

    parserOptions: {
      ecmaFeatures: { jsx: true },   // JSX sin parser adicional
    }
  },

  rules: {
    // Marcar imports faltantes
    "no-undef": "error",

    // React 17+
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",

    "no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_" }
    ]
  },
})
