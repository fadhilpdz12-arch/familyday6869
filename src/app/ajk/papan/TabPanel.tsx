"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TAB = [
  { laluan: "/ajk/papan", teks: "Ringkasan" },
  { laluan: "/ajk/papan/tugas", teks: "Tugas" },
  { laluan: "/ajk/papan/kerja", teks: "Agihan Kerja" },
  { laluan: "/ajk/papan/harian", teks: "Update harian" },
  { laluan: "/ajk/papan/pasukan", teks: "Pasukan" },
  { laluan: "/ajk/papan/risiko", teks: "Pelan sandaran" },
  { laluan: "/ajk/papan/kehadiran", teks: "Kehadiran" },
] as const;

export function TabPanel() {
  const laluan = usePathname();

  return (
    <nav className="border-t border-[rgba(201,150,47,.14)] bg-lagun">
      <div className="wrap flex gap-1 overflow-x-auto py-1.5">
        {TAB.map((t) => {
          const aktif = laluan === t.laluan;
          return (
            <Link
              key={t.laluan}
              href={t.laluan}
              aria-current={aktif ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[13.5px] font-medium no-underline transition-colors ${
                aktif
                  ? "bg-[rgba(201,150,47,.18)] text-kerang-terang"
                  : "text-atas-gelap-lembut hover:text-tembaga-muda"
              }`}
            >
              {t.teks}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
