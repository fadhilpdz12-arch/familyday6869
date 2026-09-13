"use client";

import { useState } from "react";
import { LABEL_HARI } from "@/lib/acara";
import { LABEL_PERANAN_HARI } from "@/lib/format";
import type { Ajk, Biro, PetugasHari, RancanganKerja } from "@/lib/database.types";

/**
 * Satu butang praktikal: susun semua petugas & aktiviti hari ni jadi teks
 * ringkas, senang nak tampal terus dalam group WhatsApp keluarga waktu pagi.
 */
export function SalinRingkasan({
  hari, petugas, rancangan, ajk, biro,
}: {
  hari: 1 | 2 | 3;
  petugas: PetugasHari[];
  rancangan: RancanganKerja[];
  ajk: Ajk[];
  biro: Biro[];
}) {
  const [teks, tetapkanTeks] = useState<"salin" | "disalin" | "gagal">("salin");

  function jana(): string {
    const baris: string[] = [`*${LABEL_HARI[hari]}*`, ""];

    const petugasHariIni = petugas.filter((p) => p.hari === hari);
    if (petugasHariIni.length > 0) {
      baris.push("*Petugas hari ni:*");
      for (const p of petugasHariIni) {
        const orang = ajk.find((a) => a.id === p.ajk_id)?.nama ?? "belum ditetapkan";
        const label = p.peranan === "lain" ? (p.peranan_lain ?? "Peranan lain") : LABEL_PERANAN_HARI[p.peranan];
        baris.push(`• ${label}: ${orang}`);
      }
      baris.push("");
    }

    const aktivitiHariIni = rancangan.filter((r) => r.hari === hari);
    if (aktivitiHariIni.length > 0) {
      baris.push("*Aktiviti hari ni:*");
      for (const r of aktivitiHariIni) {
        const namaBiro = biro.find((b) => b.id === r.biro_id)?.nama;
        baris.push(`• ${r.masa ? `${r.masa} — ` : ""}${r.tajuk}${namaBiro ? ` (${namaBiro})` : ""}`);
      }
    }

    if (baris.length <= 2) baris.push("Takde apa-apa disusun untuk hari ni lagi.");
    return baris.join("\n");
  }

  async function salin() {
    try {
      await navigator.clipboard.writeText(jana());
      tetapkanTeks("disalin");
    } catch {
      tetapkanTeks("gagal");
    }
    setTimeout(() => tetapkanTeks("salin"), 2500);
  }

  return (
    <button type="button" onClick={salin} className="btn btn-halus">
      {teks === "salin" && `Salin ringkasan ${LABEL_HARI[hari]}`}
      {teks === "disalin" && "Dah disalin ✓"}
      {teks === "gagal" && "Tak dapat salin, cuba lagi"}
    </button>
  );
}
