"use client";

import { useActionState, useRef, useTransition } from "react";
import { tambahAhli, tambahBiro, pindahBiro, buangAhli, ubahKuota, tukarJawatan } from "@/tindakan/pasukan";
import { LABEL_JAWATAN } from "@/lib/format";
import { ButangHantar, Mesej } from "@/components/ui";
import type { Ajk, Biro, Jawatan, Tugasan } from "@/lib/database.types";

/** Butang − / + untuk bilangan ahli yang diperlukan. */
export function KawalanKuota({ biro, bilangan }: { biro: Biro; bilangan: number }) {
  const [menunggu, mula] = useTransition();
  const ubah = (baru: number) => mula(async () => { await ubahKuota(biro.id, baru); });
  const butang = "grid h-7 w-7 place-items-center rounded-full border border-[var(--garis-gelap)] bg-white text-[15px] leading-none disabled:opacity-40";

  return (
    <span className="ml-auto flex items-center gap-2 text-[12.5px] text-teks-lembut">
      <button type="button" className={butang} disabled={menunggu || biro.kuota <= 1}
              aria-label={`Kurangkan bilangan ahli ${biro.nama}`} onClick={() => ubah(biro.kuota - 1)}>−</button>
      <span className="min-w-[36px] text-center">{bilangan}/{biro.kuota}</span>
      <button type="button" className={butang} disabled={menunggu || biro.kuota >= 30}
              aria-label={`Tambah bilangan ahli ${biro.nama}`} onClick={() => ubah(biro.kuota + 1)}>+</button>
    </span>
  );
}

export function BorangBiro() {
  const [keputusan, tindakan] = useActionState(tambahBiro, null);
  const borang = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={borang}
      action={async (d) => {
        await tindakan(d);
        borang.current?.reset();
      }}
      className="kotak mb-6"
    >
      <h2 className="mb-1 text-[1.3rem]">Buka biro baharu</h2>
      <p className="mb-4 text-sm text-teks-lembut">
        Kalau ada kerja yang tak masuk mana-mana biro, buka biro baharu di sini. Lepas tu masukkan ahli seperti biasa.
      </p>
      <Mesej keputusan={keputusan} />
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div className="medan">
          <label htmlFor="b-nama">Nama biro</label>
          <input id="b-nama" name="nama" required minLength={2} maxLength={60} placeholder="Contoh: Pengangkutan" />
        </div>
        <div className="medan">
          <label htmlFor="b-kuota">Perlu berapa orang</label>
          <input id="b-kuota" name="kuota" type="number" required min={1} max={30} defaultValue={2} />
        </div>
        <div className="medan sm:col-span-2">
          <label htmlFor="b-tugas">Tugas biro</label>
          <textarea
            id="b-tugas" name="tugas" required minLength={5} maxLength={300} rows={2}
            placeholder="Contoh: Atur kereta, kumpul senarai tumpang, pastikan semua sampai sebelum Zohor."
          />
        </div>
        <div className="sm:col-span-2"><ButangHantar>Buka biro</ButangHantar></div>
      </div>
    </form>
  );
}

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
  const jawatan: Jawatan = ahli.jawatan ?? (ahli.adalah_pengerusi ? "pengerusi" : "ahli");
  // Dropdown hanya Ahli / Ketua Biro. Pengerusi & Pembantu Pengerusi tak boleh ditukar dari sini.
  const pilihanJawatan: Jawatan[] = ["ahli", "ketua_biro"];
  const bolehTukarJawatan = jawatan === "ahli" || jawatan === "ketua_biro";
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
        {jawatan !== "ahli" && (
          <span className="ml-2 rounded-full bg-[rgba(201,150,47,.2)] px-2 py-0.5 text-[11px] font-bold text-[#8a6412]">
            {LABEL_JAWATAN[jawatan]}
          </span>
        )}
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

      {bolehUrus && jawatan !== "pengerusi" && (
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {bolehTukarJawatan && <select
            aria-label={`Jawatan ${ahli.nama}`}
            className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1 text-[13px]"
            value={jawatan}
            disabled={menunggu}
            onChange={(e) => {
              const nilai = e.target.value as Jawatan;
              if (nilai === "ketua_biro" && !confirm(`Lantik ${ahli.nama} sebagai Ketua Biro? Ketua lama biro ni (kalau ada) akan jadi ahli biasa.`)) return;
              mula(async () => {
                const k = await tukarJawatan(ahli.id, nilai);
                if (!k.ok) alert(k.mesej);
              });
            }}
          >
            {pilihanJawatan.map((j) => <option key={j} value={j}>{LABEL_JAWATAN[j]}</option>)}
          </select>}
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
