# Kairos

> **Cook what you have. Waste less. Worry less.**

Kairos is an AI-powered, zero-waste cooking app where you snap photos of the random ingredients in your fridge, pantry, or kitchen. AI identifies the food, filters out allergies and dietary restrictions, and creates a custom, step-by-step recipe from what is safe and available — no decision fatigue and no unnecessary shopping list.

## What it does

1. **Sign in with a passkey** — no password to create, remember, or leak.
2. **Set your food profile** — choose a diet, select common allergens, or type a custom allergy such as `sesame`.
3. **Add up to five photos** — take photos of a fridge, pantry, counter, or ingredients individually.
4. **Scan ingredients with AI** — Kairos combines the photos into one deduplicated ingredient list.
5. **Filter before cooking** — ingredients that conflict with the profile are clearly flagged and excluded.
6. **Generate a recipe** — get a practical recipe built only from the remaining ingredients and basic seasoning staples.
7. **Cook hands-free** — follow step-by-step Cook Mode while your hands are busy.

## Safety model

Kairos does not rely only on an AI instruction to handle food safety. It applies three layers of protection:

- **After vision:** every detected ingredient is deterministically screened against the user profile.
- **During recipe generation:** allergies, custom allergies, diet rules, and hidden-source warnings are sent to the recipe model as hard constraints.
- **Before a recipe is returned:** every recipe ingredient is screened again on the server. If the model reintroduces an unsafe item, Kairos rejects the recipe instead of showing it.

> **Important:** Kairos is an assistive planning tool, not a medical device. Always inspect labels and use personal medical guidance for severe allergies.

## Image processing

Phone photos are usually too large to upload directly. Before a scan leaves the browser, Kairos:

- reads the selected image locally with `FileReader`;
- redraws it on a canvas, capped at a **1568px long edge**;
- converts it to JPEG at **0.82 quality**;
- sends base64 image data to `/api/vision`;
- accepts a maximum of **five photos per scan** and a combined encoded payload under **7MB**.

The vision API merges results from all selected photos, normalizes ingredient names, removes duplicates, and caps the final list at 40 ingredients.

## Stack

- [Next.js 16](https://nextjs.org/) and React 19
- Tailwind CSS 4
- [Claude Sonnet 5](https://www.anthropic.com/api) via the Anthropic Messages API
- [SimpleWebAuthn](https://simplewebauthn.dev/) for passkeys
- Neon / Vercel Postgres for serverless-safe passkey credentials and temporary WebAuthn challenges

## Run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Then set these values in `.env.local`:

```bash
# Required for live ingredient scanning and recipe generation.
ANTHROPIC_API_KEY=sk-ant-...

# Required. Signs the session cookie.
# Generate one with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET=your-random-secret

# Required for passkeys. Use the connection string supplied by Neon or Vercel Postgres.
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

Without `ANTHROPIC_API_KEY`, Kairos uses demo ingredients and recipes. Without `DATABASE_URL`, passkey registration and sign-in cannot work because serverless functions do not have persistent shared storage.

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push the project to GitHub and import it into Vercel.
2. In **Vercel → Storage**, create and connect a Neon/Postgres database. This provides `DATABASE_URL`.
3. In **Vercel → Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY`
   - `AUTH_SECRET`
   - `DATABASE_URL` if Vercel did not inject it automatically
4. Deploy.
5. Register a new passkey on the deployed domain.

Passkeys are domain-bound by the WebAuthn standard: a credential registered on `localhost` will not sign in on your deployed `*.vercel.app` domain.

## Environment security

- Never commit `.env.local`.
- Never place a live Anthropic key in `.env.example`, source code, screenshots, or public posts.
- If an API key is accidentally exposed, revoke it in the Anthropic Console and create a replacement immediately.

## License

Private project — all rights reserved.
