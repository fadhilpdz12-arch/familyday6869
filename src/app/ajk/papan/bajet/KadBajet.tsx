"use client";

import { useActionState, useState, useTransition } from "react";
import { kemaskiniBarisBajet, padamBarisBajet } from "@/tindakan/bajet";
import { ButangHantar, Mesej } from "@/components/ui";
import { ringgit } from "@/lib/format";
import type { BarisBajet } from "@/lib/database.types";

const LABEL_JENIS: Record<string, string> = {
  masuk: "Masuk", keluar: "Keluar", tolak: "Tolak", jumlah: "Jumlah",
};

export function KadBajet({ baris }: { baris: BarisBajet }) {
  const [menunggu, mula] = useTransition();
  const [edit, tetapkanEdit] = useState(false);
  const [keputusan, tindakan] = useActionState(kemaskiniBarisBajet, null);

  if (edit) {
    return (
      <form action={tindakan} className="kotak mb-3">
        <input type="hidden" name="id" value={baris.id} />
        <Mesej keputusan={keputusan} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="medan sm:col-span-2">
            <label htmlFor={`bl-${baris.id}`}>Label</label>
            <input id={`bl-${baris.id}`} name="label" required minLength={2} maxLength={120} defaultValue={baris.label} />
          </div>
          <div className="medan sm:col-span-2">
            <label htmlFor={`bk-${baris.id}`}>Keterangan</label>
            <input id={`bk-${baris.id}`} name="keterangan" maxLength={300} defaultValue={baris.keterangan ?? ""} />
          </div>
          <div className="medan">
            <label htmlFor={`ba-${baris.id}`}>Amaun (RM)</label>
            <input id={`ba-${baris.id}`} name="amaun" type="number" step="0.01" min="0" required defaultValue={baris.amaun} />
          </div>
          <div className="medan">
            <label htmlFor={`bj-${baris.id}`}>Jenis</label>
            <select id={`bj-${baris.id}`} name="jenis" defaultValue={baris.jenis}>
              <option value="masuk">Masuk (kutipan/derma)</option>
              <option value="keluar">Keluar (perbelanjaan)</option>
              <option value="tolak">Tolak (potongan)</option>
              <option value="jumlah">Jumlah (baris besar)</option>
            </select>
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <ButangHantar>Simpan</ButangHantar>
            <button type="button" onClick={() => tetapkanEdit(false)} className="btn btn-halus">Batal</button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[var(--garis-gelap)] py-3 text-[14.5px]">
      <span className="rounded-full bg-[rgba(21,43,44,.08)] px-2.5 py-0.5 text-[11px] font-bold text-teks-lembut">
        {LABEL_JENIS[baris.jenis]}
      </span>
      <span className="font-semibold">{baris.label}</span>
      {baris.keterangan && <span className="text-[13px] text-teks-lembut">{baris.keterangan}</span>}
      <span className="ml-auto font-display angka-jadual text-[1.05rem]">{ringgit(Number(baris.amaun))}</span>
      <button type="button" onClick={() => tetapkanEdit(true)} className="text-[12px] underline underline-offset-2 hover:text-tembaga">
        Edit
      </button>
      <button
        type="button" disabled={menunggu}
        onClick={() => {
          if (!confirm(`Padam baris "${baris.label}"?`)) return;
          mula(async () => { await padamBarisBajet(baris.id); });
        }}
        className="text-[12px] text-tanah underline underline-offset-2 disabled:opacity-50"
      >
        Padam
      </button>
    </li>
  );
}
