"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaAhliBaru, skemaBiroBaru } from "@/lib/skema";
import { aksesSemasa, jawatanDari, sesiPengerusi } from "@/lib/sesi-pelayan";
import type { Jawatan } from "@/lib/database.types";
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

/** Pengerusi / Pembantu: tambah atau kurangkan bilangan ahli yang diperlukan dalam satu biro. */
export async function ubahKuota(biroId: number, kuota: number): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi atau Pembantu Pengerusi boleh ubah bilangan ahli." };
  if (!Number.isInteger(kuota) || kuota < 1 || kuota > 30) return { ok: false, mesej: "Bilangan ahli mesti antara 1 hingga 30." };

  const { error } = await supabasePentadbir().from("biro").update({ kuota }).eq("id", biroId);
  if (error) return { ok: false, mesej: "Tak dapat ubah bilangan ahli." };
  segarkan();
  return { ok: true, mesej: `Bilangan ahli ditetapkan kepada ${kuota}.` };
}

const JAWATAN_BOLEH_DIUBAH: Jawatan[] = ["ahli", "ketua_biro"];

/** Lantik atau lucutkan Ketua Biro. */
export async function tukarJawatan(id: string, jawatan: Jawatan): Promise<Keputusan> {
  const akses = await aksesSemasa();
  if (!akses?.penuh) return { ok: false, mesej: "Hanya Pengerusi atau Pembantu Pengerusi boleh tukar jawatan." };
  if (!JAWATAN_BOLEH_DIUBAH.includes(jawatan)) return { ok: false, mesej: "Jawatan tak sah." };

  const sb = supabasePentadbir();
  const { data: sasaran } = await sb.from("ajk").select("*").eq("id", id).maybeSingle();
  if (!sasaran) return { ok: false, mesej: "Ahli tak jumpa." };

  const semasa = jawatanDari(sasaran);
  if (semasa === "pengerusi") return { ok: false, mesej: "Jawatan Pengerusi tak boleh ditukar di sini." };
  if (semasa === "pembantu_pengerusi") return { ok: false, mesej: "Jawatan Pembantu Pengerusi tak boleh ditukar di sini." };

  // Satu biro seorang ketua: ketua lama jadi ahli biasa
  if (jawatan === "ketua_biro") {
    await sb.from("ajk").update({ jawatan: "ahli" })
      .eq("biro_id", sasaran.biro_id).eq("jawatan", "ketua_biro").neq("id", id);
  }

  const { error } = await sb.from("ajk").update({ jawatan }).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat tukar jawatan." };
  segarkan();
  return { ok: true, mesej: "Jawatan dikemas kini." };
}

/** Pindahkan seorang AJK ke biro lain. */
export async function pindahBiro(id: string, biroId: number): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh pindah ahli." };
  const sb = supabasePentadbir();
  const { data: ahli } = await sb.from("ajk").select("*").eq("id", id).maybeSingle();
  if (!ahli) return { ok: false, mesej: "Ahli tak jumpa." };

  // Ketua yang dipindah tak lagi jadi ketua di biro baru
  const kemaskini = jawatanDari(ahli) === "ketua_biro" ? { biro_id: biroId, jawatan: "ahli" as const } : { biro_id: biroId };
  const { error } = await sb.from("ajk").update(kemaskini).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat pindah." };
  segarkan();
  return { ok: true, mesej: "Dah dipindah." };
}

export async function buangAhli(id: string): Promise<Keputusan> {
  if (!(await sesiPengerusi())) return { ok: false, mesej: "Hanya Pengerusi boleh buang ahli." };
  const { data: ahli } = await supabasePentadbir().from("ajk").select("*").eq("id", id).maybeSingle();
  if (ahli && jawatanDari(ahli) === "pengerusi") return { ok: false, mesej: "Pengerusi tak boleh dikeluarkan." };
  // Tugas dia tak dipadam — cuma jadi tiada penerima, supaya boleh diassign semula
  const { error } = await supabasePentadbir().from("ajk").update({ aktif: false }).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat buang." };
  segarkan();
  return { ok: true, mesej: "Ahli dikeluarkan dari senarai aktif." };
}
