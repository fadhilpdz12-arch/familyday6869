"use client";

import { useEffect, useRef, useState } from "react";

const KUNCI_INGATAN = "fd2026-muzik";

/** Butang muzik tema terapung. Tak autoplay bersuara (ikut sekatan pelayar) —
 * pengguna kena tekan sendiri kali pertama, lepas tu pilihan diingati. */
export function MuzikTema({ url }: { url?: string }) {
  const [main, tetapkanMain] = useState(false);
  const rujukan = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(KUNCI_INGATAN) === "on") tetapkanMain(true);
    } catch {
      /* storage tak tersedia — abaikan, default off */
    }
  }, []);

  useEffect(() => {
    const el = rujukan.current;
    if (!el) return;
    if (main) {
      el.play().catch(() => tetapkanMain(false));
    } else {
      el.pause();
    }
    try {
      localStorage.setItem(KUNCI_INGATAN, main ? "on" : "off");
    } catch {
      /* abaikan */
    }
  }, [main]);

  if (!url) return null;

  return (
    <>
      <audio ref={rujukan} src={url} loop preload="none" />
      <button
        type="button"
        onClick={() => tetapkanMain((v) => !v)}
        aria-label={main ? "Matikan muzik tema" : "Hidupkan muzik tema"}
        aria-pressed={main}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(201,150,47,.4)] bg-lagun text-kerang-terang shadow-[0_6px_20px_rgba(0,0,0,.25)] transition-transform hover:scale-105"
      >
        {main ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
            <path d="M17 8a5 5 0 010 8M19.5 5.5a9 9 0 010 13" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
            <path d="M16 9l5 6M21 9l-5 6" />
          </svg>
        )}
      </button>
    </>
  );
}
