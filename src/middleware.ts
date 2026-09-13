import { NextResponse, type NextRequest } from "next/server";
import { NAMA_KUKI, bacaToken } from "@/lib/sesi";

/** Pintu pertama panel AJK. Setiap Server Action tetap semak semula sesi. */
export async function middleware(req: NextRequest) {
  const rahsia = process.env.RAHSIA_SESI;
  const sesi = rahsia ? await bacaToken(req.cookies.get(NAMA_KUKI)?.value, rahsia) : null;
  if (sesi) return NextResponse.next();

  const url = new URL("/ajk", req.url);
  url.searchParams.set("dari", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/ajk/papan/:path*"] };
