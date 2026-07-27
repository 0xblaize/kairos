"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import HeroScene from "@/components/HeroScene";
import useReveal from "@/hooks/useReveal";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import { useProfile } from "@/context/ProfileContext";

const STEPS = [
  {
    n: "01",
    title: "Set your guardrails",
    body: "Your diet and your allergies, once. From then on they sit underneath every single thing Kairos does.",
  },
  {
    n: "02",
    title: "Snap your fridge",
    body: "One photo. No typing out what you have, no searching, no scrolling a recipe index you don't have the ingredients for.",
  },
  {
    n: "03",
    title: "Watch it filter",
    body: "Anything unsafe is flagged and dropped before a recipe exists — and you are told exactly what was removed and why.",
  },
  {
    n: "04",
    title: "Cook hands-free",
    body: "Full-screen steps, readable from across the kitchen, advanced with your voice while your hands are busy.",
  },
];

const GATES = [
  {
    label: "Gate one",
    title: "At the photo",
    body: "Every ingredient the camera returns is screened against your profile before it is ever shown to you.",
  },
  {
    label: "Gate two",
    title: "At the prompt",
    body: "The recipe model is told in its system prompt what it must never touch. Unsafe items are removed from its input entirely.",
  },
  {
    label: "Gate three",
    title: "At the plate",
    body: "The finished recipe is screened again. If anything unsafe survived, Kairos refuses the recipe instead of serving it.",
  },
];

export default function Home() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();
  const rootRef = useRef(null);
  const pinRef = useRef(null);

  useSmoothScroll();
  useReveal(rootRef);

  useEffect(() => {
    const section = pinRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        const cards = section.querySelectorAll("[data-gate]");
        if (!cards.length) return;

        ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${cards.length * 60}%`,
              pin: true,
              scrub: 0.6,
            },
          });

          cards.forEach((card, i) => {
            if (i === 0) {
              gsap.set(card, { autoAlpha: 1, y: 0 });
              return;
            }
            gsap.set(card, { autoAlpha: 0, y: 48 });
            tl.to(cards[i - 1], { autoAlpha: 0, y: -40, duration: 0.5 }, i - 1).to(
              card,
              { autoAlpha: 1, y: 0, duration: 0.5 },
              i - 1 + 0.25
            );
          });
        }, section);
      }
    );

    return () => ctx?.revert();
  }, []);

  const go = () => router.push(hydrated && profile.onboarded ? "/kitchen" : "/onboarding");

  return (
    <div ref={rootRef}>
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-line/40 bg-void/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={go}
            className="rounded-full border border-line px-5 py-2 text-sm transition-colors hover:border-saffron/60 hover:text-saffron"
          >
            Open Kairos
          </button>
        </div>
      </nav>

      <main>
        <section className="relative isolate flex min-h-dvh items-center overflow-hidden">
          <HeroScene className="absolute inset-0 -z-10" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-void/50 via-transparent to-void" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(8,9,10,0.92),transparent_75%)]" />

          <div className="mx-auto w-full max-w-4xl px-5 pt-24 text-center">
            <p className="rise text-xs tracking-[0.3em] text-saffron uppercase">
              Zero-shot culinary engine
            </p>

            <h1 className="rise font-display mt-7 text-5xl leading-[1.02] sm:text-7xl lg:text-[5.75rem]">
              Cook what you
              <br />
              already have.
            </h1>

            <p className="rise mx-auto mt-8 max-w-xl text-lg text-fog sm:text-xl">
              Kairos reads your fridge from a single photo, strips out everything your
              body can&apos;t take, and hands you a recipe you can cook without ever
              touching the screen.
            </p>

            <div className="rise mt-11 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={go}
                className="rounded-full bg-saffron px-10 py-4 text-lg font-medium text-void transition-transform hover:scale-[1.03] active:scale-95"
              >
                Scan my fridge
              </button>
              <p className="text-sm text-fog">
                No account. Your profile never leaves your device.
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <span className="text-[11px] tracking-[0.28em] text-fog uppercase">Scroll</span>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-28 sm:py-36">
          <h2 data-reveal className="font-display max-w-3xl text-4xl leading-tight sm:text-6xl">
            Two things kill dinner: not knowing what you have, and not trusting what you
            find.
          </h2>
          <p data-reveal className="mt-7 max-w-xl text-lg text-fog">
            Kairos removes both. The camera handles the inventory. Your profile handles
            the safety. You just cook.
          </p>

          <div
            data-reveal-stagger
            className="mt-20 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2"
          >
            {STEPS.map((s) => (
              <div key={s.n} className="bg-char p-8 sm:p-10">
                <span className="font-display text-3xl text-saffron">{s.n}</span>
                <h3 className="mt-5 text-xl font-medium">{s.title}</h3>
                <p className="mt-3 text-fog">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          ref={pinRef}
          className="relative flex min-h-dvh items-center overflow-hidden border-y border-line bg-char"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs tracking-[0.28em] text-alarm uppercase">
                The safety net
              </p>
              <h2 className="font-display mt-5 text-4xl leading-tight sm:text-5xl">
                An allergen never has to be noticed to be blocked.
              </h2>
              <p className="mt-6 max-w-md text-fog">
                Most apps ask you to read the ingredient list and catch the problem
                yourself. Kairos assumes you shouldn&apos;t have to. Your restrictions are
                enforced three separate times, and the last one can veto the whole recipe.
              </p>
            </div>

            <div className="relative min-h-[19rem]">
              {GATES.map((g) => (
                <article
                  key={g.label}
                  data-gate
                  className="absolute inset-x-0 top-0 rounded-3xl border border-alarm/25 bg-alarm/[0.05] p-8 sm:p-10"
                >
                  <p className="text-xs tracking-[0.24em] text-alarm uppercase">
                    {g.label}
                  </p>
                  <h3 className="font-display mt-4 text-3xl">{g.title}</h3>
                  <p className="mt-4 text-fog">{g.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 py-32 text-center sm:py-44">
          <h2 data-reveal className="font-display text-4xl leading-tight sm:text-6xl">
            Your fridge already has dinner in it.
          </h2>
          <p data-reveal className="mx-auto mt-6 max-w-lg text-lg text-fog">
            Kairos just has to look.
          </p>
          <div data-reveal className="mt-11">
            <button
              type="button"
              onClick={go}
              className="rounded-full bg-saffron px-10 py-4 text-lg font-medium text-void transition-transform hover:scale-[1.03] active:scale-95"
            >
              Scan my fridge
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="text-sm text-fog">Kairos — the right moment to eat well.</p>
        </div>
      </footer>
    </div>
  );
}
