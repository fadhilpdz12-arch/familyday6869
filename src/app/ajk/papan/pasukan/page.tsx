import { muatAsasPanel } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { BorangAhli, BarisAhli } from "@/app/ajk/papan/pasukan/UrusPasukan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pasukan" };

export default async function HalamanPasukan() {
  const [{ biro, ajk, tugasan }, sesi] = await Promise.all([muatAsasPanel(), sesiSemasa()]);
  const pengerusi = sesi?.peranan === "pengerusi";

  const kosongSemua = biro.reduce(
    (a, b) => a + Math.max(b.kuota - ajk.filter((x) => x.biro_id === b.id).length, 0), 0,
  );

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Pasukan</h1>
      <p className="mb-7 text-sm text-teks-lembut">
        {ajk.length} orang bertugas.
        {kosongSemua > 0 && <span className="text-tanah"> {kosongSemua} kekosongan lagi kena isi.</span>}
      </p>

      {pengerusi ? (
        <BorangAhli biro={biro} />
      ) : (
        <p className="mesej mesej-ok mb-9">
          Hanya Pengerusi boleh tambah atau pindah ahli. Kalau ada cadangan nama, beritahu Huda.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {biro.map((b) => {
          const senarai = ajk.filter((a) => a.biro_id === b.id);
          const kosong = Math.max(b.kuota - senarai.length, 0);
          return (
            <section key={b.id} className={`rounded-xl border p-5 ${kosong > 0 ? "border-tanah bg-[rgba(168,67,47,.04)]" : "border-[var(--garis-gelap)] bg-kerang-terang"}`}>
              <div className="mb-1 flex items-baseline gap-3">
                <h2 className="text-[1.2rem]">{b.nama}</h2>
                <span className="ml-auto text-[12.5px] text-teks-lembut">{senarai.length}/{b.kuota}</span>
              </div>
              <p className="mb-3 text-[13px] leading-relaxed text-teks-lembut">{b.tugas}</p>

              <ul className="m-0 list-none border-t border-[var(--garis-gelap)] p-0">
                {senarai.map((a) => (
                  <BarisAhli
                    key={a.id} ahli={a} biro={biro} bolehUrus={pengerusi}
                    tugas={tugasan.filter((t) => t.ditugaskan_kepada === a.id)}
                  />
                ))}
                {kosong > 0 && (
                  <li className="py-3 text-[13.5px] italic text-tanah">
                    {kosong} kekosongan — {senarai.length === 0 ? "biro ni belum ada sesiapa langsung" : "kena cari orang lagi"}
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
