type Props = {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function ProductTitle({ title, subtitle, align = "left" }: Props) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-cloudera-orange-dark">
        Monopoly Run
      </p>
      <h1 className="mt-1 text-2xl font-bold text-cloudera-navy md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm font-medium text-cloudera-gray">{subtitle}</p>}
    </div>
  );
}
