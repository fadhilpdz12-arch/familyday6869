"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { muatNaikPoster, mintaMuatNaikLagu, padamLagu, padamPoster, selesaiMuatNaikLagu } from "@/tindakan/tetapan";
import { supabasePelayar } from "@/lib/supabase/pelayar";
import { ButangHantar, Mesej } from "@/components/ui";
import type { Keputusan } from "@/tindakan/jenis";

export function TetapanLaman({ posterUrl, laguUrl }: { posterUrl?: string; laguUrl?: string }) {
  const [hasilPoster, tindakanPoster] = useActionState(muatNaikPoster, null);
  const [menunggu, mula] = useTransition();
  const borangPoster = useRef<HTMLFormElement>(null);

  const [hasilLagu, tetapkanHasilLagu] = useState<Keputusan | null>(null);
  const [muatNaikLaguSedangJalan, tetapkanMuatNaikLagu] = useState(false);
  const inputLagu = useRef<HTMLInputElement>(null);

  async function pilihLagu(e: React.ChangeEvent<HTMLInputElement>) {
    const fail = e.target.files?.[0];
    if (!fail) return;
    tetapkanMuatNaikLagu(true);
    tetapkanHasilLagu(null);

    try {
      const minta = await mintaMuatNaikLagu(fail.type, fail.size);
      if (!minta.ok) {
        tetapkanHasilLagu({ ok: false, mesej: minta.mesej });
        return;
      }
      const sb = supabasePelayar();
      if (!sb) {
        tetapkanHasilLagu({ ok: false, mesej: "Tak dapat sambung ke storan." });
        return;
      }
      const { error } = await sb.storage.from("media").uploadToSignedUrl(minta.laluan, minta.token, fail);
      if (error) {
        tetapkanHasilLagu({ ok: false, mesej: "Muat naik ke storan gagal." });
        return;
      }
      const hasil = await selesaiMuatNaikLagu(minta.laluan);
      tetapkanHasilLagu(hasil);
    } finally {
      tetapkanMuatNaikLagu(false);
      if (inputLagu.current) inputLagu.current.value = "";
    }
  }

  return (
    <section className="mb-11 grid gap-5 sm:grid-cols-2">
      <div className="kotak">
        <h3 className="mb-1 text-[1.1rem]">Poster tentatif</h3>
        <p className="mb-3 text-[13px] text-teks-lembut">
          Naikkan gambar poster untuk gantikan jadual teks di laman utama. Padam untuk kembali ke jadual teks.
        </p>
        {posterUrl ? (
          <div className="mb-3 overflow-hidden rounded-lg border border-[var(--garis-gelap)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={posterUrl} alt="Poster tentatif semasa" className="block max-h-40 w-full object-cover" />
          </div>
        ) : (
          <p className="mb-3 text-[13px] italic text-teks-lembut">Belum ada poster — laman awam papar jadual teks.</p>
        )}
        <Mesej keputusan={hasilPoster} />
        <form ref={borangPoster} action={async (d) => { await tindakanPoster(d); borangPoster.current?.reset(); }} className="flex flex-wrap items-center gap-2">
          <input type="file" name="poster" accept="image/png,image/jpeg,image/webp" required
                 className="max-w-full text-[13px]" />
          <ButangHantar kelas="btn btn-halus">Naik gambar</ButangHantar>
        </form>
        {posterUrl && (
          <button
            type="button" disabled={menunggu}
            onClick={() => { if (confirm("Buang poster?")) mula(async () => { await padamPoster(); }); }}
            className="mt-2 text-[12px] text-tanah underline underline-offset-2 disabled:opacity-50"
          >
            Buang poster
          </button>
        )}
      </div>

      <div className="kotak">
        <h3 className="mb-1 text-[1.1rem]">Lagu tema</h3>
        <p className="mb-3 text-[13px] text-teks-lembut">
          Lagu bertemakan keluarga untuk butang muzik di laman awam. Cari yang bebas royalti
          (cth: YouTube Audio Library, Pixabay Music) — elak lagu berhak cipta.
        </p>
        {laguUrl ? (
          <audio controls src={laguUrl} className="mb-3 w-full" />
        ) : (
          <p className="mb-3 text-[13px] italic text-teks-lembut">Belum ada lagu — butang muzik tak dipaparkan lagi.</p>
        )}
        <Mesej keputusan={hasilLagu} />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputLagu} type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,.m4a"
            disabled={muatNaikLaguSedangJalan} onChange={pilihLagu}
            className="max-w-full text-[13px] disabled:opacity-50"
          />
          {muatNaikLaguSedangJalan && <span className="text-[12.5px] text-teks-lembut">Sedang naikkan…</span>}
        </div>
        {laguUrl && (
          <button
            type="button" disabled={menunggu}
            onClick={() => { if (confirm("Buang lagu tema?")) mula(async () => { await padamLagu(); }); }}
            className="mt-2 text-[12px] text-tanah underline underline-offset-2 disabled:opacity-50"
          >
            Buang lagu
          </button>
        )}
      </div>
    </section>
  );
}
