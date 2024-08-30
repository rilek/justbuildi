#!/usr/bin/env node

import { Command } from "commander";
import { getPackageJson } from "./utils/index";

import init from "./commands/init";

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

const start = async () => {
  const packageJson = await getPackageJson();

  const program = new Command()
    .name("justbuildit")
    .description("Manage project service coumponents with commands")
    .version(
      packageJson.version || "0.0.1",
      "-v, --version",
      "display the version number"
    );

  program.addCommand(init);

  program.parse();
}

start();
