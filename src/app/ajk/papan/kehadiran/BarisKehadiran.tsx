"use client";

import { useState, useTransition } from "react";
import { kemasBayaran, padamKehadiran } from "@/tindakan/ajk";
import { ringgit } from "@/lib/format";
import type { Kehadiran } from "@/lib/database.types";

export function BarisKehadiran({
  rekod, labelStatus, labelBilik, bolehPadam,
}: {
  rekod: Kehadiran;
  labelStatus: string;
  labelBilik: string;
  bolehPadam: boolean;
}) {
  const [bayar, setBayar] = useState(rekod.sudah_bayar);
  const [jumlah, setJumlah] = useState(Number(rekod.jumlah_bayar));
  const [menunggu, mulaTransisi] = useTransition();

  const simpan = (sudah: boolean, nilai: number) =>
    mulaTransisi(async () => { await kemasBayaran(rekod.id, sudah, nilai); });

  return (
    <tr className="border-b border-[var(--garis-gelap)] align-top">
      <td className="px-2 py-3 font-semibold">
        {rekod.nama_keluarga}
        {rekod.nota && <small className="mt-1 block font-normal text-[12.5px] text-tanah">{rekod.nota}</small>}
      </td>
      <td className="px-2 py-3">
        <a href={`https://wa.me/6${rekod.telefon.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
           className="underline underline-offset-2 hover:text-tembaga">
          {rekod.telefon}
        </a>
      </td>
      <td className="px-2 py-3">{labelStatus}</td>
      <td className="px-2 py-3 angka-jadual">{rekod.dewasa}</td>
      <td className="px-2 py-3 angka-jadual">{rekod.kanak}</td>
      <td className="px-2 py-3">{labelBilik}</td>
      <td className="px-2 py-3 angka-jadual">{ringgit(Number(rekod.yuran))}</td>
      <td className="px-2 py-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox" className="tanda" checked={bayar} disabled={menunggu}
            aria-label={`Tanda bayaran ${rekod.nama_keluarga}`}
            onChange={(e) => {
              const sudah = e.target.checked;
              const nilai = sudah && jumlah === 0 ? Number(rekod.yuran) : sudah ? jumlah : 0;
              setBayar(sudah); setJumlah(nilai); simpan(sudah, nilai);
            }}
          />
          <input
            type="number" min={0} step={10} value={jumlah} disabled={menunggu}
            aria-label={`Jumlah dibayar oleh ${rekod.nama_keluarga}`}
            onChange={(e) => setJumlah(Number(e.target.value))}
            onBlur={() => simpan(bayar, jumlah)}
            className="w-24 rounded-lg border-[1.5px] border-[var(--garis-gelap)] px-2 py-1 text-sm angka-jadual"
          />
        </div>
      </td>
      <td className="px-2 py-3">
        {bolehPadam && <button
          type="button" disabled={menunggu}
          onClick={() => {
            if (!confirm(`Padam rekod ${rekod.nama_keluarga}?`)) return;
            mulaTransisi(async () => { await padamKehadiran(rekod.id); });
          }}
          className="text-[13px] text-tanah underline underline-offset-2 disabled:opacity-50"
        >
          Padam
        </button>}
      </td>
    </tr>
  );
}
