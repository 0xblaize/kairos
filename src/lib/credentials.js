import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";

// Serverless functions get a read-only filesystem and no shared memory between
// instances, so passkeys and their in-flight challenges have to live in
// Postgres. The Neon driver talks HTTP rather than holding a TCP pool, which is
// what makes it safe to call per-request.

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

let sqlCache = null;
let ready = null;

function sql() {
  if (sqlCache) return sqlCache;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres database and copy its connection string into .env.local."
    );
  }
  sqlCache = neon(url);
  return sqlCache;
}

// Cheap enough to run per cold start, and it means there is no migration step
// to forget between local and deployed environments.
function init() {
  if (ready) return ready;
  const db = sql();
  ready = (async () => {
    await db`CREATE TABLE IF NOT EXISTS users (
      handle TEXT PRIMARY KEY,
      id TEXT NOT NULL
    )`;
    await db`CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL REFERENCES users(handle) ON DELETE CASCADE,
      public_key TEXT NOT NULL,
      counter BIGINT NOT NULL DEFAULT 0,
      transports JSONB NOT NULL DEFAULT '[]'::jsonb
    )`;
    await db`CREATE TABLE IF NOT EXISTS challenges (
      key TEXT PRIMARY KEY,
      challenge TEXT NOT NULL,
      expires BIGINT NOT NULL
    )`;
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

async function db() {
  await init();
  return sql();
}

export async function sessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return secret;
}

function shape(row, credentials) {
  return { id: row.id, handle: row.handle, credentials };
}

export async function getUser(handle) {
  const q = await db();
  const [user] = await q`SELECT handle, id FROM users WHERE handle = ${handle}`;
  if (!user) return null;
  const creds = await q`SELECT id, public_key, counter, transports
                        FROM credentials WHERE handle = ${handle}`;
  return shape(
    user,
    creds.map((c) => ({
      id: c.id,
      publicKey: c.public_key,
      counter: Number(c.counter),
      transports: c.transports || [],
    }))
  );
}

export async function createUser(handle) {
  const q = await db();
  const id = randomBytes(16).toString("base64url");
  await q`INSERT INTO users (handle, id) VALUES (${handle}, ${id})
          ON CONFLICT (handle) DO NOTHING`;
  return getUser(handle);
}

export async function addCredential(handle, credential) {
  const q = await db();
  await q`INSERT INTO credentials (id, handle, public_key, counter, transports)
          VALUES (${credential.id}, ${handle}, ${credential.publicKey},
                  ${credential.counter}, ${JSON.stringify(credential.transports || [])}::jsonb)
          ON CONFLICT (id) DO NOTHING`;
}

export async function findCredential(id) {
  if (!id) return null;
  const q = await db();
  const [row] = await q`SELECT id, handle, public_key, counter, transports
                        FROM credentials WHERE id = ${id}`;
  if (!row) return null;
  const user = await getUser(row.handle);
  return {
    user,
    credential: {
      id: row.id,
      publicKey: row.public_key,
      counter: Number(row.counter),
      transports: row.transports || [],
    },
  };
}

export async function updateCounter(id, counter) {
  const q = await db();
  await q`UPDATE credentials SET counter = ${counter} WHERE id = ${id}`;
}

export async function putChallenge(key, challenge) {
  const q = await db();
  const now = Date.now();
  await q`DELETE FROM challenges WHERE expires < ${now}`;
  await q`INSERT INTO challenges (key, challenge, expires)
          VALUES (${key}, ${challenge}, ${now + CHALLENGE_TTL_MS})
          ON CONFLICT (key) DO UPDATE
          SET challenge = EXCLUDED.challenge, expires = EXCLUDED.expires`;
}

export async function takeChallenge(key) {
  const q = await db();
  // Delete and read in one statement so a double-submit cannot replay it.
  const [row] = await q`DELETE FROM challenges WHERE key = ${key}
                        RETURNING challenge, expires`;
  if (!row || Number(row.expires) < Date.now()) return null;
  return row.challenge;
}

export async function listUsers() {
  const q = await db();
  const rows = await q`SELECT handle FROM users`;
  return Promise.all(rows.map((r) => getUser(r.handle)));
}
