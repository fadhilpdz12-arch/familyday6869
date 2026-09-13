/**
 * Jenis database. Dalam projek sebenar fail ini dijana semula dengan
 *   npm run db:types
 * selepas setiap migrasi. Versi ini ditulis tangan supaya repo boleh
 * dibina sebelum anda sambung ke projek Supabase.
 */
export type StatusHadir = "hadir" | "belum_pasti" | "tidak_hadir";
export type KeperluanBilik = "satu_bilik" | "dua_bilik" | "kongsi" | "tidak_bermalam";
export type WaktuTiba = "11dis_petang" | "11dis_malam" | "12dis_pagi" | "belum_pasti";
export type JenisBaris = "masuk" | "keluar" | "tolak" | "jumlah";
export type Keutamaan = "rendah" | "sederhana" | "tinggi" | "kritikal";
export type StatusTugas = "belum_mula" | "sedang_buat" | "tersekat" | "selesai";
export type JenisKemaskini = "kemajuan" | "masalah" | "selesai" | "maklumat";
export type Tahap = "rendah" | "sederhana" | "tinggi";
export type StatusRisiko = "dipantau" | "pelan_sedia" | "berlaku" | "ditutup";
export type Peranan = "pengerusi" | "ajk";
export type StatusRancangan = "belum_mula" | "sedang_disiapkan" | "sedia" | "selesai";
export type PerananHari = "pic_keseluruhan" | "emcee" | "bantuan_teknikal" | "fotografer" | "lain";

export interface Kehadiran {
  id: string;
  nama_keluarga: string;
  telefon: string;
  status: StatusHadir;
  dewasa: number;
  kanak: number;
  bilik: KeperluanBilik;
  tiba: WaktuTiba;
  nota: string | null;
  sudah_bayar: boolean;
  jumlah_bayar: number;
  yuran: number;
  dicipta: string;
  dikemas: string;
}

export type KehadiranAwam = Pick<
  Kehadiran,
  "id" | "nama_keluarga" | "status" | "dewasa" | "kanak" | "bilik" | "tiba" | "dicipta"
>;

export interface StatistikAwam {
  keluarga: number;
  dewasa: number;
  kanak: number;
  kutipan_dijangka: number;
  kutipan_diterima: number;
}

export interface Biro {
  id: number;
  nama: string;
  tugas: string;
  kuota: number;
  urutan: number;
}

export interface Ajk {
  id: string;
  biro_id: number;
  nama: string;
  peranan: string | null;
  urutan: number;
  telefon: string | null;
  adalah_pengerusi: boolean;
  aktif: boolean;
}

export interface Tentatif {
  id: string;
  hari: number;
  masa: string;
  tajuk: string;
  keterangan: string | null;
  tag: string | null;
  ibadah: boolean;
  draf: boolean;
  urutan: number;
}

export interface BarisBajet {
  id: string;
  label: string;
  keterangan: string | null;
  amaun: number;
  jenis: JenisBaris;
  urutan: number;
}

export interface Tugasan {
  id: string;
  biro_id: number | null;
  teks: string;
  butiran: string | null;
  ditugaskan_kepada: string | null;
  keutamaan: Keutamaan;
  status: StatusTugas;
  tarikh_akhir: string | null;
  dicipta_oleh: string | null;
  selesai_oleh: string | null;
  selesai_pada: string | null;
  urutan: number;
  dicipta: string;
  dikemas: string;
}

export interface Kemaskini {
  id: string;
  ajk_id: string | null;
  nama_paparan: string;
  tugasan_id: string | null;
  jenis: JenisKemaskini;
  teks: string;
  dicipta: string;
}

export interface Risiko {
  id: string;
  senario: string;
  pencetus: string | null;
  kebarangkalian: Tahap;
  kesan: Tahap;
  pelan_sandaran: string;
  penanggungjawab: string | null;
  status: StatusRisiko;
  rancangan_id: string | null;
  urutan: number;
  dikemas: string;
}

export interface KemajuanBiro {
  biro_id: number;
  biro: string;
  urutan: number;
  jumlah: number;
  selesai: number;
  tersekat: number;
}

export interface Barang {
  id: string;
  nama: string;
  barang: string;
  dicipta: string;
}

export interface Cadangan {
  id: string;
  nama: string;
  isi: string;
  dibaca: boolean;
  dicipta: string;
}

// ------------------------------------------------------- agihan kerja
export interface RancanganKerja {
  id: string;
  biro_id: number;
  tajuk: string;
  keterangan: string | null;
  hari: number | null;
  masa: string | null;
  status: StatusRancangan;
  pencetus_sandaran: string | null;
  pelan_sandaran: string | null;
  urutan: number;
  dicipta_oleh: string | null;
  dicipta: string;
  dikemas: string;
}

export interface RancanganPautan {
  id: string;
  rancangan_id: string;
  label: string;
  url: string;
  urutan: number;
}

export interface RancanganPic {
  id: string;
  rancangan_id: string;
  ajk_id: string;
  peranan: string | null;
}

export interface RancanganBahan {
  id: string;
  rancangan_id: string;
  teks: string;
  sedia: boolean;
  urutan: number;
}

export interface PetugasHari {
  id: string;
  hari: number;
  peranan: PerananHari;
  peranan_lain: string | null;
  ajk_id: string | null;
  nota: string | null;
  urutan: number;
}
