"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import {
  skemaBahanBaru, skemaPautanBaru, skemaPetugasBaru, skemaPicBaru,
  skemaRancanganBaru, skemaRancanganKemaskini, skemaStatusRancangan, skemaTogelBahan,
} from "@/lib/skema";
import { aksesSemasa, bolehUrusBiro, sesiPengerusi, type Akses } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

function segarkan() {
  revalidatePath("/ajk/papan");
  revalidatePath("/ajk/papan/kerja");
}

async function biroRancangan(rancanganId: string): Promise<number | undefined> {
  const { data } = await supabasePentadbir()
    .from("rancangan_kerja").select("biro_id").eq("id", rancanganId).maybeSingle();
  return data?.biro_id;
}

/**
 * Pengerusi/Pembantu: semua kerja. Ketua Biro: semua kerja dalam biro dia.
 * Semua ini boleh susun kerja, edit, padam dan agih PIC.
 */
async function aksesPengurus(rancanganId: string): Promise<Akses | null> {
  const akses = await aksesSemasa();
  if (!akses) return null;
  if (akses.penuh) return akses;
  const biroId = await biroRancangan(rancanganId);
  return biroId !== undefined && bolehUrusBiro(akses, biroId) ? akses : null;
}

/**
 * Butiran (pautan/bahan/status): pengurus di atas, atau AJK yang jadi PIC kerja tu.
 * Ini yang buat sistem ni terasa macam kerja diagihkan betul-betul,
 * bukan sekadar senarai terbuka untuk semua orang kacau.
 */
async function bolehUrus(rancanganId: string): Promise<boolean> {
  const akses = await aksesSemasa();
  if (!akses) return false;
  if (await aksesPengurus(rancanganId)) return true;

  const { data } = await supabasePentadbir()
    .from("rancangan_pic").select("ajk_id").eq("rancangan_id", rancanganId).eq("ajk_id", akses.ahliId).maybeSingle();
  return !!data;
}

const MESEJ_PENGURUS = "Hanya Pengerusi, Pembantu Pengerusi atau Ketua biro ni boleh buat perubahan ini.";

// ============================================================ rancangan
/** Pengerusi/Pembantu (semua biro) atau Ketua Biro (biro sendiri): cipta kerja/aktiviti baru. */
export async function ciptaRancangan(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const akses = await aksesSemasa();
  if (!akses) return { ok: false, mesej: "Sesi dah tamat. Log masuk semula." };
  if (!akses.penuh && akses.biroKetua === null) return { ok: false, mesej: "Hanya Pengerusi, Pembantu Pengerusi atau Ketua Biro boleh tambah kerja baru." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaRancanganBaru.safeParse({
    ...mentah,
    hari: mentah.hari || null,
    // Ketua Biro: kerja sentiasa masuk biro dia
    biro_id: akses.penuh ? mentah.biro_id : akses.biroKetua,
  });
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  if (!bolehUrusBiro(akses, semakan.data.biro_id)) return { ok: false, mesej: "Ketua Biro hanya boleh tambah kerja untuk biro sendiri." };

  const { error } = await supabasePentadbir().from("rancangan_kerja").insert({
    ...semakan.data, dicipta_oleh: akses.nama, urutan: 999,
  });
  if (error) return { ok: false, mesej: "Tak dapat simpan kerja baru." };

  segarkan();
  return { ok: true, mesej: "Kerja baru dah ditambah." };
}

/** Pengurus kerja ni: kemaskini tajuk, keterangan, hari/masa, dan pelan sandaran. */
export async function kemaskiniRancangan(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const mentah = Object.fromEntries(data);
  const semakan = skemaRancanganKemaskini.safeParse({ ...mentah, hari: mentah.hari || null });
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...kemaskini } = semakan.data;
  if (!(await aksesPengurus(id))) return { ok: false, mesej: MESEJ_PENGURUS };

  const { error } = await supabasePentadbir().from("rancangan_kerja").update(kemaskini).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };

  segarkan();
  return { ok: true, mesej: "Dah dikemas kini." };
}

/** Sesiapa yang jadi PIC (atau Pengerusi) boleh tukar status siap-belum. */
export async function tukarStatusRancangan(id: string, status: string): Promise<Keputusan> {
  if (!(await bolehUrus(id))) return { ok: false, mesej: "Hanya PIC kerja ni, Ketua biro atau Pengerusi boleh tukar status." };

  const semakan = skemaStatusRancangan.safeParse({ id, status });
  if (!semakan.success) return { ok: false, mesej: "Status tak sah." };

  const { error } = await supabasePentadbir().from("rancangan_kerja").update({ status: semakan.data.status }).eq("id", semakan.data.id);
  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };

  segarkan();
  return { ok: true, mesej: "Status dah ditukar." };
}

export async function padamRancangan(id: string): Promise<Keputusan> {
  if (!(await aksesPengurus(id))) return { ok: false, mesej: MESEJ_PENGURUS };
  const { error } = await supabasePentadbir().from("rancangan_kerja").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Kerja dipadam." };
}

// -------------------------------------------------------------- pautan
/** PIC kerja tu (atau Pengerusi) boleh tambah link rujukan — cth video game. */
export async function tambahPautan(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const mentah = Object.fromEntries(data);
  const semakan = skemaPautanBaru.safeParse(mentah);
  if (!semakan.success) {
    return { ok: false, mesej: "Pautan tak sah. Mesti mula dengan http:// atau https://", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }
  if (!(await bolehUrus(semakan.data.rancangan_id))) return { ok: false, mesej: "Hanya PIC kerja ni, Ketua biro atau Pengerusi boleh tambah pautan." };

  const { error } = await supabasePentadbir().from("rancangan_pautan").insert({ ...semakan.data, urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan pautan." };

  segarkan();
  return { ok: true, mesej: "Pautan ditambah." };
}

export async function padamPautan(id: string, rancanganId: string): Promise<Keputusan> {
  if (!(await bolehUrus(rancanganId))) return { ok: false, mesej: "Tiada kebenaran." };
  const { error } = await supabasePentadbir()
    .from("rancangan_pautan").delete().eq("id", id).eq("rancangan_id", rancanganId);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Pautan dipadam." };
}

// ------------------------------------------------------------------ PIC
/** Pengurus kerja ni: agihkan siapa PIC — ini teras "agihan kerja". */
export async function tambahPic(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const semakan = skemaPicBaru.safeParse(Object.fromEntries(data));
  if (!semakan.success) return { ok: false, mesej: "Pilih AJK dulu." };

  const akses = await aksesPengurus(semakan.data.rancangan_id);
  if (!akses) return { ok: false, mesej: MESEJ_PENGURUS };

  // Ketua Biro hanya boleh lantik ahli biro dia sebagai PIC
  if (!akses.penuh) {
    const { data: calon } = await supabasePentadbir()
      .from("ajk").select("biro_id").eq("id", semakan.data.ajk_id).eq("aktif", true).maybeSingle();
    if (calon?.biro_id !== akses.biroKetua) return { ok: false, mesej: "PIC mesti ahli biro anda sendiri." };
  }

  const { error } = await supabasePentadbir().from("rancangan_pic").insert(semakan.data);
  if (error) {
    if (error.code === "23505") return { ok: false, mesej: "Orang tu dah jadi PIC untuk kerja ni." };
    return { ok: false, mesej: "Tak dapat simpan." };
  }

  segarkan();
  return { ok: true, mesej: "PIC ditambah." };
}

export async function padamPic(id: string): Promise<Keputusan> {
  const { data: baris } = await supabasePentadbir().from("rancangan_pic").select("rancangan_id").eq("id", id).maybeSingle();
  if (!baris) return { ok: false, mesej: "PIC tak jumpa." };
  if (!(await aksesPengurus(baris.rancangan_id))) return { ok: false, mesej: MESEJ_PENGURUS };
  const { error } = await supabasePentadbir().from("rancangan_pic").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat keluarkan." };
  segarkan();
  return { ok: true, mesej: "PIC dikeluarkan." };
}

// --------------------------------------------------------------- bahan
export async function tambahBahan(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const semakan = skemaBahanBaru.safeParse(Object.fromEntries(data));
  if (!semakan.success) {
    return { ok: false, mesej: "Isi nama bahan dulu.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }
  if (!(await bolehUrus(semakan.data.rancangan_id))) return { ok: false, mesej: "Hanya PIC kerja ni, Ketua biro atau Pengerusi boleh tambah bahan." };

  const { error } = await supabasePentadbir().from("rancangan_bahan").insert({ ...semakan.data, urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan." };

  segarkan();
  return { ok: true, mesej: "Bahan ditambah." };
}

/** Tandakan bahan dah sedia / belum — boleh guna oleh sesiapa yang log masuk (kerja tim). */
export async function togelBahan(id: string, sedia: boolean, rancanganId: string): Promise<Keputusan> {
  if (!(await bolehUrus(rancanganId))) return { ok: false, mesej: "Tiada kebenaran." };
  const semakan = skemaTogelBahan.safeParse({ id, sedia });
  if (!semakan.success) return { ok: false, mesej: "Data tak sah." };

  const { error } = await supabasePentadbir()
    .from("rancangan_bahan").update({ sedia: semakan.data.sedia })
    .eq("id", semakan.data.id).eq("rancangan_id", rancanganId);
  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };
  segarkan();
  return { ok: true, mesej: "Dikemas kini." };
}

export async function padamBahan(id: string, rancanganId: string): Promise<Keputusan> {
  if (!(await bolehUrus(rancanganId))) return { ok: false, mesej: "Tiada kebenaran." };
  const { error } = await supabasePentadbir()
    .from("rancangan_bahan").delete().eq("id", id).eq("rancangan_id", rancanganId);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Bahan dipadam." };
}

// ============================================================== petugas
/** Pengerusi sahaja: tetapkan emcee / PIC keseluruhan / peranan lain untuk satu hari. */
export async function aturPetugas(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const sesi = await sesiPengerusi();
  if (!sesi) return { ok: false, mesej: "Hanya Pengerusi boleh atur jadual petugas." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaPetugasBaru.safeParse({ ...mentah, ajk_id: mentah.ajk_id || null });
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await supabasePentadbir().from("petugas_hari").insert({ ...semakan.data, urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan." };

  segarkan();
  return { ok: true, mesej: "Petugas ditambah." };
}

export async function padamPetugas(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh buang petugas." };
  const { error } = await supabasePentadbir().from("petugas_hari").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Petugas dikeluarkan." };
}
