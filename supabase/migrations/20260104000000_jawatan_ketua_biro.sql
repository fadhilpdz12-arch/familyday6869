-- =====================================================================
--  Migrasi 4: jawatan AJK (Pengerusi, Pembantu Pengerusi, Ketua Biro)
--  + lantikan ketua biro dan penambahan kuota
-- =====================================================================

create type jawatan_ajk as enum ('pengerusi', 'pembantu_pengerusi', 'ketua_biro', 'ahli');

alter table ajk add column jawatan jawatan_ajk not null default 'ahli';

-- Pengerusi sedia ada kekal Pengerusi
update ajk set jawatan = 'pengerusi' where adalah_pengerusi;

-- Satu biro, seorang ketua aktif sahaja
create unique index ajk_satu_ketua_setiap_biro
  on ajk (biro_id) where jawatan = 'ketua_biro' and aktif;

-- ---------------------------------------------------------------------
--  Lantikan. Padan biro ikut nama (bukan id) supaya selamat walaupun
--  susunan biro dalam database live dah berubah. Kalau nama AJK dah ada,
--  jawatan dia dikemas kini; kalau belum, dia dimasukkan.
-- ---------------------------------------------------------------------
create or replace function pg_temp.lantik(p_nama text, p_biro text, p_jawatan jawatan_ajk)
returns void language plpgsql as $$
declare
  v_biro smallint;
  v_ajk  uuid;
begin
  select id into v_biro from biro where nama ilike p_biro order by urutan limit 1;
  if v_biro is null then
    raise notice 'Biro "%" tak jumpa — % tak dilantik', p_biro, p_nama;
    return;
  end if;

  select id into v_ajk from ajk where lower(btrim(nama)) = lower(btrim(p_nama)) limit 1;

  if v_ajk is null then
    insert into ajk (biro_id, nama, jawatan, urutan)
    values (v_biro, p_nama, p_jawatan,
            coalesce((select max(urutan) from ajk where biro_id = v_biro), 0) + 1);
  else
    update ajk set biro_id = v_biro, jawatan = p_jawatan, aktif = true where id = v_ajk;
  end if;

  -- pastikan kuota cukup untuk ahli yang ada
  update biro set kuota = greatest(kuota, (select count(*) from ajk where biro_id = v_biro and aktif))
  where id = v_biro;
end;
$$;

select pg_temp.lantik('Hanim',    'Pengerusi',              'pembantu_pengerusi');
select pg_temp.lantik('Hidayah',  'Aktiviti%',              'ketua_biro');
select pg_temp.lantik('Danial',   'Keselamatan%',           'ketua_biro');
select pg_temp.lantik('Poklong',  'Protokol%',              'ketua_biro');
select pg_temp.lantik('Fadhil',   'Dokumentasi%',           'ketua_biro');
select pg_temp.lantik('Irfan',    '%Logistik%',             'ketua_biro');
select pg_temp.lantik('Ciksu',    'Makanan%',               'ketua_biro');

-- Biro Protokol & Ibadah perlukan seorang lagi ahli
update biro set kuota = kuota + 1 where nama ilike 'Protokol%';
