import tsEslint from "typescript-eslint";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier"

export default [
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintConfigPrettier
];
