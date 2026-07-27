"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "kairos.profile.v1";

const DEFAULT_PROFILE = {
  diet: "none",
  allergies: [],
  onboarded: false,
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
    } catch {
      // corrupted or unavailable storage falls back to defaults
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // storage full or blocked; profile still lives in memory this session
    }
  }, [profile, hydrated]);

  const value = useMemo(
    () => ({
      profile,
      hydrated,
      setDiet: (diet) => setProfile((p) => ({ ...p, diet })),
      toggleAllergy: (id) =>
        setProfile((p) => ({
          ...p,
          allergies: p.allergies.includes(id)
            ? p.allergies.filter((a) => a !== id)
            : [...p.allergies, id],
        })),
      completeOnboarding: () => setProfile((p) => ({ ...p, onboarded: true })),
      reset: () => setProfile(DEFAULT_PROFILE),
    }),
    [profile, hydrated]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
