-- =====================================================================
--  Migrasi 2: pusat operasi harian
--  Tugas terperinci · identiti AJK · update harian · pelan sandaran
-- =====================================================================

-- ------------------------------------------------------------ enum baharu
create type keutamaan_tugas as enum ('rendah', 'sederhana', 'tinggi', 'kritikal');
create type status_tugas    as enum ('belum_mula', 'sedang_buat', 'tersekat', 'selesai');
create type jenis_kemaskini as enum ('kemajuan', 'masalah', 'selesai', 'maklumat');
create type tahap           as enum ('rendah', 'sederhana', 'tinggi');
create type status_risiko   as enum ('dipantau', 'pelan_sedia', 'berlaku', 'ditutup');

-- ================================================================== AJK
alter table ajk
  add column telefon          text,
  add column adalah_pengerusi boolean not null default false,
  add column aktif            boolean not null default true;

create index ajk_aktif_idx on ajk (aktif) where aktif;

-- ============================================================== TUGASAN
-- Daripada senarai semak ringkas kepada tugas berpenanggungjawab.
alter table tugasan
  add column butiran           text,
  add column ditugaskan_kepada uuid references ajk(id) on delete set null,
  add column keutamaan         keutamaan_tugas not null default 'sederhana',
  add column status            status_tugas    not null default 'belum_mula',
  add column tarikh_akhir      date,
  add column dicipta_oleh      text,
  add column dikemas           timestamptz not null default now();

-- pindahkan nilai boolean lama ke dalam enum status
update tugasan set status = 'selesai' where selesai;

drop trigger if exists tugasan_masa_selesai on tugasan;
alter table tugasan drop column selesai;

create or replace function catat_masa_selesai()
returns trigger language plpgsql as $$
begin
  if new.status = 'selesai' and old.status <> 'selesai' then
    new.selesai_pada := now();
  elsif new.status <> 'selesai' then
    new.selesai_pada := null;
    new.selesai_oleh := null;
  end if;
  return new;
end;
$$;

create trigger tugasan_masa_selesai
  before update on tugasan
  for each row execute function catat_masa_selesai();

create trigger tugasan_dikemas
  before update on tugasan
  for each row execute function tetapkan_dikemas();

create index tugasan_penerima_idx on tugasan (ditugaskan_kepada);
create index tugasan_status_idx   on tugasan (status);
create index tugasan_tarikh_idx   on tugasan (tarikh_akhir) where tarikh_akhir is not null;

-- ============================================================ KEMASKINI
-- Log kerja harian. Satu baris = satu laporan pendek daripada seorang AJK.
create table kemaskini (
  id           uuid primary key default gen_random_uuid(),
  ajk_id       uuid references ajk(id) on delete set null,
  nama_paparan text not null check (char_length(btrim(nama_paparan)) between 2 and 60),
  tugasan_id   uuid references tugasan(id) on delete set null,
  jenis        jenis_kemaskini not null default 'kemajuan',
  teks         text not null check (char_length(btrim(teks)) between 3 and 800),
  dicipta      timestamptz not null default now()
);
create index kemaskini_masa_idx on kemaskini (dicipta desc);
create index kemaskini_ajk_idx  on kemaskini (ajk_id, dicipta desc);

-- =============================================================== RISIKO
-- Pelan sandaran. Setiap senario mesti ada orang yang bertanggungjawab.
create table risiko (
  id              uuid primary key default gen_random_uuid(),
  senario         text not null check (char_length(btrim(senario)) between 5 and 160),
  pencetus        text,                      -- tanda amaran awal
  kebarangkalian  tahap not null default 'sederhana',
  kesan           tahap not null default 'sederhana',
  pelan_sandaran  text not null,
  penanggungjawab uuid references ajk(id) on delete set null,
  status          status_risiko not null default 'dipantau',
  urutan          smallint not null default 0,
  dikemas         timestamptz not null default now()
);
create trigger risiko_dikemas
  before update on risiko
  for each row execute function tetapkan_dikemas();

-- ======================================================= PAPARAN AWAM
-- Laman awam hanya nampak peratus siap setiap biro, bukan butiran tugas.
create view kemajuan_awam as
select
  b.id                                                        as biro_id,
  b.nama                                                      as biro,
  b.urutan,
  count(t.id)::int                                            as jumlah,
  count(t.id) filter (where t.status = 'selesai')::int        as selesai,
  count(t.id) filter (where t.status = 'tersekat')::int       as tersekat
from biro b
left join tugasan t on t.biro_id = b.id
group by b.id, b.nama, b.urutan;

-- ================================================================== RLS
alter table kemaskini enable row level security;
alter table risiko    enable row level security;
-- tiada polisi anon: kedua-duanya ruang kerja dalaman AJK sahaja

-- tugasan tidak lagi dibaca terus oleh anon — hanya melalui kemajuan_awam
drop policy if exists "baca_tugasan" on tugasan;
grant select on kemajuan_awam to anon, authenticated;

-- ============================================================= REALTIME
alter publication supabase_realtime add table kemaskini;
alter publication supabase_realtime add table risiko;
