"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaBarang, skemaCadangan } from "@/lib/skema";
import type { Keputusan } from "@/tindakan/jenis";

export async function tambahBarang(
  _sebelum: Keputusan | null,
  data: FormData,
): Promise<Keputusan> {
  const semakan = skemaBarang.safeParse(Object.fromEntries(data));
  if (!semakan.success) {
    return { ok: false, mesej: "Isi nama dan barang yang dibawa." };
  }
  const { error } = await supabasePentadbir().from("barang").insert(semakan.data);
  if (error) {
    console.error("[barang]", error);
    return { ok: false, mesej: "Gagal menyimpan. Cuba lagi." };
  }
  revalidatePath("/");
  return { ok: true, mesej: "Dimasukkan ke dalam senarai." };
}

export async function hantarCadangan(
  _sebelum: Keputusan | null,
  data: FormData,
): Promise<Keputusan> {
  const semakan = skemaCadangan.safeParse(Object.fromEntries(data));
  if (!semakan.success) {
    return { ok: false, mesej: "Isi nama dan tulis cadangan sekurang-kurangnya lima aksara." };
  }
  const { error } = await supabasePentadbir().from("cadangan").insert(semakan.data);
  if (error) {
    console.error("[cadangan]", error);
    return { ok: false, mesej: "Gagal menghantar. Cuba lagi." };
  }
  revalidatePath("/");
  return { ok: true, mesej: "Cadangan dihantar kepada AJK." };
}
