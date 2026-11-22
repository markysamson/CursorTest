"use client";

import { useEffect } from "react";

export type LightboxItem = {
  src: string;
  title: string;
  subtitle?: string;
};

export function PhotoLightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
}) {
  const count = items.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && count > 1) onIndex((index - 1 + count) % count);
      if (e.key === "ArrowRight" && count > 1) onIndex((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onIndex, onClose]);

  const item = items[index];
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.title}
          className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain"
        />
        <div className="mt-3 text-center text-white">
          <p className="text-base font-bold">{item.title}</p>
          {item.subtitle && <p className="text-sm text-white/80">{item.subtitle}</p>}
          <p className="mt-1 text-xs text-white/60">
            {count > 1 ? `${index + 1} of ${count} · ` : ""}
            <a href={item.src} target="_blank" rel="noreferrer" className="underline">
              Open full size
            </a>
            {" · "}
            <a href={item.src} download className="underline">
              Download
            </a>
          </p>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => onIndex((index - 1 + count) % count)}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-xl font-bold text-cloudera-navy shadow hover:bg-white sm:-left-6"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => onIndex((index + 1) % count)}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-xl font-bold text-cloudera-navy shadow hover:bg-white sm:-right-6"
            >
              ›
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 right-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-cloudera-navy shadow sm:-right-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
