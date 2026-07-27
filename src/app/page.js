"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import HeroScene from "@/components/HeroScene";
import { useProfile } from "@/context/ProfileContext";

const NAV = [
  { label: "Profile", href: "/profile" },
  { label: "Kitchen", href: "/kitchen" },
];

export default function Home() {
  const router = useRouter();
  const { profile, hydrated } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = () => router.push(hydrated && profile.onboarded ? "/kitchen" : "/onboarding");

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7">
          <div className="hidden gap-8 text-xs font-bold tracking-[0.3em] text-white uppercase mix-blend-difference md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition-opacity hover:opacity-50">
                {n.label}
              </a>
            ))}
          </div>

          <a
            href="/"
            className="flex items-center gap-3 text-white mix-blend-difference"
            aria-label="Kairos home"
          >
            <LogoMark className="h-7 w-7" accent="currentColor" />
            <span className="font-display text-2xl tracking-[0.3em] md:text-3xl">
              KAIROS
            </span>
          </a>

          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={go}
              className="hidden text-xs font-bold tracking-[0.3em] text-white uppercase mix-blend-difference transition-opacity hover:opacity-50 md:block"
            >
              Open app
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="text-white mix-blend-difference md:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <line x1="3" y1="7" x2="21" y2="7" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="17" x2="21" y2="17" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-60 flex flex-col items-center justify-center bg-void transition-transform duration-500 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          className="absolute top-7 right-6 text-cream"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6">
            <line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" strokeWidth="2" />
            <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-12 text-cream">
          <span className="font-display text-4xl tracking-[0.3em]">KAIROS</span>
          <nav className="flex flex-col items-center gap-8 text-sm font-bold tracking-[0.3em] uppercase">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                go();
              }}
            >
              Open app
            </button>
          </nav>
        </div>
      </div>

      <main>
        <section className="relative flex h-dvh w-full items-center justify-center overflow-hidden">
          <HeroScene className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-void/40" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_54%_at_50%_50%,rgba(8,9,10,0.9),transparent_78%)]" />

          <div className="relative z-10 w-full px-6 text-center text-cream">
            <p className="mb-6 text-[10px] tracking-[0.5em] uppercase opacity-80 md:text-sm">
              Zero-shot culinary engine
            </p>

            <h1 className="hero-text-shadow font-display mb-10 text-5xl font-normal tracking-[0.3em] sm:text-7xl md:text-8xl lg:text-[9rem]">
              KAIROS
            </h1>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-6">
              <button
                type="button"
                onClick={go}
                className="inline-block w-full border border-cream px-10 py-4 text-[10px] tracking-[0.3em] uppercase transition duration-500 hover:bg-cream hover:text-void sm:w-auto md:text-xs"
              >
                Scan my fridge
              </button>
              <a
                href="/profile"
                className="inline-block w-full px-10 py-4 text-[10px] tracking-[0.3em] uppercase transition duration-500 hover:opacity-50 sm:w-auto md:text-xs"
              >
                Set allergies
              </a>
            </div>
          </div>

          <div className="absolute bottom-10 left-10 hidden text-xs tracking-[0.3em] text-cream uppercase opacity-60 md:block">
            Photograph your fridge
            <br />
            Cook what is already there
          </div>

          <div className="absolute right-8 bottom-8 z-20">
            <div className="group relative flex h-24 w-24 items-center justify-center md:h-36 md:w-36">
              <div className="badge-spin absolute inset-0">
                <svg viewBox="0 0 100 100" className="h-full w-full" overflow="visible">
                  <defs>
                    <path
                      id="badgePath"
                      d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
                    />
                  </defs>
                  <text
                    fill="currentColor"
                    className="text-cream"
                    fontSize="9"
                    letterSpacing="3"
                  >
                    <textPath href="#badgePath">
                      • ALLERGY AWARE • ZERO TYPING • HANDS FREE
                    </textPath>
                  </text>
                </svg>
              </div>
              <div className="relative z-10 text-cream">
                <LogoMark className="h-7 w-7" accent="var(--color-saffron)" />
              </div>
              <div className="absolute inset-0 rounded-full bg-cream/5 backdrop-blur-[2px]" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
