"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaKemaskini } from "@/lib/skema";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

/** Lapor kerja hari ni. Nama diambil dari sesi, bukan dari borang. */
export async function hantarKemaskini(
  _sebelum: Keputusan | null,
  data: FormData,
): Promise<Keputusan> {
  const sesi = await sesiSemasa();
  if (!sesi) return { ok: false, mesej: "Sesi dah tamat. Log masuk semula." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaKemaskini.safeParse({ ...mentah, tugasan_id: mentah.tugasan_id || null });
  if (!semakan.success) return { ok: false, mesej: "Tulis sekurang-kurangnya tiga aksara." };

  const sb = supabasePentadbir();
  const { data: ahli } = await sb.from("ajk").select("nama").eq("id", sesi.ahliId).maybeSingle();

  const { error } = await sb.from("kemaskini").insert({
    ...semakan.data,
    ajk_id: sesi.ahliId,
    nama_paparan: ahli?.nama ?? "AJK",
  });
  if (error) return { ok: false, mesej: "Tak dapat hantar. Cuba lagi." };

  revalidatePath("/ajk/papan");
  revalidatePath("/ajk/papan/harian");
  return { ok: true, mesej: "Update dah dihantar." };
}

export async function padamKemaskini(id: string): Promise<Keputusan> {
  const sesi = await sesiSemasa();
  if (!sesi) return { ok: false, mesej: "Sesi dah tamat." };

  const sb = supabasePentadbir();
  // Hanya penulis sendiri atau Pengerusi boleh padam
  const { data: baris } = await sb.from("kemaskini").select("ajk_id").eq("id", id).maybeSingle();
  if (!baris) return { ok: false, mesej: "Update tak dijumpai." };
  if (baris.ajk_id !== sesi.ahliId && sesi.peranan !== "pengerusi") {
    return { ok: false, mesej: "Hanya penulis atau Pengerusi boleh padam update ni." };
  }

  const { error } = await sb.from("kemaskini").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  revalidatePath("/ajk/papan/harian");
  return { ok: true, mesej: "Dipadam." };
}
