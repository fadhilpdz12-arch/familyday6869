-- =====================================================================
--  Family Day 2026 — Keluarga Mat Daud & Siti Fatimah
--  Migrasi 1: skema, kekangan, RLS, paparan awam, realtime
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- enum
create type status_hadir     as enum ('hadir', 'belum_pasti', 'tidak_hadir');
create type keperluan_bilik  as enum ('satu_bilik', 'dua_bilik', 'kongsi', 'tidak_bermalam');
create type waktu_tiba       as enum ('11dis_petang', '11dis_malam', '12dis_pagi', 'belum_pasti');
create type jenis_baris      as enum ('masuk', 'keluar', 'tolak', 'jumlah');

-- ------------------------------------------------------- fungsi bantuan
create or replace function tetapkan_dikemas()
returns trigger
language plpgsql
as $$
begin
  new.dikemas := now();
  return new;
end;
$$;

-- =====================================================================
--  KEHADIRAN
-- =====================================================================
create table kehadiran (
  id            uuid primary key default gen_random_uuid(),
  nama_keluarga text not null
                check (char_length(btrim(nama_keluarga)) between 3 and 80),
  telefon       text not null
                check (telefon ~ '^[0-9+][0-9+\-\s]{7,19}$'),
  status        status_hadir    not null default 'hadir',
  dewasa        smallint        not null default 1 check (dewasa between 0 and 30),
  kanak         smallint        not null default 0 check (kanak  between 0 and 30),
  bilik         keperluan_bilik not null default 'kongsi',
  tiba          waktu_tiba      not null default 'belum_pasti',
  nota          text check (nota is null or char_length(nota) <= 500),
  sudah_bayar   boolean         not null default false,
  jumlah_bayar  numeric(8,2)    not null default 0 check (jumlah_bayar >= 0),
  yuran         numeric(8,2)    generated always as (dewasa * 150::numeric) stored,
  dicipta       timestamptz     not null default now(),
  dikemas       timestamptz     not null default now(),
  -- satu keluarga tak boleh isytihar hadir dan tidak hadir serentak
  constraint bilangan_munasabah check (status <> 'hadir' or dewasa + kanak > 0)
);

-- satu baris untuk satu keluarga; hantar semula = kemas kini
create unique index kehadiran_nama_unik on kehadiran (lower(btrim(nama_keluarga)));
create index kehadiran_status_idx on kehadiran (status);

create trigger kehadiran_dikemas
  before update on kehadiran
  for each row execute function tetapkan_dikemas();

-- =====================================================================
--  AJK
-- =====================================================================
create table biro (
  id        smallint primary key,
  nama      text not null unique,
  tugas     text not null,
  kuota     smallint not null default 1 check (kuota > 0),
  urutan    smallint not null
);

create table ajk (
  id       uuid primary key default gen_random_uuid(),
  biro_id  smallint not null references biro(id) on delete cascade,
  nama     text not null check (char_length(btrim(nama)) between 2 and 60),
  peranan  text,
  urutan   smallint not null default 0
);
create index ajk_biro_idx on ajk (biro_id, urutan);

-- =====================================================================
--  TENTATIF
-- =====================================================================
create table tentatif (
  id          uuid primary key default gen_random_uuid(),
  hari        smallint not null check (hari between 1 and 3),
  masa        text not null,
  tajuk       text not null,
  keterangan  text,
  tag         text,
  ibadah      boolean not null default false,
  draf        boolean not null default false,
  urutan      smallint not null
);
create index tentatif_hari_idx on tentatif (hari, urutan);

-- =====================================================================
--  BAJET
-- =====================================================================
create table bajet (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  keterangan  text,
  amaun       numeric(10,2) not null,
  jenis       jenis_baris not null default 'masuk',
  urutan      smallint not null
);

-- =====================================================================
--  SENARAI SEMAK TUGASAN
-- =====================================================================
create table tugasan (
  id           uuid primary key default gen_random_uuid(),
  biro_id      smallint references biro(id) on delete set null,
  teks         text not null check (char_length(btrim(teks)) between 3 and 200),
  selesai      boolean not null default false,
  selesai_oleh text,
  selesai_pada timestamptz,
  urutan       smallint not null default 0,
  dicipta      timestamptz not null default now()
);
create index tugasan_urutan_idx on tugasan (urutan);

-- tandatangan automatik bila status bertukar
create or replace function catat_masa_selesai()
returns trigger language plpgsql as $$
begin
  if new.selesai and not old.selesai then
    new.selesai_pada := now();
  elsif not new.selesai then
    new.selesai_pada := null;
    new.selesai_oleh := null;
  end if;
  return new;
end;
$$;

create trigger tugasan_masa_selesai
  before update on tugasan
  for each row execute function catat_masa_selesai();

-- =====================================================================
--  BARANG BAWA & CADANGAN
-- =====================================================================
create table barang (
  id      uuid primary key default gen_random_uuid(),
  nama    text not null check (char_length(btrim(nama)) between 2 and 60),
  barang  text not null check (char_length(btrim(barang)) between 2 and 160),
  dicipta timestamptz not null default now()
);

create table cadangan (
  id      uuid primary key default gen_random_uuid(),
  nama    text not null check (char_length(btrim(nama)) between 2 and 60),
  isi     text not null check (char_length(btrim(isi)) between 5 and 600),
  dibaca  boolean not null default false,
  dicipta timestamptz not null default now()
);

-- =====================================================================
--  PAPARAN AWAM
--  Nombor telefon dan nota peribadi TIDAK didedahkan kepada orang awam.
--  Paparan ini dimiliki postgres, jadi ia memintas RLS jadual asal
--  secara sengaja — itulah sempadan keselamatannya.
-- =====================================================================
create view kehadiran_awam as
select id, nama_keluarga, status, dewasa, kanak, bilik, tiba, dicipta
from kehadiran;

create view statistik_awam as
select
  count(*) filter (where status <> 'tidak_hadir')                       as keluarga,
  coalesce(sum(dewasa) filter (where status <> 'tidak_hadir'), 0)::int  as dewasa,
  coalesce(sum(kanak)  filter (where status <> 'tidak_hadir'), 0)::int  as kanak,
  coalesce(sum(yuran)  filter (where status = 'hadir'), 0)              as kutipan_dijangka,
  coalesce(sum(jumlah_bayar), 0)                                        as kutipan_diterima
from kehadiran;

-- =====================================================================
--  ROW LEVEL SECURITY
--  Prinsip: anon boleh BACA kandungan tak sensitif sahaja.
--  Semua tulisan melalui Server Action yang guna kunci service role,
--  selepas pengesahan Zod di pelayan.
-- =====================================================================
alter table kehadiran enable row level security;
alter table biro      enable row level security;
alter table ajk       enable row level security;
alter table tentatif  enable row level security;
alter table bajet     enable row level security;
alter table tugasan   enable row level security;
alter table barang    enable row level security;
alter table cadangan  enable row level security;

-- kehadiran: tiada polisi untuk anon = tertutup sepenuhnya
create policy "baca_biro"     on biro     for select to anon, authenticated using (true);
create policy "baca_ajk"      on ajk      for select to anon, authenticated using (true);
create policy "baca_tentatif" on tentatif for select to anon, authenticated using (true);
create policy "baca_bajet"    on bajet    for select to anon, authenticated using (true);
create policy "baca_tugasan"  on tugasan  for select to anon, authenticated using (true);
create policy "baca_barang"   on barang   for select to anon, authenticated using (true);
create policy "baca_cadangan" on cadangan for select to anon, authenticated using (true);

revoke all on kehadiran from anon, authenticated;
grant select on kehadiran_awam, statistik_awam to anon, authenticated;

-- =====================================================================
--  REALTIME — hanya jadual yang selamat disiarkan
-- =====================================================================
alter publication supabase_realtime add table tugasan;
alter publication supabase_realtime add table barang;
alter publication supabase_realtime add table cadangan;
