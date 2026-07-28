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

  const scan = async ({ dataUrl, base64, mediaType }) => {
    setPhoto(dataUrl);
    setRecipe(null);
    setError(null);
    setBusy("scan");
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.demo) setDemo(true);
      if (!data.ingredients?.length) {
        setError("No food found in that photo. Try a wider shot with more light.");
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
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ingredients: entries.filter((e) => e.safe).map((e) => e.name),
          profile,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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

  if (cooking && recipe) {
    return <CookMode recipe={recipe} onExit={() => setCooking(false)} />;
  }

  return (
    <div className="relative min-h-dvh w-full bg-void text-cream">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/50 bg-void/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <LogoMark className="h-6 w-6" />
            <span className="font-display text-lg tracking-[0.3em] uppercase">Kairos</span>
          </a>
          <ShieldCluster />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-6 pt-28 pb-24">
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
          <Viewfinder onImage={scan} busy={busy === "scan"} />
        ) : (
          <div className="space-y-10">
            {photo && (
              <div className="flex items-center gap-4 border border-line bg-elev/30 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="Your scan" className="h-14 w-14 object-cover" />
                <p className="text-xs tracking-wide text-cream/50">Scanned just now</p>
                <button
                  type="button"
                  onClick={reset}
                  className="ml-auto text-xs tracking-[0.2em] text-cream/40 uppercase underline underline-offset-4 transition-colors hover:text-cream"
                >
                  New scan
                </button>
              </div>
            )}

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
        )}
      </main>
    </div>
  );
}
