import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { addCredential, getUser, takeChallenge } from "@/lib/credentials";
import { createSession, flowId, relyingParty } from "@/lib/session";

export const runtime = "nodejs";

async function readJsonBody(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

export async function POST(request) {
  try {
    const { handle, response } = await readJsonBody(request);
    const name = String(handle || "").trim().toLowerCase();

    const user = await getUser(name);
    if (!user) return Response.json({ error: "Start over — that name is unknown." }, { status: 400 });

    const expectedChallenge = await takeChallenge(`reg:${await flowId()}`);
    if (!expectedChallenge) {
      return Response.json({ error: "That took too long. Try again." }, { status: 400 });
    }

    const { rpID, origin } = await relyingParty();

    let result;
    try {
      result = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false,
      });
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    if (!result.verified) {
      return Response.json({ error: "Could not verify that passkey." }, { status: 400 });
    }

    const { credential } = result.registrationInfo;
    await addCredential(name, {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      transports: credential.transports || [],
    });

    await createSession(name);
    return Response.json({ handle: name });
  } catch (error) {
    console.error("Passkey verification failed", error);
    return Response.json({ error: error.message || "Could not verify that passkey." }, { status: 500 });
  }
}
