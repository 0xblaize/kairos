"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALLERGENS, DIETS } from "@/lib/diet";
import { useProfile } from "@/context/ProfileContext";
import Logo from "@/components/Logo";

export default function ProfileEditor({ mode = "onboarding" }) {
  const router = useRouter();
  const { profile, hydrated, setDiet, toggleAllergy, completeOnboarding } = useProfile();
  const [step, setStep] = useState(mode === "onboarding" ? 0 : 1);

  if (!hydrated) return null;

  const isOnboarding = mode === "onboarding";
  const showDiet = !isOnboarding || step === 0;
  const showAllergy = !isOnboarding || step === 1;

  const finish = () => {
    completeOnboarding();
    router.push("/kitchen");
  };

  // On step 2 the allergy block is the only content on the page, so it owns the h1.
  const AllergyHeading = isOnboarding ? "h1" : "h2";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 py-8">
      <Logo className="mb-10" />

      {showDiet && (
        <section className="rise">
          <p className="text-xs tracking-[0.22em] text-saffron uppercase">
            {isOnboarding ? "Step 1 of 2" : "Diet"}
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
            How do you eat?
          </h1>
          <p className="mt-3 max-w-md text-fog">
            Kairos will only ever build recipes that fit this. You can change it any time.
          </p>

          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {DIETS.map((d) => {
              const on = profile.diet === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiet(d.id)}
                  aria-pressed={on}
                  className={`rounded-2xl border px-4 py-3.5 text-left transition-all ${
                    on
                      ? "border-saffron bg-saffron/10"
                      : "border-line bg-elev/50 hover:border-fog/40"
                  }`}
                >
                  <span className="block text-[15px] font-medium">{d.label}</span>
                  <span className="mt-0.5 block text-xs text-fog">{d.note}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {showAllergy && (
        <section className={showDiet ? "mt-14 rise" : "rise"}>
          <p className="text-xs tracking-[0.22em] text-alarm uppercase">
            {isOnboarding ? "Step 2 of 2" : "Allergies"}
          </p>
          <AllergyHeading className="font-display mt-3 text-4xl leading-tight sm:text-5xl">
            Anything that could hurt you?
          </AllergyHeading>
          <p className="mt-3 max-w-md text-fog">
            Anything you switch on here is blocked at every stage — even if the camera sees
            it sitting in your fridge.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {ALLERGENS.map((a) => {
              const on = profile.allergies.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAllergy(a.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3.5 transition-all ${
                    on
                      ? "border-alarm bg-alarm/10"
                      : "border-line bg-elev/50 hover:border-fog/40"
                  }`}
                >
                  <span className="text-lg">{a.glyph}</span>
                  <span className="text-[15px] font-medium">{a.label}</span>
                  {on && (
                    <svg viewBox="0 0 24 24" className="ml-auto h-4 w-4 text-alarm">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                      <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {profile.allergies.length > 0 && (
            <p className="mt-5 flex items-start gap-2 rounded-xl border border-alarm/30 bg-alarm/5 px-4 py-3 text-sm text-cream/90">
              <span aria-hidden="true">🛡</span>
              <span>
                Kairos will never put these in a recipe. If the scan finds one, it gets
                flagged and dropped before anything is generated.
              </span>
            </p>
          )}
        </section>
      )}

      <div className="mt-auto flex items-center gap-3 pt-12">
        {isOnboarding && step === 0 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-full bg-cream px-7 py-3.5 font-medium text-void transition-transform hover:scale-[1.02] active:scale-95"
          >
            Continue
          </button>
        )}

        {isOnboarding && step === 1 && (
          <>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="rounded-full border border-line px-6 py-3.5 text-fog transition-colors hover:text-cream"
            >
              Back
            </button>
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-saffron px-7 py-3.5 font-medium text-void transition-transform hover:scale-[1.02] active:scale-95"
            >
              {profile.allergies.length ? "Save and start cooking" : "No allergies — continue"}
            </button>
          </>
        )}

        {!isOnboarding && (
          <button
            type="button"
            onClick={() => router.push("/kitchen")}
            className="rounded-full bg-saffron px-7 py-3.5 font-medium text-void transition-transform hover:scale-[1.02] active:scale-95"
          >
            Done
          </button>
        )}
      </div>
    </main>
  );
}
