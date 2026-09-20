"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaAhliBaru, skemaBiroBaru } from "@/lib/skema";
import { sesiPengerusi } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

function segarkan() {
  revalidatePath("/");
  revalidatePath("/ajk/papan/pasukan");
  revalidatePath("/ajk/papan/tugas");
  revalidatePath("/ajk/papan/kerja");
  revalidatePath("/ajk/papan");
}

/** Pengerusi buka biro baharu. */
export async function tambahBiro(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh tambah biro." };

  const semakan = skemaBiroBaru.safeParse(Object.fromEntries(data));
  if (!semakan.success) {
    return {
      ok: false,
      mesej: "Isi nama biro, tugas (sekurang-kurangnya 5 huruf) dan bilangan ahli diperlukan.",
      medan: semakan.error.flatten().fieldErrors,
    };
  }

  const sb = supabasePentadbir();

  // Nama biro mesti unik (tak kira huruf besar/kecil)
  const { data: sama } = await sb.from("biro").select("id").ilike("nama", semakan.data.nama).limit(1);
  if (sama && sama.length > 0) return { ok: false, mesej: `Biro "${semakan.data.nama}" dah ada.` };

  // Jadual biro guna id smallint tanpa sequence, jadi ambil nombor seterusnya
  const { data: akhir, error: ralatBaca } = await sb
    .from("biro").select("id, urutan").order("id", { ascending: false }).limit(1);
  if (ralatBaca) return { ok: false, mesej: "Tak dapat baca senarai biro. Cuba lagi." };

  const { data: urutanAkhir } = await sb
    .from("biro").select("urutan").order("urutan", { ascending: false }).limit(1);

  const idBaru = (akhir?.[0]?.id ?? 0) + 1;
  const urutanBaru = (urutanAkhir?.[0]?.urutan ?? 0) + 1;

  const { error } = await sb.from("biro").insert({ id: idBaru, urutan: urutanBaru, ...semakan.data });
  if (error) {
    // 23505 = unique violation (dua orang tekan serentak atau nama bertembung)
    return {
      ok: false,
      mesej: error.code === "23505" ? "Biro tu dah ada, atau ada orang lain baru tambah. Muat semula dan cuba lagi." : "Tak dapat tambah biro.",
    };
  }

  segarkan();
  return { ok: true, mesej: `Biro ${semakan.data.nama} dah dibuka. Sekarang boleh masukkan ahli.` };
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
