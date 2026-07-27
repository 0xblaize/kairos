"use client";

import { useEffect } from "react";

/** Lenis smooth scroll, kept in sync with GSAP's ScrollTrigger. */
export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis;
    let frame;
    let cancelled = false;

    Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);

        const raf = (t) => {
          lenis.raf(t);
          frame = requestAnimationFrame(raf);
        };
        frame = requestAnimationFrame(raf);
        ScrollTrigger.refresh();
      }
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
}
