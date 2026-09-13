import { z } from "zod";

const teksBersih = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    // buang aksara kawalan supaya tiada baris pelik dalam eksport CSV
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " "));

export const skemaKehadiran = z.object({
  nama_keluarga: teksBersih(3, 80),
  telefon: z
    .string()
    .trim()
    .regex(/^[0-9+][0-9+\-\s]{7,19}$/, "Nombor telefon tidak sah"),
  status: z.enum(["hadir", "belum_pasti", "tidak_hadir"]),
  dewasa: z.coerce.number().int().min(0).max(30),
  kanak: z.coerce.number().int().min(0).max(30),
  bilik: z.enum(["satu_bilik", "dua_bilik", "kongsi", "tidak_bermalam"]),
  tiba: z.enum(["11dis_petang", "11dis_malam", "12dis_pagi", "belum_pasti"]),
  nota: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((s) => (s ? s : null)),
}).refine((d) => d.status !== "hadir" || d.dewasa + d.kanak > 0, {
  message: "Kalau hadir, isi sekurang-kurangnya seorang",
  path: ["dewasa"],
});

export const skemaBarang = z.object({
  nama: teksBersih(2, 60),
  barang: teksBersih(2, 160),
});

export const skemaCadangan = z.object({
  nama: teksBersih(2, 60),
  isi: teksBersih(5, 600),
});

export const skemaTugasBaru = z.object({
  teks: teksBersih(3, 200),
  butiran: z.string().trim().max(1000).optional().transform((v) => v || null),
  biro_id: z.coerce.number().int().min(1).max(8).optional().nullable(),
  ditugaskan_kepada: z.string().uuid().optional().nullable(),
  keutamaan: z.enum(["rendah", "sederhana", "tinggi", "kritikal"]).default("sederhana"),
  tarikh_akhir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export const skemaStatusTugas = z.object({
  id: z.string().uuid(),
  status: z.enum(["belum_mula", "sedang_buat", "tersekat", "selesai"]),
});

export const skemaKemaskini = z.object({
  teks: teksBersih(3, 800),
  jenis: z.enum(["kemajuan", "masalah", "selesai", "maklumat"]).default("kemajuan"),
  tugasan_id: z.string().uuid().optional().nullable(),
});

export const skemaAhliBaru = z.object({
  nama: teksBersih(2, 60),
  biro_id: z.coerce.number().int().min(1).max(8),
  peranan: z.string().trim().max(60).optional().transform((v) => v || null),
  telefon: z.string().trim().max(20).optional().transform((v) => v || null),
});

export const skemaStatusRisiko = z.object({
  id: z.string().uuid(),
  status: z.enum(["dipantau", "pelan_sedia", "berlaku", "ditutup"]),
});

export const skemaLogMasukAjk = z.object({
  ahli_id: z.string().uuid("Pilih nama anda dulu"),
  kata_laluan: z.string().min(1, "Isi kata laluan"),
});

export const skemaBayaran = z.object({
  id: z.string().uuid(),
  sudah_bayar: z.coerce.boolean(),
  jumlah_bayar: z.coerce.number().min(0).max(99999),
});

export const skemaLogMasuk = z.object({
  kata_laluan: z.string().min(1, "Isi kata laluan"),
});

export type MasukanKehadiran = z.infer<typeof skemaKehadiran>;

// ------------------------------------------------------- agihan kerja
export const skemaRancanganBaru = z.object({
  biro_id: z.coerce.number().int().min(1).max(8),
  tajuk: teksBersih(3, 120),
  keterangan: z.string().trim().max(1500).optional().transform((v) => v || null),
  hari: z.coerce.number().int().min(1).max(3).optional().nullable(),
  masa: z.string().trim().max(40).optional().transform((v) => v || null),
});

export const skemaRancanganKemaskini = z.object({
  id: z.string().uuid(),
  tajuk: teksBersih(3, 120),
  keterangan: z.string().trim().max(1500).optional().transform((v) => v || null),
  hari: z.coerce.number().int().min(1).max(3).optional().nullable(),
  masa: z.string().trim().max(40).optional().transform((v) => v || null),
  pencetus_sandaran: z.string().trim().max(160).optional().transform((v) => v || null),
  pelan_sandaran: z.string().trim().max(1000).optional().transform((v) => v || null),
});

export const skemaStatusRancangan = z.object({
  id: z.string().uuid(),
  status: z.enum(["belum_mula", "sedang_disiapkan", "sedia", "selesai"]),
});

export const skemaPautanBaru = z.object({
  rancangan_id: z.string().uuid(),
  label: z.string().trim().max(60).optional().transform((v) => v || "Rujukan"),
  url: z.string().trim().url("Pautan tak sah, mesti mula dengan http:// atau https://"),
});

export const skemaPicBaru = z.object({
  rancangan_id: z.string().uuid(),
  ajk_id: z.string().uuid(),
  peranan: z.string().trim().max(40).optional().transform((v) => v || null),
});

export const skemaBahanBaru = z.object({
  rancangan_id: z.string().uuid(),
  teks: teksBersih(2, 160),
});

export const skemaTogelBahan = z.object({
  id: z.string().uuid(),
  sedia: z.coerce.boolean(),
});

export const skemaPetugasBaru = z.object({
  hari: z.coerce.number().int().min(1).max(3),
  peranan: z.enum(["pic_keseluruhan", "emcee", "bantuan_teknikal", "fotografer", "lain"]),
  peranan_lain: z.string().trim().max(40).optional().transform((v) => v || null),
  ajk_id: z.string().uuid().optional().nullable(),
  nota: z.string().trim().max(200).optional().transform((v) => v || null),
});

export const skemaRisikoBaru = z.object({
  senario: teksBersih(5, 160),
  pencetus: z.string().trim().max(200).optional().transform((v) => v || null),
  kebarangkalian: z.enum(["rendah", "sederhana", "tinggi"]),
  kesan: z.enum(["rendah", "sederhana", "tinggi"]),
  pelan_sandaran: teksBersih(5, 1000),
  penanggungjawab: z.string().uuid().optional().nullable(),
  rancangan_id: z.string().uuid().optional().nullable(),
});
