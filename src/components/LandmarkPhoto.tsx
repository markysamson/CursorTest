"use client";

type Props = {
  name: string;
  imageUrl: string | null | undefined;
  className?: string;
  /** When set, the photo is clickable (e.g. to open a larger preview). */
  onActivate?: () => void;
};

export function LandmarkPhoto({
  name,
  imageUrl,
  className = "h-24 w-full rounded-lg object-cover",
  onActivate,
}: Props) {
  const interactive = Boolean(imageUrl && onActivate);

  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-cloudera-muted text-xs font-medium text-cloudera-gray ${className}`}
      >
        Reference photo
      </div>
    );
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={`Reference photo: ${name}`}
      className={`${className}${interactive ? " cursor-pointer" : ""}`}
      loading="lazy"
    />
  );

  if (!interactive) {
    return img;
  }

  return (
    <button
      type="button"
      className="block shrink-0 border-0 bg-transparent p-0 text-left"
      aria-label={`View larger photo for ${name}`}
      onClick={(e) => {
        e.stopPropagation();
        onActivate?.();
      }}
    >
      {img}
    </button>
  );
}
