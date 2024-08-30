import tsEslint from "typescript-eslint";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier"

export default [
  {
    ignores: [
      '**/dev/*',
      '**/dist/*',
      '**/tests/*',
      'tsconfig.json',
    ]
  },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  eslintConfigPrettier,
];
