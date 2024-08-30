import fse from "fs-extra";
import path from "path";
import { type PackageJson } from "type-fest";
import { fileURLToPath } from "url";

export const getPackageJson = (): Promise<PackageJson> => {
  const currentPath = path.dirname(fileURLToPath(import.meta.url))
  const filePath = path.join(currentPath, "package.json");
  return fse.readJson(filePath);
};

export const getConfigJson = (cwd: string): Promise<unknown> =>
  fse.readJSON(path.join(cwd, "justbuildit.config.json"));
