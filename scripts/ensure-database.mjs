import "dotenv/config";

import { closeSync, mkdirSync, openSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const configuredUrl = process.env.DATABASE_URL ?? "file:./data/portal.db";

if (!configuredUrl.startsWith("file:")) {
  process.exit(0);
}

const projectDirectoryUrl = pathToFileURL(`${process.cwd()}${path.sep}`);
const databaseUrl = new URL(configuredUrl, projectDirectoryUrl);
const databasePath = fileURLToPath(databaseUrl);

mkdirSync(path.dirname(databasePath), { recursive: true });
closeSync(openSync(databasePath, "a"));
