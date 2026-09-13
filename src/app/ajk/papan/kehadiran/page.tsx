import { muatKehadiranPenuh } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { BarisKehadiran } from "@/app/ajk/papan/kehadiran/BarisKehadiran";
import { LABEL_BILIK, LABEL_STATUS, ringgit } from "@/lib/format";
import { ACARA } from "@/lib/acara";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kehadiran" };

export default async function HalamanKehadiran() {
  const [{ kehadiran, statistik }, sesi] = await Promise.all([muatKehadiranPenuh(), sesiSemasa()]);

  const belumBayar = kehadiran.filter((k) => k.status !== "tidak_hadir" && !k.sudah_bayar);
  const tertunggak = belumBayar.reduce((a, k) => a + Number(k.yuran), 0);

  const kad = [
    { label: "Keluarga dah sahkan", nilai: String(statistik.keluarga) },
    { label: "Dewasa / budak", nilai: `${statistik.dewasa} / ${statistik.kanak}` },
    { label: "Duit dah masuk", nilai: ringgit(Number(statistik.kutipan_diterima)) },
    { label: "Masih tertunggak", nilai: ringgit(tertunggak) },
  ];

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Kehadiran &amp; bayaran</h1>
      <p className="mb-7 text-sm text-teks-lembut">
        Yuran {ringgit(ACARA.yuranDewasa)} seorang dewasa · tarikh akhir {ACARA.tarikhAkhirBayaran}
      </p>

      <div className="mb-9 grid gap-px bg-[var(--garis-gelap)] sm:grid-cols-2 lg:grid-cols-4">
        {kad.map((k) => (
          <div key={k.label} className="bg-kerang-terang px-5 py-6">
            <div className="font-display text-[1.7rem] leading-none text-lagun angka-jadual">{k.nilai}</div>
            <div className="mt-2 text-[13px] text-teks-lembut">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-baseline gap-4">
        <h2 className="text-[1.4rem]">Senarai penuh</h2>
        <a href="/ajk/papan/kehadiran/eksport" className="btn btn-halus" download>Muat turun CSV</a>
      </div>

      {kehadiran.length === 0 ? (
        <p className="kotak text-teks-lembut">Belum ada sesiapa sahkan kehadiran lagi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr>
                {["Keluarga", "Telefon", "Status", "Dewasa", "Budak", "Penginapan", "Yuran", "Bayaran", ""].map((h) => (
                  <th key={h} className="border-b-[1.5px] border-[var(--garis-gelap)] px-2 pb-2.5 text-left text-[12.5px] font-bold text-teks-lembut">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kehadiran.map((k) => (
                <BarisKehadiran
                  key={k.id} rekod={k}
                  labelStatus={LABEL_STATUS[k.status]}
                  labelBilik={LABEL_BILIK[k.bilik]}
                  bolehPadam={sesi?.peranan === "pengerusi"}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
