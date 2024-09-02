import fse from "fs-extra";
import path from "path";
import { type PackageJson } from "type-fest";
import { fileURLToPath } from "url";
import { z } from "zod";

export const getPackageJson = (): Promise<PackageJson> => {
  const currentPath = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(currentPath, "package.json");
  return fse.readJson(filePath);
};

const projectSchema = z.object({
  name: z.string().min(1),
  dir: z.string().min(1),
  type: z.string().min(1),
  template: z.string().optional(),
  bundler: z.string().min(1),
  dependencies: z.array(z.string()).optional()
})

const configSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  projects: z.array(projectSchema)
});

export type Config = z.infer<typeof configSchema>;
export type Project = z.infer<typeof projectSchema>;

export const getConfigJson = async (cwd: string) =>
  configSchema.parseAsync(
    await fse.readJSON(path.join(cwd, "justbuildit.config.json"))
  );