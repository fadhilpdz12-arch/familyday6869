"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaRisikoBaru, skemaStatusRisiko } from "@/lib/skema";
import { sesiPengerusi, sesiSemasa } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

function segarkan() {
  revalidatePath("/ajk/papan");
  revalidatePath("/ajk/papan/risiko");
}

export async function tukarStatusRisiko(id: string, status: string): Promise<Keputusan> {
  if (!(await sesiSemasa())) return { ok: false, mesej: "Sesi dah tamat." };

  const semakan = skemaStatusRisiko.safeParse({ id, status });
  if (!semakan.success) return { ok: false, mesej: "Status tak sah." };

  const { error } = await supabasePentadbir()
    .from("risiko").update({ status: semakan.data.status }).eq("id", semakan.data.id);

  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };
  segarkan();
  return { ok: true, mesej: "Dikemas kini." };
}

/**
 * Pengerusi sahaja: isi sendiri pelan sandaran baru dari panel.
 * Boleh kaitkan terus dengan satu kerja/aktiviti dalam Agihan Kerja —
 * contoh "hujan lebat" dikaitkan dengan "Sukaneka luar" supaya semua
 * orang nampak sekali gus apa backup activity-nya.
 */
export async function ciptaRisiko(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh tambah pelan sandaran." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaRisikoBaru.safeParse({
    ...mentah,
    penanggungjawab: mentah.penanggungjawab || null,
    rancangan_id: mentah.rancangan_id || null,
  });
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await supabasePentadbir().from("risiko").insert({ ...semakan.data, urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan." };

  segarkan();
  return { ok: true, mesej: "Pelan sandaran baru dah ditambah." };
}

export async function padamRisiko(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh padam pelan sandaran." };
  const { error } = await supabasePentadbir().from("risiko").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Pelan sandaran dipadam." };
}
