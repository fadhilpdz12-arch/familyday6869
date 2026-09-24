-- =====================================================================
--  Kemas kini bajet ikut status terkini (23 Sept 2026)
--  Kutipan RM3,650. Penginapan, makanan & baju semua ditaja — tiada kos
--  ambil dari kutipan untuk item-item ni.
-- =====================================================================

insert into bajet (label, keterangan, amaun, jenis, urutan) values
 ('Kutipan yuran keluarga', 'Sehingga kini', 3650.00, 'masuk', 1),
 ('Penginapan (chalet)', 'Ditaja sepenuhnya — anggaran RM4,000, tiada kos dari kutipan', 0, 'keluar', 10),
 ('Makanan', 'Ditaja sepenuhnya — anggaran RM2,000, tiada kos dari kutipan', 0, 'keluar', 11),
 ('Baju Family Day', 'Ditaja sepenuhnya — anggaran RM1,200–1,400, tiada kos dari kutipan', 0, 'keluar', 12),
 ('Baki kutipan (belum dibelanja)', 'Untuk aktiviti, hadiah & lain-lain perbelanjaan', 3650.00, 'jumlah', 99);
