# Apa Yang Kau Kena Buat

Ikut turutan. Anggaran 45 minit semuanya, sekali seumur hidup.

---

## 1. Supabase — buat database (15 minit)

1. Pergi [supabase.com](https://supabase.com), daftar guna akaun GitHub.
2. **New project** → nama `familyday-2026` → pilih region **Southeast Asia (Singapore)** →
   set password database (simpan kat tempat selamat).
3. Tunggu dalam 2 minit sampai projek siap.
4. Buka **SQL Editor** → **New query**. Tampal isi fail ni satu-satu, tekan **Run**:
   - `supabase/migrations/20260101000000_skema_awal.sql`
   - `supabase/migrations/20260102000000_operasi.sql`
   - `supabase/seed.sql`
5. Pergi **Database → Replication** → pastikan `tugasan`, `kemaskini`, `barang`,
   `cadangan`, `risiko` ada tanda hijau. Kalau takde, hidupkan.
6. Pergi **Project Settings → API**, salin tiga benda ni:
   - Project URL
   - `anon public` key
   - `service_role` key ← **jangan bagi sesiapa, jangan letak dalam WhatsApp**

---

## 2. GitHub — simpan kod (5 minit)

```bash
cd familyday-2026
git init
git add .
git commit -m "Laman Family Day 2026"
gh repo create familyday-2026 --private --source=. --push
```

Kalau takde `gh`, buat repo kosong kat github.com (set **Private**), lepas tu:

```bash
git remote add origin https://github.com/<username-kau>/familyday-2026.git
git branch -M main
git push -u origin main
```

> Repo kena **Private**. Dalam ni ada nombor telefon keluarga.

---

## 3. Jana dua kata laluan + satu rahsia (2 minit)

```bash
openssl rand -base64 48        # ← ni untuk RAHSIA_SESI
```

Untuk kata laluan pula, pilih sendiri yang senang sebut dalam group:

| Pembolehubah | Untuk siapa | Contoh |
|---|---|---|
| `KATA_LALUAN_AJK` | Semua 16 AJK | `setiu2026` |
| `KATA_LALUAN_PENGERUSI` | Huda seorang je | `sesuatu-yang-lain-terus` |

Kalau orang log masuk guna kata laluan Pengerusi, dia boleh assign tugas, tambah orang,
padam rekod. Yang guna kata laluan biasa cuma boleh tukar status tugas dia sendiri dan
hantar update harian. Jadi **jangan kongsi yang Pengerusi dalam group besar**.

---

## 4. Vercel — naikkan laman (10 minit)

1. [vercel.com](https://vercel.com) → daftar guna GitHub.
2. **Add New → Project** → pilih repo `familyday-2026` → **Import**.
3. Sebelum tekan Deploy, buka **Environment Variables**, masukkan enam ni:

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY      = eyJhbGciOi...
KATA_LALUAN_AJK                = setiu2026
KATA_LALUAN_PENGERUSI          = ...
RAHSIA_SESI                    = (hasil openssl tadi)
```

4. **Deploy**. Dalam 2 minit siap.
5. Salin URL yang Vercel bagi. Kalau nak nama sendiri, beli domain
   (`familydaymatdaud.com` dalam RM50 setahun) dan sambung kat **Settings → Domains**.

---

## 5. Isi data sebenar (15 minit)

Log masuk kat `/ajk` guna nama **Huda** + kata laluan Pengerusi, lepas tu:

- **Tab Pasukan** → isi kekosongan. Biro Dokumentasi masih kosong sepenuhnya,
  Bendahari kurang sorang, Logistik kurang dua, Aktiviti kurang tiga.
- **Tab Pasukan** → tambah nombor telefon setiap AJK supaya butang WhatsApp berfungsi.
- **Tab Tugas** → tapis "Belum diassign", assign satu-satu pada orangnya.
- **Tab Pelan Sandaran** → baca sepuluh senario, tukar mana yang tak kena.

---

## 6. Hebahkan pada AJK (5 minit)

Hantar mesej ni dalam group:

> Salam semua. Laman Family Day dah siap: **[link]**
>
> Semua AJK sila log masuk kat **[link]/ajk** — pilih nama sendiri, kata laluan **setiu2026**.
>
> Setiap hari tolong buka sekali, tengok tab **Tugas** ada apa untuk kita, lepas tu
> hantar dua tiga ayat kat tab **Update Harian**. Kalau tersekat, tukar status jadi
> "Tersekat" — nanti kita tolong sama-sama.
>
> Yang belum sahkan kehadiran, isi borang kat laman utama. Yuran RM150 seorang dewasa,
> budak percuma. Tarikh akhir 30 November.

---

## Selepas ni, kerja kau tinggal

- Buka `/ajk/papan` sekali sehari. Kotak merah kat atas tunjuk apa yang perlu perhatian.
- Kalau ada AJK dua hari tak lapor, WhatsApp dia terus dari tab Pasukan.
- Sebulan sebelum acara, masuk tab Kehadiran, muat turun CSV, bagi pada Bendahari.

---

## Kalau ada masalah

| Masalah | Sebab biasa | Cara betulkan |
|---|---|---|
| Senarai nama kosong masa log masuk | `seed.sql` belum dijalankan | Jalankan dalam SQL Editor |
| Laman kosong, takde tentatif | Migrasi belum jalan | Jalankan dua fail migrasi ikut turutan |
| Update harian tak muncul serta-merta | Realtime tak hidup | Database → Replication → hidupkan `kemaskini` |
| "Pembolehubah persekitaran tidak lengkap" | Ada env yang tertinggal | Semak enam-enam kat Vercel, deploy semula |
