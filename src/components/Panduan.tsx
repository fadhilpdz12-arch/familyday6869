import Link from "next/link";
import { Jata } from "@/components/Jata";
import { ACARA, PANDUAN } from "@/lib/acara";

export function Panduan() {
  return (
    <section className="sek sek-gelap">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Sebelum bertolak</h2>
        </div>
        <div className="grid gap-[26px] sm:grid-cols-2 lg:grid-cols-4">
          {PANDUAN.map((p) => (
            <div key={p.tajuk}>
              <h3 className="mb-2 text-[1.16rem]">{p.tajuk}</h3>
              <ul className="m-0 list-disc pl-[18px] text-[14.5px] leading-[1.7] text-atas-gelap-lembut">
                {p.butir.map((b) => <li key={b} className="mb-[5px]">{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Kaki() {
  return (
    <footer className="bg-lagun-dalam pb-10 text-center text-atas-gelap-lembut">
      <span className="jalur mb-11 block" aria-hidden="true" />
      <div className="wrap">
        <Jata className="mx-auto mb-5 w-24 text-tembaga" />
        <h3 className="mb-2 font-display text-[1.35rem] text-kerang-terang">{ACARA.tajuk}</h3>
        <p className="mx-auto mb-2 max-w-[44ch] text-sm">
          {ACARA.keluarga} — {ACARA.tempat}, {ACARA.daerah}. {ACARA.julatTarikh}.
        </p>
        <p className="mt-[22px] font-display text-[1.05rem] text-tembaga-muda">
          Semoga dipertemukan dalam keadaan sihat dan bahagia.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={ACARA.pautanPeta} target="_blank" rel="noreferrer" className="btn btn-garis">
            📍 Lokasi (Google Maps)
          </a>
          <Link href="/ajk" className="btn btn-garis">Panel AJK</Link>
        </div>

        <p className="mt-6 text-[12.5px] opacity-60">
          Diselenggara oleh jawatankuasa Family Day 2026.
        </p>
      </div>
    </footer>
  );
}
