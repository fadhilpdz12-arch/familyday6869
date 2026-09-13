import type {
  JenisKemaskini, KeperluanBilik, Keutamaan, PerananHari, StatusHadir, StatusRancangan,
  StatusRisiko, StatusTugas, Tahap, WaktuTiba,
} from "@/lib/database.types";

export const LABEL_STATUS: Record<StatusHadir, string> = {
  hadir: "Hadir",
  belum_pasti: "Belum pasti",
  tidak_hadir: "Tak dapat datang",
};

export const LABEL_BILIK: Record<KeperluanBilik, string> = {
  satu_bilik: "Perlu satu bilik",
  dua_bilik: "Perlu dua bilik",
  kongsi: "Boleh kongsi bilik",
  tidak_bermalam: "Tak bermalam",
};

export const LABEL_TIBA: Record<WaktuTiba, string> = {
  "11dis_petang": "11 Dis, petang",
  "11dis_malam": "11 Dis, malam",
  "12dis_pagi": "12 Dis, pagi",
  belum_pasti: "Belum pasti",
};

export const LABEL_TUGAS: Record<StatusTugas, string> = {
  belum_mula: "Belum mula",
  sedang_buat: "Tengah buat",
  tersekat: "Tersekat",
  selesai: "Dah siap",
};

export const WARNA_TUGAS: Record<StatusTugas, string> = {
  belum_mula: "bg-[rgba(21,43,44,.08)] text-teks-lembut",
  sedang_buat: "bg-[rgba(201,150,47,.18)] text-[#8a6412]",
  tersekat: "bg-[rgba(168,67,47,.12)] text-[#8a3524]",
  selesai: "bg-[rgba(78,133,119,.16)] text-[#255e4f]",
};

export const LABEL_KEUTAMAAN: Record<Keutamaan, string> = {
  rendah: "Boleh tunggu",
  sederhana: "Biasa",
  tinggi: "Penting",
  kritikal: "Mesti siap",
};

export const WARNA_KEUTAMAAN: Record<Keutamaan, string> = {
  rendah: "text-teks-lembut",
  sederhana: "text-teks-lembut",
  tinggi: "text-[#8a6412]",
  kritikal: "text-tanah font-bold",
};

export const LABEL_KEMASKINI: Record<JenisKemaskini, string> = {
  kemajuan: "Kemajuan",
  masalah: "Ada masalah",
  selesai: "Dah siap",
  maklumat: "Makluman",
};

export const LABEL_TAHAP: Record<Tahap, string> = {
  rendah: "Rendah",
  sederhana: "Sederhana",
  tinggi: "Tinggi",
};

export const LABEL_RISIKO: Record<StatusRisiko, string> = {
  dipantau: "Dipantau",
  pelan_sedia: "Pelan dah sedia",
  berlaku: "Tengah berlaku",
  ditutup: "Dah lepas",
};

export const LABEL_RANCANGAN: Record<StatusRancangan, string> = {
  belum_mula: "Belum mula",
  sedang_disiapkan: "Tengah disiapkan",
  sedia: "Dah sedia",
  selesai: "Dah jalan / selesai",
};

export const WARNA_RANCANGAN: Record<StatusRancangan, string> = {
  belum_mula: "bg-[rgba(21,43,44,.08)] text-teks-lembut",
  sedang_disiapkan: "bg-[rgba(201,150,47,.18)] text-[#8a6412]",
  sedia: "bg-[rgba(78,133,119,.16)] text-[#255e4f]",
  selesai: "bg-[rgba(78,133,119,.16)] text-[#255e4f]",
};

export const LABEL_PERANAN_HARI: Record<PerananHari, string> = {
  pic_keseluruhan: "PIC keseluruhan",
  emcee: "Emcee",
  bantuan_teknikal: "Bantuan teknikal / audio",
  fotografer: "Fotografer / videografer",
  lain: "Peranan lain",
};

const wangMY = new Intl.NumberFormat("ms-MY", {
  style: "currency", currency: "MYR", maximumFractionDigits: 0,
});
export const ringgit = (n: number) => wangMY.format(n);

export const tarikhMY = (iso: string) =>
  new Intl.DateTimeFormat("ms-MY", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kuala_Lumpur" })
    .format(new Date(iso));

export const tarikhPendek = (iso: string) =>
  new Intl.DateTimeFormat("ms-MY", { day: "numeric", month: "short", timeZone: "Asia/Kuala_Lumpur" })
    .format(new Date(iso));

/** Tarikh hari ini mengikut waktu Malaysia, bukan waktu pelayan. */
export function hariIniMY(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}

/** Berapa hari lagi sampai tarikh akhir. Negatif bermakna dah lepas. */
export function bakiHari(tarikh: string): number {
  const a = new Date(`${hariIniMY()}T00:00:00+08:00`).getTime();
  const b = new Date(`${tarikh}T00:00:00+08:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Hari acara yang mana sekarang (1, 2 atau 3), atau null kalau belum/dah lepas. */
export function hariAcaraSemasa(): 1 | 2 | 3 | null {
  const hariIni = hariIniMY();
  const peta: Record<string, 1 | 2 | 3> = {
    "2026-12-11": 1, "2026-12-12": 2, "2026-12-13": 3,
  };
  return peta[hariIni] ?? null;
}

export function labelBakiHari(tarikh: string): { teks: string; bahaya: boolean } {
  const n = bakiHari(tarikh);
  if (n < 0) return { teks: `Lewat ${Math.abs(n)} hari`, bahaya: true };
  if (n === 0) return { teks: "Hari ini", bahaya: true };
  if (n === 1) return { teks: "Esok", bahaya: true };
  if (n <= 7) return { teks: `${n} hari lagi`, bahaya: true };
  return { teks: `${n} hari lagi`, bahaya: false };
}
