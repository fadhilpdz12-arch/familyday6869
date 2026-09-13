import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envPelayan } from "@/lib/persekitaran";

/**
 * Klien pelayan dengan kunci service role. Ia MEMINTAS RLS, jadi ia hanya
 * boleh dipanggil dari Server Action atau Route Handler yang telah
 * mengesahkan input dan kebenaran terlebih dahulu.
 *
 * Import "server-only" di atas memastikan fail ini tidak akan tersilap
 * masuk ke dalam bundle pelayar — build akan gagal kalau ia berlaku.
 */
let klien: SupabaseClient | null = null;

export function supabasePentadbir(): SupabaseClient {
  if (klien) return klien;
  const env = envPelayan();
  klien = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-aplikasi": "familyday-2026" } },
  });
  return klien;
}
