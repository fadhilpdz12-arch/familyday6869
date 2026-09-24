"use client";

import { useActionState, useRef, useTransition } from "react";
import { muatNaikLagu, muatNaikPoster, padamLagu, padamPoster } from "@/tindakan/tetapan";
import { ButangHantar, Mesej } from "@/components/ui";

export function TetapanLaman({ posterUrl, laguUrl }: { posterUrl?: string; laguUrl?: string }) {
  const [hasilPoster, tindakanPoster] = useActionState(muatNaikPoster, null);
  const [hasilLagu, tindakanLagu] = useActionState(muatNaikLagu, null);
  const [menunggu, mula] = useTransition();
  const borangPoster = useRef<HTMLFormElement>(null);
  const borangLagu = useRef<HTMLFormElement>(null);

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
        <form ref={borangLagu} action={async (d) => { await tindakanLagu(d); borangLagu.current?.reset(); }} className="flex flex-wrap items-center gap-2">
          <input type="file" name="lagu" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,.m4a" required
                 className="max-w-full text-[13px]" />
          <ButangHantar kelas="btn btn-halus">Naik lagu</ButangHantar>
        </form>
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
