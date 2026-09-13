"use client";

import { useActionState, useRef, useState } from "react";
import { ciptaRisiko } from "@/tindakan/risiko";
import { ButangHantar, Mesej } from "@/components/ui";
import type { Ajk, RancanganKerja } from "@/lib/database.types";

export function BorangRisiko({ ajk, rancangan }: { ajk: Ajk[]; rancangan: RancanganKerja[] }) {
  const [keputusan, tindakan] = useActionState(ciptaRisiko, null);
  const [buka, setBuka] = useState(false);
  const borang = useRef<HTMLFormElement>(null);

  if (!buka) {
    return (
      <button type="button" onClick={() => setBuka(true)} className="btn btn-utama mb-8">
        Tambah pelan sandaran baru
      </button>
    );
  }

  return (
    <form
      ref={borang}
      action={async (data) => { await tindakan(data); borang.current?.reset(); }}
      className="kotak mb-8"
    >
      <h2 className="mb-1 text-[1.3rem]">Pelan sandaran baru</h2>
      <p className="mb-4 text-sm text-teks-lembut">
        Fikirkan apa yang mungkin tak jadi macam dirancang, dan apa nak buat kalau ia betul-betul berlaku.
      </p>
      <Mesej keputusan={keputusan} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="medan sm:col-span-2">
          <label htmlFor="rs-senario">Apa yang mungkin berlaku</label>
          <input id="rs-senario" name="senario" required minLength={5} maxLength={160}
                 placeholder="Contoh: Hujan lebat sepanjang hari kedua" />
        </div>

        <div className="medan sm:col-span-2">
          <label htmlFor="rs-pencetus">Tanda awal (tak wajib)</label>
          <input id="rs-pencetus" name="pencetus" maxLength={200}
                 placeholder="Contoh: Ramalan MET seminggu sebelum tunjuk hujan" />
        </div>

        <div className="medan">
          <label htmlFor="rs-kebarangkalian">Kemungkinan berlaku</label>
          <select id="rs-kebarangkalian" name="kebarangkalian" defaultValue="sederhana">
            <option value="rendah">Rendah</option>
            <option value="sederhana">Sederhana</option>
            <option value="tinggi">Tinggi</option>
          </select>
        </div>

        <div className="medan">
          <label htmlFor="rs-kesan">Kalau berlaku, kesannya</label>
          <select id="rs-kesan" name="kesan" defaultValue="sederhana">
            <option value="rendah">Rendah</option>
            <option value="sederhana">Sederhana</option>
            <option value="tinggi">Tinggi</option>
          </select>
        </div>

        <div className="medan sm:col-span-2">
          <label htmlFor="rs-pelan">Pelan sandaran</label>
          <textarea id="rs-pelan" name="pelan_sandaran" required minLength={5} maxLength={1000}
                    placeholder="Contoh: Pindah sukaneka ke dalam, guna carrom dan ping pong sebagai ganti." />
        </div>

        <div className="medan">
          <label htmlFor="rs-orang">Siapa jaga</label>
          <select id="rs-orang" name="penanggungjawab" defaultValue="">
            <option value="">— Belum ditetapkan —</option>
            {ajk.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
          </select>
        </div>

        <div className="medan">
          <label htmlFor="rs-rancangan">Kaitkan dengan kerja tertentu (tak wajib)</label>
          <select id="rs-rancangan" name="rancangan_id" defaultValue="">
            <option value="">— Tiada —</option>
            {rancangan.map((r) => <option key={r.id} value={r.id}>{r.tajuk}</option>)}
          </select>
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <ButangHantar>Simpan pelan sandaran</ButangHantar>
          <button type="button" onClick={() => setBuka(false)} className="btn btn-halus">Batal</button>
        </div>
      </div>
    </form>
  );
}
