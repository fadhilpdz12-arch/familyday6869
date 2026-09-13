"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Jata } from "@/components/Jata";

const PAUTAN = [
  { id: "maklumat", teks: "Maklumat" },
  { id: "tentatif", teks: "Tentatif" },
  { id: "ajk", teks: "AJK" },
  { id: "bajet", teks: "Bajet" },
  { id: "persiapan", teks: "Persiapan" },
] as const;

export function Nav() {
  const [buka, setBuka] = useState(false);
  const [aktif, setAktif] = useState<string>("");

  useEffect(() => {
    const seksyen = PAUTAN.map((p) => document.getElementById(p.id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (!seksyen.length) return;

    const pemerhati = new IntersectionObserver(
      (masukan) => {
        const nampak = masukan.find((m) => m.isIntersecting);
        if (nampak) setAktif(nampak.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    seksyen.forEach((s) => pemerhati.observe(s));
    return () => pemerhati.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = buka ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [buka]);

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(201,150,47,.22)] bg-[rgba(6,38,44,.9)] backdrop-blur-md">
      <div className="wrap flex h-[62px] items-center gap-3">
        <Link href="/" className="mr-auto flex min-w-0 items-center gap-3 text-kerang no-underline">
          <Jata ringkas className="h-8 w-8 shrink-0 text-tembaga" />
          <b className="truncate font-display text-[16px] font-normal tracking-wide">
            Mat Daud &amp; Siti Fatimah
          </b>
        </Link>

        <button
          type="button"
          onClick={() => setBuka((v) => !v)}
          aria-expanded={buka}
          aria-controls="menu-utama"
          aria-label={buka ? "Tutup menu" : "Buka menu"}
          className="rounded-[9px] border border-[rgba(201,150,47,.4)] p-2 text-tembaga-muda lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {buka ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>

        <div
          id="menu-utama"
          className={`${buka ? "flex" : "hidden"} fixed inset-x-0 top-[62px] max-h-[calc(100dvh-62px)] flex-col overflow-auto border-b border-[var(--garis)] bg-lagun-dalam px-[18px] pb-5 pt-2.5 lg:static lg:flex lg:max-h-none lg:flex-row lg:items-center lg:gap-1 lg:border-0 lg:bg-transparent lg:p-0`}
        >
          {PAUTAN.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              onClick={() => setBuka(false)}
              aria-current={aktif === p.id ? "true" : undefined}
              className={`border-b border-[rgba(201,150,47,.12)] px-2 py-3 text-[16px] font-medium no-underline transition-colors hover:text-tembaga-muda lg:rounded-lg lg:border-0 lg:px-[11px] lg:py-2 lg:text-sm ${
                aktif === p.id ? "text-kerang-terang" : "text-atas-gelap-lembut"
              }`}
            >
              {p.teks}
            </a>
          ))}
          <a
            href="#kehadiran"
            onClick={() => setBuka(false)}
            className="mt-3.5 rounded-full bg-tembaga px-4 py-3.5 text-center text-[15px] font-bold text-lagun-dalam no-underline transition-colors hover:bg-tembaga-muda lg:mt-0 lg:py-[9px] lg:text-[13.5px]"
          >
            Sahkan kehadiran
          </a>
        </div>
      </div>
    </nav>
  );
}
