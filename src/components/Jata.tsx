/** Jata keluarga — monogram rasmi MD ◆ SF, dilingkari nama lokasi acara. */
export function Jata({ className, ringkas = false }: { className?: string; ringkas?: boolean }) {
  if (ringkas) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/lambang.png" alt="" aria-hidden="true" className={className} />
    );
  }

  return (
    <svg viewBox="0 0 200 200" className={className} role="img"
         aria-label="Jata Family Day Keluarga Mat Daud dan Che Siti Fatimah">
      <defs>
        <path id="arcAtas" d="M 34 100 A 66 66 0 0 1 166 100" fill="none" />
        <path id="arcBawah" d="M 36 100 A 64 64 0 0 0 164 100" fill="none" />
      </defs>

      <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="87" fill="none" stroke="currentColor" strokeWidth="0.6" opacity=".55" />

      <text fontFamily="Marcellus, serif" fontSize="12.5" letterSpacing="3.2" fill="currentColor">
        <textPath href="#arcAtas" startOffset="50%" textAnchor="middle">SYAFMEL CHALET</textPath>
      </text>
      <text fontFamily="Marcellus, serif" fontSize="10.5" letterSpacing="2.4" fill="currentColor" opacity=".9">
        <textPath href="#arcBawah" startOffset="50%" textAnchor="middle">SETIU, TERENGGANU</textPath>
      </text>

      <image href="/lambang.png" x="45" y="45" width="110" height="110" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}
