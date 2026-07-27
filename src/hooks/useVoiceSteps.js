"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Listens for "next"/"back"/"repeat" while cooking. Chrome-only API, so every
 * caller must still work when `supported` is false.
 */
export default function useVoiceSteps({ enabled, onNext, onBack, onRepeat }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef(null);
  const handlers = useRef({ onNext, onBack, onRepeat });

  handlers.current = { onNext, onBack, onRepeat };

  useEffect(() => {
    const Ctor =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(Boolean(Ctor));
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor || recRef.current) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const said = event.results[i][0].transcript.toLowerCase().trim();
        if (/\b(next|forward|continue|done)\b/.test(said)) handlers.current.onNext?.();
        else if (/\b(back|previous|go back)\b/.test(said)) handlers.current.onBack?.();
        else if (/\b(repeat|again|say that again)\b/.test(said)) handlers.current.onRepeat?.();
      }
    };

    // The engine stops itself after silence; restart while cook mode is open.
    rec.onend = () => {
      if (recRef.current === rec) {
        try {
          rec.start();
        } catch {
          setListening(false);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        recRef.current = null;
        setListening(false);
      }
    };

    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) stop();
    return stop;
  }, [enabled, stop]);

  return { listening, supported, start, stop };
}
