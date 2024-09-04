import { type Transform } from "jscodeshift";
import tanstackReactQuery from "./tanstack-react-query";
import tanstackReactRouter from "./tanstack-react-router";

interface Template {
  files?: {
    name: string;
    dir: string;
    code: string;
  }[];
  transformers?: {
    name: string;
    dir: string;
    parser?: "tsx" | "ts";
    transformer: Transform;
  }[];
}

export default {
  "@tanstack/react-query": tanstackReactQuery,
  "@tanstack/react-router": tanstackReactRouter,
} as Record<string, Template>;
