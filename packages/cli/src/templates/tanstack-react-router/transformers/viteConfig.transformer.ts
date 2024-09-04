import { type Transform } from "jscodeshift";
import { addImport } from "../../utils";

export const transformer: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  addImport(j, root, ["TanStackRouterVite"], "@tanstack/router-plugin/vite");

  const pluginsArray = root
    .find(j.CallExpression)
    .filter((path) => path.value.callee?.name === "defineConfig")
    .find(j.ObjectProperty)
    .filter((path) => path.value.key?.name === "plugins")
    .find(j.ArrayExpression);

  pluginsArray.forEach((path) => {
    path.value.elements.push(j.callExpression(j.identifier("TanStackRouterVite"), []));
  });

  return root.toSource();
};

export default transformer;
