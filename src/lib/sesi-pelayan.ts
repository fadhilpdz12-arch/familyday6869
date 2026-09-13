import "server-only";
import { cookies } from "next/headers";
import { NAMA_KUKI, bacaToken, type Sesi } from "@/lib/sesi";
import { envPelayan } from "@/lib/persekitaran";

export async function sesiSemasa(): Promise<Sesi | null> {
  const kuki = await cookies();
  return bacaToken(kuki.get(NAMA_KUKI)?.value, envPelayan().RAHSIA_SESI);
}

/** Untuk tindakan yang hanya Pengerusi boleh buat. */
export async function sesiPengerusi(): Promise<Sesi | null> {
  const s = await sesiSemasa();
  return s?.peranan === "pengerusi" ? s : null;
}
