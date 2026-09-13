-- =====================================================================
--  Migrasi 3: Agihan Kerja
--  Pengerusi agihkan kerja terperinci kepada setiap biro — lengkap dengan
--  pautan rujukan (cth: video game), senarai bahan, PIC, dan jadual
--  petugas harian (emcee / PIC keseluruhan). Setiap kerja juga boleh ada
--  pelan sandaran sendiri (cth: kalau hujan, aktiviti ni tukar jadi apa).
-- =====================================================================

-- ------------------------------------------------------------ enum baharu
create type status_rancangan as enum ('belum_mula', 'sedang_disiapkan', 'sedia', 'selesai');
create type peranan_hari     as enum ('pic_keseluruhan', 'emcee', 'bantuan_teknikal', 'fotografer', 'lain');

-- =====================================================================
--  RANCANGAN KERJA
--  Satu baris = satu kerja/aktiviti/game di bawah satu biro. Contoh:
--  "Ular tangga manusia" di bawah biro Aktiviti & Permainan.
-- =====================================================================
create table rancangan_kerja (
  id               uuid primary key default gen_random_uuid(),
  biro_id          smallint not null references biro(id) on delete cascade,
  tajuk            text not null check (char_length(btrim(tajuk)) between 3 and 120),
  keterangan       text check (keterangan is null or char_length(keterangan) <= 1500),
  hari             smallint check (hari between 1 and 3),
  masa             text check (masa is null or char_length(btrim(masa)) <= 40),
  status           status_rancangan not null default 'belum_mula',
  pencetus_sandaran text check (pencetus_sandaran is null or char_length(btrim(pencetus_sandaran)) <= 160),
  pelan_sandaran   text check (pelan_sandaran is null or char_length(pelan_sandaran) <= 1000),
  urutan           smallint not null default 0,
  dicipta_oleh     text,
  dicipta          timestamptz not null default now(),
  dikemas          timestamptz not null default now()
);
create index rancangan_biro_idx on rancangan_kerja (biro_id, urutan);
create index rancangan_hari_idx on rancangan_kerja (hari) where hari is not null;

create trigger rancangan_dikemas
  before update on rancangan_kerja
  for each row execute function tetapkan_dikemas();

-- --------------------------------------------------- pautan rujukan
-- Cth: link video YouTube cara main game tu.
create table rancangan_pautan (
  id           uuid primary key default gen_random_uuid(),
  rancangan_id uuid not null references rancangan_kerja(id) on delete cascade,
  label        text not null default 'Rujukan' check (char_length(btrim(label)) between 1 and 60),
  url          text not null check (url ~* '^https?://\S+$'),
  urutan       smallint not null default 0
);
create index rancangan_pautan_idx on rancangan_pautan (rancangan_id, urutan);

-- --------------------------------------------------------------- PIC
-- Sesiapa AJK yang di-assign sebagai PIC untuk kerja ni (boleh lebih 1 orang).
create table rancangan_pic (
  id           uuid primary key default gen_random_uuid(),
  rancangan_id uuid not null references rancangan_kerja(id) on delete cascade,
  ajk_id       uuid not null references ajk(id) on delete cascade,
  peranan      text check (peranan is null or char_length(btrim(peranan)) <= 40),
  unique (rancangan_id, ajk_id)
);
create index rancangan_pic_ajk_idx on rancangan_pic (ajk_id);

-- --------------------------------------------------- bahan / keperluan
-- Senarai kecil benda yang kena sedia untuk kerja ni (cth: guni, tali, wisel).
create table rancangan_bahan (
  id           uuid primary key default gen_random_uuid(),
  rancangan_id uuid not null references rancangan_kerja(id) on delete cascade,
  teks         text not null check (char_length(btrim(teks)) between 2 and 160),
  sedia        boolean not null default false,
  urutan       smallint not null default 0
);
create index rancangan_bahan_idx on rancangan_bahan (rancangan_id, urutan);

-- =====================================================================
--  PETUGAS HARIAN
--  Siapa emcee, siapa PIC keseluruhan, dan peranan lain untuk setiap hari.
-- =====================================================================
create table petugas_hari (
  id           uuid primary key default gen_random_uuid(),
  hari         smallint not null check (hari between 1 and 3),
  peranan      peranan_hari not null,
  peranan_lain text check (peranan <> 'lain' or char_length(btrim(peranan_lain)) between 2 and 40),
  ajk_id       uuid references ajk(id) on delete set null,
  nota         text check (nota is null or char_length(nota) <= 200),
  urutan       smallint not null default 0
);
create index petugas_hari_idx on petugas_hari (hari, urutan);

-- =====================================================================
--  KAITKAN PELAN SANDARAN DENGAN KERJA TERTENTU
--  Cth: risiko "hujan lebat" boleh dikaitkan terus dengan rancangan
--  "Sukaneka luar" supaya orang nampak sekali gus backup activity-nya.
-- =====================================================================
alter table risiko add column rancangan_id uuid references rancangan_kerja(id) on delete set null;
create index risiko_rancangan_idx on risiko (rancangan_id) where rancangan_id is not null;

-- ================================================================== RLS
-- Sama macam tugasan/kemaskini/risiko — ruang kerja dalaman AJK sahaja,
-- tiada polisi anon langsung. Penulisan semua melalui Server Action.
alter table rancangan_kerja  enable row level security;
alter table rancangan_pautan enable row level security;
alter table rancangan_pic    enable row level security;
alter table rancangan_bahan  enable row level security;
alter table petugas_hari     enable row level security;

-- ============================================================= REALTIME
alter publication supabase_realtime add table rancangan_kerja;
alter publication supabase_realtime add table rancangan_pautan;
alter publication supabase_realtime add table rancangan_pic;
alter publication supabase_realtime add table rancangan_bahan;
alter publication supabase_realtime add table petugas_hari;
