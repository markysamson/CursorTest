import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 44, text: "text-2xl" },
};

function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="12" cy="12" r="12" fill="#F96702" />
      <path
        fill="#ffffff"
        d="M12 4.749a7.251 7.251 0 1 0 0 14.502 7.251 7.251 0 0 0 0-14.502zm.303 17.926a8.25 8.25 0 1 1 0-16.502 8.21 8.21 0 0 1 5.633 2.234l-2.458 2.453a4.686 4.686 0 0 0-3.175-1.239 4.709 4.709 0 1 0 3.284 8.081l2.657 2.346a8.224 8.224 0 0 1-5.941 2.533z"
      />
    </svg>
  );
}

export function ClouderaLogo({ href = "/", size = "md", showWordmark = true }: Props) {
  const s = sizes[size];
  const content = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={s.icon} />
      {showWordmark && (
        <span className={`${s.text} font-semibold tracking-tight text-cloudera-charcoal`}>
          Cloudera
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {content}
      </Link>
    );
  }

  return content;
}
