import { KEMUDAHAN } from "@/lib/acara";

const IKON: Record<string, React.ReactNode> = {
  carrom: (<><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="7.5" cy="7.5" r="1.6" /><circle cx="16.5" cy="7.5" r="1.6" /><circle cx="7.5" cy="16.5" r="1.6" /><circle cx="16.5" cy="16.5" r="1.6" /><circle cx="12" cy="12" r="2.2" /></>),
  pingpong: (<><ellipse cx="9" cy="9.5" rx="5" ry="5" /><path d="M12.8 13.2l6 6a2 2 0 01-2.8 2.8l-6-6" strokeLinecap="round" /><path d="M3 16h6" strokeLinecap="round" /></>),
  snooker: (<><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="9" cy="12" r="1.7" /><circle cx="15" cy="12" r="1.7" /><path d="M2.5 9.5h1.5M20 9.5h1.5" strokeLinecap="round" /></>),
  bbq: (<><path d="M4 12h16v3a5 5 0 01-5 5H9a5 5 0 01-5-5z" /><path d="M9 8.5c0-1.5-1.5-2-1.5-3.5M12 8.5c0-1.5-1.5-2-1.5-3.5M15 8.5c0-1.5-1.5-2-1.5-3.5" strokeLinecap="round" /></>),
  bola: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5c-3 4-3 13 0 17M12 3.5c3 4 3 13 0 17M3.7 9.5h16.6M3.7 14.5h16.6" /></>),
  kolam: (<g strokeLinecap="round"><path d="M2.5 16.5c2-1.8 3.5-1.8 5.5 0s3.5 1.8 5.5 0 3.5-1.8 5.5 0M2.5 20c2-1.8 3.5-1.8 5.5 0s3.5 1.8 5.5 0 3.5-1.8 5.5 0" /><path d="M7 13V6.5A2.5 2.5 0 0112 6.5V13M17 13V6.5" /></g>),
  audio: (<><rect x="8.5" y="2.5" width="7" height="11" rx="3.5" /><path d="M5 11a7 7 0 0014 0M12 18v3.5M8.5 21.5h7" strokeLinecap="round" /></>),
};

export function Kemudahan() {
  return (
    <section className="sek sek-gelap">
      <div className="wrap">
        <div className="tajuk">
          <span className="hias" aria-hidden="true" />
          <h2>Apa yang ada di sana</h2>
          <p>Semua kemudahan ini disediakan oleh pihak chalet. AJK Aktiviti boleh terus guna tanpa perlu sewa luar.</p>
        </div>

        <ul className="grid list-none grid-cols-1 gap-x-11 border-t border-[var(--garis)] p-0 sm:grid-cols-2 lg:grid-cols-3">
          {KEMUDAHAN.map((k) => (
            <li key={k.nama} className="flex items-start gap-4 border-b border-[var(--garis)] py-5 pr-5">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-[26px] w-[26px] shrink-0 text-tembaga"
                   fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                {IKON[k.ikon]}
              </svg>
              <div>
                <b className="block font-display text-[1.12rem] font-normal text-kerang-terang">{k.nama}</b>
                <span className="text-sm leading-relaxed text-atas-gelap-lembut">{k.nota}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
