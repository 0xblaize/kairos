const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

export function hasKey() {
  // Unrelated tools leave other `*_API_KEY` values in the environment; only a
  // real Anthropic key should take us out of demo mode.
  return /^sk-ant-/.test(process.env.ANTHROPIC_API_KEY || "");
}

export async function callClaude({ system, messages, maxTokens = 2000 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Claude ${res.status}: ${detail.slice(0, 400)}`);
  }

  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Models like to wrap JSON in prose or fences. Pull out the first real value. */
export function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;

  try {
    return JSON.parse(body.trim());
  } catch {
    // fall through to bracket scan
  }

  const start = body.search(/[[{]/);
  if (start === -1) throw new Error("No JSON found in model response");

  const open = body[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inStr = false;
  let esc = false;

  for (let i = start; i < body.length; i++) {
    const ch = body[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (ch === "\\") {
      esc = true;
      continue;
    }
    if (ch === '"') inStr = !inStr;
    if (inStr) continue;
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return JSON.parse(body.slice(start, i + 1));
    }
  }

  throw new Error("Unbalanced JSON in model response");
}
