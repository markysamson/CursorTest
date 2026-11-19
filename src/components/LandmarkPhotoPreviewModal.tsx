"use client";

import { useEffect } from "react";

type Props = {
  name: string;
  imageUrl: string;
  onClose: () => void;
};

export function LandmarkPhotoPreviewModal({ name, imageUrl, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Reference photo: ${name}`}
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Reference photo: ${name}`}
          className="max-h-[80vh] w-full rounded-xl object-contain"
        />
        <p className="mt-3 text-center text-sm font-semibold text-white">{name}</p>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-cloudera-navy shadow"
        >
          Close
        </button>
      </div>
    </div>
  );
}
