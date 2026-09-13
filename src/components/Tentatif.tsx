"use client";

import { useState } from "react";
import type { Tentatif as BarisTentatif } from "@/lib/database.types";

const HARI = [
  { no: 1, teks: "Hari pertama", tarikh: "Jumaat, 11 Dis" },
  { no: 2, teks: "Hari kedua", tarikh: "Sabtu, 12 Dis" },
  { no: 3, teks: "Hari ketiga", tarikh: "Ahad, 13 Dis" },
] as const;

export function Tentatif({ baris }: { baris: BarisTentatif[] }) {
  const [hari, setHari] = useState(1);
  const senarai = baris.filter((b) => b.hari === hari);
  const adaDraf = senarai.some((b) => b.draf);

  return (
    <section id="tentatif" className="sek sek-terang">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Tentatif program</h2>
          <p>Waktu solat dijaga sepanjang tiga hari. Aktiviti boleh dianjak sikit ikut keadaan, tapi waktu makan dan check out kekal.</p>
        </div>

        <div role="tablist" aria-label="Pilih hari" className="mb-[30px] flex flex-wrap gap-2">
          {HARI.map((h) => {
            const pilih = h.no === hari;
            return (
              <button
                key={h.no}
                role="tab"
                aria-selected={pilih}
                aria-controls={`panel-hari-${h.no}`}
                id={`tab-hari-${h.no}`}
                onClick={() => setHari(h.no)}
                onKeyDown={(e) => {
                  const arah = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                  if (!arah) return;
                  e.preventDefault();
                  const seterus = ((hari - 1 + arah + 3) % 3) + 1;
                  setHari(seterus);
                  document.getElementById(`tab-hari-${seterus}`)?.focus();
                }}
                className={`cursor-pointer rounded-full border-[1.5px] px-5 py-[11px] text-left text-[14.5px] font-semibold transition-colors ${
                  pilih
                    ? "border-lagun bg-lagun text-kerang-terang"
                    : "border-[var(--garis-gelap)] text-teks-lembut hover:border-tembaga hover:text-teks"
                }`}
              >
                {h.teks}
                <small className="mt-px block text-xs font-normal opacity-75">{h.tarikh}</small>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`panel-hari-${hari}`} aria-labelledby={`tab-hari-${hari}`}>
          {adaDraf && (
            <p className="mb-7 rounded-r-[10px] border-l-[3px] border-tanah bg-[rgba(168,67,47,.06)] px-[18px] py-3.5 text-[14.5px] text-[#7a3524]">
              <b>Sebahagian baris ini draf cadangan.</b> Ia boleh diubah oleh AJK berkenaan sebelum disahkan Pengerusi.
            </p>
          )}

          <ol className="m-0 list-none p-0">
            {senarai.map((b, i) => (
              <li key={b.id} className="relative grid gap-x-5 pb-[26px] sm:grid-cols-[96px_1fr]">
                {i < senarai.length - 1 && (
                  <span aria-hidden="true" className="absolute bottom-[-8px] top-[34px] w-px bg-[var(--garis-gelap)] left-[7px] sm:left-[123px] sm:top-5" />
                )}
                <div className="pl-8 font-display text-[.95rem] text-tembaga angka-jadual sm:pl-0 sm:pt-px sm:text-right sm:text-[1.02rem] sm:text-lagun">
                  {b.masa}
                </div>
                <div className="relative pl-8">
                  <span aria-hidden="true" className="absolute left-0.5 top-[-20px] h-[11px] w-[11px] rounded-full border-2 border-tembaga bg-kerang-terang sm:top-2" />
                  <b className="block font-display text-[1.16rem] font-normal">{b.tajuk}</b>
                  {b.keterangan && <p className="m-0 text-[14.5px] text-teks-lembut">{b.keterangan}</p>}
                  {(b.tag || b.ibadah) && (
                    <span className={`mt-[7px] inline-block rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold tracking-wide ${
                      b.ibadah ? "bg-[rgba(201,150,47,.16)] text-[#8a6412]" : "bg-[rgba(78,133,119,.14)] text-[#2e6355]"
                    }`}>
                      {b.ibadah ? "Ibadah" : b.tag}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
