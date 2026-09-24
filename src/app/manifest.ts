import type { MetadataRoute } from "next";
import { ACARA } from "@/lib/acara";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${ACARA.tajuk} — ${ACARA.keluarga}`,
    short_name: "Family Day 2026",
    description: `${ACARA.julatTarikh} · ${ACARA.tempat}, ${ACARA.daerah}`,
    start_url: "/",
    display: "standalone",
    background_color: "#06262C",
    theme_color: "#06262C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
