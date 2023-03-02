#!/usr/bin/env node

import migrations from "./migrations";
import { program } from "commander";

program
  .command("migrations")
  .option("-d, --directory <dir>", "custom output directory")
  .action(migrations);

program.parse();
