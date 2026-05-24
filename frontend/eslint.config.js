import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,

      // 🔥 CLAVE REAL PARA JSX EN ESLINT MODERNO
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
rules: {
  ...reactHooks.configs.recommended.rules,

  "react-refresh/only-export-components": "warn",

  // 🔥 DESACTIVAR VARIABLES NO USADAS
  "no-unused-vars": "off"
},
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": "warn",
    },
  },
];