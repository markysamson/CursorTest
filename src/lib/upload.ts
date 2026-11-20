import { getUploadRoot } from "@/lib/data-paths";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFor(mime: string): string {
  return mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
}

export async function saveSelfie(file: File, gameId: string): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Selfie must be a JPEG, PNG, or WebP image.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Selfie must be under 8MB.");
  }
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${extensionFor(file.type)}`;
  const dir = path.join(getUploadRoot(), gameId);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${gameId}/${name}`;
}

const LANDMARK_DIR = "landmarks";
const LANDMARK_URL_PATTERN = /^\/uploads\/landmarks\/[a-z0-9.-]+$/i;

export function isUploadedLandmarkPhoto(url: string | null | undefined): url is string {
  return !!url && LANDMARK_URL_PATTERN.test(url) && !url.includes("..");
}

/** Store an admin-supplied reference photo for a property. */
export async function saveLandmarkPhoto(file: File, locationId: string): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Photo must be a JPEG, PNG, or WebP image.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Photo must be under 12MB.");
  }
  const name = `${locationId}-${Date.now()}.${extensionFor(file.type)}`;
  const dir = path.join(getUploadRoot(), LANDMARK_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${LANDMARK_DIR}/${name}`;
}

/** Best-effort cleanup of a previously uploaded reference photo. */
export async function removeLandmarkPhotoFile(url: string | null | undefined): Promise<void> {
  if (!isUploadedLandmarkPhoto(url)) return;
  const root = path.resolve(getUploadRoot());
  const full = path.resolve(root, LANDMARK_DIR, path.basename(url));
  if (!full.startsWith(root + path.sep)) return;
  await unlink(full).catch(() => undefined);
}
