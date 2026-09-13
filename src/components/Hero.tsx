import { Jata } from "@/components/Jata";
import { KiraDetik } from "@/components/KiraDetik";
import { ACARA } from "@/lib/acara";

export function Hero() {
  return (
    <header id="atas" className="relative overflow-hidden bg-lagun-dalam text-center text-atas-gelap">
      <span className="jalur" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_-8%,rgba(201,150,47,.22),transparent_62%),radial-gradient(70%_50%_at_50%_108%,rgba(78,133,119,.3),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-[840px] px-[22px] pb-[60px] pt-[52px]">
        <Jata className="muncul mx-auto mb-[26px] h-auto w-[min(220px,52vw)] text-tembaga" />

        <h1 className="muncul d1 mb-1.5 text-[clamp(2.55rem,9.5vw,4.6rem)] leading-[1.02] text-kerang-terang">
          {ACARA.tajuk}
        </h1>
        <p className="muncul d1 mb-5 font-display text-[clamp(1.02rem,3.6vw,1.42rem)] leading-snug text-tembaga-muda">
          {ACARA.keluarga}
        </p>

        <div className="muncul d2 mb-[30px] flex flex-wrap justify-center gap-x-7 gap-y-2.5 text-[14.5px] text-atas-gelap-lembut">
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0 text-tembaga" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
            </svg>
            {ACARA.julatTarikh} · {ACARA.tempoh}
          </span>
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0 text-tembaga" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" /><circle cx="12" cy="10" r="2.8" />
            </svg>
            {ACARA.tempat}, {ACARA.daerah.split(",")[0]}
          </span>
        </div>

        <div className="muncul d2"><KiraDetik /></div>

        <div className="muncul d3 flex flex-wrap justify-center gap-3">
          <a href="#kehadiran" className="btn btn-utama">Sahkan kehadiran</a>
          <a href="#tentatif" className="btn btn-garis">Lihat tentatif</a>
        </div>
      </div>
      <span className="jalur jalur-balik" aria-hidden="true" />
    </header>
  );
}
