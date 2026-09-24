import { muatBajet } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { ringgit } from "@/lib/format";
import { BorangBajet } from "@/app/ajk/papan/bajet/BorangBajet";
import { KadBajet } from "@/app/ajk/papan/bajet/KadBajet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bajet" };

export default async function HalamanBajet() {
  const [baris, sesi] = await Promise.all([muatBajet(), sesiSemasa()]);
  const pengerusi = sesi?.peranan === "pengerusi";

  const masuk = baris.filter((b) => b.jenis === "masuk").reduce((a, b) => a + Number(b.amaun), 0);
  const keluar = baris.filter((b) => b.jenis === "keluar" || b.jenis === "tolak").reduce((a, b) => a + Number(b.amaun), 0);
  const baki = masuk - keluar;

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Bajet</h1>
      <p className="mb-7 max-w-[62ch] text-sm text-teks-lembut">
        Ni yang orang awam nampak kat laman utama (bahagian &ldquo;Bajet secara terbuka&rdquo;) — apa-apa
        perubahan di sini terus naik ke laman awam.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="kotak">
          <p className="mb-1 text-[12.5px] font-semibold text-teks-lembut">Jumlah masuk</p>
          <p className="font-display angka-jadual text-2xl text-[#255e4f]">{ringgit(masuk)}</p>
        </div>
        <div className="kotak">
          <p className="mb-1 text-[12.5px] font-semibold text-teks-lembut">Jumlah keluar/tolak</p>
          <p className="font-display angka-jadual text-2xl text-tanah">{ringgit(keluar)}</p>
        </div>
        <div className="kotak">
          <p className="mb-1 text-[12.5px] font-semibold text-teks-lembut">Baki</p>
          <p className="font-display angka-jadual text-2xl">{ringgit(baki)}</p>
        </div>
      </div>

      {pengerusi ? (
        <BorangBajet />
      ) : (
        <p className="kotak mb-8 text-[13.5px] text-teks-lembut">
          Hanya Pengerusi boleh tambah/edit/padam baris bajet. Bagitahu Huda kalau ada perubahan.
        </p>
      )}

      {baris.length === 0 ? (
        <p className="kotak text-teks-lembut">Belum ada baris bajet lagi.</p>
      ) : pengerusi ? (
        <div className="flex flex-col">
          {baris.map((b) => <KadBajet key={b.id} baris={b} />)}
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col border-t border-[var(--garis-gelap)] p-0">
          {baris.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-4 border-b border-[var(--garis-gelap)] py-3 text-[14.5px]">
              <span className="font-semibold">{b.label}</span>
              {b.keterangan && <span className="text-[13px] text-teks-lembut">{b.keterangan}</span>}
              <span className="ml-auto font-display angka-jadual text-[1.05rem]">{ringgit(Number(b.amaun))}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
