"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import {
  skemaBahanBaru, skemaPautanBaru, skemaPetugasBaru, skemaPicBaru,
  skemaRancanganBaru, skemaRancanganKemaskini, skemaStatusRancangan, skemaTogelBahan,
} from "@/lib/skema";
import { sesiPengerusi, sesiSemasa } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

function segarkan() {
  revalidatePath("/ajk/papan");
  revalidatePath("/ajk/papan/kerja");
}

/**
 * Pengerusi boleh urus semua rancangan. Seorang AJK biasa hanya boleh
 * urus butiran (pautan/bahan/status) kerja yang dia sendiri jadi PIC.
 * Ini yang buat sistem ni terasa macam kerja diagihkan betul-betul,
 * bukan sekadar senarai terbuka untuk semua orang kacau.
 */
async function bolehUrus(rancanganId: string): Promise<boolean> {
  const sesi = await sesiSemasa();
  if (!sesi) return false;
  if (sesi.peranan === "pengerusi") return true;

  const { data } = await supabasePentadbir()
    .from("rancangan_pic").select("ajk_id").eq("rancangan_id", rancanganId).eq("ajk_id", sesi.ahliId).maybeSingle();
  return !!data;
}

// ============================================================ rancangan
/** Pengerusi sahaja: cipta kerja/aktiviti baru di bawah satu biro. */
export async function ciptaRancangan(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const sesi = await sesiPengerusi();
  if (!sesi) return { ok: false, mesej: "Hanya Pengerusi boleh tambah kerja baru." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaRancanganBaru.safeParse({ ...mentah, hari: mentah.hari || null });
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const sb = supabasePentadbir();
  const { data: ahli } = await sb.from("ajk").select("nama").eq("id", sesi.ahliId).maybeSingle();

  const { error } = await sb.from("rancangan_kerja").insert({
    ...semakan.data, dicipta_oleh: ahli?.nama ?? "Pengerusi", urutan: 999,
  });
  if (error) return { ok: false, mesej: "Tak dapat simpan kerja baru." };

  segarkan();
  return { ok: true, mesej: "Kerja baru dah ditambah." };
}

/** Pengerusi sahaja: kemaskini tajuk, keterangan, hari/masa, dan pelan sandaran. */
export async function kemaskiniRancangan(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const sesi = await sesiPengerusi();
  if (!sesi) return { ok: false, mesej: "Hanya Pengerusi boleh edit kerja ni." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaRancanganKemaskini.safeParse({ ...mentah, hari: mentah.hari || null });
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...kemaskini } = semakan.data;
  const { error } = await supabasePentadbir().from("rancangan_kerja").update(kemaskini).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };

  segarkan();
  return { ok: true, mesej: "Dah dikemas kini." };
}

/** Sesiapa yang jadi PIC (atau Pengerusi) boleh tukar status siap-belum. */
export async function tukarStatusRancangan(id: string, status: string): Promise<Keputusan> {
  if (!(await bolehUrus(id))) return { ok: false, mesej: "Hanya PIC kerja ni atau Pengerusi boleh tukar status." };

  const semakan = skemaStatusRancangan.safeParse({ id, status });
  if (!semakan.success) return { ok: false, mesej: "Status tak sah." };

  const { error } = await supabasePentadbir().from("rancangan_kerja").update({ status: semakan.data.status }).eq("id", semakan.data.id);
  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };

  segarkan();
  return { ok: true, mesej: "Status dah ditukar." };
}

export async function padamRancangan(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh padam kerja." };
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
  if (!(await bolehUrus(semakan.data.rancangan_id))) return { ok: false, mesej: "Hanya PIC kerja ni atau Pengerusi boleh tambah pautan." };

  const { error } = await supabasePentadbir().from("rancangan_pautan").insert({ ...semakan.data, urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan pautan." };

  segarkan();
  return { ok: true, mesej: "Pautan ditambah." };
}

export async function padamPautan(id: string, rancanganId: string): Promise<Keputusan> {
  if (!(await bolehUrus(rancanganId))) return { ok: false, mesej: "Tiada kebenaran." };
  const { error } = await supabasePentadbir().from("rancangan_pautan").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Pautan dipadam." };
}

// ------------------------------------------------------------------ PIC
/** Pengerusi sahaja: agihkan siapa PIC untuk kerja ni — ini teras "agihan kerja". */
export async function tambahPic(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const sesi = await sesiPengerusi();
  if (!sesi) return { ok: false, mesej: "Hanya Pengerusi boleh agihkan PIC." };

  const semakan = skemaPicBaru.safeParse(Object.fromEntries(data));
  if (!semakan.success) return { ok: false, mesej: "Pilih AJK dulu." };

  const { error } = await supabasePentadbir().from("rancangan_pic").insert(semakan.data);
  if (error) {
    if (error.code === "23505") return { ok: false, mesej: "Orang tu dah jadi PIC untuk kerja ni." };
    return { ok: false, mesej: "Tak dapat simpan." };
  }

  segarkan();
  return { ok: true, mesej: "PIC ditambah." };
}

export async function padamPic(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh keluarkan PIC." };
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
  if (!(await bolehUrus(semakan.data.rancangan_id))) return { ok: false, mesej: "Hanya PIC kerja ni atau Pengerusi boleh tambah bahan." };

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

  const { error } = await supabasePentadbir().from("rancangan_bahan").update({ sedia: semakan.data.sedia }).eq("id", semakan.data.id);
  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };
  segarkan();
  return { ok: true, mesej: "Dikemas kini." };
}

export async function padamBahan(id: string, rancanganId: string): Promise<Keputusan> {
  if (!(await bolehUrus(rancanganId))) return { ok: false, mesej: "Tiada kebenaran." };
  const { error } = await supabasePentadbir().from("rancangan_bahan").delete().eq("id", id);
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
