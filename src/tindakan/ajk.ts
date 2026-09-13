"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { envPelayan } from "@/lib/persekitaran";
import { ciptaToken, NAMA_KUKI, pilihanKuki, samaMasaTetap } from "@/lib/sesi";
import { sesiPengerusi } from "@/lib/sesi-pelayan";
import { skemaBayaran, skemaLogMasukAjk } from "@/lib/skema";
import type { Keputusan } from "@/tindakan/jenis";

export async function logMasuk(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  const semakan = skemaLogMasukAjk.safeParse(Object.fromEntries(data));
  if (!semakan.success) {
    return { ok: false, mesej: "Pilih nama dan isi kata laluan." };
  }

  const { data: ahli } = await supabasePentadbir()
    .from("ajk").select("id, nama, aktif").eq("id", semakan.data.ahli_id).maybeSingle();

  if (!ahli || !ahli.aktif) return { ok: false, mesej: "Nama tu tiada dalam senarai AJK aktif." };

  const env = envPelayan();
  const kl = semakan.data.kata_laluan;
  const peranan = samaMasaTetap(kl, env.KATA_LALUAN_PENGERUSI)
    ? "pengerusi"
    : samaMasaTetap(kl, env.KATA_LALUAN_AJK)
      ? "ajk"
      : null;

  if (!peranan) {
    await new Promise((r) => setTimeout(r, 600)); // lengah sikit, susahkan orang teka
    return { ok: false, mesej: "Kata laluan salah." };
  }

  const kuki = await cookies();
  kuki.set(NAMA_KUKI, await ciptaToken({ peranan, ahliId: ahli.id }, env.RAHSIA_SESI), pilihanKuki);
  redirect("/ajk/papan");
}

export async function logKeluar(): Promise<void> {
  const kuki = await cookies();
  kuki.delete(NAMA_KUKI);
  redirect("/ajk");
}

export async function kemasBayaran(id: string, sudah_bayar: boolean, jumlah_bayar: number): Promise<Keputusan> {
  if (!(await sesiPengerusi())) {
    // Bendahari pun perlu — jadi benarkan sesiapa yang dah log masuk
    const { sesiSemasa } = await import("@/lib/sesi-pelayan");
    if (!(await sesiSemasa())) return { ok: false, mesej: "Sesi dah tamat." };
  }

  const semakan = skemaBayaran.safeParse({ id, sudah_bayar, jumlah_bayar });
  if (!semakan.success) return { ok: false, mesej: "Data bayaran tak sah." };

  const { error } = await supabasePentadbir()
    .from("kehadiran")
    .update({ sudah_bayar: semakan.data.sudah_bayar, jumlah_bayar: semakan.data.jumlah_bayar })
    .eq("id", semakan.data.id);

  if (error) return { ok: false, mesej: "Tak dapat kemas kini bayaran." };
  revalidatePath("/ajk/papan/kehadiran");
  return { ok: true, mesej: "Rekod bayaran dikemas kini." };
}

export async function padamKehadiran(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh padam rekod." };
  const { error } = await supabasePentadbir().from("kehadiran").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  revalidatePath("/ajk/papan/kehadiran");
  revalidatePath("/");
  return { ok: true, mesej: "Rekod dipadam." };
}
