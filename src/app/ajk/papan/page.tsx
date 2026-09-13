import Link from "next/link";
import { laporanHariIni, muatAsasPanel, muatKehadiranPenuh, muatPetugas, muatRancangan, muatRisiko } from "@/lib/data";
import { sesiSemasa } from "@/lib/sesi-pelayan";
import { KadTugas } from "@/app/ajk/papan/KadTugas";
import { ACARA, LABEL_HARI } from "@/lib/acara";
import { LABEL_KEMASKINI, bakiHari, ringgit, tarikhMY } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ringkasan" };

export default async function Ringkasan() {
  const [{ biro, ajk, tugasan }, harian, { statistik }, risiko, { rancangan, pic }, petugas, sesi] = await Promise.all([
    muatAsasPanel(), laporanHariIni(), muatKehadiranPenuh(), muatRisiko(), muatRancangan(), muatPetugas(), sesiSemasa(),
  ]);

  const saya = ajk.find((a) => a.id === sesi?.ahliId);
  const pengerusi = sesi?.peranan === "pengerusi";

  const kerjaSaya = rancangan.filter(
    (r) => pic.some((p) => p.rancangan_id === r.id && p.ajk_id === sesi?.ahliId) && r.status !== "selesai",
  );
  const belumAdaPic = rancangan.filter((r) => !pic.some((p) => p.rancangan_id === r.id));
  const petugasKosong = ([1, 2, 3] as const).filter(
    (h) => !petugas.some((p) => p.hari === h && p.peranan === "emcee")
        || !petugas.some((p) => p.hari === h && p.peranan === "pic_keseluruhan"),
  );

  const tugasSaya = tugasan.filter((t) => t.ditugaskan_kepada === sesi?.ahliId && t.status !== "selesai");
  const siap = tugasan.filter((t) => t.status === "selesai").length;
  const tersekat = tugasan.filter((t) => t.status === "tersekat");
  const belumAssign = tugasan.filter((t) => !t.ditugaskan_kepada && t.status !== "selesai");
  const lewat = tugasan.filter(
    (t) => t.tarikh_akhir && t.status !== "selesai" && bakiHari(t.tarikh_akhir) < 0,
  );
  const mingguIni = tugasan.filter((t) => {
    if (!t.tarikh_akhir || t.status === "selesai") return false;
    const n = bakiHari(t.tarikh_akhir);
    return n >= 0 && n <= 7;
  });
  const risikoBerlaku = risiko.filter((r) => r.status === "berlaku");
  const hariKeAcara = bakiHari("2026-12-11");

  const kad = [
    { label: "Hari lagi sampai acara", nilai: hariKeAcara > 0 ? String(hariKeAcara) : "Dah sampai" },
    { label: "Tugas siap", nilai: `${siap}/${tugasan.length}` },
    { label: "Keluarga sahkan", nilai: String(statistik.keluarga) },
    { label: "Duit dah masuk", nilai: ringgit(Number(statistik.kutipan_diterima)) },
  ];

  return (
    <main className="wrap pt-9">
      <h1 className="mb-1 text-[clamp(1.7rem,5vw,2.2rem)]">
        {saya ? `Hai ${saya.nama}` : "Ringkasan"}
      </h1>
      <p className="mb-8 text-sm text-teks-lembut">
        {ACARA.julatTarikh} · {ACARA.tempat}, {ACARA.daerah}
      </p>

      {/* --- benda yang kena tengok dulu --- */}
      {(lewat.length > 0 || tersekat.length > 0 || risikoBerlaku.length > 0 || (pengerusi && (belumAssign.length > 0 || belumAdaPic.length > 0 || petugasKosong.length > 0))) && (
        <div className="mb-9 rounded-xl border border-tanah bg-[rgba(168,67,47,.06)] p-5">
          <h2 className="mb-2 text-[1.2rem] text-[#8a3524]">Kena tengok hari ni</h2>
          <ul className="m-0 list-disc pl-5 text-[14.5px] leading-relaxed">
            {lewat.length > 0 && (
              <li><Link href="/ajk/papan/tugas" className="underline underline-offset-2">{lewat.length} tugas dah lepas tarikh akhir</Link></li>
            )}
            {tersekat.length > 0 && (
              <li><Link href="/ajk/papan/tugas" className="underline underline-offset-2">{tersekat.length} tugas tersekat, orangnya perlu bantuan</Link></li>
            )}
            {pengerusi && belumAssign.length > 0 && (
              <li><Link href="/ajk/papan/tugas?orang=kosong" className="underline underline-offset-2">{belumAssign.length} tugas belum ada orang pegang</Link></li>
            )}
            {risikoBerlaku.length > 0 && (
              <li><Link href="/ajk/papan/risiko" className="underline underline-offset-2">{risikoBerlaku.length} senario sandaran tengah berlaku</Link></li>
            )}
            {pengerusi && belumAdaPic.length > 0 && (
              <li><Link href="/ajk/papan/kerja" className="underline underline-offset-2">{belumAdaPic.length} kerja dalam Agihan Kerja belum ada PIC</Link></li>
            )}
            {pengerusi && petugasKosong.length > 0 && (
              <li>
                <Link href="/ajk/papan/kerja" className="underline underline-offset-2">
                  Emcee/PIC keseluruhan belum lengkap untuk {petugasKosong.map((h) => LABEL_HARI[h]).join(", ")}
                </Link>
              </li>
            )}
            {pengerusi && harian.belumLapor.length > 0 && (
              <li><Link href="/ajk/papan/harian" className="underline underline-offset-2">{harian.belumLapor.length} AJK belum lapor hari ni</Link></li>
            )}
          </ul>
        </div>
      )}

      <div className="mb-11 grid gap-px bg-[var(--garis-gelap)] sm:grid-cols-2 lg:grid-cols-4">
        {kad.map((k) => (
          <div key={k.label} className="bg-kerang-terang px-5 py-6">
            <div className="font-display text-[1.8rem] leading-none text-lagun angka-jadual">{k.nilai}</div>
            <div className="mt-2 text-[13px] text-teks-lembut">{k.label}</div>
          </div>
        ))}
      </div>

      {/* --- tugas saya --- */}
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="text-[1.5rem]">Tugas saya</h2>
        <Link href="/ajk/papan/tugas?orang=saya" className="text-[13.5px] underline underline-offset-2 hover:text-tembaga">
          Lihat semua
        </Link>
      </div>

      {tugasSaya.length === 0 ? (
        <p className="kotak mb-11 text-teks-lembut">
          Takde tugas terbuka untuk anda sekarang. Kalau rasa patut ada, beritahu Pengerusi.
        </p>
      ) : (
        <div className="mb-11 grid gap-3 lg:grid-cols-2">
          {tugasSaya.slice(0, 6).map((t) => (
            <KadTugas key={t.id} tugas={t} ajk={ajk} biro={biro} bolehAssign={pengerusi} />
          ))}
        </div>
      )}

      {/* --- kerja/aktiviti saya PIC --- */}
      {kerjaSaya.length > 0 && (
        <>
          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            <h2 className="text-[1.5rem]">Kerja saya dalam Agihan Kerja</h2>
            <Link href="/ajk/papan/kerja" className="text-[13.5px] underline underline-offset-2 hover:text-tembaga">
              Buka Agihan Kerja
            </Link>
          </div>
          <ul className="mb-11 m-0 list-none border-t border-[var(--garis-gelap)] p-0">
            {kerjaSaya.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--garis-gelap)] py-3 text-[14.5px]">
                <span className="font-semibold">{r.tajuk}</span>
                {r.hari && <span className="text-[13px] text-teks-lembut">{LABEL_HARI[r.hari]}{r.masa ? ` · ${r.masa}` : ""}</span>}
                {!r.pelan_sandaran && <span className="ml-auto text-[13px] text-tanah">Belum ada pelan sandaran</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* --- deadline minggu ni --- */}
      <h2 className="mb-4 text-[1.5rem]">Kena siap dalam tujuh hari</h2>
      {mingguIni.length === 0 ? (
        <p className="kotak mb-11 text-teks-lembut">Takde tarikh akhir dalam masa terdekat. Lega sikit.</p>
      ) : (
        <ul className="mb-11 m-0 list-none border-t border-[var(--garis-gelap)] p-0">
          {mingguIni.map((t) => {
            const orang = ajk.find((a) => a.id === t.ditugaskan_kepada);
            return (
              <li key={t.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--garis-gelap)] py-3 text-[14.5px]">
                <span className="font-semibold">{t.teks}</span>
                <span className="text-[13px] text-teks-lembut">{orang?.nama ?? "belum diassign"}</span>
                <span className="ml-auto text-[13px] font-semibold text-tanah">
                  {t.tarikh_akhir && bakiHari(t.tarikh_akhir) === 0 ? "Hari ini" : `${t.tarikh_akhir && bakiHari(t.tarikh_akhir)} hari lagi`}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* --- update terkini --- */}
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <h2 className="text-[1.5rem]">Update hari ni</h2>
        <Link href="/ajk/papan/harian" className="text-[13.5px] underline underline-offset-2 hover:text-tembaga">
          Hantar update anda
        </Link>
      </div>

      {harian.kemaskini.length === 0 ? (
        <p className="kotak text-teks-lembut">Belum ada sesiapa lapor hari ni.</p>
      ) : (
        <ul className="grid list-none gap-3 p-0 lg:grid-cols-2">
          {harian.kemaskini.slice(0, 6).map((k) => (
            <li key={k.id} className="rounded-xl border border-[var(--garis-gelap)] bg-kerang-terang p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[13px]">
                <b>{k.nama_paparan}</b>
                <span className="text-teks-lembut">{LABEL_KEMASKINI[k.jenis]}</span>
                <span className="ml-auto text-[12px] text-teks-lembut">{tarikhMY(k.dicipta)}</span>
              </div>
              <p className="text-[14.5px] leading-relaxed">{k.teks}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
