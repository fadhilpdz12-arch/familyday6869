"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaStatusTugas, skemaTugasBaru } from "@/lib/skema";
import { aksesSemasa, bolehUrusBiro, sesiSemasa, type Akses } from "@/lib/sesi-pelayan";
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

/** Ahli yang dipilih mesti dalam biro yang sama (untuk Ketua Biro). */
async function ahliDalamBiro(ahliId: string, biroId: number): Promise<boolean> {
  const { data } = await supabasePentadbir()
    .from("ajk").select("biro_id").eq("id", ahliId).eq("aktif", true).maybeSingle();
  return data?.biro_id === biroId;
}

/** Semak sama ada akses ni boleh assign tugas biro tu kepada ahli tu. */
async function bolehAgih(akses: Akses, biroId: number | null, ahliId: string | null): Promise<string | null> {
  if (akses.penuh) return null;
  if (akses.biroKetua === null) return "Hanya Pengerusi, Pembantu Pengerusi dan Ketua Biro boleh agih tugas.";
  if (biroId !== akses.biroKetua) return "Ketua Biro hanya boleh agih tugas untuk biro sendiri.";
  if (ahliId && !(await ahliDalamBiro(ahliId, akses.biroKetua))) {
    return "Tugas hanya boleh diberi kepada ahli dalam biro anda.";
  }
  return null;
}

/** Pengerusi, Pembantu Pengerusi, atau Ketua Biro (untuk biro sendiri): cipta tugas baru. */
export async function ciptaTugas(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const akses = await aksesSemasa();
  if (!akses) return { ok: false, mesej: "Sesi dah tamat. Log masuk semula." };

  const mentah = Object.fromEntries(data);
  const semakan = skemaTugasBaru.safeParse({
    ...mentah,
    // Ketua Biro: tugas sentiasa masuk biro dia
    biro_id: akses.penuh ? (mentah.biro_id || null) : akses.biroKetua,
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

  const halangan = await bolehAgih(akses, semakan.data.biro_id ?? null, semakan.data.ditugaskan_kepada ?? null);
  if (halangan) return { ok: false, mesej: halangan };

  const { error } = await supabasePentadbir()
    .from("tugasan").insert({ ...semakan.data, dicipta_oleh: akses.nama, urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan tugas." };

  segarkan();
  return { ok: true, mesej: "Tugas baru dah ditambah." };
}

async function biroTugas(id: string): Promise<number | null | undefined> {
  const { data } = await supabasePentadbir().from("tugasan").select("biro_id").eq("id", id).maybeSingle();
  return data ? data.biro_id : undefined;
}

/** Tukar siapa yang pegang satu tugas. */
export async function tugaskanSemula(id: string, ahliId: string | null): Promise<Keputusan> {
  const akses = await aksesSemasa();
  if (!akses) return { ok: false, mesej: "Sesi dah tamat. Log masuk semula." };

  const biroId = await biroTugas(id);
  if (biroId === undefined) return { ok: false, mesej: "Tugas tak jumpa." };
  const halangan = await bolehAgih(akses, biroId, ahliId);
  if (halangan) return { ok: false, mesej: halangan };

  const { error } = await supabasePentadbir()
    .from("tugasan")
    .update({ ditugaskan_kepada: ahliId })
    .eq("id", id);

  if (error) return { ok: false, mesej: "Tak dapat assign." };
  segarkan();
  return { ok: true, mesej: "Dah diassign." };
}

export async function padamTugas(id: string): Promise<Keputusan> {
  const akses = await aksesSemasa();
  const biroId = await biroTugas(id);
  if (biroId === undefined) return { ok: false, mesej: "Tugas tak jumpa." };
  if (!bolehUrusBiro(akses, biroId)) {
    return { ok: false, mesej: "Hanya Pengerusi, Pembantu Pengerusi atau Ketua Biro tu boleh padam tugas ni." };
  }
  const { error } = await supabasePentadbir().from("tugasan").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Tugas dipadam." };
}
