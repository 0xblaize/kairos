"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { LogoMark } from "@/components/Logo";
import { useProfile } from "@/context/ProfileContext";

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });

  // A crashed route or a proxy redirect returns HTML, not JSON — reading the
  // body as text first keeps the real status visible instead of surfacing a
  // "Unexpected end of JSON input" parse error.
  const raw = await res.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(`Server error (${res.status}). Try again.`);
  }

  if (!res.ok) throw new Error(data?.error || `Something went wrong (${res.status}).`);
  return data;
}

export default function AuthPage() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();
  const [mode, setMode] = useState("signin");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (mode === "register") inputRef.current?.focus();
  }, [mode]);

  const enter = () => {
    setDone(true);
    setTimeout(() => router.replace(profile.onboarded ? "/kitchen" : "/onboarding"), 700);
  };

  const signIn = async () => {
    setError(null);
    setBusy(true);
    try {
      const { options } = await post("/api/auth/signin/options");
      const response = await startAuthentication({ optionsJSON: options });
      await post("/api/auth/signin/verify", { response });
      enter();
    } catch (e) {
      setError(e.name === "NotAllowedError" ? "Cancelled." : e.message);
      setBusy(false);
    }
  };

  const register = async () => {
    setError(null);
    setBusy(true);
    try {
      const { options, handle: name } = await post("/api/auth/register/options", { handle });
      const response = await startRegistration({ optionsJSON: options });
      await post("/api/auth/register/verify", { handle: name, response });
      enter();
    } catch (e) {
      setError(e.name === "NotAllowedError" ? "Cancelled." : e.message);
      setBusy(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-void text-cream">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(244,241,234,0.05),transparent_75%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-7 sm:px-10">
        <a href="/" className="flex items-center gap-3">
          <LogoMark className="h-6 w-6" />
          <span className="font-display text-lg tracking-[0.3em] uppercase">Kairos</span>
        </a>
        <span className="text-[10px] tracking-[0.4em] text-cream/30 uppercase">Passkey</span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-sm text-center">
          <div
            className={`mx-auto grid place-items-center transition-all duration-700 ease-out ${
              done ? "scale-[12] opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <LogoMark className={`h-16 w-16 ${busy ? "pulse-mark" : "breathe-mark"}`} />
          </div>

          <h1 className="font-display mt-10 text-5xl leading-tight font-normal sm:text-6xl">
            No password.
            <br />
            Just you.
          </h1>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-cream/50">
            Kairos uses a passkey — your face, fingerprint or device PIN. Nothing to remember,
            nothing to leak.
          </p>

          {mode === "register" && (
            <input
              ref={inputRef}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle.trim() && register()}
              placeholder="Choose a name"
              autoComplete="username webauthn"
              maxLength={40}
              className="mt-10 w-full border border-line bg-transparent px-4 py-4 text-center text-sm tracking-[0.1em] outline-none transition-colors placeholder:text-cream/25 focus:border-cream/40"
            />
          )}

          {error && (
            <p className="mt-6 border border-alarm/40 bg-alarm/5 px-4 py-3 text-xs leading-relaxed text-alarm">
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={busy || (mode === "register" && handle.trim().length < 2)}
            onClick={mode === "register" ? register : signIn}
            className={`w-full border border-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition duration-300 hover:bg-cream hover:text-void disabled:cursor-not-allowed disabled:opacity-30 ${
              mode === "register" ? "mt-4" : "mt-10"
            }`}
          >
            {busy
              ? "Waiting for your device…"
              : mode === "register"
                ? "Create passkey"
                : "Sign in with passkey"}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setError(null);
              setMode(mode === "register" ? "signin" : "register");
            }}
            className="mt-6 text-[11px] tracking-[0.3em] text-cream/40 uppercase underline underline-offset-4 transition-colors hover:text-cream disabled:opacity-30"
          >
            {mode === "register" ? "I already have one" : "First time here"}
          </button>
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center">
        <p className="text-[10px] tracking-[0.25em] text-cream/25 uppercase">
          Allergy aware · Zero typing · Hands free
        </p>
      </footer>
    </div>
  );
}
