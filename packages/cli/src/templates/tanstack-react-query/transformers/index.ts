import main from "./mainTsx.transformer";

export default [
  {
    name: "main.tsx",
    dir: "src",
    parser: "tsx",
    transformer: main,
  },
];
