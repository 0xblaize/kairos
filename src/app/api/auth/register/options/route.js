import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getUser, createUser, putChallenge } from "@/lib/credentials";
import { flowId, relyingParty } from "@/lib/session";

export const runtime = "nodejs";

async function readJsonBody(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

export async function POST(request) {
  try {
    const { handle } = await readJsonBody(request);
    const name = String(handle || "").trim().toLowerCase();

    if (name.length < 2 || name.length > 40) {
      return Response.json({ error: "Pick a name between 2 and 40 characters." }, { status: 400 });
    }

    const existing = await getUser(name);
    if (existing?.credentials.length) {
      return Response.json(
        { error: "That name already has a passkey. Sign in instead." },
        { status: 409 }
      );
    }

    const user = existing || (await createUser(name));
    const { rpID } = await relyingParty();

    const options = await generateRegistrationOptions({
      rpName: "Kairos",
      rpID,
      userName: user.handle,
      userDisplayName: user.handle,
      userID: new TextEncoder().encode(user.id),
      attestationType: "none",
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
    });

    await putChallenge(`reg:${await flowId()}`, options.challenge);

    return Response.json({ options, handle: user.handle });
  } catch (error) {
    console.error("Passkey registration failed", error);
    return Response.json({ error: error.message || "Could not create that passkey." }, { status: 500 });
  }
}
