"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import AmbientField from "@/components/AmbientField";
import { useProfile } from "@/context/ProfileContext";

const STEPS = [
  {
    n: "01",
    title: "Set your guardrails",
    body: "Diet and allergies, once. They sit underneath everything Kairos does from then on.",
  },
  {
    n: "02",
    title: "Snap your fridge",
    body: "One photo. No typing out what you have, no searching, no scrolling a recipe index.",
  },
  {
    n: "03",
    title: "Watch it filter",
    body: "Anything unsafe is flagged and dropped before a recipe is generated — and you are told why.",
  },
  {
    n: "04",
    title: "Cook hands-free",
    body: "Full-screen steps, readable across the kitchen, advanced with your voice.",
  },
];

export default function Home() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();

  useEffect(() => {
    let lenis;
    let frame;
    let cancelled = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const raf = (t) => {
        lenis.raf(t);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  const go = () => router.push(hydrated && profile.onboarded ? "/kitchen" : "/onboarding");

  return (
    <main>
      <section className="relative isolate min-h-dvh overflow-hidden">
        <AmbientField className="absolute inset-0 -z-10" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-void/40 to-void" />

        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
          <Logo />
          <button
            type="button"
            onClick={go}
            className="rounded-full border border-line px-5 py-2 text-sm transition-colors hover:border-saffron/60"
          >
            Open Kairos
          </button>
        </nav>

        <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pt-20 pb-28 text-center sm:pt-28">
          <p className="rise text-xs tracking-[0.28em] text-saffron uppercase">
            Zero-shot culinary engine
          </p>

          <h1 className="rise font-display mt-6 text-5xl leading-[1.02] sm:text-7xl lg:text-[5.5rem]">
            Cook what you
            <br />
            already have.
          </h1>

          <p className="rise mt-7 max-w-xl text-lg text-fog sm:text-xl">
            Kairos reads your fridge from a photo, strips out anything your body can&apos;t
            take, and hands you a recipe you can cook without touching the screen.
          </p>

          <button
            type="button"
            onClick={go}
            className="rise mt-10 rounded-full bg-saffron px-9 py-4 text-lg font-medium text-void transition-transform hover:scale-[1.03] active:scale-95"
          >
            Scan my fridge
          </button>

          <p className="rise mt-6 text-sm text-fog">
            No account. Your profile stays on your device.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="font-display max-w-2xl text-4xl leading-tight sm:text-5xl">
          Two things kill dinner: not knowing what you have, and not trusting what you
          find.
        </h2>
        <p className="mt-5 max-w-xl text-fog">
          Kairos removes both. The camera handles inventory. Your profile handles safety.
        </p>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-char p-8">
              <span className="font-display text-3xl text-saffron">{s.n}</span>
              <h3 className="mt-4 text-xl font-medium">{s.title}</h3>
              <p className="mt-2.5 text-fog">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-28">
        <div className="rounded-3xl border border-alarm/25 bg-alarm/[0.04] p-8 sm:p-12">
          <p className="text-xs tracking-[0.24em] text-alarm uppercase">The safety net</p>
          <h2 className="font-display mt-4 max-w-2xl text-3xl leading-tight sm:text-4xl">
            An allergen never has to be noticed to be blocked.
          </h2>
          <p className="mt-5 max-w-2xl text-fog">
            Your restrictions are enforced three times over: ingredients are screened the
            moment they come off the photo, the recipe model is told in its system prompt
            what it must never touch, and the finished recipe is screened again before it
            reaches you. If anything unsafe survives all three, Kairos refuses the recipe
            rather than serving it.
          </p>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="text-sm text-fog">Kairos — the right moment to eat well.</p>
        </div>
      </footer>
    </main>
  );
}
