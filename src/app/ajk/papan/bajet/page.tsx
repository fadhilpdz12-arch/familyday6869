import { muatBajet } from "@/lib/data";
import { aksesSemasa, bolehUrusBayaran } from "@/lib/sesi-pelayan";
import { ringgit } from "@/lib/format";
import { BorangBajet } from "@/app/ajk/papan/bajet/BorangBajet";
import { KadBajet } from "@/app/ajk/papan/bajet/KadBajet";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bajet" };

export default async function HalamanBajet() {
  const [baris, akses] = await Promise.all([muatBajet(), aksesSemasa()]);
  const bolehUrus = await bolehUrusBayaran(akses);

  const masukBaris = baris.filter((b) => b.jenis === "masuk");
  const keluarBaris = baris.filter((b) => b.jenis === "keluar" || b.jenis === "tolak");
  const catatanBaris = baris.filter((b) => b.jenis === "jumlah");

  const masuk = masukBaris.reduce((a, b) => a + Number(b.amaun), 0);
  const keluar = keluarBaris.reduce((a, b) => a + Number(b.amaun), 0);
  const baki = masuk - keluar;
  const peratusBelanja = masuk > 0 ? Math.min(100, Math.round((keluar / masuk) * 100)) : 0;

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Bajet</h1>
      <p className="mb-7 max-w-[62ch] text-sm text-teks-lembut">
        Ni yang orang awam nampak kat laman utama (bahagian &ldquo;Bajet secara terbuka&rdquo;) — apa-apa
        perubahan di sini terus naik ke laman awam.
      </p>

      <div className="mb-3 grid gap-4 sm:grid-cols-3">
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

      {masuk > 0 && (
        <div className="mb-8">
          <div className="mb-1.5 flex items-baseline justify-between text-[12.5px] text-teks-lembut">
            <span>Kutipan dah dibelanja</span>
            <span className="font-semibold">{peratusBelanja}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(21,43,44,.08)]">
            <div
              className={`h-full rounded-full ${peratusBelanja >= 90 ? "bg-tanah" : "bg-lagun"}`}
              style={{ width: `${peratusBelanja}%` }}
            />
          </div>
        </div>
      )}

      {bolehUrus ? (
        <BorangBajet />
      ) : (
        <p className="kotak mb-8 text-[13.5px] text-teks-lembut">
          Hanya Pengerusi atau Bendahari boleh tambah/edit/padam baris bajet.
        </p>
      )}

      {baris.length === 0 ? (
        <p className="kotak text-teks-lembut">Belum ada baris bajet lagi.</p>
      ) : (
        <div className="flex flex-col gap-9">
          {masukBaris.length > 0 && (
            <section>
              <h2 className="mb-3 text-[1.15rem] text-[#255e4f]">💰 Pemasukan</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {masukBaris.map((b) => <KadBajet key={b.id} baris={b} bolehUrus={bolehUrus} />)}
              </ul>
            </section>
          )}

          {keluarBaris.length > 0 && (
            <section>
              <h2 className="mb-3 text-[1.15rem] text-tanah">💸 Perbelanjaan &amp; potongan</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {keluarBaris.map((b) => <KadBajet key={b.id} baris={b} bolehUrus={bolehUrus} />)}
              </ul>
            </section>
          )}

          {catatanBaris.length > 0 && (
            <section>
              <h2 className="mb-3 text-[1.15rem]">📌 Catatan</h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {catatanBaris.map((b) => <KadBajet key={b.id} baris={b} bolehUrus={bolehUrus} />)}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
