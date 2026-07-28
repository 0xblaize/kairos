"use client";

export default function DishOptions({ options, selectedId, onSelect }) {
  return (
    <section className="mt-10 rise">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.5em] text-cream/40 uppercase">Available now</p>
          <h2 className="font-display mt-3 text-3xl font-normal">Choose a direction</h2>
        </div>
        <span className="text-[11px] tracking-[0.2em] text-cream/40 uppercase">
          {options.length} {options.length === 1 ? "match" : "matches"}
        </span>
      </div>

      {options.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {options.map(({ dish }) => {
            const selected = selectedId === dish.id;
            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => onSelect(dish.id)}
                aria-pressed={selected}
                className={`border p-5 text-left transition-colors ${
                  selected
                    ? "border-cream bg-cream text-void"
                    : "border-line bg-elev/30 text-cream hover:border-cream/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-[10px] tracking-[0.25em] uppercase ${
                        selected ? "text-void/55" : "text-cream/40"
                      }`}
                    >
                      {dish.cuisine}
                    </p>
                    <h3 className="font-display mt-2 text-2xl font-normal">{dish.title}</h3>
                  </div>
                  <span
                    className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${
                      selected ? "border-void/40" : "border-cream/30"
                    }`}
                    aria-hidden="true"
                  >
                    {selected ? "✓" : ""}
                  </span>
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${selected ? "text-void/65" : "text-cream/50"}`}>
                  {dish.description}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 border border-line px-5 py-4 text-sm leading-relaxed text-cream/50">
          No catalog dish matches every safe ingredient yet. You can still ask Kairos to make something from your pantry.
        </p>
      )}

      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={!selectedId}
        className={`mt-3 w-full border px-5 py-4 text-left transition-colors ${
          !selectedId
            ? "border-cream/60 bg-elev text-cream"
            : "border-line text-cream/50 hover:border-cream/40 hover:text-cream"
        }`}
      >
        <span className="block text-[10px] tracking-[0.25em] uppercase">Use all safe ingredients</span>
        <span className="mt-1 block text-sm">Let Kairos create something original.</span>
      </button>
    </section>
  );
}
