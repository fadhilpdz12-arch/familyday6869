import type { Ajk, Biro } from "@/lib/database.types";

const inisial = (nama: string) =>
  nama.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();

export function SenaraiAjk({ biro, ahli }: { biro: Biro[]; ahli: Ajk[] }) {
  const jumlahAhli = ahli.length;
  const jumlahKuota = biro.reduce((a, b) => a + b.kuota, 0);

  return (
    <section id="ajk" className="sek sek-gelap">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Jawatankuasa</h2>
          <p>Kalau ada soalan tentang satu bahagian, terus tanya orang dalam senarai itu — bukan tanya semua orang dalam kumpulan.</p>
        </div>

        <div className="mb-2 flex flex-wrap items-baseline gap-x-7 gap-y-2.5 border-b border-[var(--garis)] pb-[22px] pt-4 text-[14.5px] text-atas-gelap-lembut">
          <div><b className="mr-1.5 font-display text-[1.6rem] font-normal text-tembaga-muda">{jumlahAhli}</b>AJK bertugas</div>
          <div><b className="mr-1.5 font-display text-[1.6rem] font-normal text-tembaga-muda">{biro.length}</b>biro</div>
          <div><b className="mr-1.5 font-display text-[1.6rem] font-normal text-tembaga-muda">{Math.max(jumlahKuota - jumlahAhli, 0)}</b>kekosongan</div>
        </div>

        <div className="grid gap-px bg-[rgba(201,150,47,.16)] sm:grid-cols-2 lg:grid-cols-3">
          {biro.map((b) => {
            const senarai = ahli.filter((a) => a.biro_id === b.id).sort((x, y) => x.urutan - y.urutan);
            const kosong = Math.max(b.kuota - senarai.length, 0);
            return (
              <article key={b.id} className="bg-lagun px-[22px] py-6">
                <div className="mb-1 flex items-start gap-3">
                  <span className="mt-0.5 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-tembaga font-display text-[.95rem] text-tembaga">
                    {b.id}
                  </span>
                  <h3 className="text-[1.24rem]">{b.nama}</h3>
                  {kosong === 0 && (
                    <span className="ml-auto shrink-0 rounded-full bg-[rgba(78,133,119,.22)] px-2.5 py-[3px] text-[11.5px] font-bold text-[#9bd4c2]">
                      Penuh
                    </span>
                  )}
                </div>
                <p className="mb-4 ml-[43px] text-[13.5px] leading-relaxed text-atas-gelap-lembut">{b.tugas}</p>

                <ul className="ml-[43px] flex list-none flex-col gap-[9px] p-0">
                  {senarai.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 text-[15px]">
                      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[rgba(201,150,47,.18)] text-xs font-bold text-tembaga-muda">
                        {inisial(a.nama)}
                      </span>
                      {a.nama}
                      {a.peranan && <span className="ml-1 text-[12.5px] text-atas-gelap-lembut">{a.peranan}</span>}
                    </li>
                  ))}
                  {kosong > 0 && (
                    <li className="flex items-center gap-3 text-sm italic text-atas-gelap-lembut">
                      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-dashed border-[rgba(201,150,47,.4)] text-[rgba(201,150,47,.6)] not-italic">
                        +
                      </span>
                      {senarai.length === 0 ? "Biro ini belum ada ahli" : `${kosong} kekosongan`}
                    </li>
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
