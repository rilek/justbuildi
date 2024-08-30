import { Command } from "commander";
import z from "zod";
import { getConfigJson } from "../utils";

const optionsSchema = z.object({
  cwd: z.string().min(1)
});


export const init = new Command()
  .name("init")
  .description("Init your project")
  .option(
    "-c, --cwd <cwd>",
    "set the current working directory",
    process.cwd()
  ).action(async (opts) => {
    const options = optionsSchema.parse(opts);
    const config = await getConfigJson(options.cwd);
    console.log(config);
  });

export default init;
