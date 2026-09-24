-- =====================================================================
--  Migrasi 5: Storage untuk media (poster & lagu tema) + jadual tetapan
-- =====================================================================

-- bucket storage untuk poster tentatif dan lagu tema (public = boleh baca
-- terus tanpa sign, sebab ni memang untuk paparan awam)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- =====================================================================
--  TETAPAN — key/value ringkas untuk konfigurasi laman
--  Contoh kunci: 'poster_tentatif' (URL gambar poster),
--                'lagu_tema' (URL fail audio tema keluarga)
-- =====================================================================
create table tetapan (
  kunci   text primary key,
  nilai   text,
  dikemas timestamptz not null default now()
);

create trigger tetapan_dikemas
  before update on tetapan
  for each row execute function tetapkan_dikemas();

alter table tetapan enable row level security;
create policy "baca_tetapan" on tetapan for select to anon, authenticated using (true);
-- tiada polisi tulis untuk anon — semua tulisan melalui Server Action guna service role
