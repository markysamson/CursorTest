import { COLOR_GROUP_STYLES } from "@/lib/locations-data";

/** Full-height stripe in the colour group, like the band on a Monopoly title deed. */
export function PropertyColorBar({ group, className = "" }: { group: string; className?: string }) {
  const style = COLOR_GROUP_STYLES[group];
  return (
    <span
      aria-hidden
      title={style?.label ?? group}
      className={`block w-2 shrink-0 self-stretch rounded-full ${style?.bg ?? "bg-zinc-400"} ${className}`}
    />
  );
}

/** Colour-group name on its own background. */
export function PropertyColorChip({ group, className = "" }: { group: string; className?: string }) {
  const style = COLOR_GROUP_STYLES[group];
  const dark = group !== "yellow" && group !== "light-blue" && group !== "pink";
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
        style?.bg ?? "bg-zinc-400"
      } ${dark ? "text-white" : "text-slate-900"} ${className}`}
    >
      {style?.label ?? group}
    </span>
  );
}
