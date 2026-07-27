"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useVoiceSteps from "@/hooks/useVoiceSteps";

export default function CookMode({ recipe, onExit }) {
  const steps = recipe.steps || [];
  const [index, setIndex] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);
  const wakeLockRef = useRef(null);

  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, steps.length - 1)),
    [steps.length]
  );
  const back = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const speak = useCallback(
    (i) => {
      const step = steps[i];
      if (!step || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${step.title}. ${step.detail}`);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    },
    [steps]
  );

  const voice = useVoiceSteps({
    enabled: voiceOn,
    onNext: next,
    onBack: back,
    onRepeat: () => setIndex((i) => {
      speak(i);
      return i;
    }),
  });

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") back();
      else if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back, onExit]);

  // Keep the screen awake — hands are busy and the phone is on the counter.
  useEffect(() => {
    let cancelled = false;
    const request = async () => {
      try {
        if ("wakeLock" in navigator) {
          const lock = await navigator.wakeLock.request("screen");
          if (cancelled) lock.release();
          else wakeLockRef.current = lock;
        }
      } catch {
        // denied or unsupported; cooking still works
      }
    };
    request();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggleVoice = () => {
    if (voice.listening) {
      voice.stop();
      setVoiceOn(false);
    } else {
      setVoiceOn(true);
      voice.start();
    }
  };

  const step = steps[index];
  const last = index === steps.length - 1;
  const progress = steps.length ? ((index + 1) / steps.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-void">
      <div className="h-1 w-full bg-line">
        <div
          className="h-full bg-saffron transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="text-sm tracking-widest text-fog uppercase">
          Step {index + 1} of {steps.length}
        </span>

        <div className="flex items-center gap-2">
          {voice.supported && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-pressed={voice.listening}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                voice.listening
                  ? "border-verde/60 bg-verde/10 text-verde"
                  : "border-line text-fog hover:text-cream"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  voice.listening ? "animate-pulse bg-verde" : "bg-fog"
                }`}
              />
              {voice.listening ? "Listening" : "Voice"}
            </button>
          )}
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-line px-4 py-2 text-sm text-fog transition-colors hover:text-cream"
          >
            Exit
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center px-6 pb-4 sm:px-12">
        {step && (
          <div key={index} className="rise mx-auto w-full max-w-4xl">
            {step.minutes > 0 && (
              <p className="text-lg tracking-wide text-saffron">
                about {step.minutes} min
              </p>
            )}
            <h1 className="font-display mt-3 text-5xl leading-[1.05] sm:text-7xl lg:text-8xl">
              {step.title}
            </h1>
            <p className="mt-7 max-w-3xl text-2xl leading-snug text-cream/85 sm:text-3xl lg:text-4xl">
              {step.detail}
            </p>
          </div>
        )}
      </main>

      {voice.listening && (
        <p className="pb-3 text-center text-sm text-fog">
          Say <span className="text-cream">“next”</span>,{" "}
          <span className="text-cream">“back”</span> or{" "}
          <span className="text-cream">“repeat”</span>
        </p>
      )}

      <footer className="flex items-center gap-3 px-5 pb-8 sm:px-12">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="rounded-full border border-line px-7 py-4 text-lg text-fog transition-colors hover:text-cream disabled:opacity-30"
        >
          Back
        </button>
        <button
          type="button"
          onClick={last ? onExit : next}
          className="flex-1 rounded-full bg-saffron px-8 py-5 text-xl font-medium text-void transition-transform active:scale-[0.98]"
        >
          {last ? "Finish" : "Next step"}
        </button>
      </footer>
    </div>
  );
}
