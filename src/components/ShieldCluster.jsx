"use client";

import { ALLERGENS, DIETS } from "@/lib/diet";
import { useProfile } from "@/context/ProfileContext";
import Link from "next/link";

export default function ShieldCluster({ href = "/profile" }) {
  const { profile } = useProfile();
  const active = ALLERGENS.filter((a) => profile.allergies.includes(a.id));
  const diet = DIETS.find((d) => d.id === profile.diet);

  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-full border border-line bg-elev/70 py-1.5 pr-3 pl-2 backdrop-blur transition-colors hover:border-cream/30"
      aria-label="Edit dietary and allergy profile"
    >
      {active.length === 0 && (!diet || diet.id === "none") ? (
        <span className="px-1 text-xs text-fog">Set your profile</span>
      ) : (
        <>
          <span className="flex -space-x-1">
            {active.slice(0, 4).map((a) => (
              <span
                key={a.id}
                title={`No ${a.label}`}
                className="relative grid h-6 w-6 place-items-center rounded-full border border-line bg-void text-[11px]"
              >
                {a.glyph}
                <span className="absolute inset-0 grid place-items-center text-alarm">
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.85" />
                    <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
              </span>
            ))}
          </span>
          {active.length > 4 && (
            <span className="text-[11px] text-fog">+{active.length - 4}</span>
          )}
          {diet && diet.id !== "none" && (
            <span className="text-[11px] tracking-wide text-cream/80">{diet.label}</span>
          )}
        </>
      )}
    </Link>
  );
}
