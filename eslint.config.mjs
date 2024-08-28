import tsEslint from "typescript-eslint";
import js from "@eslint/js";

// const project = resolve(process.cwd(), "tsconfig.json");

export default [
  js.configs.recommended,
  ...tsEslint.configs.recommended,
];
