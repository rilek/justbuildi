import { type Transform, type JSCodeshift, type Collection } from "jscodeshift";
import { addGlobal, addImport } from "./utils";

const wrapReactComponentChildren = (
  j: JSCodeshift,
  root: Collection<unknown>,
  componentName: string,
  wrapperName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, { type: "expression" | "value"; value: any }> = {}
) => {
  root.findJSXElements(componentName).forEach((el) => {
    const newElement = j.jsxElement(
      j.jsxOpeningElement(
        j.jsxIdentifier(wrapperName),
        Object.entries(props).map(([k, { type, value }]) =>
          j.jsxAttribute(
            j.jsxIdentifier(k),
            type === "expression"
              ? j.jsxExpressionContainer(j.identifier(value))
              : j.stringLiteral(value)
          )
        )
      ),
      j.jsxClosingElement(j.jsxIdentifier(wrapperName)),
      [j.jsxText("\n"), el.node, j.jsxText("\n")]
    );

    el.replace(newElement);
  });
};

export const transformer: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  addImport(j, root, ["QueryClient", "QueryClientProvider"], "@tanstack/react-query");
  addGlobal(j, root, "const queryClient = new QueryClient()");

  wrapReactComponentChildren(j, root, "App", "QueryClientProvider", {
    client: { type: "expression", value: "queryClient" },
  });

  return root.toSource();
};

export default transformer;
