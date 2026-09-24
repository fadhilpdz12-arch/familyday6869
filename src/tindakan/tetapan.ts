"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { sesiPengerusi } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

const JENIS_GAMBAR = new Set(["image/png", "image/jpeg", "image/webp"]);
const JENIS_AUDIO = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"]);
const SAIZ_MAKS_GAMBAR = 8 * 1024 * 1024; // 8MB
const SAIZ_MAKS_AUDIO = 15 * 1024 * 1024; // 15MB

async function simpanTetapan(kunci: string, nilai: string) {
  await supabasePentadbir().from("tetapan").upsert({ kunci, nilai });
}

function segarkanSemua() {
  revalidatePath("/");
  revalidatePath("/ajk/papan");
}

/** Pengerusi sahaja: naikkan gambar poster tentatif, gantikan yang lama kalau ada. */
export async function muatNaikPoster(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh naikkan poster." };

  const fail = data.get("poster");
  if (!(fail instanceof File) || fail.size === 0) return { ok: false, mesej: "Sila pilih fail gambar." };
  if (!JENIS_GAMBAR.has(fail.type)) return { ok: false, mesej: "Format tak disokong. Guna PNG, JPG atau WEBP sahaja." };
  if (fail.size > SAIZ_MAKS_GAMBAR) return { ok: false, mesej: "Gambar terlalu besar (maksimum 8MB)." };

  const sambungan = fail.type === "image/png" ? "png" : fail.type === "image/webp" ? "webp" : "jpg";
  const laluan = `poster/tentatif-${Date.now()}.${sambungan}`;

  const sb = supabasePentadbir();
  const { error: ralatMuatNaik } = await sb.storage.from("media").upload(laluan, fail, {
    contentType: fail.type, upsert: true,
  });
  if (ralatMuatNaik) return { ok: false, mesej: "Tak dapat muat naik gambar." };

  const { data: awam } = sb.storage.from("media").getPublicUrl(laluan);
  await simpanTetapan("poster_tentatif", awam.publicUrl);

  segarkanSemua();
  return { ok: true, mesej: "Poster tentatif dah dikemas kini." };
}

/** Pengerusi sahaja: buang poster, laman awam kembali papar jadual teks. */
export async function padamPoster(): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh urus poster." };
  const { error } = await supabasePentadbir().from("tetapan").delete().eq("kunci", "poster_tentatif");
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkanSemua();
  return { ok: true, mesej: "Poster dibuang, jadual teks dipaparkan semula." };
}

/**
 * Naikkan fail terus dari browser ke Supabase Storage (skip Vercel) —
 * Vercel ada had keras ~4.5MB setiap request pada function-nya, dan lagu
 * biasanya lebih besar dari tu. Dua langkah:
 *  1) mintaMuatNaikLagu — sediakan pautan sekali-guna (request kecil sahaja)
 *  2) selesaiMuatNaikLagu — lepas pelayar upload fail terus ke Supabase,
 *     simpan URL awam dalam tetapan.
 */
export async function mintaMuatNaikLagu(
  jenisMime: string, saiz: number,
): Promise<{ ok: true; laluan: string; token: string } | { ok: false; mesej: string }> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh naikkan lagu." };
  if (!JENIS_AUDIO.has(jenisMime)) return { ok: false, mesej: "Format tak disokong. Guna MP3, WAV, M4A atau OGG." };
  if (saiz > SAIZ_MAKS_AUDIO) return { ok: false, mesej: "Fail terlalu besar (maksimum 15MB)." };

  const sambungan = jenisMime.includes("wav") ? "wav" : jenisMime.includes("ogg") ? "ogg" : jenisMime.includes("mp4") || jenisMime.includes("m4a") ? "m4a" : "mp3";
  const laluan = `audio/tema-${Date.now()}.${sambungan}`;

  const { data, error } = await supabasePentadbir().storage.from("media").createSignedUploadUrl(laluan);
  if (error || !data) return { ok: false, mesej: "Tak dapat sediakan pautan muat naik." };

  return { ok: true, laluan: data.path, token: data.token };
}

export async function selesaiMuatNaikLagu(laluan: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh urus lagu tema." };
  const { data: awam } = supabasePentadbir().storage.from("media").getPublicUrl(laluan);
  await simpanTetapan("lagu_tema", awam.publicUrl);
  segarkanSemua();
  return { ok: true, mesej: "Lagu tema dah dikemas kini." };
}

export async function padamLagu(): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh urus lagu tema." };
  const { error } = await supabasePentadbir().from("tetapan").delete().eq("kunci", "lagu_tema");
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkanSemua();
  return { ok: true, mesej: "Lagu tema dibuang." };
}
