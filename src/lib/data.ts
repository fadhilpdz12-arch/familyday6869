import "server-only";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { hariIniMY } from "@/lib/format";
import type {
  Ajk, BarisBajet, Barang, Biro, Cadangan, Kehadiran, KehadiranAwam,
  KemajuanBiro, Kemaskini, PetugasHari, RancanganBahan, RancanganKerja,
  RancanganPautan, RancanganPic, Risiko, StatistikAwam, Tentatif, Tugasan,
} from "@/lib/database.types";

const STATISTIK_KOSONG: StatistikAwam = {
  keluarga: 0, dewasa: 0, kanak: 0, kutipan_dijangka: 0, kutipan_diterima: 0,
};

// ------------------------------------------------------------ laman awam
export async function muatLamanUtama() {
  try {
    return await bacaLamanUtama();
  } catch (ralat) {
    console.error("[muatLamanUtama]", ralat);
    return {
      biro: [] as Biro[], ajk: [] as Ajk[], tentatif: [] as Tentatif[],
      bajet: [] as BarisBajet[], kemajuan: [] as KemajuanBiro[],
      barang: [] as Barang[], cadangan: [] as Cadangan[],
      kehadiran: [] as KehadiranAwam[], statistik: STATISTIK_KOSONG,
    };
  }
}

async function bacaLamanUtama() {
  const sb = supabasePentadbir();
  const [biro, ajk, tentatif, bajet, kemajuan, barang, cadangan, kehadiran, statistik] =
    await Promise.all([
      sb.from("biro").select("*").order("urutan"),
      sb.from("ajk").select("*").eq("aktif", true).order("urutan"),
      sb.from("tentatif").select("*").order("hari").order("urutan"),
      sb.from("bajet").select("*").order("urutan"),
      sb.from("kemajuan_awam").select("*").order("urutan"),
      sb.from("barang").select("*").order("dicipta", { ascending: false }).limit(60),
      sb.from("cadangan").select("*").order("dicipta", { ascending: false }).limit(60),
      sb.from("kehadiran_awam").select("*").order("dicipta"),
      sb.from("statistik_awam").select("*").maybeSingle(),
    ]);

  return {
    biro: (biro.data ?? []) as Biro[],
    ajk: (ajk.data ?? []) as Ajk[],
    tentatif: (tentatif.data ?? []) as Tentatif[],
    bajet: (bajet.data ?? []) as BarisBajet[],
    kemajuan: (kemajuan.data ?? []) as KemajuanBiro[],
    barang: (barang.data ?? []) as Barang[],
    cadangan: (cadangan.data ?? []) as Cadangan[],
    kehadiran: (kehadiran.data ?? []) as KehadiranAwam[],
    statistik: (statistik.data as StatistikAwam | null) ?? STATISTIK_KOSONG,
  };
}

/** Senarai nama untuk skrin log masuk. */
export async function senaraiAhliAktif(): Promise<Pick<Ajk, "id" | "nama" | "biro_id">[]> {
  try {
    const { data } = await supabasePentadbir()
      .from("ajk").select("id, nama, biro_id").eq("aktif", true).order("urutan");
    return data ?? [];
  } catch { return []; }
}

// ------------------------------------------------------------- panel AJK
export async function muatAsasPanel() {
  const sb = supabasePentadbir();
  const [biro, ajk, tugasan] = await Promise.all([
    sb.from("biro").select("*").order("urutan"),
    sb.from("ajk").select("*").eq("aktif", true).order("biro_id").order("urutan"),
    sb.from("tugasan").select("*").order("tarikh_akhir", { nullsFirst: false }).order("urutan"),
  ]);
  return {
    biro: (biro.data ?? []) as Biro[],
    ajk: (ajk.data ?? []) as Ajk[],
    tugasan: (tugasan.data ?? []) as Tugasan[],
  };
}

export async function muatKemaskini(had = 100): Promise<Kemaskini[]> {
  const { data } = await supabasePentadbir()
    .from("kemaskini").select("*").order("dicipta", { ascending: false }).limit(had);
  return (data ?? []) as Kemaskini[];
}

/** Siapa yang dah lapor hari ini, siapa yang belum. */
export async function laporanHariIni() {
  const sb = supabasePentadbir();
  const hariIni = hariIniMY();
  const [{ data: kemaskini }, { data: ajk }] = await Promise.all([
    sb.from("kemaskini").select("*").gte("dicipta", `${hariIni}T00:00:00+08:00`).order("dicipta", { ascending: false }),
    sb.from("ajk").select("*").eq("aktif", true).order("biro_id").order("urutan"),
  ]);

  const senarai = (kemaskini ?? []) as Kemaskini[];
  const semua = (ajk ?? []) as Ajk[];
  const dahLapor = new Set(senarai.map((k) => k.ajk_id).filter(Boolean) as string[]);

  return {
    hariIni,
    kemaskini: senarai,
    dahLapor: semua.filter((a) => dahLapor.has(a.id)),
    belumLapor: semua.filter((a) => !dahLapor.has(a.id)),
  };
}

export async function muatRisiko(): Promise<Risiko[]> {
  const { data } = await supabasePentadbir().from("risiko").select("*").order("urutan");
  return (data ?? []) as Risiko[];
}

export async function muatKehadiranPenuh() {
  const sb = supabasePentadbir();
  const [kehadiran, statistik] = await Promise.all([
    sb.from("kehadiran").select("*").order("dicipta"),
    sb.from("statistik_awam").select("*").maybeSingle(),
  ]);
  return {
    kehadiran: (kehadiran.data ?? []) as Kehadiran[],
    statistik: (statistik.data as StatistikAwam | null) ?? STATISTIK_KOSONG,
  };
}

// ------------------------------------------------------------- agihan kerja
export async function muatRancangan() {
  const sb = supabasePentadbir();
  const [rancangan, pautan, pic, bahan] = await Promise.all([
    sb.from("rancangan_kerja").select("*").order("biro_id").order("urutan"),
    sb.from("rancangan_pautan").select("*").order("urutan"),
    sb.from("rancangan_pic").select("*"),
    sb.from("rancangan_bahan").select("*").order("urutan"),
  ]);
  return {
    rancangan: (rancangan.data ?? []) as RancanganKerja[],
    pautan: (pautan.data ?? []) as RancanganPautan[],
    pic: (pic.data ?? []) as RancanganPic[],
    bahan: (bahan.data ?? []) as RancanganBahan[],
  };
}

export async function muatPetugas(): Promise<PetugasHari[]> {
  const { data } = await supabasePentadbir().from("petugas_hari").select("*").order("hari").order("urutan");
  return (data ?? []) as PetugasHari[];
}

export async function muatCadangan(): Promise<Cadangan[]> {
  const { data } = await supabasePentadbir()
    .from("cadangan").select("*").order("dicipta", { ascending: false });
  return (data ?? []) as Cadangan[];
}
