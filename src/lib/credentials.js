import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// No database in this project. Credentials live in a gitignored JSON file so
// passkeys survive a dev-server restart; swap this module for a real store
// before this ever sees more than one machine.
const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "credentials.json");

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

let cache = null;
let writing = Promise.resolve();

async function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(FILE, "utf8"));
  } catch {
    cache = { secret: randomBytes(32).toString("base64url"), users: {}, challenges: {} };
  }
  return cache;
}

async function save() {
  const snapshot = JSON.stringify(cache, null, 2);
  writing = writing.then(async () => {
    await mkdir(DIR, { recursive: true });
    await writeFile(FILE, snapshot, "utf8");
  });
  return writing;
}

export async function sessionSecret() {
  const db = await load();
  return process.env.AUTH_SECRET || db.secret;
}

export async function getUser(handle) {
  const db = await load();
  return db.users[handle] || null;
}

export async function listUsers() {
  const db = await load();
  return Object.values(db.users);
}

export async function createUser(handle) {
  const db = await load();
  if (db.users[handle]) return db.users[handle];
  db.users[handle] = { id: randomBytes(16).toString("base64url"), handle, credentials: [] };
  await save();
  return db.users[handle];
}

export async function addCredential(handle, credential) {
  const db = await load();
  const user = db.users[handle];
  if (!user) throw new Error("Unknown user");
  user.credentials.push(credential);
  await save();
}

export async function findCredential(id) {
  const db = await load();
  for (const user of Object.values(db.users)) {
    const credential = user.credentials.find((c) => c.id === id);
    if (credential) return { user, credential };
  }
  return null;
}

export async function updateCounter(id, counter) {
  const found = await findCredential(id);
  if (!found) return;
  found.credential.counter = counter;
  await save();
}

export async function putChallenge(key, challenge) {
  const db = await load();
  const now = Date.now();
  for (const [k, v] of Object.entries(db.challenges)) {
    if (v.expires < now) delete db.challenges[k];
  }
  db.challenges[key] = { challenge, expires: now + CHALLENGE_TTL_MS };
  await save();
}

export async function takeChallenge(key) {
  const db = await load();
  const entry = db.challenges[key];
  delete db.challenges[key];
  await save();
  if (!entry || entry.expires < Date.now()) return null;
  return entry.challenge;
}
