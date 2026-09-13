"use client";

import { useActionState, useRef, useState } from "react";
import { ciptaRancangan } from "@/tindakan/kerja";
import { ButangHantar, Mesej } from "@/components/ui";
import type { Biro } from "@/lib/database.types";

export function BorangRancangan({ biro, biroDicadang }: { biro: Biro[]; biroDicadang?: number }) {
  const [keputusan, tindakan] = useActionState(ciptaRancangan, null);
  const [buka, setBuka] = useState(false);
  const borang = useRef<HTMLFormElement>(null);

  if (!buka) {
    return (
      <button type="button" onClick={() => setBuka(true)} className="btn btn-utama mb-8">
        Tambah kerja / aktiviti baru
      </button>
    );
  }

  return (
    <form
      ref={borang}
      action={async (data) => { await tindakan(data); borang.current?.reset(); }}
      className="kotak mb-8"
    >
      <h2 className="mb-1 text-[1.3rem]">Kerja / aktiviti baru</h2>
      <p className="mb-4 text-sm text-teks-lembut">
        Lepas simpan, agihkan PIC dan tambah pautan rujukan terus dalam kad kerja tu.
      </p>
      <Mesej keputusan={keputusan} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="medan sm:col-span-2">
          <label htmlFor="rk-tajuk">Nama kerja / aktiviti</label>
          <input id="rk-tajuk" name="tajuk" required minLength={3} maxLength={120}
                 placeholder="Contoh: Ular tangga manusia" />
        </div>

        <div className="medan sm:col-span-2">
          <label htmlFor="rk-ket">Keterangan (tak wajib)</label>
          <textarea id="rk-ket" name="keterangan" maxLength={1500}
                    placeholder="Cara main, berapa kumpulan, apa nak sediakan…" />
        </div>

        <div className="medan">
          <label htmlFor="rk-biro">Biro</label>
          <select id="rk-biro" name="biro_id" required defaultValue={biroDicadang ?? ""}>
            <option value="" disabled>— Pilih biro —</option>
            {biro.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
        </div>

        <div className="medan">
          <label htmlFor="rk-hari">Hari (tak wajib)</label>
          <select id="rk-hari" name="hari" defaultValue="">
            <option value="">— Belum tentu —</option>
            <option value="1">Hari 1 (11 Dis)</option>
            <option value="2">Hari 2 (12 Dis)</option>
            <option value="3">Hari 3 (13 Dis)</option>
          </select>
        </div>

        <div className="medan sm:col-span-2">
          <label htmlFor="rk-masa">Masa (tak wajib)</label>
          <input id="rk-masa" name="masa" maxLength={40} placeholder="Contoh: 9.30 pagi" />
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <ButangHantar>Simpan kerja</ButangHantar>
          <button type="button" onClick={() => setBuka(false)} className="btn btn-halus">Batal</button>
        </div>
      </div>
    </form>
  );
}
