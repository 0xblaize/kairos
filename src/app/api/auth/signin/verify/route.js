import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { findCredential, takeChallenge, updateCounter } from "@/lib/credentials";
import { createSession, flowId, relyingParty } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request) {
  const { response } = await request.json();

  const found = await findCredential(response?.id);
  if (!found) {
    return Response.json({ error: "That passkey is not registered here." }, { status: 400 });
  }

  const expectedChallenge = await takeChallenge(`auth:${await flowId()}`);
  if (!expectedChallenge) {
    return Response.json({ error: "That took too long. Try again." }, { status: 400 });
  }

  const { rpID, origin } = await relyingParty();

  let result;
  try {
    result = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
      credential: {
        id: found.credential.id,
        publicKey: new Uint8Array(Buffer.from(found.credential.publicKey, "base64url")),
        counter: found.credential.counter,
        transports: found.credential.transports,
      },
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }

  if (!result.verified) {
    return Response.json({ error: "Could not verify that passkey." }, { status: 400 });
  }

  await updateCounter(found.credential.id, result.authenticationInfo.newCounter);
  await createSession(found.user.handle);

  return Response.json({ handle: found.user.handle });
}
