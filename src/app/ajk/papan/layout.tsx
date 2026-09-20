import Link from "next/link";
import { redirect } from "next/navigation";
import { aksesSemasa } from "@/lib/sesi-pelayan";
import { LABEL_JAWATAN } from "@/lib/format";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { logKeluar } from "@/tindakan/ajk";
import { TabPanel } from "@/app/ajk/papan/TabPanel";

export const dynamic = "force-dynamic";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const akses = await aksesSemasa();
  if (!akses) redirect("/ajk");

  const { data: biroKetua } = akses.biroKetua
    ? await supabasePentadbir().from("biro").select("nama").eq("id", akses.biroKetua).maybeSingle()
    : { data: null };
  const labelJawatan = akses.jawatan === "ketua_biro" && biroKetua
    ? `Ketua ${biroKetua.nama}`
    : akses.jawatan !== "ahli" ? LABEL_JAWATAN[akses.jawatan] : null;

  return (
    <div className="min-h-dvh bg-kerang pb-20">
      <header className="sticky top-0 z-40 border-b border-[rgba(201,150,47,.22)] bg-lagun-dalam">
        <div className="wrap flex h-[58px] items-center gap-4">
          <b className="font-display text-[15px] font-normal text-kerang">Panel AJK</b>
          <span className="ml-auto truncate text-[13px] text-atas-gelap-lembut">
            {akses.nama}
            {labelJawatan && (
              <span className="ml-2 rounded-full bg-tembaga px-2 py-0.5 text-[11px] font-bold text-lagun-dalam">
                {labelJawatan}
              </span>
            )}
          </span>
          <Link href="/" className="hidden text-[13px] text-atas-gelap-lembut hover:text-tembaga-muda sm:block">
            Laman awam
          </Link>
          <form action={logKeluar}>
            <button type="submit" className="text-[13px] text-atas-gelap-lembut underline underline-offset-2 hover:text-tembaga-muda">
              Keluar
            </button>
          </form>
        </div>
        <TabPanel />
      </header>
      {children}
    </div>
  );
}
