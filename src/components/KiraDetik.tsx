"use client";

import { useEffect, useState } from "react";
import { ACARA } from "@/lib/acara";

const SASARAN = new Date(ACARA.mula).getTime();
const pad = (n: number) => String(n).padStart(2, "0");

function baki() {
  const ms = SASARAN - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    hari: String(Math.floor(s / 86400)),
    jam: pad(Math.floor((s % 86400) / 3600)),
    minit: pad(Math.floor((s % 3600) / 60)),
    saat: pad(s % 60),
  };
}

export function KiraDetik() {
  // null semasa render pelayan supaya tiada ketidakpadanan hidrasi
  const [masa, setMasa] = useState<ReturnType<typeof baki>>(null);
  const [sedia, setSedia] = useState(false);

  useEffect(() => {
    setSedia(true);
    setMasa(baki());
    const jam = setInterval(() => setMasa(baki()), 1000);
    return () => clearInterval(jam);
  }, []);

  if (sedia && !masa) {
    return (
      <p className="mx-auto mb-7 max-w-[430px] font-display text-xl text-tembaga-muda">
        Family Day sedang berlangsung. Selamat berkumpul.
      </p>
    );
  }

  const unit = [
    { nilai: masa?.hari, label: "Hari" },
    { nilai: masa?.jam, label: "Jam" },
    { nilai: masa?.minit, label: "Minit" },
    { nilai: masa?.saat, label: "Saat" },
  ];

  return (
    <div className="mx-auto mb-7 flex max-w-[430px] justify-center gap-2" aria-live="off">
      {unit.map((u) => (
        <div key={u.label} className="flex-1 rounded-xl border border-[rgba(201,150,47,.32)] bg-[rgba(242,237,225,.045)] px-1 pb-2.5 pt-3">
          <b className="block font-display text-[clamp(1.5rem,6vw,2.1rem)] font-normal leading-none text-kerang-terang angka-jadual">
            {u.nilai ?? "—"}
          </b>
          <i className="mt-[7px] block text-[11px] not-italic tracking-[.09em] text-atas-gelap-lembut">
            {u.label}
          </i>
        </div>
      ))}
    </div>
  );
}
