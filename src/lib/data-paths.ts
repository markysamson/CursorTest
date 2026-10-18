import path from "path";

function stripEnvQuotes(value: string): string {
  const t = value.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function resolveFileDatabaseUrl(url: string): string {
  const prefix = "file:";
  if (!url.startsWith(prefix)) {
    return url;
  }
  const raw = url.slice(prefix.length);
  if (path.isAbsolute(raw)) {
    return `${prefix}${raw}`;
  }
  return `${prefix}${path.join(process.cwd(), raw)}`;
}

/** Persistent state directory on EC2/VPS (e.g. `/var/lib/monopoly-run`). */
export function getMonopolyDataDir(): string | null {
  const raw = process.env.MONOPOLY_DATA_DIR?.trim();
  if (!raw) {
    return null;
  }
  const dir = stripEnvQuotes(raw);
  return path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
}

export function usesExternalDataDir(): boolean {
  return getMonopolyDataDir() != null;
}

export function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  if (fromEnv) {
    return resolveFileDatabaseUrl(stripEnvQuotes(fromEnv));
  }
  const dataDir = getMonopolyDataDir();
  if (dataDir) {
    return resolveFileDatabaseUrl(`file:${path.join(dataDir, "data.db")}`);
  }
  return resolveFileDatabaseUrl("file:./dev.db");
}

export function getUploadRoot(): string {
  const dataDir = getMonopolyDataDir();
  if (dataDir) {
    return path.join(dataDir, "uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}
