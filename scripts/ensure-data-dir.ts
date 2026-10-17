import { mkdir } from "fs/promises";
import { getMonopolyDataDir, getUploadRoot, resolveDatabaseUrl } from "../src/lib/data-paths";
import path from "path";

async function main() {
  const dataDir = getMonopolyDataDir();
  if (dataDir) {
    await mkdir(dataDir, { recursive: true, mode: 0o750 });
  }
  await mkdir(getUploadRoot(), { recursive: true, mode: 0o750 });

  const dbUrl = resolveDatabaseUrl();
  if (dbUrl.startsWith("file:")) {
    const dbPath = dbUrl.slice("file:".length);
    await mkdir(path.dirname(dbPath), { recursive: true, mode: 0o750 });
  }
}

main().catch((err) => {
  console.error("[ensure-data-dir]", err);
  process.exit(1);
});
