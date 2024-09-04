import { type Transform } from "jscodeshift";
import { addGlobal, addImport, wrapReactComponentChildren } from "../../utils";

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
