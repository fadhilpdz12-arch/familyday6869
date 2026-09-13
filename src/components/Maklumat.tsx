import { ACARA } from "@/lib/acara";
import { ringgit } from "@/lib/format";

const FAKTA = [
  { dt: "Tarikh", dd: ACARA.julatTarikh, kecil: `Jumaat hingga Ahad · ${ACARA.tempoh}` },
  { dt: "Tempat", dd: ACARA.tempat, kecil: ACARA.daerah },
  { dt: "Penginapan", dd: "11 bilik + 1 homestay", kecil: "Semua bilik berhawa dingin" },
  { dt: "Yuran seorang", dd: ringgit(ACARA.yuranDewasa), kecil: "Dewasa sahaja · kanak-kanak percuma" },
];

export function Maklumat() {
  return (
    <section id="maklumat" className="sek sek-terang">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Perkara yang perlu semua tahu</h2>
          <p>Empat maklumat asas. Kalau ada satu benda saja yang sempat dibaca sebelum bertolak, ini dia.</p>
        </div>

        <dl className="grid grid-cols-2 border-t border-[var(--garis-gelap)] md:grid-cols-4">
          {FAKTA.map((f, i) => (
            <div
              key={f.dt}
              className={`border-b border-[var(--garis-gelap)] px-5 py-[22px] ${
                i % 2 === 0 ? "border-r md:border-r" : "md:border-r"
              } ${i === FAKTA.length - 1 ? "md:border-r-0" : ""} border-[var(--garis-gelap)]`}
            >
              <dt className="mb-[7px] text-[12.5px] tracking-wide text-teks-lembut">{f.dt}</dt>
              <dd className="m-0 font-display text-[clamp(1.05rem,2.7vw,1.32rem)] leading-tight">
                {f.dd}
                <small className="mt-[5px] block font-sans text-[13px] text-teks-lembut">{f.kecil}</small>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
