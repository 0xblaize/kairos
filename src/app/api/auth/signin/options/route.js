import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { putChallenge } from "@/lib/credentials";
import { flowId, relyingParty } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { rpID } = await relyingParty();

    // Discoverable credentials, so no allowCredentials: the browser shows the
    // account picker and we learn who it is from the assertion itself.
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
    });

    await putChallenge(`auth:${await flowId()}`, options.challenge);

    return Response.json({ options });
  } catch (error) {
    console.error("Passkey sign-in options failed", error);
    return Response.json(
      { error: error.message || "Could not start sign-in." },
      { status: 500 }
    );
  }
}
