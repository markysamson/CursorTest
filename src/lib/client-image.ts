/**
 * Shrink a phone photo before upload. Reference photos are shown in lists on teams'
 * phones, so a 5 MB original would be wasteful over mobile data.
 */
export async function resizeImageForUpload(
  file: File,
  maxEdge = 1280,
  quality = 0.82,
): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) throw new Error("Could not encode image");
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return file;
    }
    throw new Error("That image format is not supported. Use a JPEG, PNG or WebP photo.");
  }
}
