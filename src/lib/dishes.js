import { screenIngredient } from "@/lib/diet";

export const DISHES = [
  {
    id: "nigerian-jollof-rice",
    cuisine: "West African",
    title: "Jollof rice",
    description: "A rich tomato and pepper rice dish with deep savoury flavour.",
    required: [
      { label: "rice", aliases: ["rice"] },
      { label: "tomato", aliases: ["tomato", "tomatoes", "tomato paste"] },
      { label: "aromatics", aliases: ["onion", "red onion", "garlic"] },
    ],
    videoQuery: "how to cook Nigerian jollof rice",
  },
  {
    id: "mexican-bean-tacos",
    cuisine: "Mexican",
    title: "Bean tacos",
    description: "Warm tortillas filled with seasoned beans and fresh toppings.",
    required: [
      { label: "tortillas", aliases: ["tortilla", "tortillas"] },
      { label: "beans", aliases: ["bean", "beans", "black beans", "kidney beans"] },
      { label: "fresh topping", aliases: ["tomato", "tomatoes", "onion", "red onion", "avocado"] },
    ],
    videoQuery: "easy Mexican bean tacos recipe",
  },
  {
    id: "japanese-ramen",
    cuisine: "Japanese",
    title: "Quick ramen",
    description: "A comforting noodle bowl finished with egg and savoury toppings.",
    required: [
      { label: "noodles", aliases: ["noodle", "noodles", "ramen", "udon"] },
      { label: "broth", aliases: ["stock", "broth"] },
      { label: "savoury seasoning", aliases: ["soy sauce", "miso", "tamari"] },
    ],
    videoQuery: "easy homemade Japanese ramen recipe",
  },
  {
    id: "thai-pad-thai",
    cuisine: "Thai",
    title: "Pad Thai",
    description: "Stir-fried rice noodles with a bright, savoury-sweet sauce.",
    required: [
      { label: "rice noodles", aliases: ["rice noodle", "rice noodles", "noodles"] },
      { label: "protein", aliases: ["egg", "eggs", "tofu", "shrimp", "prawn", "chicken"] },
      { label: "savoury sauce", aliases: ["fish sauce", "soy sauce", "tamari"] },
    ],
    videoQuery: "authentic Thai pad Thai recipe",
  },
  {
    id: "indian-chana-masala",
    cuisine: "Indian",
    title: "Chana masala",
    description: "Spiced chickpeas simmered with tomato, onion, and warming aromatics.",
    required: [
      { label: "chickpeas", aliases: ["chickpea", "chickpeas", "garbanzo beans"] },
      { label: "tomato", aliases: ["tomato", "tomatoes", "tomato paste"] },
      { label: "aromatics", aliases: ["onion", "red onion", "garlic", "ginger"] },
    ],
    videoQuery: "Indian chana masala recipe",
  },
  {
    id: "italian-tomato-pasta",
    cuisine: "Italian",
    title: "Tomato pasta",
    description: "A simple pantry pasta with tomato, garlic, and olive oil.",
    required: [
      { label: "pasta", aliases: ["pasta", "spaghetti", "penne", "macaroni"] },
      { label: "tomato", aliases: ["tomato", "tomatoes", "tomato paste"] },
      { label: "aromatics", aliases: ["onion", "red onion", "garlic"] },
    ],
    videoQuery: "simple Italian tomato pasta recipe",
  },
  {
    id: "greek-salad",
    cuisine: "Greek",
    title: "Greek salad",
    description: "A crisp salad of tomato, cucumber, feta, and bright herbs.",
    required: [
      { label: "tomato", aliases: ["tomato", "tomatoes", "cherry tomatoes"] },
      { label: "cucumber", aliases: ["cucumber"] },
      { label: "feta", aliases: ["feta", "feta cheese"] },
    ],
    videoQuery: "traditional Greek salad recipe",
  },
  {
    id: "shakshuka",
    cuisine: "North African",
    title: "Shakshuka",
    description: "Eggs gently cooked in a spiced tomato and pepper sauce.",
    required: [
      { label: "eggs", aliases: ["egg", "eggs"] },
      { label: "tomato", aliases: ["tomato", "tomatoes", "tomato paste"] },
      { label: "aromatics", aliases: ["onion", "red onion", "garlic"] },
    ],
    videoQuery: "classic shakshuka recipe",
  },
  {
    id: "french-omelette",
    cuisine: "French",
    title: "French omelette",
    description: "A soft, quick omelette that makes a little pantry go a long way.",
    required: [
      { label: "eggs", aliases: ["egg", "eggs"] },
      { label: "fat", aliases: ["butter", "olive oil", "oil"] },
    ],
    videoQuery: "classic French omelette technique",
  },
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesAlias(name, aliases) {
  const normalized = normalize(name);
  return aliases.some((alias) => {
    const candidate = normalize(alias);
    return normalized === candidate || normalized.includes(candidate) || candidate.includes(normalized);
  });
}

export function findDish(id) {
  return DISHES.find((dish) => dish.id === id) || null;
}

export function getDishAvailability(dish, ingredients, profile = {}) {
  const safeNames = (ingredients || [])
    .map((entry) => (typeof entry === "string" ? entry : entry?.name))
    .filter(Boolean)
    .filter((name) => screenIngredient(name, profile).safe);

  const missing = dish.required
    .filter((group) => !safeNames.some((name) => matchesAlias(name, group.aliases)))
    .map((group) => group.label);

  return {
    dish,
    available: missing.length === 0,
    missing,
    matched: safeNames,
  };
}

export function getAvailableDishes(ingredients, profile) {
  return DISHES.map((dish) => getDishAvailability(dish, ingredients, profile)).filter(
    (result) => result.available
  );
}

export function videoSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
