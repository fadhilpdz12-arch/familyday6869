import { muatAsasPanel, muatRancangan, muatRisiko } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { BorangRisiko } from "@/app/ajk/papan/risiko/BorangRisiko";
import { KadRisiko } from "@/app/ajk/papan/risiko/KadRisiko";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pelan sandaran" };

export default async function HalamanRisiko() {
  const [risiko, { ajk }, { rancangan }, sesi] = await Promise.all([
    muatRisiko(), muatAsasPanel(), muatRancangan(), sesiSemasa(),
  ]);
  const pengerusi = sesi?.peranan === "pengerusi";
  const berlaku = risiko.filter((r) => r.status === "berlaku");
  const lain = risiko.filter((r) => r.status !== "berlaku");

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Pelan sandaran</h1>
      <p className="mb-8 max-w-[62ch] text-sm text-teks-lembut">
        Senarai benda yang mungkin tak jadi macam dirancang, dan apa yang kena buat kalau ia berlaku.
        Setiap satu ada orang yang jaga. Kalau ada yang mula berlaku, tukar statusnya supaya semua tahu.
        Boleh juga kaitkan terus dengan satu kerja dalam tab Agihan Kerja.
      </p>

      {pengerusi && <BorangRisiko ajk={ajk} rancangan={rancangan} />}

      {berlaku.length > 0 && (
        <>
          <h2 className="mb-3 text-[1.3rem] text-tanah">Tengah berlaku sekarang</h2>
          <div className="mb-10 grid gap-4 lg:grid-cols-2">
            {berlaku.map((r) => (
              <KadRisiko key={r.id} risiko={r} ajk={ajk} rancangan={rancangan} pengerusi={pengerusi} />
            ))}
          </div>
        </>
      )}

      {risiko.length === 0 ? (
        <p className="kotak text-teks-lembut">
          Belum ada pelan sandaran lagi. {pengerusi ? "Guna butang di atas untuk mula." : "Tanya Pengerusi untuk tambah."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lain.map((r) => (
            <KadRisiko key={r.id} risiko={r} ajk={ajk} rancangan={rancangan} pengerusi={pengerusi} />
          ))}
        </div>
      )}
    </main>
  );
}
