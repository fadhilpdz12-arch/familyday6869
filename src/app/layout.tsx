import type { Metadata, Viewport } from "next";
import { Marcellus, Plus_Jakarta_Sans } from "next/font/google";
import { ACARA } from "@/lib/acara";
import "./globals.css";

// Fon dihoskan sendiri oleh Next — tiada permintaan ke Google semasa larian,
// tiada anjakan susun atur, dan CSP boleh kekal ketat.
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-marcellus",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyday-2026.vercel.app"),
  title: {
    default: `${ACARA.tajuk} — ${ACARA.keluarga}`,
    template: `%s — ${ACARA.tajuk}`,
  },
  description: `${ACARA.keluarga}. ${ACARA.julatTarikh}, ${ACARA.tempat}, ${ACARA.daerah}. Tentatif, senarai AJK, bajet dan pengesahan kehadiran.`,
  openGraph: {
    type: "website",
    locale: "ms_MY",
    title: `${ACARA.tajuk} — ${ACARA.keluarga}`,
    description: `${ACARA.julatTarikh} · ${ACARA.tempat}, ${ACARA.daerah}`,
  },
  // Acara keluarga persendirian — jangan diindeks enjin carian.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#06262C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className={`${marcellus.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
