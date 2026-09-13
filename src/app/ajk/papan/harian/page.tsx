import { laporanHariIni, muatAsasPanel, muatKemaskini } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { BorangKemaskini } from "@/app/ajk/papan/harian/BorangKemaskini";
import { LABEL_KEMASKINI, tarikhMY } from "@/lib/format";
import type { JenisKemaskini } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Update harian" };

const WARNA: Record<JenisKemaskini, string> = {
  kemajuan: "bg-[rgba(78,133,119,.16)] text-[#255e4f]",
  masalah: "bg-[rgba(168,67,47,.12)] text-[#8a3524]",
  selesai: "bg-[rgba(201,150,47,.18)] text-[#8a6412]",
  maklumat: "bg-[rgba(21,43,44,.08)] text-teks-lembut",
};

export default async function HalamanHarian() {
  const [{ kemaskini: hariIni, belumLapor }, semua, { tugasan }, sesi] = await Promise.all([
    laporanHariIni(), muatKemaskini(80), muatAsasPanel(), sesiSemasa(),
  ]);

  const tugasSaya = tugasan.filter((t) => t.ditugaskan_kepada === sesi?.ahliId && t.status !== "selesai");
  const semalamKeBawah = semua.filter((k) => !hariIni.some((h) => h.id === k.id));

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">Update harian</h1>
      <p className="mb-7 text-sm text-teks-lembut">
        Setiap AJK lapor sekali sehari. Pengerusi tengok sini untuk tahu siapa jalan, siapa tersekat.
      </p>

      <BorangKemaskini tugasSaya={tugasSaya} />

      {belumLapor.length > 0 && (
        <div className="mb-9 rounded-xl border border-tanah bg-[rgba(168,67,47,.06)] p-5">
          <h2 className="mb-2 text-[1.15rem] text-[#8a3524]">Belum lapor hari ni</h2>
          <p className="flex flex-wrap gap-2">
            {belumLapor.map((a) => (
              <span key={a.id} className="rounded-full bg-white px-3 py-1 text-[13.5px]">{a.nama}</span>
            ))}
          </p>
        </div>
      )}

      <h2 className="mb-4 text-[1.4rem]">Hari ini</h2>
      {hariIni.length === 0 ? (
        <p className="kotak mb-10 text-teks-lembut">Belum ada sesiapa lapor hari ni. Jadi yang pertama.</p>
      ) : (
        <ul className="mb-10 grid list-none gap-3 p-0 lg:grid-cols-2">
          {hariIni.map((k) => (
            <li key={k.id} className="rounded-xl border border-[var(--garis-gelap)] bg-kerang-terang p-4">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <b className="text-[14px]">{k.nama_paparan}</b>
                <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${WARNA[k.jenis]}`}>
                  {LABEL_KEMASKINI[k.jenis]}
                </span>
                <span className="ml-auto text-[12px] text-teks-lembut">{tarikhMY(k.dicipta)}</span>
              </div>
              <p className="text-[14.5px] leading-relaxed">{k.teks}</p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-4 text-[1.4rem]">Sebelum ni</h2>
      {semalamKeBawah.length === 0 ? (
        <p className="kotak text-teks-lembut">Takde rekod lama lagi.</p>
      ) : (
        <ul className="grid list-none gap-3 p-0 lg:grid-cols-2">
          {semalamKeBawah.map((k) => (
            <li key={k.id} className="rounded-xl border border-[var(--garis-gelap)] bg-white p-4">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <b className="text-[14px]">{k.nama_paparan}</b>
                <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${WARNA[k.jenis]}`}>
                  {LABEL_KEMASKINI[k.jenis]}
                </span>
                <span className="ml-auto text-[12px] text-teks-lembut">{tarikhMY(k.dicipta)}</span>
              </div>
              <p className="text-[14.5px] leading-relaxed">{k.teks}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
