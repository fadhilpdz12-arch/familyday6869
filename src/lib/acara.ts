/** Maklumat acara yang tetap. Satu sumber kebenaran untuk seluruh laman. */
export const ACARA = {
  tajuk: "Family Day 2026",
  keluarga: "Keluarga Mat Daud & Siti Fatimah",
  tempat: "Syafmel Chalet",
  daerah: "Setiu, Terengganu",
  mula: "2026-12-11T14:00:00+08:00",
  tamat: "2026-12-13T12:00:00+08:00",
  julatTarikh: "11–13 Disember 2026",
  tempoh: "3 hari 2 malam",
  bilik: "11 bilik berhawa dingin + 1 homestay",
  yuranDewasa: 150,
  tarikhAkhirBayaran: "30 November 2026",
} as const;

export const LABEL_HARI: Record<number, string> = {
  1: "Hari 1 · 11 Dis",
  2: "Hari 2 · 12 Dis",
  3: "Hari 3 · 13 Dis",
};

export const KEMUDAHAN = [
  { nama: "Carrom", nota: "Papan carrom untuk sesi santai lepas makan", ikon: "carrom" },
  { nama: "Meja ping pong", nota: "Boleh buat kejohanan kecil antara sepupu", ikon: "pingpong" },
  { nama: "Mini snooker", nota: "Meja kecil, sesuai untuk remaja dan dewasa", ikon: "snooker" },
  { nama: "BBQ pit", nota: "Untuk malam pertama — dikendali Abe Awi", ikon: "bbq" },
  { nama: "Gelanggang bola tampar", nota: "Padan untuk perlawanan hari kedua", ikon: "bola" },
  { nama: "Kolam mandi", nota: "Kawasan utama anak-anak — perlu pemantauan", ikon: "kolam" },
  { nama: "Sound system + 2 mikrofon", nota: "Senamrobik, sukaneka dan malam kesenian", ikon: "audio" },
] as const;

export const PANDUAN = [
  {
    tajuk: "Bawa sendiri",
    butir: [
      "Tuala dan baju mandi kolam",
      "Telekung dan sejadah",
      "Ubat peribadi",
      "Baju keluarga (diedar oleh AJK Logistik)",
      "Selimut lebih kalau senang tidur sejuk",
    ],
  },
  {
    tajuk: "Peraturan kolam",
    butir: [
      "Anak bawah 10 tahun mesti ada orang dewasa di tepi kolam",
      "Tiada mandi selepas Maghrib",
      "Peti kecemasan diletak berdekatan kolam",
    ],
  },
  {
    tajuk: "Jaga tempat",
    butir: [
      "Kasut ditinggalkan di luar bilik",
      "Sampah dikumpul dalam beg besar setiap malam",
      "Peralatan permainan dipulangkan ke tempat asal",
      "Semak bilik bersama sebelum check out",
    ],
  },
  {
    tajuk: "Bayaran",
    butir: [
      "RM150 seorang dewasa",
      "Serah kepada Bendahari sebelum 30 November 2026",
      "Hantar resit pemindahan dalam kumpulan WhatsApp",
    ],
  },
] as const;
