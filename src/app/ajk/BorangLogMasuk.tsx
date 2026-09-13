"use client";

import { useActionState } from "react";
import { logMasuk } from "@/tindakan/ajk";
import { ButangHantar, Mesej } from "@/components/ui";

export function BorangLogMasuk({ ahli }: { ahli: { id: string; nama: string }[] }) {
  const [keputusan, tindakan] = useActionState(logMasuk, null);

  return (
    <form action={tindakan} className="text-left">
      <Mesej keputusan={keputusan} />

      <div className="medan mb-4">
        <label htmlFor="ahli_id" className="text-atas-gelap">Siapa anda?</label>
        <select id="ahli_id" name="ahli_id" required defaultValue="">
          <option value="" disabled>— Pilih nama —</option>
          {ahli.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
        </select>
        {ahli.length === 0 && (
          <small className="text-tembaga-muda">
            Senarai AJK masih kosong. Jalankan seed.sql dalam Supabase dulu.
          </small>
        )}
      </div>

      <div className="medan mb-5">
        <label htmlFor="kata_laluan" className="text-atas-gelap">Kata laluan</label>
        <input id="kata_laluan" name="kata_laluan" type="password" required autoComplete="current-password" />
      </div>

      <ButangHantar kelas="btn btn-utama w-full">Masuk</ButangHantar>
    </form>
  );
}
