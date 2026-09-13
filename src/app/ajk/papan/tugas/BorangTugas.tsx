"use client";

import { useActionState, useRef, useState } from "react";
import { ciptaTugas } from "@/tindakan/tugas";
import { ButangHantar, Mesej } from "@/components/ui";
import type { Ajk, Biro } from "@/lib/database.types";

export function BorangTugas({ ajk, biro }: { ajk: Ajk[]; biro: Biro[] }) {
  const [keputusan, tindakan] = useActionState(ciptaTugas, null);
  const [buka, setBuka] = useState(false);
  const borang = useRef<HTMLFormElement>(null);

  if (!buka) {
    return (
      <button type="button" onClick={() => setBuka(true)} className="btn btn-utama mb-8">
        Tambah tugas baru
      </button>
    );
  }

  return (
    <form
      ref={borang}
      action={async (data) => { await tindakan(data); borang.current?.reset(); }}
      className="kotak mb-8"
    >
      <Mesej keputusan={keputusan} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="medan sm:col-span-2">
          <label htmlFor="t-teks">Apa yang kena buat</label>
          <input id="t-teks" name="teks" required minLength={3} maxLength={200}
                 placeholder="Contoh: Tempah bas untuk yang datang dari KL" />
        </div>

        <div className="medan sm:col-span-2">
          <label htmlFor="t-butiran">Butiran (tak wajib)</label>
          <textarea id="t-butiran" name="butiran" maxLength={1000}
                    placeholder="Terangkan sikit supaya orang tu tak perlu tanya balik." />
        </div>

        <div className="medan">
          <label htmlFor="t-biro">Biro</label>
          <select id="t-biro" name="biro_id" defaultValue="">
            <option value="">— Tiada biro —</option>
            {biro.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
        </div>

        <div className="medan">
          <label htmlFor="t-orang">Siapa buat</label>
          <select id="t-orang" name="ditugaskan_kepada" defaultValue="">
            <option value="">— Assign kemudian —</option>
            {ajk.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
          </select>
        </div>

        <div className="medan">
          <label htmlFor="t-keutamaan">Keutamaan</label>
          <select id="t-keutamaan" name="keutamaan" defaultValue="sederhana">
            <option value="rendah">Boleh tunggu</option>
            <option value="sederhana">Biasa</option>
            <option value="tinggi">Penting</option>
            <option value="kritikal">Mesti siap</option>
          </select>
        </div>

        <div className="medan">
          <label htmlFor="t-tarikh">Kena siap bila</label>
          <input id="t-tarikh" name="tarikh_akhir" type="date" max="2026-12-13" />
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <ButangHantar>Simpan tugas</ButangHantar>
          <button type="button" onClick={() => setBuka(false)} className="btn btn-halus">Batal</button>
        </div>
      </div>
    </form>
  );
}
