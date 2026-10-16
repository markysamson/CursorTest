import { getUploadRoot } from "@/lib/data-paths";
import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function safeUploadPath(segments: string[]): string | null {
  if (segments.length !== 2) {
    return null;
  }
  const [gameId, fileName] = segments;
  if (!/^[a-z0-9]+$/i.test(gameId)) {
    return null;
  }
  if (!/^[a-z0-9.-]+$/i.test(fileName) || fileName.includes("..")) {
    return null;
  }
  const ext = path.extname(fileName).toLowerCase();
  if (!MIME[ext]) {
    return null;
  }

  const root = path.resolve(getUploadRoot());
  const full = path.resolve(root, gameId, fileName);
  if (!full.startsWith(root + path.sep)) {
    return null;
  }
  return full;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const filePath = safeUploadPath(segments);
  if (!filePath) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return new NextResponse(null, { status: 404 });
    }
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
