"use client";

import { useState } from "react";
import { allergenLabel, dietLabel } from "@/lib/diet";

function Pill({ entry, onRemove }) {
  const unsafe = !entry.safe;
  const reason = entry.allergens.length
    ? `Contains ${entry.allergens.map(allergenLabel).join(", ").toLowerCase()}`
    : entry.dietConflict
      ? `Not ${dietLabel(entry.dietConflict).toLowerCase()}`
      : null;

  return (
    <span
      title={reason || undefined}
      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border py-2 pr-2 pl-3.5 text-sm transition-colors ${
        unsafe
          ? "border-alarm/60 bg-alarm/10 text-alarm"
          : "border-line bg-elev text-cream"
      }`}
    >
      {unsafe && (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path
            d="M12 4 2.5 20h19L12 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <line x1="12" y1="10" x2="12" y2="14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="17" r="1" fill="currentColor" />
        </svg>
      )}
      <span className={unsafe ? "line-through decoration-alarm/60" : ""}>{entry.name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${entry.name}`}
        className="grid h-5 w-5 place-items-center rounded-full text-fog transition-colors hover:bg-void hover:text-cream"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3">
          <line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

export default function IngredientBoard({ entries, onRemove, onAdd, onGenerate, busy }) {
  const [draft, setDraft] = useState("");
  const blocked = entries.filter((e) => !e.safe);
  const safe = entries.filter((e) => e.safe);

  const submit = (e) => {
    e.preventDefault();
    const v = draft.trim().toLowerCase();
    if (!v) return;
    onAdd(v);
    setDraft("");
  };

  return (
    <section className="rise">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-3xl">Verified pantry</h2>
        <span className="text-sm text-fog">
          {safe.length} usable{blocked.length > 0 && ` · ${blocked.length} blocked`}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {entries.map((entry, i) => (
          <Pill key={`${entry.name}-${i}`} entry={entry} onRemove={() => onRemove(i)} />
        ))}
      </div>

      <form onSubmit={submit} className="mt-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Missed something? Add it here"
          className="w-full rounded-full border border-line bg-elev/60 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-fog/70 focus:border-cream/40"
        />
      </form>

      {blocked.length > 0 && (
        <div className="mt-6 rounded-2xl border border-alarm/30 bg-alarm/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-alarm">
            <span aria-hidden="true">🛡</span> Excluded by your profile
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {blocked.map((b, i) => (
              <li key={i} className="text-sm text-cream/85">
                <span className="font-medium capitalize">{b.name}</span>
                {" — "}
                {b.allergens.length
                  ? `detected, but excluded from recipe generation due to your ${b.allergens
                      .map(allergenLabel)
                      .join(" and ")
                      .toLowerCase()} allergy.`
                  : `excluded because it is not ${dietLabel(b.dietConflict).toLowerCase()}.`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onGenerate}
        disabled={busy || safe.length === 0}
        className="mt-7 w-full rounded-full bg-cream px-8 py-4 font-medium text-void transition-transform hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Building your recipe…" : "Generate recipe"}
      </button>
    </section>
  );
}
