"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ALLERGENS, DIETS } from "@/lib/diet";
import { useProfile } from "@/context/ProfileContext";
import { LogoMark } from "@/components/Logo";

export default function ProfileEditor({ mode = "onboarding" }) {
  const router = useRouter();
  const {
    profile,
    hydrated,
    setDiet,
    toggleAllergy,
    addCustomAllergy,
    removeCustomAllergy,
    completeOnboarding,
  } = useProfile();
  const [step, setStep] = useState(mode === "onboarding" ? 0 : 1);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const customRef = useRef(null);

  if (!hydrated) return null;

  const isOnboarding = mode === "onboarding";
  const showDiet = !isOnboarding || step === 0;
  const showAllergy = !isOnboarding || step === 1;
  const AllergyHeading = isOnboarding ? "h1" : "h2";

  const openCustom = () => {
    setTyping(true);
    requestAnimationFrame(() => customRef.current?.focus());
  };

  const commitCustom = () => {
    if (!draft.trim()) return setTyping(false);
    addCustomAllergy(draft);
    setDraft("");
    customRef.current?.focus();
  };

  const finish = () => {
    completeOnboarding();
    router.push("/kitchen");
  };

  return (
    <div className="relative min-h-dvh w-full bg-void text-cream">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-7">
        <a href="/" className="flex items-center gap-3">
          <LogoMark className="h-6 w-6" />
          <span className="font-display text-lg tracking-[0.3em] uppercase">Kairos</span>
        </a>
        {isOnboarding && (
          <span className="text-[10px] tracking-[0.4em] text-cream/40 uppercase">
            {step === 0 ? "1 / 2" : "2 / 2"}
          </span>
        )}
      </header>

      <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-6 pt-28 pb-32">
        {showDiet && (
          <section className="rise">
            <p className="text-[10px] tracking-[0.5em] text-cream/40 uppercase">
              {isOnboarding ? "Step one" : "Diet preference"}
            </p>
            <h1 className="font-display mt-4 text-5xl font-normal leading-tight sm:text-6xl">
              How do you eat?
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/50">
              Kairos builds every recipe around this. Change it any time.
            </p>

            <div className="mt-10 grid gap-2 sm:grid-cols-2">
              {DIETS.map((d) => {
                const on = profile.diet === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDiet(d.id)}
                    aria-pressed={on}
                    className={`rounded-none border px-5 py-4 text-left transition-all duration-300 ${
                      on
                        ? "border-cream bg-cream text-void"
                        : "border-line bg-transparent hover:border-cream/40"
                    }`}
                  >
                    <span className="block text-sm font-medium tracking-wide">{d.label}</span>
                    <span className={`mt-0.5 block text-xs ${on ? "text-void/60" : "text-cream/40"}`}>
                      {d.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {showAllergy && (
          <section className={showDiet ? "mt-16 rise" : "rise"}>
            <p className="text-[10px] tracking-[0.5em] text-cream/40 uppercase">
              {isOnboarding ? "Step two" : "Allergens"}
            </p>
            <AllergyHeading className="font-display mt-4 text-5xl font-normal leading-tight sm:text-6xl">
              Anything off limits?
            </AllergyHeading>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/50">
              These are blocked at every stage — even if the camera sees them in your fridge.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {ALLERGENS.map((a) => {
                const on = profile.allergies.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAllergy(a.id)}
                    aria-pressed={on}
                    className={`flex items-center gap-3 border px-4 py-3.5 text-left transition-all duration-300 ${
                      on
                        ? "border-alarm/70 bg-alarm/8 text-alarm"
                        : "border-line bg-transparent hover:border-cream/30"
                    }`}
                  >
                    <span className="text-base grayscale">{a.glyph}</span>
                    <span className="text-sm font-medium">{a.label}</span>
                    {on && (
                      <svg viewBox="0 0 24 24" className="ml-auto h-3.5 w-3.5 shrink-0 text-alarm">
                        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                        <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {!typing ? (
              <button
                type="button"
                onClick={openCustom}
                className="mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-line px-4 py-3.5 text-[11px] tracking-[0.25em] text-cream/50 uppercase transition-all duration-300 hover:border-cream/40 hover:text-cream"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
                </svg>
                Add another allergy
              </button>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  ref={customRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); commitCustom(); }
                    if (e.key === "Escape") { setDraft(""); setTyping(false); }
                  }}
                  onBlur={() => !draft.trim() && setTyping(false)}
                  placeholder="Type an allergy, e.g. sesame"
                  maxLength={40}
                  className="min-w-0 flex-1 border border-cream/40 bg-transparent px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-cream/25 focus:border-cream"
                />
                <button
                  type="button"
                  onClick={commitCustom}
                  disabled={!draft.trim()}
                  className="shrink-0 border border-cream px-5 py-3.5 text-[11px] tracking-[0.25em] uppercase transition duration-300 hover:bg-cream hover:text-void disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Add
                </button>
              </div>
            )}

            {profile.customAllergies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.customAllergies.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => removeCustomAllergy(term)}
                    aria-label={`Remove ${term}`}
                    className="group flex items-center gap-2 border border-alarm/70 bg-alarm/8 px-3.5 py-2 text-sm text-alarm transition-colors hover:border-alarm"
                  >
                    <span>{term}</span>
                    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100">
                      <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {(profile.allergies.length > 0 || profile.customAllergies.length > 0) && (
              <p className="mt-6 flex items-start gap-3 border border-alarm/20 bg-alarm/5 px-4 py-3 text-xs leading-relaxed text-cream/70">
                <span aria-hidden="true" className="mt-0.5 shrink-0 grayscale">🛡</span>
                Kairos will never include these. If the scan finds one, it is flagged and dropped before anything is generated.
              </p>
            )}
          </section>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-void/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-5">
          {isOnboarding && step === 0 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full border border-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition duration-300 hover:bg-cream hover:text-void"
            >
              Continue
            </button>
          )}

          {isOnboarding && step === 1 && (
            <>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="border border-line px-7 py-4 text-[11px] tracking-[0.3em] text-cream/50 uppercase transition duration-300 hover:border-cream/40 hover:text-cream"
              >
                Back
              </button>
              <button
                type="button"
                onClick={finish}
                className="flex-1 border border-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition duration-300 hover:bg-cream hover:text-void"
              >
                {profile.allergies.length || profile.customAllergies.length
                  ? "Save and start cooking"
                  : "No allergies — continue"}
              </button>
            </>
          )}

          {!isOnboarding && (
            <button
              type="button"
              onClick={() => router.push("/kitchen")}
              className="w-full border border-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase transition duration-300 hover:bg-cream hover:text-void"
            >
              Done
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
