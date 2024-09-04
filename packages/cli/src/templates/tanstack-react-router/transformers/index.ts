import main from "./viteConfig.transformer";

export default [
  {
    name: "vite.config.ts",
    dir: ".",
    parser: "ts",
    transformer: main,
  },
];
