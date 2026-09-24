"use client";

import { useEffect, useRef, useState } from "react";
import { ACARA } from "@/lib/acara";

type Props = {
  namaKeluarga: string;
  dewasa: number;
  kanak: number;
};

const LEBAR = 1080;
const TINGGI = 1350;

/** Baca nilai sebenar CSS var fon next/font, supaya canvas guna fon brand yang sama. */
function bacaFon(pembolehubah: string, gantian: string): string {
  if (typeof window === "undefined") return gantian;
  const nilai = getComputedStyle(document.documentElement).getPropertyValue(pembolehubah).trim();
  return nilai || gantian;
}

function bulatSegiEmpat(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tulisTengah(
  ctx: CanvasRenderingContext2D, teks: string, x: number, y: number, lebarMaks: number, saizFon: number,
): number {
  const perkataan = teks.split(" ");
  const baris: string[] = [];
  let semasa = "";
  for (const p of perkataan) {
    const cuba = semasa ? `${semasa} ${p}` : p;
    if (ctx.measureText(cuba).width > lebarMaks && semasa) {
      baris.push(semasa);
      semasa = p;
    } else {
      semasa = cuba;
    }
  }
  if (semasa) baris.push(semasa);
  baris.forEach((b, i) => ctx.fillText(b, x, y + i * saizFon * 1.18));
  return baris.length;
}

export function KadJemputan({ namaKeluarga, dewasa, kanak }: Props) {
  const kanvas = useRef<HTMLCanvasElement>(null);
  const [sedia, tetapkanSedia] = useState(false);
  const [kongsiBoleh, tetapkanKongsiBoleh] = useState(false);

  useEffect(() => {
    setKongsiSokongan();
    async function setKongsiSokongan() {
      tetapkanKongsiBoleh(typeof navigator !== "undefined" && "share" in navigator && "canShare" in navigator);
    }
    lukis();

    async function lukis() {
      const kanvasEl = kanvas.current;
      if (!kanvasEl) return;
      const ctx = kanvasEl.getContext("2d");
      if (!ctx) return;

      const nisbah = Math.min(2, window.devicePixelRatio || 1);
      kanvasEl.width = LEBAR * nisbah;
      kanvasEl.height = TINGGI * nisbah;
      kanvasEl.style.width = "100%";
      kanvasEl.style.height = "auto";
      ctx.scale(nisbah, nisbah);

      const fonDisplay = bacaFon("--font-marcellus", "Georgia, serif");
      const fonSans = bacaFon("--font-jakarta", "system-ui, sans-serif");

      try {
        await document.fonts.load(`700 60px ${fonDisplay}`);
        await document.fonts.load(`600 30px ${fonSans}`);
        await document.fonts.load(`400 26px ${fonSans}`);
      } catch {
        /* fon fallback tetap jalan */
      }

      // --------------------------------------------------------- latar
      const grad = ctx.createRadialGradient(LEBAR / 2, -80, 80, LEBAR / 2, TINGGI * 0.35, LEBAR * 1.1);
      grad.addColorStop(0, "#123a3f");
      grad.addColorStop(1, "#06262c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, LEBAR, TINGGI);

      const gradBawah = ctx.createRadialGradient(LEBAR / 2, TINGGI + 60, 100, LEBAR / 2, TINGGI * 0.75, LEBAR * 0.9);
      gradBawah.addColorStop(0, "rgba(78,133,119,.35)");
      gradBawah.addColorStop(1, "rgba(78,133,119,0)");
      ctx.fillStyle = gradBawah;
      ctx.fillRect(0, 0, LEBAR, TINGGI);

      // ------------------------------------------------- bingkai emas
      ctx.strokeStyle = "rgba(201,150,47,.85)";
      ctx.lineWidth = 2.5;
      bulatSegiEmpat(ctx, 44, 44, LEBAR - 88, TINGGI - 88, 26);
      ctx.stroke();
      ctx.strokeStyle = "rgba(201,150,47,.35)";
      ctx.lineWidth = 1;
      bulatSegiEmpat(ctx, 58, 58, LEBAR - 116, TINGGI - 116, 18);
      ctx.stroke();

      // ------------------------------------------------------- lambang
      const lambang = new Image();
      lambang.src = "/lambang-lengkap.png";
      await new Promise<void>((sel) => {
        lambang.onload = () => sel();
        lambang.onerror = () => sel();
      });
      const saizLambang = 260;
      if (lambang.width) {
        ctx.drawImage(lambang, (LEBAR - saizLambang) / 2, 118, saizLambang, saizLambang);
      }

      let y = 118 + saizLambang + 68;

      // --------------------------------------------------- label kecil
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(240,200,120,.95)";
      ctx.font = `600 26px ${fonSans}`;
      ctx.fillText("P E N G E S A H A N   K E H A D I R A N", LEBAR / 2, y);
      y += 64;

      // ---------------------------------------------------- nama keluarga
      ctx.fillStyle = "#F7F1E3";
      ctx.font = `400 78px ${fonDisplay}`;
      const barisNama = tulisTengah(ctx, `Keluarga ${namaKeluarga}`, LEBAR / 2, y, LEBAR - 220, 78);
      y += barisNama * 78 * 1.18 + 26;

      // ---------------------------------------------------------- divider
      ctx.strokeStyle = "rgba(201,150,47,.6)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(LEBAR / 2 - 90, y); ctx.lineTo(LEBAR / 2 - 22, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(LEBAR / 2 + 22, y); ctx.lineTo(LEBAR / 2 + 90, y); ctx.stroke();
      ctx.fillStyle = "rgba(201,150,47,.85)";
      ctx.beginPath();
      ctx.moveTo(LEBAR / 2, y - 7); ctx.lineTo(LEBAR / 2 + 7, y); ctx.lineTo(LEBAR / 2, y + 7); ctx.lineTo(LEBAR / 2 - 7, y);
      ctx.closePath(); ctx.fill();
      y += 56;

      // -------------------------------------------------------- kehadiran
      ctx.fillStyle = "rgba(247,241,227,.92)";
      ctx.font = `500 34px ${fonSans}`;
      const bilangan = kanak > 0 ? `${dewasa} dewasa · ${kanak} kanak-kanak` : `${dewasa} dewasa`;
      ctx.fillText(`Akan hadir bersama ${bilangan}`, LEBAR / 2, y);
      y += 90;

      // ------------------------------------------------------ butiran acara
      ctx.font = `700 44px ${fonDisplay}`;
      ctx.fillStyle = "#F7F1E3";
      ctx.fillText(ACARA.tajuk, LEBAR / 2, y);
      y += 52;

      ctx.font = `400 30px ${fonSans}`;
      ctx.fillStyle = "rgba(240,200,120,.95)";
      ctx.fillText(ACARA.julatTarikh, LEBAR / 2, y);
      y += 46;
      ctx.fillStyle = "rgba(247,241,227,.75)";
      ctx.font = `400 27px ${fonSans}`;
      ctx.fillText(`${ACARA.tempat}, ${ACARA.daerah}`, LEBAR / 2, y);

      // ------------------------------------------------------------ nota
      ctx.font = `400 25px ${fonSans}`;
      ctx.fillStyle = "rgba(247,241,227,.65)";
      ctx.fillText("Sampai jumpa di sana. Terima kasih kerana mengesahkan kehadiran.", LEBAR / 2, TINGGI - 110);

      ctx.font = `600 22px ${fonSans}`;
      ctx.fillStyle = "rgba(201,150,47,.7)";
      ctx.fillText("familyday-2026.vercel.app", LEBAR / 2, TINGGI - 66);

      tetapkanSedia(true);
    }
  }, [namaKeluarga, dewasa, kanak]);

  function failNama() {
    return `kad-${namaKeluarga.trim().toLowerCase().replace(/\s+/g, "-")}.png`;
  }

  function muatTurun() {
    const kanvasEl = kanvas.current;
    if (!kanvasEl) return;
    const pautan = document.createElement("a");
    pautan.download = failNama();
    pautan.href = kanvasEl.toDataURL("image/png");
    pautan.click();
  }

  async function kongsi() {
    const kanvasEl = kanvas.current;
    if (!kanvasEl) return;
    kanvasEl.toBlob(async (blob) => {
      if (!blob) return;
      const fail = new File([blob], failNama(), { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [fail] })) {
          await navigator.share({
            files: [fail],
            title: ACARA.tajuk,
            text: `Kad pengesahan kehadiran ${namaKeluarga} untuk ${ACARA.tajuk}`,
          });
        } else {
          muatTurun();
        }
      } catch {
        /* pengguna batalkan share — tak perlu buat apa-apa */
      }
    }, "image/png");
  }

  return (
    <div className="mt-7 rounded-2xl border border-[rgba(201,150,47,.35)] bg-lagun-dalam p-4">
      <canvas ref={kanvas} className="mx-auto block max-w-[380px] rounded-xl" />
      {sedia && (
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={muatTurun} className="btn btn-utama">Simpan kad</button>
          {kongsiBoleh && (
            <button type="button" onClick={kongsi} className="btn btn-garis">Kongsi ke WhatsApp</button>
          )}
        </div>
      )}
    </div>
  );
}
