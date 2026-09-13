"use client";

import { useActionState, useEffect, useState } from "react";
import { tambahBarang, hantarCadangan } from "@/tindakan/persiapan";
import { ButangHantar, Mesej } from "@/components/ui";
import { supabasePelayar } from "@/lib/supabase/pelayar";
import type { Barang, Cadangan } from "@/lib/database.types";

function useLangganan<T extends { id: string }>(jadual: string, awal: T[]) {
  const [baris, setBaris] = useState(awal);
  useEffect(() => setBaris(awal), [awal]);
  useEffect(() => {
    const sb = supabasePelayar();
    if (!sb) return;
    const saluran = sb
      .channel(`${jadual}-langsung`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: jadual }, (m) => {
        const baharu = m.new as T;
        setBaris((s) => (s.some((x) => x.id === baharu.id) ? s : [baharu, ...s]));
      })
      .subscribe();
    return () => { void sb.removeChannel(saluran); };
  }, [jadual]);
  return baris;
}

export function Persiapan({ barang, cadangan }: { barang: Barang[]; cadangan: Cadangan[] }) {
  const [hasilBarang, tindakanBarang] = useActionState(tambahBarang, null);
  const [hasilCadangan, tindakanCadangan] = useActionState(hantarCadangan, null);
  const senaraiBarang = useLangganan<Barang>("barang", barang);
  const senaraiCadangan = useLangganan<Cadangan>("cadangan", cadangan);

  return (
    <section id="persiapan" className="sek sek-terang">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Persiapan bersama</h2>
          <p>Dua ruang untuk elak benda bertindih: satu untuk isytihar apa yang anda bawa, satu lagi untuk cadangan aktiviti.</p>
        </div>

        <div className="grid gap-px bg-[var(--garis-gelap)] lg:grid-cols-2">
          <div className="bg-kerang-terang px-7 py-[30px]">
            <h3 className="mb-1.5 text-[1.4rem]">Saya bawa apa</h3>
            <p className="mb-[18px] text-[14.5px] text-teks-lembut">
              Tengok dulu apa orang lain dah bawa. Elak lima orang bawa air kotak yang sama.
            </p>
            <form action={tindakanBarang} className="flex flex-col gap-4">
              <Mesej keputusan={hasilBarang} />
              <div className="medan">
                <label htmlFor="b-nama">Nama</label>
                <input id="b-nama" name="nama" required minLength={2} maxLength={60} placeholder="Nama anda" />
              </div>
              <div className="medan">
                <label htmlFor="b-barang">Barang yang dibawa</label>
                <input id="b-barang" name="barang" required minLength={2} maxLength={160} placeholder="Contoh: 2 tong ais + selimut lebih" />
              </div>
              <div><ButangHantar>Tambah ke senarai</ButangHantar></div>
            </form>

            <ul className="mt-5 flex max-h-[330px] list-none flex-col gap-3 overflow-auto p-0">
              {senaraiBarang.length === 0 ? (
                <li className="rounded-xl border border-dashed border-[var(--garis-gelap)] px-4 py-3.5 text-[14.5px] text-teks-lembut">
                  Senarai masih kosong. Tulis apa yang anda bawa supaya orang lain tak bawa benda sama.
                </li>
              ) : (
                senaraiBarang.map((b) => (
                  <li key={b.id} className="rounded-xl border border-[var(--garis-gelap)] bg-white px-[15px] py-3.5 text-[14.5px]">
                    <b className="mb-0.5 block text-[12.5px] font-bold text-tembaga">{b.nama}</b>
                    {b.barang}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="bg-kerang-terang px-7 py-[30px]">
            <h3 className="mb-1.5 text-[1.4rem]">Kotak cadangan</h3>
            <p className="mb-[18px] text-[14.5px] text-teks-lembut">
              Idea permainan, menu, atau apa-apa yang patut AJK pertimbang. Semua boleh baca.
            </p>
            <form action={tindakanCadangan} className="flex flex-col gap-4">
              <Mesej keputusan={hasilCadangan} />
              <div className="medan">
                <label htmlFor="c-nama">Nama</label>
                <input id="c-nama" name="nama" required minLength={2} maxLength={60} placeholder="Nama anda" />
              </div>
              <div className="medan">
                <label htmlFor="c-isi">Cadangan</label>
                <textarea id="c-isi" name="isi" required minLength={5} maxLength={600}
                          placeholder="Contoh: buat sesi salasilah keluarga malam kedua, sebab ramai cucu tak kenal sepupu sendiri." />
              </div>
              <div><ButangHantar>Hantar cadangan</ButangHantar></div>
            </form>

            <ul className="mt-5 flex max-h-[330px] list-none flex-col gap-3 overflow-auto p-0">
              {senaraiCadangan.length === 0 ? (
                <li className="rounded-xl border border-dashed border-[var(--garis-gelap)] px-4 py-3.5 text-[14.5px] text-teks-lembut">
                  Belum ada cadangan. Idea pertama selalunya yang paling dikenang.
                </li>
              ) : (
                senaraiCadangan.map((c) => (
                  <li key={c.id} className="rounded-xl border border-[var(--garis-gelap)] bg-white px-[15px] py-3.5 text-[14.5px]">
                    <b className="mb-0.5 block text-[12.5px] font-bold text-tembaga">{c.nama}</b>
                    {c.isi}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
