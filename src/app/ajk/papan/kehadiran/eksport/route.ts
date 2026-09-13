import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { muatKehadiranPenuh } from "@/lib/data";
import { NAMA_KUKI, bacaToken } from "@/lib/sesi";
import { envPelayan } from "@/lib/persekitaran";
import { LABEL_BILIK, LABEL_STATUS, LABEL_TIBA } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Petik medan CSV mengikut RFC 4180 supaya koma dan petikan tidak merosakkan fail. */
const petik = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const kuki = await cookies();
  if (!(await bacaToken(kuki.get(NAMA_KUKI)?.value, envPelayan().RAHSIA_SESI))) {
    return NextResponse.json({ ralat: "Tidak dibenarkan" }, { status: 401 });
  }

  const { kehadiran } = await muatKehadiranPenuh();
  const tajuk = [
    "Nama keluarga", "Telefon", "Status", "Dewasa", "Budak", "Penginapan",
    "Waktu tiba", "Yuran (RM)", "Sudah bayar", "Jumlah dibayar (RM)", "Nota", "Dihantar",
  ];

  const baris = kehadiran.map((k) =>
    [
      k.nama_keluarga, k.telefon, LABEL_STATUS[k.status], k.dewasa, k.kanak,
      LABEL_BILIK[k.bilik], LABEL_TIBA[k.tiba], Number(k.yuran),
      k.sudah_bayar ? "Ya" : "Belum", Number(k.jumlah_bayar), k.nota ?? "",
      new Date(k.dicipta).toISOString(),
    ].map(petik).join(","),
  );

  // BOM supaya Excel di Windows membaca aksara Melayu dengan betul
  const csv = "\uFEFF" + [tajuk.map(petik).join(","), ...baris].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kehadiran-familyday-2026.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
