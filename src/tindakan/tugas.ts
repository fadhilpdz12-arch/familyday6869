"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaStatusTugas, skemaTugasBaru } from "@/lib/skema";
import { sesiPengerusi, sesiSemasa } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

function segarkan() {
  revalidatePath("/");
  revalidatePath("/ajk/papan");
  revalidatePath("/ajk/papan/tugas");
}

/** Sesiapa yang dah log masuk boleh tukar status tugas. */
export async function tukarStatus(id: string, status: string): Promise<Keputusan> {
  const sesi = await sesiSemasa();
  if (!sesi) return { ok: false, mesej: "Sesi dah tamat. Log masuk semula." };

  const semakan = skemaStatusTugas.safeParse({ id, status });
  if (!semakan.success) return { ok: false, mesej: "Status tak sah." };

  const sb = supabasePentadbir();
  const { data: ahli } = await sb.from("ajk").select("nama").eq("id", sesi.ahliId).maybeSingle();

  const { error } = await sb
    .from("tugasan")
    .update({
      status: semakan.data.status,
      selesai_oleh: semakan.data.status === "selesai" ? (ahli?.nama ?? null) : null,
    })
    .eq("id", semakan.data.id);

  if (error) return { ok: false, mesej: "Tak dapat kemas kini. Cuba lagi." };
  segarkan();
  return { ok: true, mesej: "Dah dikemas kini." };
}

/** Pengerusi sahaja: cipta tugas baru dan tetapkan siapa yang buat. */
export async function ciptaTugas(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const sesi = await sesiPengerusi();
  if (!sesi) return { ok: false, mesej: "Hanya Pengerusi boleh tambah tugas." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaTugasBaru.safeParse({
    ...mentah,
    biro_id: mentah.biro_id || null,
    ditugaskan_kepada: mentah.ditugaskan_kepada || null,
    tarikh_akhir: mentah.tarikh_akhir || null,
  });

  if (!semakan.success) {
    return {
      ok: false,
      mesej: "Ada medan tak lengkap.",
      medan: semakan.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const sb = supabasePentadbir();
  const { data: ahli } = await sb.from("ajk").select("nama").eq("id", sesi.ahliId).maybeSingle();

  const { error } = await sb.from("tugasan").insert({ ...semakan.data, dicipta_oleh: ahli?.nama ?? "Pengerusi", urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan tugas." };

  segarkan();
  return { ok: true, mesej: "Tugas baru dah ditambah." };
}

/** Pengerusi sahaja: tukar siapa yang pegang satu tugas. */
export async function tugaskanSemula(id: string, ahliId: string | null): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh assign tugas." };

  const { error } = await supabasePentadbir()
    .from("tugasan")
    .update({ ditugaskan_kepada: ahliId })
    .eq("id", id);

  if (error) return { ok: false, mesej: "Tak dapat assign." };
  segarkan();
  return { ok: true, mesej: "Dah diassign." };
}

export async function padamTugas(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh padam tugas." };
  const { error } = await supabasePentadbir().from("tugasan").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Tugas dipadam." };
}
