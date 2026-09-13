/** Jata keluarga — badge rasmi (monogram MD ◆ SF dililit nama lokasi acara). */
export function Jata({ className, ringkas = false }: { className?: string; ringkas?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ringkas ? "/lambang.png" : "/lambang-lengkap.png"}
      alt={ringkas ? "" : "Jata Family Day — Keluarga Mat Daud & Che Siti Fatimah, Syafmel Chalet, Setiu, Terengganu"}
      aria-hidden={ringkas ? "true" : undefined}
      className={className}
    />
  );
}
