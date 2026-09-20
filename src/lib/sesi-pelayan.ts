import "server-only";
import { cookies } from "next/headers";
import { NAMA_KUKI, bacaToken, type Sesi } from "@/lib/sesi";
import { envPelayan } from "@/lib/persekitaran";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import type { Jawatan } from "@/lib/database.types";

export async function sesiSemasa(): Promise<Sesi | null> {
  const kuki = await cookies();
  return bacaToken(kuki.get(NAMA_KUKI)?.value, envPelayan().RAHSIA_SESI);
}

/** Untuk tindakan yang hanya Pengerusi boleh buat. */
export async function sesiPengerusi(): Promise<Sesi | null> {
  const s = await sesiSemasa();
  return s?.peranan === "pengerusi" ? s : null;
}

export interface Akses {
  sesi: Sesi;
  ahliId: string;
  nama: string;
  biroId: number;
  jawatan: Jawatan;
  /** Pengerusi & Pembantu Pengerusi: boleh buat semua benda */
  penuh: boolean;
  /** Biro yang dia ketuai, kalau dia Ketua Biro */
  biroKetua: number | null;
}

/** Jawatan dibaca semula dari database setiap kali, jadi perubahan jawatan berkuat kuasa serta-merta. */
export async function aksesSemasa(): Promise<Akses | null> {
  const sesi = await sesiSemasa();
  if (!sesi) return null;

  const { data } = await supabasePentadbir()
    .from("ajk").select("*").eq("id", sesi.ahliId).eq("aktif", true).maybeSingle();
  if (!data) return null;

  const jawatan = jawatanDari(data);
  return {
    sesi,
    ahliId: data.id,
    nama: data.nama,
    biroId: data.biro_id,
    jawatan,
    penuh: sesi.peranan === "pengerusi",
    biroKetua: jawatan === "ketua_biro" ? data.biro_id : null,
  };
}

/** Serasi dengan database yang belum jalankan migrasi jawatan. */
export function jawatanDari(ahli: { jawatan?: Jawatan | null; adalah_pengerusi?: boolean | null }): Jawatan {
  return ahli.jawatan ?? (ahli.adalah_pengerusi ? "pengerusi" : "ahli");
}

/** Boleh urus tugas biro ni? Pengerusi/Pembantu: semua biro. Ketua Biro: biro sendiri sahaja. */
export function bolehUrusBiro(akses: Akses | null, biroId: number | null | undefined): boolean {
  if (!akses) return false;
  if (akses.penuh) return true;
  return akses.biroKetua !== null && biroId === akses.biroKetua;
}

/** Biro Bendahari dikenal pasti ikut nama supaya tak bergantung pada nombor id. */
export function biroBendahari(namaBiro: string | null | undefined): boolean {
  return !!namaBiro && /^bendahari/i.test(namaBiro.trim());
}

/** Rekod bayaran: Pengerusi, Pembantu Pengerusi dan ahli biro Bendahari sahaja. */
export async function bolehUrusBayaran(akses: Akses | null): Promise<boolean> {
  if (!akses) return false;
  if (akses.penuh) return true;
  const { data } = await supabasePentadbir().from("biro").select("nama").eq("id", akses.biroId).maybeSingle();
  return biroBendahari(data?.nama);
}
