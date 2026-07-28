import { callClaude, extractJson, hasKey } from "@/lib/claude";
import { screenAll, allergenLabel, dietLabel } from "@/lib/diet";
import { findDish, getDishAvailability, videoSearchUrl } from "@/lib/dishes";

export const runtime = "nodejs";
export const maxDuration = 60;

function buildSystem(profile, safeNames, dish) {
  const allergies = [
    ...(profile.allergies || []).map(allergenLabel),
    ...(profile.customAllergies || []),
  ];

  const lines = [
    "You are a precise, practical home-cooking chef.",
    "",
    "The user has ONLY these ingredients available:",
    safeNames.join(", ") || "(none)",
    "",
  ];

  if (allergies.length) {
    lines.push(
      `SAFETY — THE USER HAS A SEVERE ALLERGY TO: ${allergies.join(", ").toUpperCase()}.`,
      "You MUST NOT use any ingredient that contains, may contain, or is derived from these allergens.",
      "This includes hidden sources (soy sauce contains wheat; many stocks contain dairy).",
      "Any ingredient that was unsafe has already been removed from the list above — do not reintroduce it,",
      "do not suggest it as an optional extra, and do not mention it as a substitution.",
      ""
    );
  }

  if (profile.diet && profile.diet !== "none") {
    lines.push(`The recipe must be strictly ${dietLabel(profile.diet)}.`, "");
  }

  if (dish) {
    lines.push(
      `The user selected ${dish.title}, a ${dish.cuisine} dish.`,
      "Make that dish, not a different generic recipe.",
      `Its required ingredient groups are: ${dish.required.map((group) => `${group.label} (${group.aliases.join(" / ")})`).join(", ")}.`,
      "Every required group is already represented by a safe available ingredient.",
      "Do not add missing ingredients or unsafe substitutions.",
      ""
    );
  }

  lines.push(
    "You may additionally assume basic seasonings: salt, black pepper, water.",
    "Never invent an ingredient that is not on the list. If the list is too sparse for a real dish,",
    "build the simplest honest thing that works and say so in the description.",
    "",
    "Write steps for someone whose hands are busy: one action per step, no step longer than",
    "two sentences, concrete times and temperatures, no ingredient quantities buried in prose.",
    "",
    "Output ONLY this JSON shape, no prose or code fence:",
    "{",
    '  "title": string,',
    '  "description": string,',
    '  "prepMinutes": number,',
    '  "cookMinutes": number,',
    '  "servings": number,',
    '  "macros": { "calories": number, "protein": number, "carbs": number, "fat": number },',
    '  "ingredients": [{ "item": string, "amount": string }],',
    '  "steps": [{ "title": string, "detail": string, "minutes": number }]',
    "}",
    "Macros are per serving, in grams except calories."
  );

  return lines.join("\n");
}

function demoRecipe(safeNames, dish) {
  if (dish) {
    return {
      title: dish.title,
      description: dish.description,
      prepMinutes: 10,
      cookMinutes: 25,
      servings: 2,
      macros: { calories: 320, protein: 8, carbs: 48, fat: 9 },
      ingredients: safeNames.map((item) => ({ item, amount: "as available" })),
      steps: [
        { title: "Prepare the ingredients", detail: "Wash, peel, and cut the available ingredients into cooking-size pieces.", minutes: 10 },
        { title: "Cook the dish", detail: `Cook the prepared ingredients together as a simple version of ${dish.title}, seasoning with salt and pepper to taste.`, minutes: 25 },
      ],
    };
  }

  return {
    title: "Spinach & Feta Frittata",
    description:
      dish?.description || "A fast, high-protein skillet frittata built from what you already had in the fridge.",
    prepMinutes: 8,
    cookMinutes: 14,
    servings: 2,
    macros: { calories: 386, protein: 27, carbs: 8, fat: 27 },
    ingredients: [
      { item: "eggs", amount: "6 large" },
      { item: "baby spinach", amount: "2 packed cups" },
      { item: "feta cheese", amount: "1/2 cup, crumbled" },
      { item: "cherry tomatoes", amount: "1 cup, halved" },
      { item: "red onion", amount: "1/2, thinly sliced" },
      { item: "olive oil", amount: "1 tbsp" },
    ].filter((i) => safeNames.length === 0 || safeNames.includes(i.item)),
    steps: [
      { title: "Heat the pan", detail: "Warm olive oil in an oven-safe skillet over medium heat until it shimmers.", minutes: 2 },
      { title: "Soften the onion", detail: "Add the sliced red onion and cook until translucent and just starting to colour.", minutes: 4 },
      { title: "Wilt the spinach", detail: "Add spinach in handfuls, stirring until each batch collapses before adding more.", minutes: 2 },
      { title: "Beat and pour", detail: "Whisk the eggs with salt and pepper, then pour evenly over the vegetables.", minutes: 1 },
      { title: "Add the feta", detail: "Scatter crumbled feta and halved tomatoes across the surface. Do not stir.", minutes: 1 },
      { title: "Finish under heat", detail: "Cook undisturbed until the edges set, then broil 3 minutes until the centre is just firm.", minutes: 5 },
      { title: "Rest and slice", detail: "Let it sit 3 minutes off the heat before slicing into wedges.", minutes: 3 },
    ],
    demo: true,
  };
}

export async function POST(request) {
  try {
    const { ingredients = [], profile = {}, dishId = null } = await request.json();
    const dish = dishId ? findDish(dishId) : null;

    if (dishId && !dish) {
      return Response.json({ error: "That dish is not available." }, { status: 404 });
    }

    // Re-screen server-side. The client already filtered, but the recipe route
    // must never trust its input for an allergy decision.
    const screened = screenAll(ingredients, profile);
    const safe = screened.filter((s) => s.safe).map((s) => s.name);
    const excluded = screened.filter((s) => !s.safe);

    if (!safe.length) {
      return Response.json(
        { error: "Nothing left to cook with once your restrictions are applied." },
        { status: 422 }
      );
    }

    if (dish) {
      const availability = getDishAvailability(dish, safe, profile);
      if (!availability.available) {
        return Response.json(
          { error: `${dish.title} needs ${availability.missing.join(", ")}.` },
          { status: 422 }
        );
      }
    }

    const media = dish?.videoQuery
      ? { title: `${dish.title} video`, url: videoSearchUrl(dish.videoQuery) }
      : null;

    if (!hasKey()) {
      return Response.json({ recipe: demoRecipe(safe, dish), excluded, media, demo: true });
    }

    const text = await callClaude({
      system: buildSystem(profile, safe, dish),
      maxTokens: 6000,
      effort: "low",
      messages: [
        {
          role: "user",
          content:
            "Generate one recipe I can cook right now with these ingredients. Return the JSON only.",
        },
      ],
    });

    const recipe = extractJson(text);

    // Final gate: if the model reintroduced anything unsafe, refuse rather than serve it.
    const violations = screenAll(
      (recipe.ingredients || []).map((i) => i.item),
      profile
    ).filter((s) => !s.safe);

    if (violations.length) {
      return Response.json(
        {
          error: `Recipe rejected — it included ${violations
            .map((v) => v.name)
            .join(", ")}, which conflicts with your profile. Try scanning again.`,
        },
        { status: 502 }
      );
    }

    return Response.json({ recipe, excluded, media });
  } catch (err) {
    return Response.json(
      { error: err.message || "Could not build a recipe." },
      { status: 500 }
    );
  }
}
