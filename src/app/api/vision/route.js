import { callClaude, extractJson, hasKey } from "@/lib/claude";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You identify food in photographs of fridges, pantries and countertops.

Rules:
- List every distinct edible item and ingredient you can actually see.
- Use short, common grocery names ("red onion", "greek yogurt", "soy sauce").
- Be specific when the label or appearance makes it clear; do not invent detail you cannot see.
- Do not guess at items hidden behind others. Do not include cookware, packaging or furniture.
- If you see no food at all, return an empty array.

Output ONLY a JSON array of strings. No prose, no code fence, no keys.`;

const DEMO = [
  "eggs", "baby spinach", "feta cheese", "cherry tomatoes", "red onion",
  "shrimp", "soy sauce", "greek yogurt", "lemon", "garlic", "olive oil", "butter",
];

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "That upload was malformed." }, { status: 400 });
    }

    const { image, mediaType, images } = body;

    // Accept either a single image or a batch; normalise to one list.
    const shots = Array.isArray(images) && images.length
      ? images
      : image
        ? [{ image, mediaType }]
        : [];

    if (!shots.length) {
      return Response.json({ error: "No image supplied." }, { status: 400 });
    }

    if (shots.length > 5) {
      return Response.json({ error: "Up to 5 photos per scan." }, { status: 400 });
    }

    // Anthropic rejects images over ~5MB; fail with a readable message rather
    // than letting the upstream call blow up.
    const total = shots.reduce((n, s) => n + (s.image?.length || 0), 0);
    if (total > 7_000_000) {
      return Response.json(
        { error: "Those photos are too large. Try fewer, or smaller ones." },
        { status: 413 }
      );
    }

    if (!hasKey()) {
      return Response.json({ ingredients: DEMO, demo: true });
    }

    const text = await callClaude({
      system: SYSTEM,
      maxTokens: 3000,
      effort: "low",
      messages: [
        {
          role: "user",
          content: [
            ...shots.map((s) => ({
              type: "image",
              source: {
                type: "base64",
                media_type: s.mediaType || "image/jpeg",
                data: s.image,
              },
            })),
            {
              type: "text",
              text:
                shots.length > 1
                  ? `Identify every food item across all ${shots.length} images. Merge them into one combined list, without duplicates.`
                  : "Identify every food item in this image.",
            },
          ],
        },
      ],
    });

    const parsed = extractJson(text);
    const ingredients = (Array.isArray(parsed) ? parsed : parsed.ingredients || [])
      .filter((i) => typeof i === "string" && i.trim())
      .map((i) => i.trim().toLowerCase())
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 40);

    return Response.json({ ingredients });
  } catch (err) {
    return Response.json(
      { error: err.message || "Could not read that photo." },
      { status: 500 }
    );
  }
}
