import { config } from "dotenv";
import { existsSync } from "fs";

/** Project `.env` (local dev), then production env on EC2 if present. */
export function loadPrismaEnv(): void {
  config();
  const prodPath =
    process.env.MONOPOLY_ENV_FILE?.trim() ||
    (existsSync("/var/lib/monopoly-run/.env") ? "/var/lib/monopoly-run/.env" : "");
  if (prodPath && existsSync(prodPath)) {
    config({ path: prodPath, override: true });
  }
}
