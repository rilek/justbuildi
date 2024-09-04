import { Command } from "commander";
import { z } from "zod";
import { Config, getConfigJson, Project } from "../utils";
import fse from "fs-extra";
import path from "path";
import { exec } from "child_process";
import templates from "../templates";
import jscodeshift, { API } from "jscodeshift";

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

const getRootDir = (options: Options, config: Config) => path.join(options.cwd, config.path);

const setupPackage = async (config: Config, project: Project) => {
  const { dir, name, dependencies, type } = project;
  const projectRoot = path.join(config.path, dir, name);

  await fse.ensureDir(projectRoot);

  if (type === "frontend")
    await execAsync(`cd ${projectRoot} && pnpm create vite . --template react-ts`);

  if (type === "backend")
    await execAsync(`cd ${projectRoot} && pnpx fastify-cli generate . --esm --lang=ts`);

  for await (const dependency of dependencies ?? []) {
    console.log(`[${type}] Adding ${dependency}`);

    const template = templates[dependency as keyof typeof templates];

    if (!template) {
      console.warn(`[${name}] Template for dependency ${dependency} not found`);
      return;
    }

    for (const t of template.transformers || []) {
      const { name, parser, dir, transformer } = t;
      const filePath = path.join(projectRoot, dir, name);
      const fileContent = await fse.readFile(filePath);

      const j = parser ? jscodeshift.withParser(parser) : jscodeshift;

      const transformedCode = transformer(
        { path: filePath, source: fileContent.toString() },
        { j, jscodeshift: j } as API,
        {}
      );

      if (!transformedCode) {
        throw new Error("Failed to transform code");
      }

      fse.writeFile(filePath, transformedCode);
    }

    for (const f of template.files || []) {
      const { name, dir, code } = f;
      const filePath = path.join(projectRoot, dir, name);
      await fse.ensureFile(filePath);
      await fse.writeFile(filePath, code);
    }

    await execAsync(`cd ${projectRoot} && pnpm install ${dependency}`);
  }

  console.log("[root] Installing dependencies");
  await execAsync(`cd ${projectRoot} && pnpm install`);
};

const setupRepo = async (options: Options, config: Config) => {
  const repoRoot = getRootDir(options, config);
  await fse.ensureDir(repoRoot);

  console.log(`[Root] Creating turborepo...`);
  await execAsync(
    `cd ${repoRoot} && pnpx create-turbo@latest . -m pnpm --skip-install --skip-transforms`
  );
  await execAsync(`cd ${repoRoot} && rm -rf apps packages`);

  console.log("[Root] Writing pnpm-workspace.yaml...");
  const pnpmWorkspaces = config.projects.map((p) => {
    const dirPath = p.dir.split("/");
    if (dirPath.length > 0) return dirPath[0];
  });
  await fse.writeFile(
    path.join(repoRoot, "pnpm-workspace.yaml"),
    `packages:
  - "${pnpmWorkspaces.join('/*"\n  - "')}/*"`
  );
};

const initAction = async (opts: unknown) => {
  const options = optionsSchema.parse(opts);
  const config = await getConfigJson(options.cwd);
  const repoRoot = getRootDir(options, config);

  if(!config) {
    throw new Error ("No config found");
  }

  try {
    fse.emptyDir(getRootDir(options, config));

    await setupRepo(options, config);

    for await (const p of config.projects) {
      await setupPackage(config, p);
    }

    await execAsync(`cd ${repoRoot} && pnpm install`);
  } catch (e) {
    console.error(e);
  } finally {
    if (config)
      await fse.writeJSON(path.join(options.cwd, "justbuildit.config.json"), config, {
        spaces: 2,
      });

    process.exit(1);
  }
};

export const init = new Command()
  .name("init")
  .description("Init your project")
  .option("-c, --cwd <cwd>", "set the current working directory", process.cwd())
  .action(initAction);

export default init;
