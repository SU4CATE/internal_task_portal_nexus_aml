import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_DATABASE_URL = "file:./data/portal.db";

export function getDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

  if (!url.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a SQLite file URL");
  }

  const filePath = url.slice("file:".length);
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  return pathToFileURL(absolutePath).href;
}
