/** Jata keluarga — matahari, monogram MD ◆ SF, dan ombak lagun Setiu. */
export function Jata({ className, ringkas = false }: { className?: string; ringkas?: boolean }) {
  if (ringkas) {
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
        <circle cx="20" cy="20" r="18.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="20" cy="15.5" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M9 25.5q5.5-3.6 11 0t11 0M11.5 30q4.3-2.9 8.5 0t8.5 0"
          fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 200" className={className} role="img"
         aria-label="Jata Family Day Keluarga Mat Daud dan Siti Fatimah">
      <defs>
        <path id="arcAtas" d="M 34 100 A 66 66 0 0 1 166 100" fill="none" />
        <path id="arcBawah" d="M 36 100 A 64 64 0 0 0 164 100" fill="none" />
      </defs>

      <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="87" fill="none" stroke="currentColor" strokeWidth="0.6" opacity=".55" />

      <text fontFamily="Marcellus, serif" fontSize="12.5" letterSpacing="3.4" fill="currentColor">
        <textPath href="#arcAtas" startOffset="50%" textAnchor="middle">FAMILY DAY 2026</textPath>
      </text>
      <text fontFamily="Marcellus, serif" fontSize="11" letterSpacing="3" fill="currentColor" opacity=".9">
        <textPath href="#arcBawah" startOffset="50%" textAnchor="middle">SETIU &#9670; TERENGGANU</textPath>
      </text>

      <circle cx="100" cy="66" r="9.5" fill="currentColor" opacity=".85" />
      <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".8">
        <path d="M100 50v-5.5M100 87v5.5M84 66h-5.5M116 66h5.5M88.7 54.7l-3.9-3.9M111.3 54.7l3.9-3.9M88.7 77.3l-3.9 3.9M111.3 77.3l3.9 3.9" />
      </g>

      <text x="74" y="114" textAnchor="middle" fontFamily="Marcellus, serif" fontSize="29" fill="#FAF7F0" letterSpacing="1">MD</text>
      <path d="M100 101l4 5-4 5-4-5z" fill="currentColor" />
      <text x="126" y="114" textAnchor="middle" fontFamily="Marcellus, serif" fontSize="29" fill="#FAF7F0" letterSpacing="1">SF</text>

      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M62 131q9.5-6.5 19 0t19 0t19 0t19 0" />
        <path d="M71.5 141q9.5-6.5 19 0t19 0t19 0" opacity=".65" />
      </g>
      <text x="100" y="174" textAnchor="middle" fontFamily="Marcellus, serif" fontSize="10"
            letterSpacing="2.2" fill="currentColor" opacity=".85">11 &#8211; 13 DIS</text>
    </svg>
  );
}
