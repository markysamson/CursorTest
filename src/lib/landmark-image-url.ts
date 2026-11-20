/** Stable Wikimedia Commons thumbnail URL (Special:FilePath redirects to upload.wikimedia.org). */
export function commonsLandmarkImageUrl(commonsFileName: string, width = 640): string {
  const file = commonsFileName.replace(/^File:/i, "").trim();
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

/** Short fingerprint of a photo URL, used to bust caches when an admin changes a photo. */
export function photoRevision(url: string | null | undefined): string {
  if (!url) return "0";
  let hash = 5381;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) + hash + url.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

export function landmarkImageProxyUrl(locationId: string, rev?: string): string {
  const base = `/api/landmark-image?locationId=${encodeURIComponent(locationId)}`;
  return rev ? `${base}&v=${encodeURIComponent(rev)}` : base;
}
