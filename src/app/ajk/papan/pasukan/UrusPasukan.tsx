"use client";

import { useActionState, useRef, useTransition } from "react";
import { tambahAhli, pindahBiro, buangAhli } from "@/tindakan/pasukan";
import { ButangHantar, Mesej } from "@/components/ui";
import type { Ajk, Biro, Tugasan } from "@/lib/database.types";

export function BorangAhli({ biro, biroDicadang }: { biro: Biro[]; biroDicadang?: number }) {
  const [keputusan, tindakan] = useActionState(tambahAhli, null);
  const borang = useRef<HTMLFormElement>(null);

  return (
    <form ref={borang} action={async (d) => { await tindakan(d); borang.current?.reset(); }} className="kotak mb-9">
      <h2 className="mb-1 text-[1.3rem]">Masukkan orang baru</h2>
      <p className="mb-4 text-sm text-teks-lembut">
        Isi kekosongan biro. Lepas masuk, dia terus boleh log masuk guna namanya sendiri.
      </p>
      <Mesej keputusan={keputusan} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="medan">
          <label htmlFor="a-nama">Nama</label>
          <input id="a-nama" name="nama" required minLength={2} maxLength={60} placeholder="Contoh: Amir" />
        </div>
        <div className="medan">
          <label htmlFor="a-biro">Masuk biro mana</label>
          <select id="a-biro" name="biro_id" required defaultValue={biroDicadang ?? ""}>
            <option value="" disabled>— Pilih biro —</option>
            {biro.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
        </div>
        <div className="medan">
          <label htmlFor="a-peranan">Tugas khusus (tak wajib)</label>
          <input id="a-peranan" name="peranan" maxLength={60} placeholder="Contoh: pegang kamera" />
        </div>
        <div className="medan">
          <label htmlFor="a-tel">Nombor telefon (tak wajib)</label>
          <input id="a-tel" name="telefon" type="tel" maxLength={20} placeholder="011-2345 678" />
        </div>
        <div className="sm:col-span-2"><ButangHantar>Masukkan dalam pasukan</ButangHantar></div>
      </div>
    </form>
  );
}

export function BarisAhli({
  ahli, biro, tugas, bolehUrus,
}: {
  ahli: Ajk; biro: Biro[]; tugas: Tugasan[]; bolehUrus: boolean;
}) {
  const [menunggu, mula] = useTransition();
  const siap = tugas.filter((t) => t.status === "selesai").length;
  const tersekat = tugas.filter((t) => t.status === "tersekat").length;

  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-[var(--garis-gelap)] py-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[rgba(201,150,47,.18)] text-[13px] font-bold text-[#8a6412]">
        {ahli.nama.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-[130px]">
        <b className="text-[15px]">{ahli.nama}</b>
        {ahli.peranan && <span className="ml-2 text-[12.5px] text-teks-lembut">{ahli.peranan}</span>}
        <div className="text-[12.5px] text-teks-lembut">
          {tugas.length} tugas · {siap} siap
          {tersekat > 0 && <span className="text-tanah"> · {tersekat} tersekat</span>}
        </div>
      </div>

      {ahli.telefon && (
        <a href={`https://wa.me/6${ahli.telefon.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
           className="text-[13px] underline underline-offset-2 hover:text-tembaga">
          WhatsApp
        </a>
      )}

      {bolehUrus && (
        <div className="ml-auto flex items-center gap-2">
          <select
            aria-label={`Pindah ${ahli.nama} ke biro lain`}
            className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1 text-[13px]"
            value={ahli.biro_id}
            disabled={menunggu}
            onChange={(e) => {
              const nilai = Number(e.target.value);
              mula(async () => { await pindahBiro(ahli.id, nilai); });
            }}
          >
            {biro.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
          <button
            type="button" disabled={menunggu}
            onClick={() => {
              if (!confirm(`Keluarkan ${ahli.nama} dari senarai AJK?`)) return;
              mula(async () => { await buangAhli(ahli.id); });
            }}
            className="text-[12.5px] text-tanah underline underline-offset-2 disabled:opacity-50"
          >
            Keluarkan
          </button>
        </div>
      )}
    </li>
  );
}
