import { z } from "zod";

/**
 * Pembolehubah persekitaran disahkan sekali sahaja semasa modul dimuatkan.
 * Kalau ada yang tertinggal, build gagal dengan mesej jelas — bukan
 * `undefined` yang meletup pada waktu larian di tengah acara.
 */
const skemaPelayan = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  KATA_LALUAN_AJK: z.string().min(1),
  KATA_LALUAN_PENGERUSI: z.string().min(1),
  RAHSIA_SESI: z.string().min(16),
});

let cache: z.infer<typeof skemaPelayan> | null = null;

export function envPelayan() {
  if (cache) return cache;
  const hasil = skemaPelayan.safeParse(process.env);
  if (!hasil.success) {
    const hilang = Object.keys(hasil.error.flatten().fieldErrors).join(", ");
    throw new Error(
      `Pembolehubah persekitaran tidak lengkap: ${hilang}. Rujuk .env.example.`,
    );
  }
  cache = hasil.data;
  return cache;
}

export const envPelayar = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};
