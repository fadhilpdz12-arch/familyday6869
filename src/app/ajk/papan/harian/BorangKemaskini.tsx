"use client";

import { useActionState, useRef } from "react";
import { hantarKemaskini } from "@/tindakan/harian";
import { ButangHantar, Mesej } from "@/components/ui";
import type { Tugasan } from "@/lib/database.types";

export function BorangKemaskini({ tugasSaya }: { tugasSaya: Tugasan[] }) {
  const [keputusan, tindakan] = useActionState(hantarKemaskini, null);
  const borang = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={borang}
      action={async (d) => { await tindakan(d); borang.current?.reset(); }}
      className="kotak mb-10"
    >
      <h2 className="mb-1 text-[1.3rem]">Update anda hari ni</h2>
      <p className="mb-4 text-sm text-teks-lembut">
        Tulis pendek je — apa yang dah buat, apa yang tersekat. Dua tiga ayat cukup.
      </p>
      <Mesej keputusan={keputusan} />

      <div className="grid gap-4">
        <div className="medan">
          <label htmlFor="k-teks">Apa cerita?</label>
          <textarea id="k-teks" name="teks" required minLength={3} maxLength={800}
                    placeholder="Contoh: Dah call chalet, dorang confirm 11 bilik. Surat pengesahan dorang hantar minggu depan." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="medan">
            <label htmlFor="k-jenis">Jenis</label>
            <select id="k-jenis" name="jenis" defaultValue="kemajuan">
              <option value="kemajuan">Kemajuan biasa</option>
              <option value="masalah">Ada masalah, perlu bantuan</option>
              <option value="selesai">Satu tugas dah siap</option>
              <option value="maklumat">Makluman je</option>
            </select>
          </div>

          <div className="medan">
            <label htmlFor="k-tugas">Berkaitan tugas mana (tak wajib)</label>
            <select id="k-tugas" name="tugasan_id" defaultValue="">
              <option value="">— Tiada —</option>
              {tugasSaya.map((t) => <option key={t.id} value={t.id}>{t.teks.slice(0, 60)}</option>)}
            </select>
          </div>
        </div>

        <div><ButangHantar>Hantar update</ButangHantar></div>
      </div>
    </form>
  );
}
