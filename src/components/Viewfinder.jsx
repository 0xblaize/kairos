"use client";

import { useRef, useState } from "react";
import AmbientField from "@/components/AmbientField";

export default function Viewfinder({ onImage, busy }) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const read = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      onImage({
        dataUrl: url,
        base64: url.split(",")[1],
        mediaType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        read(e.dataTransfer.files?.[0]);
      }}
      className={`relative isolate overflow-hidden rounded-[2rem] border transition-colors ${
        dragging ? "border-cream/60 bg-cream/5" : "border-line bg-char"
      }`}
    >
      <AmbientField className="pointer-events-none absolute inset-0 -z-10 opacity-70" />

      <div className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
        <button
          type="button"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
          className="group relative grid h-28 w-28 place-items-center rounded-full bg-cream text-void transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 sm:h-32 sm:w-32"
          aria-label="Take a photo of your fridge"
        >
          <span className="pulse-ring absolute inset-0 rounded-full border-2 border-cream" />
          {busy ? (
            <svg viewBox="0 0 24 24" className="h-9 w-9 animate-spin">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none">
              <path
                d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2a1.5 1.5 0 0 0 1.25-.67l.6-.9A1.5 1.5 0 0 1 10.8 3.5h2.4a1.5 1.5 0 0 1 1.25.93l.6.9A1.5 1.5 0 0 0 16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          )}
        </button>

        <p className="mt-7 text-lg font-medium">
          {busy ? "Reading your ingredients…" : "Snap your fridge or counter"}
        </p>
        <p className="mt-1.5 max-w-xs text-sm text-fog">
          {busy
            ? "Identifying everything edible in the photo."
            : "No typing. Kairos works out what you have and what is safe to cook."}
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="mt-6 text-sm text-fog underline underline-offset-4 transition-colors hover:text-cream disabled:opacity-50"
        >
          or upload a photo
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => read(e.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => read(e.target.files?.[0])}
      />
    </div>
  );
}
