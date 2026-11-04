/** Stable Wikimedia Commons thumbnail URL (Special:FilePath redirects to upload.wikimedia.org). */
export function commonsLandmarkImageUrl(commonsFileName: string, width = 640): string {
  const file = commonsFileName.replace(/^File:/i, "").trim();
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
}

export function landmarkImageProxyUrl(locationId: string): string {
  return `/api/landmark-image?locationId=${encodeURIComponent(locationId)}`;
}
