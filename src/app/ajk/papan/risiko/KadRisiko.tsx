"use client";

import Link from "next/link";
import { useTransition } from "react";
import { padamRisiko, tukarStatusRisiko } from "@/tindakan/risiko";
import { LABEL_RISIKO, LABEL_TAHAP } from "@/lib/format";
import type { Ajk, RancanganKerja, Risiko, StatusRisiko } from "@/lib/database.types";

const STATUS: StatusRisiko[] = ["dipantau", "pelan_sedia", "berlaku", "ditutup"];

const WARNA: Record<StatusRisiko, string> = {
  dipantau: "bg-[rgba(21,43,44,.08)] text-teks-lembut",
  pelan_sedia: "bg-[rgba(78,133,119,.16)] text-[#255e4f]",
  berlaku: "bg-[rgba(168,67,47,.14)] text-[#8a3524]",
  ditutup: "bg-[rgba(201,150,47,.14)] text-[#8a6412]",
};

export function KadRisiko({
  risiko, ajk, rancangan, pengerusi,
}: {
  risiko: Risiko; ajk: Ajk[]; rancangan: RancanganKerja[]; pengerusi: boolean;
}) {
  const [menunggu, mula] = useTransition();
  const orang = ajk.find((a) => a.id === risiko.penanggungjawab);
  const dikaitkan = rancangan.find((r) => r.id === risiko.rancangan_id);
  const merah = risiko.status === "berlaku";

  return (
    <article className={`rounded-xl border p-5 ${merah ? "border-tanah bg-[rgba(168,67,47,.05)]" : "border-[var(--garis-gelap)] bg-kerang-terang"}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${WARNA[risiko.status]}`}>
          {LABEL_RISIKO[risiko.status]}
        </span>
        <span className="text-[11.5px] text-teks-lembut">
          Kemungkinan {LABEL_TAHAP[risiko.kebarangkalian].toLowerCase()} · kesan {LABEL_TAHAP[risiko.kesan].toLowerCase()}
        </span>
      </div>

      <h2 className="mb-2 font-sans text-[16px] font-semibold leading-snug">{risiko.senario}</h2>

      {risiko.pencetus && (
        <p className="mb-2 text-[13.5px] text-teks-lembut">
          <b className="font-semibold text-teks">Tanda awal:</b> {risiko.pencetus}
        </p>
      )}

      <p className="mb-3 text-[14px] leading-relaxed">{risiko.pelan_sandaran}</p>

      {dikaitkan && (
        <p className="mb-3 text-[13px] text-teks-lembut">
          Dikaitkan dengan{" "}
          <Link href={`/ajk/papan/kerja?biro=${dikaitkan.biro_id}`} className="underline underline-offset-2 hover:text-tembaga">
            {dikaitkan.tajuk}
          </Link>{" "}
          dalam Agihan Kerja.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--garis-gelap)] pt-3">
        <span className="text-[13px] text-teks-lembut">
          Yang jaga: <b className="font-semibold text-teks">{orang?.nama ?? "Belum ditetapkan"}</b>
        </span>
        <select
          aria-label={`Tukar status untuk ${risiko.senario}`}
          className="ml-auto rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1 text-[13px]"
          value={risiko.status}
          disabled={menunggu}
          onChange={(e) => {
            const nilai = e.target.value;
            mula(async () => { await tukarStatusRisiko(risiko.id, nilai); });
          }}
        >
          {STATUS.map((s) => <option key={s} value={s}>{LABEL_RISIKO[s]}</option>)}
        </select>
        {pengerusi && (
          <button
            type="button" disabled={menunggu}
            onClick={() => {
              if (!confirm(`Padam pelan sandaran "${risiko.senario}"?`)) return;
              mula(async () => { await padamRisiko(risiko.id); });
            }}
            className="text-[12.5px] text-tanah underline underline-offset-2 disabled:opacity-50"
          >
            Padam
          </button>
        )}
      </div>
    </article>
  );
}
