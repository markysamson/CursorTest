import path from "path";

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

/** Persistent state directory on VPS (e.g. Oracle Always Free: `/var/lib/monopoly-run`). */
export function getMonopolyDataDir(): string | null {
  const raw = process.env.MONOPOLY_DATA_DIR?.trim();
  if (!raw) {
    return null;
  }
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

export function usesExternalDataDir(): boolean {
  return getMonopolyDataDir() != null;
}

export function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  if (fromEnv) {
    return resolveFileDatabaseUrl(fromEnv);
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
