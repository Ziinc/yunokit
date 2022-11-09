import { execSync } from "child_process";
import { program } from "commander";
import { DATABASE_URL } from "./constants";
import { exportContent } from "./export";

require("dotenv").config({ path: ".env.secret" });

const env = process.env.NODE_ENV || "dev";
require("dotenv").config({ path: `.env.${env}`, override: true });
require("dotenv").config({ path: `.env.${env}.secret`, override: true });

program
  .command("migrate <direction>")
  .action(async (direction: "up" | "down", _options, command) => {
    if (!["up", "down"].includes(direction)) {
      throw Error("Unknown value for directoin, expected up or down");
    }

    const stdout = execSync(`dbmate ${direction}`, {
      env: {
        DATABASE_URL: DATABASE_URL + "?sslmode=disable",
        PATH: process.env.PATH,
      },
    });
    const msg = stdout.toString();
    if (msg) {
      console.log(msg);
    }
  });

program
  .command("export <project_id>")
  .option("-f, --format", "file format")
  .option("--markdownBodyKey", "data key used for markdown file body")
  .action(exportContent);

// dev
program.command("drop", "drops the database").action(() => null);

// debugging
program
  .command("debug:env", { hidden: true })
  .action(() => console.log(process.env));

program.parseAsync();
