import Image from "next/image";
import Link from "next/link";

/** Official wordmark from cloudera.com (transparent PNG). */
const LOGO_SRC = "/brand/cloudera-new-logo.png";
const LOGO_ASPECT = 736 / 92;

type Props = {
  href?: string;
  size?: "sm" | "md" | "lg";
};

const heights = { sm: 28, md: 36, lg: 44 } as const;

export function ClouderaLogo({ href = "/", size = "md" }: Props) {
  const height = heights[size];
  const width = Math.round(height * LOGO_ASPECT);

  const image = (
    <Image
      src={LOGO_SRC}
      alt="Cloudera"
      width={width}
      height={height}
      className="h-auto w-auto max-w-full"
      priority={size === "lg"}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {image}
      </Link>
    );
  }

  return image;
}
