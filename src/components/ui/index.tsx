"use client";

import { useFormStatus } from "react-dom";
import type { Keputusan } from "@/tindakan/jenis";

export function ButangHantar({
  children,
  kelas = "btn btn-utama",
}: {
  children: React.ReactNode;
  kelas?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={kelas} disabled={pending} aria-busy={pending}>
      {pending ? "Sedang hantar…" : children}
    </button>
  );
}

export function Mesej({ keputusan }: { keputusan: Keputusan | null }) {
  if (!keputusan) return null;
  return (
    <div role="status" className={`mesej ${keputusan.ok ? "mesej-ok" : "mesej-silap"} mb-4`}>
      {keputusan.mesej}
    </div>
  );
}

export function Ralat({
  medan,
  nama,
}: {
  medan: Record<string, string[]> | undefined;
  nama: string;
}) {
  const r = medan?.[nama]?.[0];
  return r ? <span className="ralat">{r}</span> : null;
}
