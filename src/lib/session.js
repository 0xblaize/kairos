import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { sessionSecret } from "@/lib/credentials";

export const COOKIE = "kairos.session";
const MAX_AGE = 60 * 60 * 24 * 30;

// The RP ID must be the bare hostname — WebAuthn rejects a port or scheme here,
// even though the origin check below needs both.
export async function relyingParty() {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const rpID = host.split(":")[0];
  const proto = h.get("x-forwarded-proto") || (rpID === "localhost" ? "http" : "https");
  return { rpID, origin: `${proto}://${host}` };
}

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createSession(handle) {
  const secret = await sessionSecret();
  const payload = Buffer.from(
    JSON.stringify({ handle, exp: Date.now() + MAX_AGE * 1000 })
  ).toString("base64url");
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function readSession() {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;

  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return null;

  const expected = sign(payload, await sessionSecret());
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

// Ties a pending challenge to this browser without needing a user to exist yet.
export async function flowId() {
  const store = await cookies();
  let id = store.get("kairos.flow")?.value;
  if (!id) {
    id = randomBytes(16).toString("base64url");
    store.set("kairos.flow", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 600,
    });
  }
  return id;
}
