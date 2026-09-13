import type { KemajuanBiro } from "@/lib/database.types";

/** Laman awam nampak peratus siap setiap biro sahaja — bukan butiran tugas. */
export function Kemajuan({ senarai }: { senarai: KemajuanBiro[] }) {
  const jumlah = senarai.reduce((a, b) => a + b.jumlah, 0);
  const siap = senarai.reduce((a, b) => a + b.selesai, 0);
  const peratus = jumlah ? Math.round((siap / jumlah) * 100) : 0;

  return (
    <section className="sek sek-terang">
      <div className="wrap wrap-sempit">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Sejauh mana persediaan</h2>
          <p>
            AJK kemas kini kerja mereka setiap hari. Ini gambaran ringkas untuk semua orang —
            butiran penuh ada dalam panel AJK.
          </p>
        </div>

        <div className="mb-9">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[2.4rem] leading-none text-lagun">{peratus}%</span>
            <span className="text-sm text-teks-lembut">{siap} daripada {jumlah} tugas dah siap</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--garis-gelap)]"
               role="progressbar" aria-valuenow={peratus} aria-valuemin={0} aria-valuemax={100}
               aria-label="Kemajuan keseluruhan">
            <span className="block h-full rounded-full bg-rhu" style={{ width: `${peratus}%` }} />
          </div>
        </div>

        <ul className="m-0 list-none border-t border-[var(--garis-gelap)] p-0">
          {senarai.map((b) => {
            const p = b.jumlah ? Math.round((b.selesai / b.jumlah) * 100) : 0;
            return (
              <li key={b.biro_id} className="border-b border-[var(--garis-gelap)] py-4">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold">{b.biro}</span>
                  <span className="text-sm text-teks-lembut">
                    {b.selesai}/{b.jumlah}
                    {b.tersekat > 0 && <span className="ml-2 text-tanah">· {b.tersekat} tersekat</span>}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--garis-gelap)]">
                  <span className={`block h-full rounded-full ${b.tersekat > 0 ? "bg-tanah" : "bg-rhu"}`}
                        style={{ width: `${p}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
