import { muatAsasPanel, muatPetugas, muatRancangan, muatRisiko } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { BorangRancangan } from "@/app/ajk/papan/kerja/BorangRancangan";
import { JadualPetugas } from "@/app/ajk/papan/kerja/JadualPetugas";
import { KadRancangan } from "@/app/ajk/papan/kerja/KadRancangan";
import { SalinRingkasan } from "@/app/ajk/papan/kerja/SalinRingkasan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agihan Kerja" };

export default async function HalamanKerja({
  searchParams,
}: {
  searchParams: Promise<{ biro?: string }>;
}) {
  const [{ biro, ajk }, { rancangan, pautan, pic, bahan }, petugas, risiko, sesi, tapis] = await Promise.all([
    muatAsasPanel(), muatRancangan(), muatPetugas(), muatRisiko(), sesiSemasa(), searchParams,
  ]);

  const pengerusi = sesi?.peranan === "pengerusi";
  const ditapis = tapis.biro ? rancangan.filter((r) => String(r.biro_id) === tapis.biro) : rancangan;

  const belumAdaPic = rancangan.filter((r) => !pic.some((p) => p.rancangan_id === r.id)).length;
  const belumSandaran = rancangan.filter((r) => !r.pelan_sandaran).length;

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Agihan Kerja</h1>
      <p className="mb-2 max-w-[68ch] text-sm text-teks-lembut">
        Sini tempat Pengerusi agihkan kerja terperinci untuk setiap biro — lengkap dengan pautan rujukan
        (cth: video game), senarai bahan, siapa PIC, dan pelan sandaran kalau ada halangan macam hujan.
        Siapa emcee dan PIC keseluruhan untuk setiap hari pun ditetapkan kat sini.
      </p>
      {(belumAdaPic > 0 || belumSandaran > 0) && (
        <p className="mb-7 text-[13px] text-tanah">
          {belumAdaPic > 0 && <>{belumAdaPic} kerja belum ada PIC. </>}
          {belumSandaran > 0 && <>{belumSandaran} kerja belum ada pelan sandaran.</>}
        </p>
      )}

      <h2 className="mb-3 text-[1.4rem]">Petugas ikut hari</h2>
      <JadualPetugas petugas={petugas} ajk={ajk} pengerusi={pengerusi} />

      <div className="mb-8 flex flex-wrap gap-2">
        <SalinRingkasan hari={1} petugas={petugas} rancangan={rancangan} ajk={ajk} biro={biro} />
        <SalinRingkasan hari={2} petugas={petugas} rancangan={rancangan} ajk={ajk} biro={biro} />
        <SalinRingkasan hari={3} petugas={petugas} rancangan={rancangan} ajk={ajk} biro={biro} />
      </div>

      <div className="mb-7 flex items-baseline justify-between gap-3">
        <h2 className="text-[1.4rem]">Kerja & aktiviti ikut biro</h2>
      </div>

      {pengerusi && <BorangRancangan biro={biro} biroDicadang={Number(tapis.biro) || undefined} />}

      <div className="mb-7 flex flex-wrap gap-2 text-[13px]">
        <a href="/ajk/papan/kerja" className={`btn btn-halus ${!tapis.biro ? "border-tembaga" : ""}`}>Semua biro</a>
        {biro.map((b) => (
          <a key={b.id} href={`/ajk/papan/kerja?biro=${b.id}`}
             className={`btn btn-halus ${tapis.biro === String(b.id) ? "border-tembaga" : ""}`}>
            {b.nama}
          </a>
        ))}
      </div>

      {ditapis.length === 0 ? (
        <p className="kotak text-teks-lembut">
          Belum ada kerja disusun {tapis.biro ? "untuk biro ni" : "lagi"}.
          {pengerusi && " Guna butang di atas untuk mula tambah."}
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {ditapis.map((r) => (
            <KadRancangan
              key={r.id}
              rancangan={r}
              pautan={pautan.filter((p) => p.rancangan_id === r.id)}
              pic={pic.filter((p) => p.rancangan_id === r.id)}
              bahan={bahan.filter((b) => b.rancangan_id === r.id)}
              risikoKait={risiko.filter((x) => x.rancangan_id === r.id)}
              ajkSemua={ajk}
              pengerusi={pengerusi}
              bolehUrusItem={pengerusi || pic.some((p) => p.rancangan_id === r.id && p.ajk_id === sesi?.ahliId)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
