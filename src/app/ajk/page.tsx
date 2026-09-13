import { senaraiAhliAktif } from "@/lib/data";
import { BorangLogMasuk } from "@/app/ajk/BorangLogMasuk";
import { Jata } from "@/components/Jata";

export const dynamic = "force-dynamic";
export const metadata = { title: "Log masuk AJK" };

export default async function LogMasukAjk() {
  const ahli = await senaraiAhliAktif();

  return (
    <main className="grid min-h-dvh place-items-center bg-lagun-dalam px-6 py-16">
      <div className="w-full max-w-sm text-center">
        <Jata className="mx-auto mb-7 w-28 text-tembaga" />
        <h1 className="mb-2 text-3xl text-kerang-terang">Panel AJK</h1>
        <p className="mb-8 text-sm text-atas-gelap-lembut">
          Pilih nama anda, masukkan kata laluan yang Pengerusi bagi dalam group.
        </p>
        <BorangLogMasuk ahli={ahli} />
      </div>
    </main>
  );
}
