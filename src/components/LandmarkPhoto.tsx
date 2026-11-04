type Props = {
  name: string;
  imageUrl: string | null | undefined;
  className?: string;
};

export function LandmarkPhoto({ name, imageUrl, className = "h-24 w-full rounded-lg object-cover" }: Props) {
  if (!imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-cloudera-muted text-xs font-medium text-cloudera-gray ${className}`}
      >
        Reference photo
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={`Reference photo: ${name}`} className={className} loading="lazy" />
  );
}
