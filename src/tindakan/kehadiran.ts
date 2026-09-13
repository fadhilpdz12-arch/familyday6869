"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaKehadiran } from "@/lib/skema";
import type { Keputusan } from "@/tindakan/jenis";

/**
 * Hantar atau kemas kini pengesahan kehadiran satu keluarga.
 * Indeks unik pada lower(nama_keluarga) menjadikan ini idempoten —
 * hantar dua kali tidak menghasilkan dua baris.
 */
export async function hantarKehadiran(
  _sebelum: Keputusan | null,
  data: FormData,
): Promise<Keputusan> {
  const semakan = skemaKehadiran.safeParse(Object.fromEntries(data));

  if (!semakan.success) {
    return {
      ok: false,
      mesej: "Ada maklumat yang belum betul. Semak medan bertanda merah.",
      medan: semakan.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { error } = await supabasePentadbir()
    .from("kehadiran")
    .upsert(semakan.data, { onConflict: "nama_keluarga", ignoreDuplicates: false })
    .select("id")
    .single();

  if (error) {
    // 23505 = pelanggaran indeks unik pada lower(nama). Cuba kemas kini ikut nama.
    if (error.code === "23505") {
      const { error: ralatKemas } = await supabasePentadbir()
        .from("kehadiran")
        .update(semakan.data)
        .ilike("nama_keluarga", semakan.data.nama_keluarga);
      if (!ralatKemas) {
        revalidatePath("/");
        return { ok: true, mesej: `Maklumat keluarga ${semakan.data.nama_keluarga} dikemas kini.` };
      }
    }
    console.error("[kehadiran]", error);
    return { ok: false, mesej: "Gagal menyimpan. Cuba sekali lagi dalam beberapa saat." };
  }

  revalidatePath("/");
  revalidatePath("/ajk/papan");
  return {
    ok: true,
    mesej: `Terima kasih. Kehadiran ${semakan.data.nama_keluarga} sudah direkod.`,
  };
}
