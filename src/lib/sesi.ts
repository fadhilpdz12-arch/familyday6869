/**
 * Sesi panel AJK.
 *
 * Setiap orang pilih nama dia sendiri masa log masuk, jadi sistem tahu
 * tugas siapa nak papar dan siapa yang hantar update. Kata laluan pula
 * dikongsi — satu untuk AJK biasa, satu lagi untuk Pengerusi.
 *
 * Kuki ditandatangani HMAC-SHA256 guna Web Crypto supaya fungsi yang sama
 * boleh jalan kat Node (Server Action) dan Edge (middleware).
 */
export const NAMA_KUKI = "sesi_ajk";
const TEMPOH_SAAT = 60 * 60 * 24 * 7; // seminggu — supaya tak asyik log masuk

export type Peranan = "pengerusi" | "ajk";
export interface Sesi { peranan: Peranan; ahliId: string; }

const enc = new TextEncoder();

async function kunciHmac(rahsia: string) {
  return crypto.subtle.importKey("raw", enc.encode(rahsia), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

function keBase64Url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Banding dua rentetan tanpa bocorkan berapa banyak aksara yang sama. */
export function samaMasaTetap(a: string, b: string): boolean {
  const pa = enc.encode(a), pb = enc.encode(b);
  let beza = pa.length ^ pb.length;
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) beza |= (pa[i] ?? 0) ^ (pb[i] ?? 0);
  return beza === 0;
}

export async function ciptaToken(sesi: Sesi, rahsia: string): Promise<string> {
  const luput = Math.floor(Date.now() / 1000) + TEMPOH_SAAT;
  const muatan = `${sesi.peranan}.${sesi.ahliId}.${luput}`;
  const tandatangan = await crypto.subtle.sign("HMAC", await kunciHmac(rahsia), enc.encode(muatan));
  return `${muatan}.${keBase64Url(tandatangan)}`;
}

export async function bacaToken(token: string | undefined, rahsia: string): Promise<Sesi | null> {
  if (!token) return null;
  const bahagian = token.split(".");
  if (bahagian.length !== 4) return null;
  const [peranan, ahliId, luputTeks, tandatangan] = bahagian as [string, string, string, string];
  if (peranan !== "pengerusi" && peranan !== "ajk") return null;

  const luput = Number.parseInt(luputTeks, 10);
  if (!Number.isFinite(luput) || luput * 1000 < Date.now()) return null;

  const jangkaan = keBase64Url(
    await crypto.subtle.sign("HMAC", await kunciHmac(rahsia), enc.encode(`${peranan}.${ahliId}.${luputTeks}`)),
  );
  if (!samaMasaTetap(tandatangan, jangkaan)) return null;

  return { peranan, ahliId };
}

export const pilihanKuki = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TEMPOH_SAAT,
} as const;
