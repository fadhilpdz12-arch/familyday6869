import { muatAsasPanel } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { KadTugas } from "@/app/ajk/papan/KadTugas";
import { BorangTugas } from "@/app/ajk/papan/tugas/BorangTugas";
import { LABEL_TUGAS } from "@/lib/format";
import type { StatusTugas } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tugas" };

const LAJUR: StatusTugas[] = ["belum_mula", "sedang_buat", "tersekat", "selesai"];

export default async function HalamanTugas({
  searchParams,
}: {
  searchParams: Promise<{ biro?: string; orang?: string }>;
}) {
  const [{ biro, ajk, tugasan }, sesi, tapis] = await Promise.all([
    muatAsasPanel(), sesiSemasa(), searchParams,
  ]);

  const pengerusi = sesi?.peranan === "pengerusi";
  const ditapis = tugasan.filter((t) => {
    if (tapis.biro && String(t.biro_id) !== tapis.biro) return false;
    if (tapis.orang === "saya" && t.ditugaskan_kepada !== sesi?.ahliId) return false;
    if (tapis.orang === "kosong" && t.ditugaskan_kepada !== null) return false;
    return true;
  });

  const belumAssign = tugasan.filter((t) => !t.ditugaskan_kepada && t.status !== "selesai").length;

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Semua tugas</h1>
      <p className="mb-7 text-sm text-teks-lembut">
        {tugasan.length} tugas semuanya.
        {belumAssign > 0 && <span className="text-tanah"> {belumAssign} lagi belum ada orang pegang.</span>}
      </p>

      {pengerusi && <BorangTugas ajk={ajk} biro={biro} />}

      <div className="mb-7 flex flex-wrap gap-2 text-[13px]">
        <a href="/ajk/papan/tugas" className={`btn btn-halus ${!tapis.biro && !tapis.orang ? "border-tembaga" : ""}`}>Semua</a>
        <a href="/ajk/papan/tugas?orang=saya" className={`btn btn-halus ${tapis.orang === "saya" ? "border-tembaga" : ""}`}>Tugas saya</a>
        <a href="/ajk/papan/tugas?orang=kosong" className={`btn btn-halus ${tapis.orang === "kosong" ? "border-tembaga" : ""}`}>Belum diassign</a>
        {biro.map((b) => (
          <a key={b.id} href={`/ajk/papan/tugas?biro=${b.id}`}
             className={`btn btn-halus ${tapis.biro === String(b.id) ? "border-tembaga" : ""}`}>
            {b.nama}
          </a>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {LAJUR.map((lajur) => {
          const senarai = ditapis.filter((t) => t.status === lajur);
          return (
            <section key={lajur}>
              <h2 className="mb-3 flex items-baseline gap-2 font-sans text-[14px] font-bold tracking-wide text-teks-lembut">
                {LABEL_TUGAS[lajur]}
                <span className="rounded-full bg-[rgba(21,43,44,.08)] px-2 py-0.5 text-[12px]">{senarai.length}</span>
              </h2>
              <div className="flex flex-col gap-3">
                {senarai.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[var(--garis-gelap)] p-4 text-[13px] text-teks-lembut">
                    Takde apa-apa di sini.
                  </p>
                ) : (
                  senarai.map((t) => (
                    <KadTugas key={t.id} tugas={t} ajk={ajk} biro={biro} bolehAssign={pengerusi} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
