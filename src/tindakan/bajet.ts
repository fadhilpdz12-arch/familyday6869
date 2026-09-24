"use server";

import { revalidatePath } from "next/cache";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { skemaBajetBaru, skemaBajetKemaskini } from "@/lib/skema";
import { aksesSemasa, bolehUrusBayaran } from "@/lib/sesi-pelayan";
import type { Keputusan } from "@/tindakan/jenis";

function segarkan() {
  revalidatePath("/");
  revalidatePath("/ajk/papan");
  revalidatePath("/ajk/papan/bajet");
}

async function bolehUrus(): Promise<boolean> {
  return bolehUrusBayaran(await aksesSemasa());
}

export async function ciptaBarisBajet(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  if (!(await bolehUrus())) return { ok: false, mesej: "Hanya Pengerusi atau Bendahari boleh urus bajet." };

  const semakan = skemaBajetBaru.safeParse(Object.fromEntries(data));
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { error } = await supabasePentadbir().from("bajet").insert({ ...semakan.data, urutan: 999 });
  if (error) return { ok: false, mesej: "Tak dapat simpan." };

  segarkan();
  return { ok: true, mesej: "Baris bajet ditambah." };
}

export async function kemaskiniBarisBajet(_sebelum: Keputusan | null, data: FormData): Promise<Keputusan> {
  if (!(await bolehUrus())) return { ok: false, mesej: "Hanya Pengerusi atau Bendahari boleh urus bajet." };

  const semakan = skemaBajetKemaskini.safeParse(Object.fromEntries(data));
  if (!semakan.success) {
    return { ok: false, mesej: "Ada medan tak lengkap.", medan: semakan.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { id, ...kemaskini } = semakan.data;
  const { error } = await supabasePentadbir().from("bajet").update(kemaskini).eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat kemas kini." };

  segarkan();
  return { ok: true, mesej: "Dikemas kini." };
}

export async function padamBarisBajet(id: string): Promise<Keputusan> {
  if (!(await bolehUrus())) return { ok: false, mesej: "Hanya Pengerusi atau Bendahari boleh urus bajet." };
  const { error } = await supabasePentadbir().from("bajet").delete().eq("id", id);
  if (error) return { ok: false, mesej: "Tak dapat padam." };
  segarkan();
  return { ok: true, mesej: "Baris dipadam." };
}
