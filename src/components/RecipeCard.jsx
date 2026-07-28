"use client";

export default function RecipeCard({ recipe, onStart, onRescan }) {
  const total = (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  const media = recipe.media;
  const m = recipe.macros || {};

  return (
    <section className="rise border border-line">
      <div className="border-b border-line px-6 py-8 sm:px-8">
        <p className="text-[10px] tracking-[0.5em] text-cream/40 uppercase">Kairos choice</p>
        <h2 className="font-display mt-4 text-4xl font-normal leading-tight sm:text-5xl">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/50">{recipe.description}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-xs tracking-[0.2em] text-cream/60 uppercase">
          <span>Prep {recipe.prepMinutes}m</span>
          <span>Cook {recipe.cookMinutes}m</span>
          <span>Total {total}m</span>
          <span>Serves {recipe.servings}</span>
        </div>
      </div>

      {media?.url && (
        <div className="border-b border-line bg-elev/30 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-cream/40 uppercase">Prefer to watch?</p>
              <p className="mt-2 text-sm text-cream/70">Open a video guide for this dish while you cook.</p>
            </div>
            <a
              href={media.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 border border-cream px-5 py-3 text-center text-[10px] tracking-[0.25em] uppercase transition-colors hover:bg-cream hover:text-void"
            >
              Find video
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 divide-x divide-line border-b border-line">
        {[["Cal", m.calories, ""], ["Protein", m.protein, "g"], ["Carbs", m.carbs, "g"], ["Fat", m.fat, "g"]].map(
          ([label, value, unit]) => (
            <div key={label} className="px-3 py-5 text-center">
              <p className="font-display text-2xl font-normal">
                {value ?? "—"}<span className="text-sm text-cream/40">{unit}</span>
              </p>
              <p className="mt-1 text-[10px] tracking-[0.3em] text-cream/40 uppercase">{label}</p>
            </div>
          )
        )}
      </div>

      {recipe.ingredients?.length > 0 && (
        <ul className="divide-y divide-line/50 px-6 sm:px-8">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline justify-between gap-6 py-3 text-sm">
              <span className="capitalize">{ing.item}</span>
              <span className="shrink-0 text-cream/40">{ing.amount}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 px-6 py-7 sm:flex-row sm:px-8">
        <button
          type="button"
          onClick={onStart}
          className="flex-1 border border-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition duration-300 hover:bg-cream hover:text-void"
        >
          Start cooking
        </button>
        <button
          type="button"
          onClick={onRescan}
          className="border border-line px-7 py-4 text-[11px] tracking-[0.3em] text-cream/50 uppercase transition duration-300 hover:border-cream/40 hover:text-cream"
        >
          Scan again
        </button>
      </div>
    </section>
  );
}
