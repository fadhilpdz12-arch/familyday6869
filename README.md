# Family Day 2026 — Keluarga Mat Daud & Siti Fatimah

Laman rasmi acara keluarga di Syafmel Chalet, Setiu, Terengganu, 11–13 Disember 2026.

**Stack:** Next.js 15 (App Router, React 19 Server Components) · TypeScript strict ·
Tailwind CSS v4 · Supabase Postgres + Realtime · Zod · Vercel / Netlify

---

## Apa yang laman ini buat

### Laman awam
Tentatif tiga hari, senarai AJK, bajet terbuka, kemudahan chalet, kemajuan persediaan,
borang pengesahan kehadiran (satu keluarga satu borang, hantar semula = kemas kini),
"saya bawa apa" dan kotak cadangan.

### Panel AJK — `/ajk`
Setiap AJK log masuk dengan namanya sendiri. Tujuh tab:

| Tab | Fungsi |
|---|---|
| **Ringkasan** | Kotak merah "kena tengok hari ni", tugas saya, kerja saya (Agihan Kerja), deadline tujuh hari, update terkini |
| **Tugas** | Papan empat lajur ikut status. Tapis ikut biro atau ikut orang. Pengerusi boleh cipta dan assign |
| **Agihan Kerja** | Pengerusi agihkan kerja/aktiviti terperinci ikut biro — tajuk, keterangan, hari & masa, pautan rujukan (cth: video game), senarai bahan, siapa PIC, dan pelan sandaran khusus kerja tu. Ada juga jadual petugas harian (emcee, PIC keseluruhan, dll ikut hari) dan butang salin ringkasan harian untuk broadcast WhatsApp |
| **Update harian** | Semua AJK lapor sekali sehari. Sistem senaraikan siapa belum lapor |
| **Pasukan** | Senarai penuh ikut biro, kekosongan ditanda merah. Pengerusi boleh tambah dan pindah orang |
| **Pelan sandaran** | Senario yang mungkin jadi + apa nak buat. Pengerusi boleh tambah terus dari panel dan kaitkan dengan kerja tertentu dalam Agihan Kerja |
| **Kehadiran** | Nombor telefon, status bayaran, eksport CSV |

**Dua peranan:** kata laluan biasa untuk semua AJK (tukar status tugas/kerja sendiri kalau jadi PIC, hantar
update, tambah pautan/bahan untuk kerja yang dia pegang). Kata laluan Pengerusi untuk Huda (assign tugas,
agihkan PIC dan petugas harian, urus pasukan, isi pelan sandaran, padam rekod).

---

## Model keselamatan

Ini bahagian yang paling penting difahami sebelum mengubah kod.

1. **Kunci `anon` tidak boleh menulis apa-apa.** RLS diaktifkan pada setiap
   jadual. Polisi `anon` hanya `SELECT`, dan hanya pada jadual tak sensitif.
2. **Jadual `kehadiran` tertutup sepenuhnya daripada `anon`** — tiada polisi
   langsung. Orang awam membaca melalui paparan `kehadiran_awam` yang
   membuang nombor telefon dan nota peribadi.
3. **Semua penulisan melalui Server Action** yang menggunakan kunci
   `service_role` di pelayan, selepas pengesahan Zod. `src/lib/supabase/pelayan.ts`
   mengimport `server-only`, jadi build gagal kalau ia tersilap masuk bundle pelayar.
4. **Panel AJK** dilindungi kuki HMAC-SHA256 (Web Crypto, jalan di Node dan Edge).
   Middleware menapis laluan; setiap Server Action tetap menyemak semula sesi.
   Perbandingan kata laluan guna masa tetap.
5. Header keselamatan (CSP, `X-Frame-Options`, `Referrer-Policy`) ditetapkan
   dalam `next.config.ts`. Laman ditanda `noindex` — ini acara keluarga persendirian.

> Nota: `kehadiran_awam` dan `statistik_awam` adalah paparan `SECURITY DEFINER`.
> Supabase Advisor akan memberi amaran mengenainya. Itu memang disengajakan —
> paparan itulah sempadan yang menapis medan sensitif.

> Nota tambahan: jadual `rancangan_kerja`, `rancangan_pautan`, `rancangan_pic`,
> `rancangan_bahan` dan `petugas_hari` (migrasi 3) ikut prinsip yang sama macam
> `tugasan`/`risiko` — tertutup sepenuhnya daripada `anon`, ruang kerja dalaman
> AJK sahaja. Kebenaran tulis dikawal dalam Server Action: Pengerusi urus
> semuanya, seorang AJK biasa cuma boleh urus butiran (pautan, bahan, status)
> untuk kerja yang dia sendiri jadi PIC.

---

## Sediakan tempatan

```bash
git clone https://github.com/<pengguna-anda>/familyday-2026.git
cd familyday-2026
npm install
cp .env.example .env.local     # isi nilai sebenar
npm run dev
```

### Supabase

```bash
npm i -g supabase
supabase login
supabase link --project-ref <ref-projek-anda>
supabase db push                    # jalankan migrasi
psql "$DATABASE_URL" -f supabase/seed.sql   # atau tampal dalam SQL Editor
npm run db:types                    # jana semula jenis TypeScript
```

Aktifkan Realtime untuk `tugasan`, `barang`, `cadangan` di
**Database → Replication** kalau migrasi tidak melakukannya secara automatik.

### Jana rahsia sesi

```bash
openssl rand -base64 48
```

---

## Deploy

### Vercel (disyorkan — rantau `sin1` paling hampir dengan Malaysia)

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add KATA_LALUAN_AJK
vercel env add RAHSIA_SESI
vercel --prod
```

### Netlify

Pasang `@netlify/plugin-nextjs`, kemudian tetapkan lima pembolehubah yang sama
di **Site settings → Environment variables**. `netlify.toml` sudah disediakan.

---

## Struktur

```
src/
├── app/                 Laluan App Router
│   ├── page.tsx         Laman awam (Server Component)
│   └── ajk/             Log masuk + panel AJK + eksport CSV
├── components/          Komponen UI
├── lib/
│   ├── acara.ts         Maklumat acara — satu sumber kebenaran
│   ├── data.ts          Semua bacaan database
│   ├── sesi.ts          HMAC kuki AJK
│   ├── skema.ts         Skema Zod
│   └── supabase/        Klien pelayan (service role) & pelayar (anon)
├── tindakan/            Server Actions — satu-satunya jalan penulisan
└── middleware.ts        Penjaga laluan /ajk/papan

supabase/
├── migrations/          Skema, kekangan, RLS, realtime
└── seed.sql             AJK, tentatif, bajet, tugasan sebenar
```

---

## Nota reka bentuk

Palet diambil daripada lagun Setiu waktu senja dan benang emas songket.
Motif *pucuk rebung* digunakan sebagai jalur pemisah. Muka taip: **Marcellus**
untuk jata dan tajuk, **Plus Jakarta Sans** untuk badan teks. Semua label,
mesej ralat dan nama pembolehubah ditulis dalam Bahasa Melayu supaya AJK yang
membuka kod ini kemudian hari faham apa yang berlaku.

## Perkara yang belum siap

- Muat naik gambar ke Supabase Storage untuk galeri hari ketiga
- Notifikasi WhatsApp automatik untuk peringatan bayaran dan tugas lewat
- Biro Dokumentasi masih tiada ahli — isi dari tab Pasukan

## Nak mula?

Baca `PANDUAN-SETUP.md`. Semua langkah dari kosong sampai laman hidup.
