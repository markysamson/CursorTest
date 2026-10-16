import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import path from "path";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const prefix = "file:";
  if (!url.startsWith(prefix)) return url;
  const raw = url.slice(prefix.length);
  if (path.isAbsolute(raw)) return `${prefix}${raw}`;
  return `${prefix}${path.join(process.cwd(), raw)}`;
}

export function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
  return new PrismaClient({ adapter });
}
