"use client";

import { useRef, useState } from "react";

const MAX_SHOTS = 5;

export default function Viewfinder({ onImage, busy }) {
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [shots, setShots] = useState([]);

  const read = (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    for (const file of list.slice(0, MAX_SHOTS)) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result);
        const img = new window.Image();
        img.onload = () => {
          // A raw phone photo base64-encodes to several megabytes, which the
          // vision request cannot carry. 1568px on the long edge is the point
          // past which the model gains no detail, so downscaling to it is free
          // accuracy-wise and keeps small labels legible.
          const scale = Math.min(1, 1568 / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          const jpeg = canvas.toDataURL("image/jpeg", 0.82);
          add({ dataUrl: jpeg, base64: jpeg.split(",")[1], mediaType: "image/jpeg" });
        };
        img.onerror = () =>
          add({ dataUrl: url, base64: url.split(",")[1], mediaType: file.type });
        img.src = url;
      };
      reader.readAsDataURL(file);
    }
  };

  const add = (shot) =>
    setShots((prev) => (prev.length >= MAX_SHOTS ? prev : [...prev, shot]));

  const remove = (i) => setShots((prev) => prev.filter((_, x) => x !== i));

  const full = shots.length >= MAX_SHOTS;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); read(e.dataTransfer.files); }}
      className={`relative border transition-colors duration-300 ${
        dragging ? "border-cream/60 bg-cream/5" : "border-line bg-char"
      }`}
    >
      <div className="flex flex-col items-center px-6 py-16 text-center sm:py-24">
        <button
          type="button"
          disabled={busy || full}
          onClick={() => cameraRef.current?.click()}
          aria-label="Take a photo of your fridge"
          className="group relative grid h-24 w-24 place-items-center border border-cream/80 text-cream transition-all duration-300 hover:bg-cream hover:text-void disabled:opacity-50"
        >
          {busy ? (
            <svg viewBox="0 0 24 24" className="h-8 w-8 animate-spin">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
              <path
                d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2a1.5 1.5 0 0 0 1.25-.67l.6-.9A1.5 1.5 0 0 1 10.8 3.5h2.4a1.5 1.5 0 0 1 1.25.93l.6.9A1.5 1.5 0 0 0 16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
                stroke="currentColor" strokeWidth="1.6"
              />
              <circle cx="12" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          )}
        </button>

        <p className="mt-8 text-sm tracking-[0.2em] uppercase">
          {busy
            ? "Reading ingredients…"
            : shots.length
              ? "Add another angle"
              : "Photograph your fridge"}
        </p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-cream/40">
          {busy
            ? "Identifying everything edible in your photos."
            : shots.length
              ? `${shots.length} of ${MAX_SHOTS} added. Shoot the pantry and counter too, then scan.`
              : "No typing required. Kairos identifies what you have and what is safe to cook."}
        </p>

        {shots.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {shots.map((s, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.dataUrl} alt={`Shot ${i + 1}`} className="h-16 w-16 border border-line object-cover" />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center border border-line bg-void text-cream/60 transition-colors hover:border-cream hover:text-cream disabled:opacity-40"
                >
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5">
                    <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="3" />
                    <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {shots.length > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onImage(shots)}
            className="mt-8 w-full max-w-xs border border-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition duration-300 hover:bg-cream hover:text-void disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Scanning…" : `Scan ${shots.length} photo${shots.length > 1 ? "s" : ""}`}
          </button>
        )}

        <button
          type="button"
          disabled={busy || full}
          onClick={() => fileRef.current?.click()}
          className="mt-6 text-[11px] tracking-[0.3em] text-cream/40 uppercase underline underline-offset-4 transition-colors hover:text-cream disabled:opacity-40"
        >
          {shots.length ? "Upload more" : "Upload instead"}
        </button>
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { read(e.target.files); e.target.value = ""; }} />
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { read(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
