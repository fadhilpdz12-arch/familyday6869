import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Maklumat } from "@/components/Maklumat";
import { Kemudahan } from "@/components/Kemudahan";
import { Tentatif } from "@/components/Tentatif";
import { SenaraiAjk } from "@/components/SenaraiAjk";
import { Kemajuan } from "@/components/Kemajuan";
import { Bajet } from "@/components/Bajet";
import { Kehadiran } from "@/components/Kehadiran";
import { Persiapan } from "@/components/Persiapan";
import { Panduan, Kaki } from "@/components/Panduan";
import { muatLamanUtama } from "@/lib/data";

// Data berubah sepanjang hari; segar semula setiap 30 saat, dan serta-merta
// selepas sebarang Server Action melalui revalidatePath.
export const revalidate = 30;

export default async function LamanUtama() {
  const d = await muatLamanUtama();

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Maklumat />
        <Kemudahan />
        <Tentatif baris={d.tentatif} />
        <SenaraiAjk biro={d.biro} ahli={d.ajk} />
        <Kemajuan senarai={d.kemajuan} />
        <Bajet baris={d.bajet} />
        <Kehadiran senarai={d.kehadiran} statistik={d.statistik} />
        <Persiapan barang={d.barang} cadangan={d.cadangan} />
        <Panduan />
      </main>
      <Kaki />
    </>
  );
}
