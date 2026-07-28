"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import ShieldCluster from "@/components/ShieldCluster";
import Viewfinder from "@/components/Viewfinder";
import IngredientBoard from "@/components/IngredientBoard";
import RecipeCard from "@/components/RecipeCard";
import CookMode from "@/components/CookMode";
import { useProfile } from "@/context/ProfileContext";
import { screenAll, screenIngredient } from "@/lib/diet";

export default function KitchenPage() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();

  const [photo, setPhoto] = useState(null);
  const [entries, setEntries] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [cooking, setCooking] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (hydrated && !profile.onboarded) router.replace("/onboarding");
  }, [hydrated, profile.onboarded, router]);

  useEffect(() => {
    setEntries((prev) =>
      prev ? screenAll(prev.map((e) => e.name), profile) : prev
    );
  }, [profile]);

  if (!hydrated) return null;

  // A crashed route, a 413 on a large photo, or a proxy redirect returns HTML
  // rather than JSON. Reading as text first turns that into a readable status
  // instead of "Unexpected end of JSON input".
  const postJson = async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      throw new Error(
        res.status === 413
          ? "That photo is too large. Try a smaller one."
          : `Server error (${res.status}). Try again.`
      );
    }

    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status}).`);
    return data;
  };

  const scan = async (shots) => {
    setPhoto(shots[0].dataUrl);
    setRecipe(null);
    setError(null);
    setBusy("scan");
    try {
      const data = await postJson("/api/vision", {
        images: shots.map((s) => ({ image: s.base64, mediaType: s.mediaType })),
      });
      if (data.demo) setDemo(true);
      if (!data.ingredients?.length) {
        setError("No food found in those photos. Try a wider shot with more light.");
        setEntries([]);
      } else {
        setEntries(screenAll(data.ingredients, profile));
      }
    } catch (e) {
      setError(e.message || "That scan failed. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setError(null);
    setBusy("recipe");
    try {
      const data = await postJson("/api/recipe", {
        ingredients: entries.filter((e) => e.safe).map((e) => e.name),
        profile,
      });
      if (data.demo) setDemo(true);
      setRecipe(data.recipe);
    } catch (e) {
      setError(e.message || "Could not build a recipe.");
    } finally {
      setBusy(null);
    }
  };

  const reset = () => {
    setPhoto(null);
    setEntries(null);
    setRecipe(null);
    setError(null);
  };

  const signOut = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/auth");
  };

  if (cooking && recipe) {
    return <CookMode recipe={recipe} onExit={() => setCooking(false)} />;
  }

  return (
    <div className="relative min-h-dvh w-full bg-void text-cream">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/50 bg-void/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <LogoMark className="h-6 w-6" />
            <span className="font-display text-lg tracking-[0.3em] uppercase">Kairos</span>
          </a>
          <div className="flex items-center gap-5">
            <ShieldCluster />
            <button
              type="button"
              onClick={signOut}
              className="shrink-0 text-[10px] tracking-[0.3em] text-cream/35 uppercase transition-colors hover:text-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pt-28 pb-24">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.5em] text-cream/40 uppercase">Kitchen</p>
          <h1 className="font-display mt-3 text-4xl font-normal leading-tight sm:text-5xl">
            What are we cooking?
          </h1>
        </div>

        {demo && (
          <p className="mb-6 border border-line px-4 py-3 text-xs text-cream/50">
            Demo mode — add <code className="text-cream/80">ANTHROPIC_API_KEY</code> to{" "}
            <code className="text-cream/80">.env.local</code> for live scanning.
          </p>
        )}

        {error && (
          <p className="mb-6 border border-alarm/40 bg-alarm/5 px-4 py-3 text-sm text-alarm">
            {error}
          </p>
        )}

        {!entries ? (
          <div className="mx-auto max-w-3xl">
            <Viewfinder onImage={scan} busy={busy === "scan"} />
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-14">
            <div className="space-y-6 lg:sticky lg:top-28">
              {photo && (
                <div className="border border-line bg-elev/30 p-3">
                  <div className="flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt="Your scan"
                      className="h-14 w-14 shrink-0 object-cover lg:h-52 lg:w-full"
                    />
                    <p className="text-xs tracking-wide text-cream/50">Scanned just now</p>
                    <button
                      type="button"
                      onClick={reset}
                      className="ml-auto shrink-0 text-xs tracking-[0.2em] text-cream/40 uppercase underline underline-offset-4 transition-colors hover:text-cream lg:ml-0 lg:text-left"
                    >
                      New scan
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              {!recipe && (
                <IngredientBoard
                  entries={entries}
                  busy={busy === "recipe"}
                  onRemove={(i) => setEntries((p) => p.filter((_, x) => x !== i))}
                  onAdd={(name) => setEntries((p) => [...p, screenIngredient(name, profile)])}
                  onGenerate={generate}
                />
              )}

              {recipe && (
                <RecipeCard
                  recipe={recipe}
                  onStart={() => setCooking(true)}
                  onRescan={reset}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
