"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaAhliBaru } from "@/lib/skema";
import { sesiPengerusi } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

function segarkan() {
  revalidatePath("/");
  revalidatePath("/ajk/papan/pasukan");
  revalidatePath("/ajk/papan/tugas");
}

/** Pengerusi isi kekosongan biro. */
export async function tambahAhli(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh tambah ahli." };

  const semakan = skemaAhliBaru.safeParse(Object.fromEntries(data));
  if (!semakan.success) return { ok: false, mesej: "Isi nama dan pilih biro." };

  const sb = supabasePentadbir();
  const { count } = await sb
    .from("ajk").select("id", { count: "exact", head: true })
    .eq("biro_id", semakan.data.biro_id);

  const { error } = await sb.from("ajk").insert({ ...semakan.data, urutan: (count ?? 0) + 1 });
  if (error) return { ok: false, mesej: "Tak dapat tambah. Mungkin nama dah ada." };

  segarkan();
  return { ok: true, mesej: `${semakan.data.nama} dah masuk pasukan.` };
}

/** Pindahkan seorang AJK ke biro lain. */
export async function pindahBiro(id: string, biroId: number): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh pindah ahli." };
  const { error } = await supabasePentadbir().from("ajk").update({ biro_id: biroId }).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat pindah." };
  segarkan();
  return { ok: true, mesej: "Dah dipindah." };
}

export async function buangAhli(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh buang ahli." };
  // Tugas dia tak dipadam — cuma jadi tiada penerima, supaya boleh diassign semula
  const { error } = await supabasePentadbir().from("ajk").update({ aktif: false }).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat buang." };
  segarkan();
  return { ok: true, mesej: "Ahli dikeluarkan dari senarai aktif." };
}
