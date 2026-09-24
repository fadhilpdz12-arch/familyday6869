"use client";

import { useActionState, useRef, useState } from "react";
import { ciptaBarisBajet } from "@/tindakan/bajet";
import { ButangHantar, Mesej } from "@/components/ui";

export function BorangBajet() {
  const [keputusan, tindakan] = useActionState(ciptaBarisBajet, null);
  const [buka, setBuka] = useState(false);
  const borang = useRef<HTMLFormElement>(null);

  if (!buka) {
    return (
      <button type="button" onClick={() => setBuka(true)} className="btn btn-utama mb-8">
        Tambah baris bajet baru
      </button>
    );
  }

  return (
    <form ref={borang} action={async (d) => { await tindakan(d); borang.current?.reset(); }} className="kotak mb-8">
      <h2 className="mb-1 text-[1.3rem]">Baris bajet baru</h2>
      <p className="mb-4 text-sm text-teks-lembut">
        &ldquo;Masuk&rdquo; untuk kutipan/derma, &ldquo;Keluar&rdquo; untuk perbelanjaan, &ldquo;Tolak&rdquo; untuk potongan, &ldquo;Jumlah&rdquo; untuk baris jumlah besar.
      </p>
      <Mesej keputusan={keputusan} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="medan sm:col-span-2">
          <label htmlFor="b-label">Label</label>
          <input id="b-label" name="label" required minLength={2} maxLength={120} placeholder="Contoh: Yuran keluarga" />
        </div>
        <div className="medan sm:col-span-2">
          <label htmlFor="b-ket">Keterangan (tak wajib)</label>
          <input id="b-ket" name="keterangan" maxLength={300} placeholder="Nota tambahan" />
        </div>
        <div className="medan">
          <label htmlFor="b-amaun">Amaun (RM)</label>
          <input id="b-amaun" name="amaun" type="number" step="0.01" min="0" required placeholder="0.00" />
        </div>
        <div className="medan">
          <label htmlFor="b-jenis">Jenis</label>
          <select id="b-jenis" name="jenis" defaultValue="keluar">
            <option value="masuk">Masuk (kutipan/derma)</option>
            <option value="keluar">Keluar (perbelanjaan)</option>
            <option value="tolak">Tolak (potongan)</option>
            <option value="jumlah">Jumlah (baris besar)</option>
          </select>
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <ButangHantar>Simpan</ButangHantar>
          <button type="button" onClick={() => setBuka(false)} className="btn btn-halus">Batal</button>
        </div>
      </div>
    </form>
  );
}
