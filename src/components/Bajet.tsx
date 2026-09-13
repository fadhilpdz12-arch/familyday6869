import type { BarisBajet } from "@/lib/database.types";
import { ringgit } from "@/lib/format";

const PECAHAN = [
  ["Malam BBQ (hari 1)", 900],
  ["Sarapan × 2 hari", 600],
  ["Makan tengah hari × 2", 800],
  ["Makan malam hari kedua", 500],
  ["Air, minum petang & snek", 400],
  ["Hadiah sukaneka & cabutan bertuah", 360],
  ["Simpanan kecemasan", 100],
] as const;

export function Bajet({ baris }: { baris: BarisBajet[] }) {
  const jumlah = baris.find((b) => b.jenis === "jumlah");
  const totalPecahan = PECAHAN.reduce((a, [, n]) => a + n, 0);

  return (
    <section id="bajet" className="sek sek-terang pt-0">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Bajet secara terbuka</h2>
          <p>Semua nombor dipaparkan supaya tiada siapa perlu bertanya duit pergi ke mana.</p>
        </div>

        <div className="grid items-start gap-11 lg:grid-cols-[1.15fr_.85fr]">
          <ul className="m-0 list-none border-t border-[var(--garis-gelap)] p-0">
            {baris.map((b) => (
              <li
                key={b.id}
                className={`flex items-baseline justify-between gap-[18px] py-[15px] text-[15.5px] ${
                  b.jenis === "jumlah"
                    ? "border-b-2 border-lagun pt-[19px]"
                    : "border-b border-[var(--garis-gelap)]"
                }`}
              >
                <span className={b.jenis === "jumlah" ? "font-bold" : ""}>
                  {b.label}
                  {b.keterangan && (
                    <em className="mt-0.5 block text-[13px] not-italic text-teks-lembut">{b.keterangan}</em>
                  )}
                </span>
                <span
                  className={`whitespace-nowrap font-display angka-jadual ${
                    b.jenis === "jumlah" ? "text-2xl text-lagun" : "text-[1.16rem]"
                  } ${b.jenis === "tolak" ? "text-rhu" : ""}`}
                >
                  {b.jenis === "tolak" ? "− " : ""}
                  {ringgit(Number(b.amaun))}
                </span>
              </li>
            ))}
          </ul>

          <aside className="rounded-[14px] bg-lagun px-6 py-[26px] text-atas-gelap">
            <h3 className="text-[1.15rem] text-kerang-terang">Cadangan pecahan perbelanjaan</h3>
            <p className="my-2.5 font-display text-[clamp(2.2rem,8vw,3rem)] leading-none text-tembaga-muda">
              {ringgit(Number(jumlah?.amaun ?? totalPecahan))}
            </p>
            <p className="text-[13.5px] text-atas-gelap-lembut">
              Pecahan ini cadangan untuk membantu Bendahari bermula. Boleh diubah selagi jumlahnya kekal.
            </p>
            <ul className="mt-5 list-none border-t border-[rgba(201,150,47,.25)] p-0 pt-[18px]">
              {PECAHAN.map(([label, amaun]) => (
                <li key={label} className="flex justify-between gap-3.5 py-[7px] text-sm">
                  <span>{label}</span>
                  <b className="font-semibold text-kerang-terang angka-jadual">{ringgit(amaun)}</b>
                </li>
              ))}
              <li className="mt-2 flex justify-between gap-3.5 border-t border-[rgba(201,150,47,.25)] pt-3 text-sm">
                <span>Jumlah</span>
                <b className="font-semibold text-kerang-terang angka-jadual">{ringgit(totalPecahan)}</b>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
