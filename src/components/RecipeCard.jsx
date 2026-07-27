"use client";

export default function RecipeCard({ recipe, onStart, onRescan }) {
  const total = (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  const m = recipe.macros || {};

  return (
    <section className="rise overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-elev to-char">
      <div className="border-b border-line px-6 py-7 sm:px-8">
        <p className="text-xs tracking-[0.22em] text-saffron uppercase">Kairos choice</p>
        <h2 className="font-display mt-2.5 text-4xl leading-tight sm:text-5xl">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="mt-3 max-w-lg text-fog">{recipe.description}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm">
          <span>
            <span className="text-fog">Prep </span>
            {recipe.prepMinutes}m
          </span>
          <span>
            <span className="text-fog">Cook </span>
            {recipe.cookMinutes}m
          </span>
          <span>
            <span className="text-fog">Total </span>
            {total}m
          </span>
          <span>
            <span className="text-fog">Serves </span>
            {recipe.servings}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 divide-x divide-line border-b border-line">
        {[
          ["Calories", m.calories, ""],
          ["Protein", m.protein, "g"],
          ["Carbs", m.carbs, "g"],
          ["Fat", m.fat, "g"],
        ].map(([label, value, unit]) => (
          <div key={label} className="px-3 py-5 text-center">
            <p className="font-display text-2xl">
              {value ?? "—"}
              <span className="text-base text-fog">{unit}</span>
            </p>
            <p className="mt-1 text-[11px] tracking-wider text-fog uppercase">{label}</p>
          </div>
        ))}
      </div>

      {recipe.ingredients?.length > 0 && (
        <ul className="divide-y divide-line/60 px-6 sm:px-8">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-baseline justify-between gap-6 py-3">
              <span className="capitalize">{ing.item}</span>
              <span className="shrink-0 text-sm text-fog">{ing.amount}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 px-6 py-7 sm:flex-row sm:px-8">
        <button
          type="button"
          onClick={onStart}
          className="flex-1 rounded-full bg-saffron px-8 py-4 text-lg font-medium text-void transition-transform hover:scale-[1.01] active:scale-95"
        >
          Start cooking
        </button>
        <button
          type="button"
          onClick={onRescan}
          className="rounded-full border border-line px-7 py-4 text-fog transition-colors hover:text-cream"
        >
          Scan again
        </button>
      </div>
    </section>
  );
}
