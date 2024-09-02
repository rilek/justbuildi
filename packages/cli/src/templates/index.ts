import transformer from "./react-query";

export default {
  "@tanstack/react-query": [
    {
      bundler: "vite",
      template: "react-ts",
      file: "src/main.tsx",
      transformer,
    },
  ],
} as const;
