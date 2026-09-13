"use client";

import { useActionState } from "react";
import { hantarKehadiran } from "@/tindakan/kehadiran";
import { ButangHantar, Mesej, Ralat } from "@/components/ui";
import { LABEL_BILIK, LABEL_STATUS, LABEL_TIBA, ringgit } from "@/lib/format";
import { ACARA } from "@/lib/acara";
import type { KehadiranAwam, StatistikAwam } from "@/lib/database.types";

export function Kehadiran({
  senarai,
  statistik,
}: {
  senarai: KehadiranAwam[];
  statistik: StatistikAwam;
}) {
  const [keputusan, tindakan] = useActionState(hantarKehadiran, null);
  const medan = keputusan && !keputusan.ok ? keputusan.medan : undefined;

  return (
    <section id="kehadiran" className="sek">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Sahkan kehadiran</h2>
          <p>
            Satu borang untuk satu keluarga. Hantar semula dengan nama sama untuk mengemas kini.
            Nombor telefon anda hanya dilihat oleh AJK, bukan orang awam.
          </p>
        </div>

        <form action={tindakan} className="kotak mb-11">
          <Mesej keputusan={keputusan} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="medan">
              <label htmlFor="nama_keluarga">Nama ketua keluarga *</label>
              <input id="nama_keluarga" name="nama_keluarga" required minLength={3} maxLength={80}
                     autoComplete="name" placeholder="Contoh: Ahmad bin Mat Daud"
                     aria-invalid={Boolean(medan?.nama_keluarga)} />
              <Ralat medan={medan} nama="nama_keluarga" />
            </div>

            <div className="medan">
              <label htmlFor="telefon">Nombor telefon *</label>
              <input id="telefon" name="telefon" type="tel" required inputMode="tel"
                     autoComplete="tel" placeholder="011-2345 678"
                     aria-invalid={Boolean(medan?.telefon)} />
              <Ralat medan={medan} nama="telefon" />
            </div>

            <fieldset className="medan sm:col-span-2 border-0 p-0 m-0">
              <legend className="mb-2 text-[13.5px] font-semibold">Adakah anda hadir?</legend>
              <div className="flex flex-wrap gap-2.5">
                {(Object.keys(LABEL_STATUS) as (keyof typeof LABEL_STATUS)[]).map((s, i) => (
                  <label key={s} className="pil relative">
                    <input type="radio" name="status" value={s} defaultChecked={i === 0} />
                    <span>{LABEL_STATUS[s]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="medan">
              <label htmlFor="dewasa">Bilangan dewasa</label>
              <input id="dewasa" name="dewasa" type="number" min={0} max={30} defaultValue={2} inputMode="numeric"
                     aria-invalid={Boolean(medan?.dewasa)} />
              <small>Yuran {ringgit(ACARA.yuranDewasa)} seorang dewasa</small>
              <Ralat medan={medan} nama="dewasa" />
            </div>

            <div className="medan">
              <label htmlFor="kanak">Bilangan kanak-kanak</label>
              <input id="kanak" name="kanak" type="number" min={0} max={30} defaultValue={0} inputMode="numeric" />
              <small>12 tahun ke bawah, tiada yuran</small>
            </div>

            <div className="medan">
              <label htmlFor="bilik">Keperluan penginapan</label>
              <select id="bilik" name="bilik" defaultValue="kongsi">
                {(Object.keys(LABEL_BILIK) as (keyof typeof LABEL_BILIK)[]).map((b) => (
                  <option key={b} value={b}>{LABEL_BILIK[b]}</option>
                ))}
              </select>
            </div>

            <div className="medan">
              <label htmlFor="tiba">Anggaran waktu tiba</label>
              <select id="tiba" name="tiba" defaultValue="11dis_petang">
                {(Object.keys(LABEL_TIBA) as (keyof typeof LABEL_TIBA)[]).map((t) => (
                  <option key={t} value={t}>{LABEL_TIBA[t]}</option>
                ))}
              </select>
            </div>

            <div className="medan sm:col-span-2">
              <label htmlFor="nota">Apa-apa yang AJK perlu tahu</label>
              <textarea id="nota" name="nota" maxLength={500}
                        placeholder="Contoh: bawa ibu yang guna kerusi roda, atau ada anak alah kacang." />
              <small>Hanya AJK boleh baca ruangan ini.</small>
            </div>

            <div className="sm:col-span-2">
              <ButangHantar>Hantar pengesahan</ButangHantar>
            </div>
          </div>
        </form>

        <div className="mb-[18px] flex flex-wrap items-baseline gap-x-8 gap-y-3 text-sm text-teks-lembut">
          <div><b className="mr-1.5 font-display text-[1.7rem] font-normal text-lagun">{statistik.keluarga}</b>keluarga sudah sahkan</div>
          <div><b className="mr-1.5 font-display text-[1.7rem] font-normal text-lagun">{statistik.dewasa}</b>dewasa</div>
          <div><b className="mr-1.5 font-display text-[1.7rem] font-normal text-lagun">{statistik.kanak}</b>kanak-kanak</div>
          <div><b className="mr-1.5 font-display text-[1.7rem] font-normal text-lagun">{ringgit(Number(statistik.kutipan_dijangka))}</b>anggaran kutipan</div>
        </div>

        {senarai.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--garis-gelap)] px-4 py-[34px] text-center text-teks-lembut">
            Belum ada pengesahan. Jadilah keluarga pertama yang mengisi borang di atas.
          </p>
        ) : (
          <table className="w-full border-collapse text-[14.5px]">
            <caption className="sr-only">Senarai keluarga yang telah mengesahkan kehadiran</caption>
            <thead>
              <tr className="hidden sm:table-row">
                {["Keluarga", "Dewasa", "Kanak", "Penginapan", "Status"].map((h) => (
                  <th key={h} className="border-b-[1.5px] border-[var(--garis-gelap)] pb-2.5 pr-3 text-left text-[12.5px] font-bold tracking-wide text-teks-lembut">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {senarai.map((r) => (
                <tr key={r.id} className="block border-b border-[var(--garis-gelap)] py-3.5 sm:table-row sm:py-0">
                  <td className="block font-display text-[16.5px] sm:table-cell sm:border-b sm:border-[var(--garis-gelap)] sm:py-3.5 sm:pr-3 sm:font-sans sm:text-[14.5px] sm:font-semibold">
                    {r.nama_keluarga}
                  </td>
                  <td className="flex justify-between sm:table-cell sm:w-16 sm:border-b sm:border-[var(--garis-gelap)] sm:py-3.5 sm:text-center angka-jadual">
                    <span className="text-[13px] text-teks-lembut sm:hidden">Dewasa</span>{r.dewasa}
                  </td>
                  <td className="flex justify-between sm:table-cell sm:w-16 sm:border-b sm:border-[var(--garis-gelap)] sm:py-3.5 sm:text-center angka-jadual">
                    <span className="text-[13px] text-teks-lembut sm:hidden">Kanak-kanak</span>{r.kanak}
                  </td>
                  <td className="flex justify-between gap-4 text-right sm:table-cell sm:border-b sm:border-[var(--garis-gelap)] sm:py-3.5 sm:pr-3 sm:text-left">
                    <span className="text-[13px] text-teks-lembut sm:hidden">Penginapan</span>
                    <span>{LABEL_BILIK[r.bilik]}<small className="block text-[12.5px] text-teks-lembut">{LABEL_TIBA[r.tiba]}</small></span>
                  </td>
                  <td className="flex justify-between sm:table-cell sm:border-b sm:border-[var(--garis-gelap)] sm:py-3.5">
                    <span className="text-[13px] text-teks-lembut sm:hidden">Status</span>{LABEL_STATUS[r.status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
