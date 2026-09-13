"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { aturPetugas, padamPetugas } from "@/tindakan/kerja";
import { ButangHantar, Mesej } from "@/components/ui";
import { LABEL_HARI } from "@/lib/acara";
import { LABEL_PERANAN_HARI } from "@/lib/format";
import type { Ajk, PerananHari, PetugasHari } from "@/lib/database.types";

const PERANAN: PerananHari[] = ["pic_keseluruhan", "emcee", "bantuan_teknikal", "fotografer", "lain"];

export function JadualPetugas({ petugas, ajk, pengerusi }: { petugas: PetugasHari[]; ajk: Ajk[]; pengerusi: boolean }) {
  return (
    <div className="mb-12 grid gap-5 lg:grid-cols-3">
      {[1, 2, 3].map((hari) => (
        <LajurHari key={hari} hari={hari} senarai={petugas.filter((p) => p.hari === hari)} ajk={ajk} pengerusi={pengerusi} />
      ))}
    </div>
  );
}

function LajurHari({ hari, senarai, ajk, pengerusi }: { hari: number; senarai: PetugasHari[]; ajk: Ajk[]; pengerusi: boolean }) {
  const [menunggu, mula] = useTransition();

  return (
    <section className="rounded-xl border border-[var(--garis-gelap)] bg-kerang-terang p-4">
      <h3 className="mb-3 font-sans text-[14px] font-bold tracking-wide text-teks-lembut">{LABEL_HARI[hari]}</h3>

      {senarai.length === 0 ? (
        <p className="mb-3 text-[13px] italic text-teks-lembut">Belum ada petugas ditetapkan.</p>
      ) : (
        <ul className="mb-3 m-0 flex list-none flex-col gap-2 p-0">
          {senarai.map((p) => {
            const orang = ajk.find((a) => a.id === p.ajk_id);
            return (
              <li key={p.id} className="flex items-start gap-2 rounded-lg bg-[rgba(21,43,44,.04)] px-3 py-2 text-[13.5px]">
                <div className="min-w-0 flex-1">
                  <b className="font-semibold">{p.peranan === "lain" ? (p.peranan_lain ?? "Peranan lain") : LABEL_PERANAN_HARI[p.peranan]}</b>
                  <div className="text-teks-lembut">{orang?.nama ?? "Belum ditetapkan"}</div>
                  {p.nota && <div className="text-[12px] text-teks-lembut">{p.nota}</div>}
                </div>
                {pengerusi && (
                  <button
                    type="button" disabled={menunggu}
                    onClick={() => mula(async () => { await padamPetugas(p.id); })}
                    className="shrink-0 text-[11.5px] text-tanah underline underline-offset-2 disabled:opacity-50"
                  >
                    padam
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pengerusi && <FormPetugas hari={hari} ajk={ajk} />}
    </section>
  );
}

function FormPetugas({ hari, ajk }: { hari: number; ajk: Ajk[] }) {
  const [keputusan, tindakan] = useActionState(aturPetugas, null);
  const borang = useRef<HTMLFormElement>(null);
  const [peranan, tetapkanPeranan] = useState<PerananHari>("emcee");

  return (
    <form ref={borang} action={async (d) => { await tindakan(d); borang.current?.reset(); tetapkanPeranan("emcee"); }} className="flex flex-col gap-2 border-t border-[var(--garis-gelap)] pt-3">
      <input type="hidden" name="hari" value={hari} />
      <Mesej keputusan={keputusan} />

      <select
        name="peranan" value={peranan} onChange={(e) => tetapkanPeranan(e.target.value as PerananHari)}
        className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]"
      >
        {PERANAN.map((p) => <option key={p} value={p}>{LABEL_PERANAN_HARI[p]}</option>)}
      </select>

      {peranan === "lain" && (
        <input name="peranan_lain" placeholder="Nama peranan" maxLength={40} required
               className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]" />
      )}

      <select name="ajk_id" defaultValue="" className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]">
        <option value="">— Pilih orang —</option>
        {ajk.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
      </select>

      <input name="nota" placeholder="Nota (tak wajib)" maxLength={200}
             className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]" />

      <ButangHantar kelas="btn btn-halus">+ Tambah petugas</ButangHantar>
    </form>
  );
}
