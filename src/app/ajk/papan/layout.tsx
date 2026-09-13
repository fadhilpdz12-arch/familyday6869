import Link from "next/link";
import { redirect } from "next/navigation";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { supabasePentadbir } from "@/lib/supabase/pelayan";
import { logKeluar } from "@/tindakan/ajk";
import { TabPanel } from "@/app/ajk/papan/TabPanel";

export const dynamic = "force-dynamic";

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  const sesi = await sesiSemasa();
  if (!sesi) redirect("/ajk");

  const { data: ahli } = await supabasePentadbir()
    .from("ajk").select("nama").eq("id", sesi.ahliId).maybeSingle();

  return (
    <div className="min-h-dvh bg-kerang pb-20">
      <header className="sticky top-0 z-40 border-b border-[rgba(201,150,47,.22)] bg-lagun-dalam">
        <div className="wrap flex h-[58px] items-center gap-4">
          <b className="font-display text-[15px] font-normal text-kerang">Panel AJK</b>
          <span className="ml-auto truncate text-[13px] text-atas-gelap-lembut">
            {ahli?.nama ?? "AJK"}
            {sesi.peranan === "pengerusi" && (
              <span className="ml-2 rounded-full bg-tembaga px-2 py-0.5 text-[11px] font-bold text-lagun-dalam">
                Pengerusi
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
