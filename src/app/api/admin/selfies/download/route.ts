import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listSelfies } from "@/lib/selfies";
import { resolveSelfieFile } from "@/lib/upload";
import { zipSync } from "fflate";
import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

function slug(value: string, max = 40) {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return (cleaned || "item").slice(0, max);
}

function stamp(iso: string) {
  return iso.slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const KIND_LABEL = { PURCHASE: "bought", RENT: "rent", PASS: "passed", CHANCE: "chance" } as const;

/**
 * A zip of every selfie, oldest first. File names start with a running number and a
 * timestamp, so slideshow software that sorts by name plays them in the order they happened.
 */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const game = await prisma.game.findFirst({ orderBy: { createdAt: "desc" } });
  if (!game) {
    return NextResponse.json({ error: "No game yet" }, { status: 404 });
  }

  const teamId = new URL(request.url).searchParams.get("teamId") || undefined;
  const items = (await listSelfies(game.id, teamId)).reverse();

  const files: Record<string, Uint8Array> = {};
  const rows = ["file,team,type,title,detail,amount_gbp,time_utc"];

  for (const item of items) {
    const full = resolveSelfieFile(item.selfiePath);
    if (!full) continue;
    let data: Buffer;
    try {
      data = await readFile(full);
    } catch {
      continue;
    }
    const ext = path.extname(full).toLowerCase() || ".jpg";
    const name = [
      String(Object.keys(files).length + 1).padStart(3, "0"),
      stamp(item.createdAt),
      slug(item.teamName, 24),
      KIND_LABEL[item.kind],
      slug(item.title, 36),
    ].join("_");
    const fileName = `${name}${ext}`;
    files[fileName] = new Uint8Array(data);
    rows.push(
      [fileName, item.teamName, KIND_LABEL[item.kind], item.title, item.detail, item.amount, item.createdAt]
        .map(csvCell)
        .join(","),
    );
  }

  if (Object.keys(files).length === 0) {
    return NextResponse.json({ error: "There are no selfies to download yet." }, { status: 404 });
  }

  files["captions.csv"] = new TextEncoder().encode(rows.join("\n") + "\n");
  const zip = zipSync(files, { level: 0 });

  const teamName = teamId ? items[0]?.teamName : undefined;
  const label = slug(teamName ? `${game.name}-${teamName}` : game.name, 60);
  return new Response(new Blob([new Uint8Array(zip)], { type: "application/zip" }), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${label}-selfies.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
