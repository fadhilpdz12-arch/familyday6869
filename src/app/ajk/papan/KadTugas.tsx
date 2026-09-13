"use client";

import { useTransition } from "react";
import { tukarStatus, tugaskanSemula, padamTugas } from "@/tindakan/tugas";
import { LABEL_KEUTAMAAN, LABEL_TUGAS, WARNA_KEUTAMAAN, WARNA_TUGAS, labelBakiHari } from "@/lib/format";
import type { Ajk, Biro, StatusTugas, Tugasan } from "@/lib/database.types";

const STATUS: StatusTugas[] = ["belum_mula", "sedang_buat", "tersekat", "selesai"];

export function KadTugas({
  tugas, ajk, biro, bolehAssign,
}: {
  tugas: Tugasan;
  ajk: Ajk[];
  biro: Biro[];
  bolehAssign: boolean;
}) {
  const [menunggu, mula] = useTransition();
  const pemilik = ajk.find((a) => a.id === tugas.ditugaskan_kepada);
  const namaBiro = biro.find((b) => b.id === tugas.biro_id)?.nama;
  const tempoh = tugas.tarikh_akhir ? labelBakiHari(tugas.tarikh_akhir) : null;
  const lewat = tempoh?.bahaya && tugas.status !== "selesai";

  return (
    <article className={`rounded-xl border bg-kerang-terang p-4 ${lewat ? "border-tanah" : "border-[var(--garis-gelap)]"}`}>
      <div className="mb-2 flex flex-wrap items-start gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${WARNA_TUGAS[tugas.status]}`}>
          {LABEL_TUGAS[tugas.status]}
        </span>
        <span className={`text-[11.5px] ${WARNA_KEUTAMAAN[tugas.keutamaan]}`}>
          {LABEL_KEUTAMAAN[tugas.keutamaan]}
        </span>
        {namaBiro && <span className="text-[11.5px] text-teks-lembut">· {namaBiro}</span>}
        {tempoh && (
          <span className={`ml-auto text-[11.5px] ${lewat ? "font-bold text-tanah" : "text-teks-lembut"}`}>
            {tempoh.teks}
          </span>
        )}
      </div>

      <h3 className="mb-1 font-sans text-[15.5px] font-semibold leading-snug">{tugas.teks}</h3>
      {tugas.butiran && <p className="mb-3 text-[13.5px] leading-relaxed text-teks-lembut">{tugas.butiran}</p>}

      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--garis-gelap)] pt-3">
        <select
          aria-label="Tukar status"
          className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1 text-[13px]"
          value={tugas.status}
          disabled={menunggu}
          onChange={(e) => {
            const nilai = e.target.value;
            mula(async () => { await tukarStatus(tugas.id, nilai); });
          }}
        >
          {STATUS.map((s) => <option key={s} value={s}>{LABEL_TUGAS[s]}</option>)}
        </select>

        {bolehAssign ? (
          <select
            aria-label="Assign kepada"
            className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1 text-[13px]"
            value={tugas.ditugaskan_kepada ?? ""}
            disabled={menunggu}
            onChange={(e) => {
              const nilai = e.target.value || null;
              mula(async () => { await tugaskanSemula(tugas.id, nilai); });
            }}
          >
            <option value="">— Belum diassign —</option>
            {ajk.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
          </select>
        ) : (
          <span className="text-[13px] text-teks-lembut">
            {pemilik ? pemilik.nama : "Belum diassign"}
          </span>
        )}

        {bolehAssign && (
          <button
            type="button"
            disabled={menunggu}
            onClick={() => {
              if (!confirm(`Padam tugas "${tugas.teks}"?`)) return;
              mula(async () => { await padamTugas(tugas.id); });
            }}
            className="ml-auto text-[12.5px] text-tanah underline underline-offset-2 disabled:opacity-50"
          >
            Padam
          </button>
        )}
      </div>
    </article>
  );
}
