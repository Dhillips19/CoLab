// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react", "@babel/preset-env"],
        }
      }
    },
    plugins: {
      react
    },
    rules: {
      "react/prop-types": "off",
      "no-unused-vars": "warn"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
