import { destroySession, readSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  return Response.json({ handle: session?.handle || null });
}

export async function DELETE() {
  await destroySession();
  return Response.json({ handle: null });
}
