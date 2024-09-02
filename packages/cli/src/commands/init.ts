import { Command } from "commander";
import { z } from "zod";
import { Config, getConfigJson, Project } from "../utils";
import fse from "fs-extra";
import path from "path";

import { exec } from "child_process";
import { PackageJson } from "type-fest";

const optionsSchema = z.object({
  cwd: z.string().min(1),
});

const execAsync = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stdout);
    });
  });
};

type Options = z.infer<typeof optionsSchema>;

const getRootDir = (options: Options, config: Config) =>
  path.join(options.cwd, config.path);

const setupPackage = async (config: Config, project: Project) => {
  const { dir, name, dependencies, type } = project;
  const projectRoot = path.join(config.path, dir, name);

  await fse.ensureDir(projectRoot);

  if (type === "frontend")
    await execAsync(
      `cd ${projectRoot} && pnpm create vite . --template react-ts`
    );

  if (type === "backend")
    await execAsync(
      `cd ${projectRoot} && pnpx fastify-cli generate . --esm --lang=ts`
    );

  for await (const dep of dependencies ?? []) {
    console.log(`Adding ${dep} to ${name}`);

    if (type === "frontend") {
      switch (dep) {
        case "@tanstack/react-query":
          break;
        case "@tanstack/react-router":
          break;
        default:
          console.error(`Unknown dependency: ${dep}`);
      }
    }

    await execAsync(`cd ${projectRoot} && pnpm add ${dep}`);
  }
};

const setupRepo = async (options: Options, config: Config) => {
  const repoRoot = getRootDir(options, config);
  await fse.ensureDir(repoRoot);

  console.log("Creating turborepo...");
  await execAsync(`cd ${repoRoot} && pnpx create-turbo@latest . -m pnpm`);
  await execAsync(`cd ${repoRoot} && rm -rf apps packages`);

  console.log("Writing pnpm-workspace.yaml...");
  const pnpmWorkspaces = config.projects.map((p) => {
    const dirPath = p.dir.split("/");
    if (dirPath.length > 0) return dirPath[0];
  });
  await fse.writeFile(
    path.join(repoRoot, "pnpm-workspace.yaml"),
    `packages:
  - "${pnpmWorkspaces.join('/*"\n  - "')}/*"`
  );

  console.log("Updating package.json...");
  const deps = config.projects.map((p) => p.dependencies).flat();
  const packageJson = (await fse.readJson(
    path.join(repoRoot, "package.json")
  )) as PackageJson;

  packageJson.name = config.name;
  packageJson.dependencies = {
    ...packageJson.dependencies,
    ...Object.fromEntries(deps.map((d) => [d, "*"])),
  };

  await fse.writeFile(
    path.join(repoRoot, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  const projects = config.projects;

  for await (const p of projects) {
    await setupPackage(config, p);
  }

  await execAsync(`cd ${repoRoot} && pnpm install`);
};

const initAction = async (opts: unknown) => {
  const options = optionsSchema.parse(opts);
  const config = await getConfigJson(options.cwd);

  try {
    fse.emptyDir(getRootDir(options, config));

    await setupRepo(options, config);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

export const init = new Command()
  .name("init")
  .description("Init your project")
  .option("-c, --cwd <cwd>", "set the current working directory", process.cwd())
  .action(initAction);

export default init;