"use client";

import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import {
  kemaskiniRancangan, padamBahan, padamPautan, padamPic, padamRancangan,
  tambahBahan, tambahPautan, tambahPic, togelBahan, tukarStatusRancangan,
} from "@/tindakan/kerja";
import { ButangHantar, Mesej } from "@/components/ui";
import { LABEL_HARI } from "@/lib/acara";
import { LABEL_RANCANGAN, WARNA_RANCANGAN } from "@/lib/format";
import type {
  Ajk, RancanganBahan, RancanganKerja, RancanganPautan, RancanganPic, Risiko, StatusRancangan,
} from "@/lib/database.types";

const STATUS: StatusRancangan[] = ["belum_mula", "sedang_disiapkan", "sedia", "selesai"];

export function KadRancangan({
  rancangan, pautan, pic, bahan, risikoKait, ajkSemua, pengerusi, bolehUrusItem,
}: {
  rancangan: RancanganKerja;
  pautan: RancanganPautan[];
  pic: RancanganPic[];
  bahan: RancanganBahan[];
  risikoKait: Risiko[];
  ajkSemua: Ajk[];
  pengerusi: boolean;
  bolehUrusItem: boolean;
}) {
  const [menunggu, mula] = useTransition();
  const [buangan, tetapkanBuangan] = useState(false);
  const bahanSedia = bahan.filter((b) => b.sedia).length;

  return (
    <article className="rounded-xl border border-[var(--garis-gelap)] bg-kerang-terang p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ${WARNA_RANCANGAN[rancangan.status]}`}>
          {LABEL_RANCANGAN[rancangan.status]}
        </span>
        {rancangan.hari && (
          <span className="rounded-full bg-[rgba(78,133,119,.14)] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#255e4f]">
            {LABEL_HARI[rancangan.hari]}{rancangan.masa ? ` · ${rancangan.masa}` : ""}
          </span>
        )}
        {bahan.length > 0 && (
          <span className="text-[11.5px] text-teks-lembut">Bahan {bahanSedia}/{bahan.length} sedia</span>
        )}

        {bolehUrusItem && (
          <select
            aria-label={`Tukar status untuk ${rancangan.tajuk}`}
            className="ml-auto rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1 text-[13px]"
            value={rancangan.status}
            disabled={menunggu}
            onChange={(e) => {
              const nilai = e.target.value;
              mula(async () => { await tukarStatusRancangan(rancangan.id, nilai); });
            }}
          >
            {STATUS.map((s) => <option key={s} value={s}>{LABEL_RANCANGAN[s]}</option>)}
          </select>
        )}
      </div>

      <h3 className="mb-1 font-sans text-[16.5px] font-semibold leading-snug">{rancangan.tajuk}</h3>
      {rancangan.keterangan && (
        <p className="mb-3 whitespace-pre-line text-[13.5px] leading-relaxed text-teks-lembut">{rancangan.keterangan}</p>
      )}

      {/* --- PIC --- */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[12.5px] font-semibold text-teks-lembut">PIC:</span>
        {pic.length === 0 && <span className="text-[12.5px] italic text-tanah">Belum ada PIC</span>}
        {pic.map((p) => {
          const orang = ajkSemua.find((a) => a.id === p.ajk_id);
          return (
            <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-[rgba(201,150,47,.14)] px-2.5 py-0.5 text-[12px] font-medium text-[#8a6412]">
              {orang?.nama ?? "?"}{p.peranan ? ` · ${p.peranan}` : ""}
              {pengerusi && (
                <button
                  type="button" aria-label={`Keluarkan ${orang?.nama} sebagai PIC`}
                  disabled={menunggu}
                  onClick={() => mula(async () => { await padamPic(p.id); })}
                  className="text-[#8a6412] hover:text-tanah"
                >
                  ×
                </button>
              )}
            </span>
          );
        })}
      </div>
      {pengerusi && <FormPic rancanganId={rancangan.id} ajkSemua={ajkSemua} pic={pic} />}

      {/* --- pautan rujukan --- */}
      {(pautan.length > 0 || bolehUrusItem) && (
        <div className="mb-3">
          <span className="mb-1 block text-[12.5px] font-semibold text-teks-lembut">Rujukan</span>
          {pautan.length > 0 && (
            <ul className="mb-2 m-0 flex list-none flex-col gap-1 p-0">
              {pautan.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-[13.5px]">
                  <a href={p.url} target="_blank" rel="noreferrer" className="truncate underline underline-offset-2 hover:text-tembaga">
                    {p.label}
                  </a>
                  {bolehUrusItem && (
                    <button
                      type="button" disabled={menunggu}
                      onClick={() => mula(async () => { await padamPautan(p.id, rancangan.id); })}
                      className="text-[11.5px] text-tanah underline underline-offset-2 disabled:opacity-50"
                    >
                      padam
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {bolehUrusItem && <FormPautan rancanganId={rancangan.id} />}
        </div>
      )}

      {/* --- bahan / keperluan --- */}
      {(bahan.length > 0 || bolehUrusItem) && (
        <div className="mb-3">
          <span className="mb-1 block text-[12.5px] font-semibold text-teks-lembut">Bahan / keperluan</span>
          {bahan.length > 0 && (
            <ul className="mb-2 m-0 flex list-none flex-col gap-1 p-0">
              {bahan.map((b) => (
                <li key={b.id} className="flex items-center gap-2 text-[13.5px]">
                  <label className="flex flex-1 items-center gap-2">
                    <input
                      type="checkbox" className="tanda" checked={b.sedia} disabled={menunggu || !bolehUrusItem}
                      onChange={(e) => mula(async () => { await togelBahan(b.id, e.target.checked, rancangan.id); })}
                    />
                    <span className={b.sedia ? "text-teks-lembut line-through" : ""}>{b.teks}</span>
                  </label>
                  {bolehUrusItem && (
                    <button
                      type="button" disabled={menunggu}
                      onClick={() => mula(async () => { await padamBahan(b.id, rancangan.id); })}
                      className="text-[11.5px] text-tanah underline underline-offset-2 disabled:opacity-50"
                    >
                      padam
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {bolehUrusItem && <FormBahan rancanganId={rancangan.id} />}
        </div>
      )}

      {/* --- pelan sandaran khusus kerja ni --- */}
      {(rancangan.pelan_sandaran || pengerusi) && (
        <div className="mb-3 rounded-lg border border-[rgba(168,67,47,.3)] bg-[rgba(168,67,47,.05)] p-3">
          <span className="mb-1 block text-[12px] font-bold uppercase tracking-wide text-[#8a3524]">Pelan sandaran</span>
          {rancangan.pelan_sandaran ? (
            <p className="text-[13.5px] leading-relaxed">
              {rancangan.pencetus_sandaran && <b className="font-semibold">Kalau {rancangan.pencetus_sandaran}: </b>}
              {rancangan.pelan_sandaran}
            </p>
          ) : (
            <p className="text-[13px] italic text-teks-lembut">Belum diisi. Fikirkan apa jadi kalau ada halangan (cth: hujan).</p>
          )}
        </div>
      )}

      {risikoKait.length > 0 && (
        <p className="mb-3 text-[12.5px] text-teks-lembut">
          Dikaitkan dengan {risikoKait.length} senario dalam{" "}
          <Link href="/ajk/papan/risiko" className="underline underline-offset-2 hover:text-tembaga">Pelan sandaran</Link>.
        </p>
      )}

      {pengerusi && (
        <div className="flex flex-wrap gap-3 border-t border-[var(--garis-gelap)] pt-3">
          <button type="button" onClick={() => tetapkanBuangan((v) => !v)} className="text-[12.5px] underline underline-offset-2 hover:text-tembaga">
            {buangan ? "Tutup edit" : "Edit kerja ni"}
          </button>
          <button
            type="button"
            disabled={menunggu}
            onClick={() => {
              if (!confirm(`Padam kerja "${rancangan.tajuk}"? Semua pautan, PIC dan bahan sekali dipadam.`)) return;
              mula(async () => { await padamRancangan(rancangan.id); });
            }}
            className="ml-auto text-[12.5px] text-tanah underline underline-offset-2 disabled:opacity-50"
          >
            Padam
          </button>
        </div>
      )}

      {buangan && <FormEdit rancangan={rancangan} />}
    </article>
  );
}

// ============================================================= sub-borang
function FormPic({ rancanganId, ajkSemua, pic }: { rancanganId: string; ajkSemua: Ajk[]; pic: RancanganPic[] }) {
  const [keputusan, tindakan] = useActionState(tambahPic, null);
  const borang = useRef<HTMLFormElement>(null);
  const belumJadiPic = ajkSemua.filter((a) => !pic.some((p) => p.ajk_id === a.id));

  if (belumJadiPic.length === 0) return null;

  return (
    <form ref={borang} action={async (d) => { await tindakan(d); borang.current?.reset(); }} className="mb-2 flex flex-wrap items-center gap-2">
      <input type="hidden" name="rancangan_id" value={rancanganId} />
      <select name="ajk_id" required defaultValue="" className="rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]">
        <option value="" disabled>+ Agihkan PIC…</option>
        {belumJadiPic.map((a) => <option key={a.id} value={a.id}>{a.nama}</option>)}
      </select>
      <input name="peranan" placeholder="Peranan (tak wajib, cth: pembantu)" maxLength={40} className="w-[190px] rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]" />
      <ButangHantar kelas="btn btn-halus">Tambah</ButangHantar>
      {keputusan && !keputusan.ok && <span className="ralat text-[12px]">{keputusan.mesej}</span>}
    </form>
  );
}

function FormPautan({ rancanganId }: { rancanganId: string }) {
  const [keputusan, tindakan] = useActionState(tambahPautan, null);
  const borang = useRef<HTMLFormElement>(null);

  return (
    <form ref={borang} action={async (d) => { await tindakan(d); borang.current?.reset(); }} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="rancangan_id" value={rancanganId} />
      <input name="label" placeholder="Label (cth: Video cara main)" maxLength={60} className="w-[190px] rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]" />
      <input name="url" type="url" required placeholder="https://youtube.com/…" className="w-[220px] rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]" />
      <ButangHantar kelas="btn btn-halus">+ Tambah pautan</ButangHantar>
      {keputusan && !keputusan.ok && <span className="ralat text-[12px]">{keputusan.mesej}</span>}
    </form>
  );
}

function FormBahan({ rancanganId }: { rancanganId: string }) {
  const [keputusan, tindakan] = useActionState(tambahBahan, null);
  const borang = useRef<HTMLFormElement>(null);

  return (
    <form ref={borang} action={async (d) => { await tindakan(d); borang.current?.reset(); }} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="rancangan_id" value={rancanganId} />
      <input name="teks" placeholder="Cth: guni, tali, wisel…" minLength={2} maxLength={160} className="w-[220px] rounded-lg border-[1.5px] border-[var(--garis-gelap)] bg-white px-2 py-1.5 text-[13px]" />
      <ButangHantar kelas="btn btn-halus">+ Tambah bahan</ButangHantar>
      {keputusan && !keputusan.ok && <span className="ralat text-[12px]">{keputusan.mesej}</span>}
    </form>
  );
}

function FormEdit({ rancangan }: { rancangan: RancanganKerja }) {
  const [keputusan, tindakan] = useActionState(kemaskiniRancangan, null);

  return (
    <form action={tindakan} className="mt-3 grid gap-3 border-t border-[var(--garis-gelap)] pt-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={rancangan.id} />
      <Mesej keputusan={keputusan} />

      <div className="medan sm:col-span-2">
        <label htmlFor={`r-tajuk-${rancangan.id}`}>Tajuk</label>
        <input id={`r-tajuk-${rancangan.id}`} name="tajuk" required minLength={3} maxLength={120} defaultValue={rancangan.tajuk} />
      </div>

      <div className="medan sm:col-span-2">
        <label htmlFor={`r-ket-${rancangan.id}`}>Keterangan</label>
        <textarea id={`r-ket-${rancangan.id}`} name="keterangan" maxLength={1500} defaultValue={rancangan.keterangan ?? ""} />
      </div>

      <div className="medan">
        <label htmlFor={`r-hari-${rancangan.id}`}>Hari</label>
        <select id={`r-hari-${rancangan.id}`} name="hari" defaultValue={rancangan.hari ?? ""}>
          <option value="">— Belum tentu —</option>
          <option value="1">Hari 1 (11 Dis)</option>
          <option value="2">Hari 2 (12 Dis)</option>
          <option value="3">Hari 3 (13 Dis)</option>
        </select>
      </div>

      <div className="medan">
        <label htmlFor={`r-masa-${rancangan.id}`}>Masa (tak wajib)</label>
        <input id={`r-masa-${rancangan.id}`} name="masa" maxLength={40} placeholder="Cth: 9.30 pagi" defaultValue={rancangan.masa ?? ""} />
      </div>

      <div className="medan">
        <label htmlFor={`r-pencetus-${rancangan.id}`}>Pencetus pelan sandaran</label>
        <input id={`r-pencetus-${rancangan.id}`} name="pencetus_sandaran" maxLength={160} placeholder="Cth: hujan lebat" defaultValue={rancangan.pencetus_sandaran ?? ""} />
      </div>

      <div className="medan sm:col-span-2">
        <label htmlFor={`r-sandaran-${rancangan.id}`}>Pelan sandaran</label>
        <textarea id={`r-sandaran-${rancangan.id}`} name="pelan_sandaran" maxLength={1000}
                  placeholder="Contoh: pindah dalam, guna carrom & ping pong sebagai ganti."
                  defaultValue={rancangan.pelan_sandaran ?? ""} />
      </div>

      <div className="sm:col-span-2"><ButangHantar>Simpan perubahan</ButangHantar></div>
    </form>
  );
}
