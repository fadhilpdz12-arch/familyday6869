"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { envPelayar } from "@/lib/persekitaran";

/**
 * Klien pelayar dengan kunci anon sahaja. Digunakan untuk langganan
 * Realtime pada jadual tak sensitif (tugasan, barang, cadangan).
 */
let klien: SupabaseClient | null = null;

export function supabasePelayar(): SupabaseClient | null {
  if (!envPelayar.url || !envPelayar.anon) return null;
  klien ??= createClient(envPelayar.url, envPelayar.anon, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 4 } },
  });
  return klien;
}
