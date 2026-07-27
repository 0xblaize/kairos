"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
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

  // Restrictions can change mid-session; re-screen so pills never go stale.
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
    <main className="mx-auto w-full max-w-3xl px-5 py-6 pb-24">
      <header className="flex items-center justify-between gap-4">
        <Logo />
        <ShieldCluster />
      </header>

      <h1 className="font-display mt-12 text-4xl leading-tight sm:text-5xl">
        What are we cooking today?
      </h1>

      {demo && (
        <p className="mt-4 rounded-xl border border-line bg-elev/60 px-4 py-2.5 text-sm text-fog">
          Demo mode — set <code className="text-cream">ANTHROPIC_API_KEY</code> in{" "}
          <code className="text-cream">.env.local</code> for live scanning.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-alarm/40 bg-alarm/5 px-4 py-3 text-sm text-alarm">
          {error}
        </p>
      )}

      <div className="mt-7">
        {!entries ? (
          <Viewfinder onImage={scan} busy={busy === "scan"} />
        ) : (
          <div className="space-y-10">
            {photo && (
              <div className="flex items-center gap-4 rounded-2xl border border-line bg-elev/40 p-3">
                {/* User's own capture, sized by the container — next/image adds no value here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt="Your scan"
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <p className="text-sm text-fog">Scanned just now</p>
                <button
                  type="button"
                  onClick={reset}
                  className="ml-auto text-sm text-fog underline underline-offset-4 hover:text-cream"
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
                onAdd={(name) =>
                  setEntries((p) => [...p, screenIngredient(name, profile)])
                }
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
      </div>
    </main>
  );
}
