-- =====================================================================
--  Data benih penuh — jalankan selepas kedua-dua migrasi
-- =====================================================================

insert into biro (id, nama, tugas, kuota, urutan) values
 (1,'Pengerusi','Pantau semua biro, sahkan keputusan besar, kejar yang tersekat.',1,1),
 (2,'Bendahari','Kutip duit, simpan resit, jaga baki supaya tak terlebih belanja.',2,2),
 (3,'Tempat & Logistik','Urus chalet, susun bilik, semak kelengkapan masa masuk dan sebelum balik.',4,3),
 (4,'Makanan & Minuman','Rancang menu lima sesi makan, beli barang, jaga bajet dapur.',5,4),
 (5,'Aktiviti & Permainan','Susun sukaneka besar kecil, sediakan alatan, beli hadiah.',5,5),
 (6,'Dokumentasi & Publisiti','Rakam gambar dan video, kumpul semua dalam satu folder Drive.',3,6),
 (7,'Keselamatan & Kebajikan','Jaga budak-budak terutama kat kolam, sedia peti kecemasan.',3,7),
 (8,'Protokol & Ibadah','Ingatkan waktu solat, sediakan tempat berjemaah, uruskan sesi ucapan.',2,8);

insert into ajk (biro_id, nama, peranan, urutan, adalah_pengerusi) values
 (1,'Huda',      null,            1, true),
 (2,'Saadah',    null,            1, false),
 (3,'Irfan',     null,            1, false),
 (3,'Alesya',    null,            2, false),
 (4,'Ciksu',     null,            1, false),
 (4,'Cikteh',    null,            2, false),
 (4,'Aqil',      null,            3, false),
 (4,'Kak Farah', 'dengan Hafiz',  4, false),
 (4,'Abe Awi',   'BBQ',           5, false),
 (5,'Makdo',     'hadiah',        1, false),
 (5,'Zieka',     'hadiah',        2, false),
 (7,'Pakdo',     null,            1, false);

-- ------------------------------------------------------------ tentatif
insert into tentatif (hari, masa, tajuk, keterangan, tag, ibadah, draf, urutan) values
 (1,'2.00 ptg','Check in & punggah barang','Masuk bilik, susun tempat tidur, letak barang dapur kat ruang yang dah ditetapkan.','Logistik',false,false,1),
 (1,'2.30 ptg','Solat Zohor','Solat masing-masing lepas siap unpack.',null,true,false,2),
 (1,'4.30 ptg','Solat Asar berjemaah','Kumpul kat ruang tamu homestay.',null,true,false,3),
 (1,'5.00 ptg','Minum petang & budak-budak mandi kolam','Orang dewasa minum petang, budak-budak main air. Kena ada dua orang jaga tepi kolam.','Makanan',false,false,4),
 (1,'7.00 mlm','Solat Maghrib & bersiap','Budak-budak naik dari kolam paling lewat 6.30 petang.',null,true,false,5),
 (1,'8.00 mlm','Malam BBQ','Bakar awal supaya bara dah sedia. Sambil makan sambil kenal-kenal.','Abe Awi',false,false,6),

 (2,'7.30 pagi','Senamrobik','Guna sound system chalet. Semua umur boleh join.','Aktiviti',false,true,1),
 (2,'8.30 pagi','Sarapan',null,null,false,true,2),
 (2,'9.30 pagi','Sukaneka budak-budak','Lari dalam guni, isi air dalam botol, tarik upih. Semua peserta dapat hadiah.','Aktiviti',false,true,3),
 (2,'11.00 pagi','Sukaneka orang dewasa','Tarik tali antara keluarga dan bola tampar kat gelanggang.','Aktiviti',false,true,4),
 (2,'12.45 tgh','Solat Zohor',null,null,true,true,5),
 (2,'1.15 ptg','Makan tengah hari',null,null,false,true,6),
 (2,'2.30 ptg','Rehat & main dalam','Carrom, ping pong dan mini snooker dibuka. Boleh buat kejohanan kecil.',null,false,true,7),
 (2,'4.30 ptg','Solat Asar berjemaah',null,null,true,true,8),
 (2,'5.00 ptg','Mandi kolam & minum petang','Budak-budak naik paling lewat 6.30 petang.',null,false,true,9),
 (2,'7.00 mlm','Solat Maghrib & Isyak',null,null,true,true,10),
 (2,'8.15 mlm','Makan malam',null,null,false,true,11),
 (2,'9.00 mlm','Malam keluarga','Sesi salasilah, ucapan wakil keluarga, sampai hadiah sukaneka dan cabutan bertuah.','Pengerusi',false,true,12),
 (2,'11.00 mlm','Rehat','Budak-budak masuk tidur. Yang berjaga tolong kemas ruang makan.',null,false,true,13),

 (3,'7.30 pagi','Senamrobik','Ringan-ringan je sebelum sarapan.','Aktiviti',false,false,1),
 (3,'8.00 pagi','Sarapan',null,null,false,false,2),
 (3,'8.30 pagi','Budak-budak mandi kolam','Sesi terakhir. Kemas barang serentak supaya tak kelam-kabut masa check out.',null,false,false,3),
 (3,'11.00 pagi','Gambar beramai-ramai','Gambar penuh satu keluarga besar sebelum bersurai.','Dokumentasi',false,true,4),
 (3,'12.00 tgh','Check out','Semak bilik, pulang kunci, pastikan takde barang tertinggal.','Logistik',false,false,5);

-- --------------------------------------------------------------- bajet
insert into bajet (label, keterangan, amaun, jenis, urutan) values
 ('Kutipan yuran','RM150 × 27 orang dewasa', 4050, 'masuk', 1),
 ('Sewa penginapan','11 bilik aircond + 1 homestay', 4390, 'keluar', 2),
 ('Tolak sumbangan penaja','Tampung hampir semua sewa', 4000, 'tolak', 3),
 ('Baki sewa kena bayar', null, 390, 'keluar', 4),
 ('Baju keluarga','Ditaja sepenuhnya', 0, 'keluar', 5),
 ('Baki untuk makan minum dan lain-lain', null, 3660, 'jumlah', 6);

-- --------------------------------------------------------------- tugas
-- Setiap tugas ada orangnya dan ada tarikh akhir. Yang takde nama lagi
-- sengaja dibiar kosong supaya Pengerusi boleh assign dari panel.
insert into tugasan (biro_id, teks, butiran, ditugaskan_kepada, keutamaan, tarikh_akhir, urutan, dicipta_oleh) values
 (1,'Buat taklimat AJK pertama','Terangkan pembahagian biro, tunjuk laman ni, ajar cara guna panel.', (select id from ajk where nama='Huda'), 'tinggi','2026-09-30',1,'Sistem'),
 (1,'Isi kekosongan biro Dokumentasi','Biro ni masih kosong. Cari tiga orang yang rajin ambil gambar.', (select id from ajk where nama='Huda'), 'kritikal','2026-10-05',2,'Sistem'),
 (1,'Semak semua biro setiap minggu','Buka tab Update Harian, tengok siapa tak lapor, WhatsApp dia.', (select id from ajk where nama='Huda'), 'sederhana','2026-12-10',3,'Sistem'),
 (1,'Sahkan tentatif hari kedua','Tentatif hari kedua masih draf. Kena sahkan sebelum cetak.', (select id from ajk where nama='Huda'), 'tinggi','2026-11-01',4,'Sistem'),

 (2,'Buka akaun kutipan','Guna satu akaun je. Hebahkan nombor dalam group WhatsApp.', (select id from ajk where nama='Saadah'), 'kritikal','2026-09-30',10,'Sistem'),
 (2,'Kutip RM150 × 27 orang','Tanda dalam tab Kehadiran setiap kali ada orang bayar.', (select id from ajk where nama='Saadah'), 'kritikal','2026-11-30',11,'Sistem'),
 (2,'Sahkan duit penaja RM4,000 dah masuk','Minta bukti pemindahan, simpan dalam folder Drive.', (select id from ajk where nama='Saadah'), 'kritikal','2026-10-15',12,'Sistem'),
 (2,'Bayar deposit chalet','Tanya pihak Syafmel berapa deposit dan bila kena bayar.', (select id from ajk where nama='Saadah'), 'tinggi','2026-10-10',13,'Sistem'),
 (2,'Siapkan penyata akhir','Semua resit dikumpul, kira baki, kongsi dalam group lepas balik.', null, 'sederhana','2026-12-20',14,'Sistem'),

 (3,'Sahkan tempahan 11 bilik + 1 homestay','Dapatkan surat pengesahan bertulis, bukan setakat WhatsApp.', (select id from ajk where nama='Irfan'), 'kritikal','2026-09-30',20,'Sistem'),
 (3,'Kumpul saiz baju semua orang','Buat borang, kejar yang lambat jawab.', (select id from ajk where nama='Alesya'), 'tinggi','2026-10-20',21,'Sistem'),
 (3,'Hantar senarai saiz pada penaja baju', null, (select id from ajk where nama='Alesya'), 'tinggi','2026-10-31',22,'Sistem'),
 (3,'Buat pelan pembahagian bilik','Ikut keluarga. Orang tua bagi bilik dekat dengan surau dan tandas.', (select id from ajk where nama='Irfan'), 'sederhana','2026-11-25',23,'Sistem'),
 (3,'Recce chalet sekali sebelum acara','Tengok keadaan sebenar bilik, kolam, gelanggang, plug elektrik.', null, 'sederhana','2026-11-15',24,'Sistem'),
 (3,'Sedia senarai barang bawa dari rumah','Kipas, extension, lampu tambahan, tikar, apa yang chalet takde.', null, 'sederhana','2026-12-01',25,'Sistem'),

 (4,'Siapkan menu penuh lima sesi makan','BBQ, sarapan × 2, tengah hari × 2, malam × 1. Kira portion untuk 27 dewasa + budak.', (select id from ajk where nama='Ciksu'), 'tinggi','2026-10-31',30,'Sistem'),
 (4,'Dapatkan sebut harga katering vs masak sendiri','Banding dua-dua, bawa pada Bendahari untuk keputusan.', (select id from ajk where nama='Cikteh'), 'tinggi','2026-10-20',31,'Sistem'),
 (4,'Tempah daging, ayam, seafood untuk BBQ','Tempah awal, ambil sehari sebelum. Pastikan ada peti ais.', (select id from ajk where nama='Abe Awi'), 'tinggi','2026-11-30',32,'Sistem'),
 (4,'Beli arang, pemetik api, foil, tukul daging', null, (select id from ajk where nama='Abe Awi'), 'sederhana','2026-12-05',33,'Sistem'),
 (4,'Senarai alat dapur yang kena bawa','Periuk besar, kuali, pisau, papan potong, bekas simpan.', (select id from ajk where nama='Kak Farah'), 'sederhana','2026-11-20',34,'Sistem'),
 (4,'Urus air dan snek sepanjang tiga hari','Air kotak, teh, kopi, biskut. Jangan bertindih dengan senarai Bawa Apa.', (select id from ajk where nama='Aqil'), 'sederhana','2026-12-01',35,'Sistem'),
 (4,'Semak siapa ada pantang atau alahan','Baca nota dalam tab Kehadiran.', (select id from ajk where nama='Ciksu'), 'tinggi','2026-11-30',36,'Sistem'),

 (5,'Muktamadkan tentatif hari kedua','Hantar draf pada Pengerusi untuk disahkan.', (select id from ajk where nama='Makdo'), 'tinggi','2026-10-25',40,'Sistem'),
 (5,'Senarai permainan budak-budak','Lima permainan, ikut umur 4 sampai 12.', (select id from ajk where nama='Zieka'), 'sederhana','2026-11-01',41,'Sistem'),
 (5,'Senarai permainan orang dewasa','Tarik tali, bola tampar, dan satu permainan dalam kalau hujan.', (select id from ajk where nama='Makdo'), 'sederhana','2026-11-01',42,'Sistem'),
 (5,'Beli hadiah sukaneka dan cabutan bertuah','Bajet RM360. Pastikan semua budak dapat sesuatu.', (select id from ajk where nama='Zieka'), 'sederhana','2026-11-25',43,'Sistem'),
 (5,'Sediakan alatan sukaneka','Guni, tali, botol, upih, wisel, gula-gula.', null, 'sederhana','2026-12-05',44,'Sistem'),
 (5,'Sedia playlist dan uji sound system','Datang awal hari pertama, test mic dan lagu.', null, 'rendah','2026-12-11',45,'Sistem'),

 (6,'Lantik tiga ahli biro Dokumentasi','Biro ni kosong sepenuhnya.', null, 'kritikal','2026-10-05',50,'Sistem'),
 (6,'Buka folder Google Drive dan kongsi link','Buat folder ikut hari supaya senang cari.', null, 'tinggi','2026-11-01',51,'Sistem'),
 (6,'Susun giliran ambil gambar','Siapa pegang kamera bila. Jangan semua orang bergambar, takde orang rakam.', null, 'sederhana','2026-12-01',52,'Sistem'),
 (6,'Buat banner atau backdrop untuk gambar kumpulan', null, null, 'rendah','2026-12-05',53,'Sistem'),

 (7,'Sedia peti kecemasan lengkap','Plaster, ubat luka, ubat demam, ubat gastrik, minyak angin, sarung tangan.', (select id from ajk where nama='Pakdo'), 'kritikal','2026-12-05',60,'Sistem'),
 (7,'Susun giliran jaga kolam','Dua orang setiap sesi mandi. Buat jadual bertulis.', (select id from ajk where nama='Pakdo'), 'kritikal','2026-12-01',61,'Sistem'),
 (7,'Catat nombor klinik dan hospital terdekat','Simpan nombor, tampal kat pintu homestay.', null, 'tinggi','2026-12-01',62,'Sistem'),
 (7,'Semak siapa ada masalah kesihatan atau bawa ubat tetap','Tanya secara peribadi, jangan dalam group.', null, 'sederhana','2026-11-30',63,'Sistem'),

 (8,'Semak arah kiblat dan sediakan tempat solat','Bawa sejadah lebih dan telekung simpanan.', null, 'sederhana','2026-12-05',70,'Sistem'),
 (8,'Susun siapa jadi imam dan bilal', null, null, 'rendah','2026-12-05',71,'Sistem'),
 (8,'Sediakan teks ucapan wakil keluarga','Pendek je, lima minit cukup.', null, 'rendah','2026-12-08',72,'Sistem');

-- --------------------------------------------------------------- risiko
insert into risiko (senario, pencetus, kebarangkalian, kesan, pelan_sandaran, penanggungjawab, status, urutan) values
 ('Hujan lebat sepanjang hari kedua','Ramalan MET seminggu sebelum tunjuk hujan','tinggi','tinggi',
  'Pindah semua sukaneka ke dalam. Guna carrom, ping pong, mini snooker dan permainan dalam. BBQ pindah bawah bumbung atau tukar jadi masak dalam. Sediakan satu senarai permainan dalam sebagai ganti penuh.',
  (select id from ajk where nama='Makdo'), 'pelan_sedia', 1),

 ('Ada budak lemas atau tercedera dekat kolam','Budak mandi tanpa orang dewasa tepi kolam','sederhana','tinggi',
  'Tiada sesi mandi tanpa dua orang dewasa bertugas. Peti kecemasan letak tepi kolam. Nombor klinik dan hospital tampal kat pintu. Satu kereta sentiasa ada minyak dan kunci tergantung kat tempat yang semua tahu.',
  (select id from ajk where nama='Pakdo'), 'pelan_sedia', 2),

 ('Duit kutipan tak cukup sebab ada yang tak bayar','Kurang 20 orang bayar menjelang 20 November','sederhana','tinggi',
  'Bendahari kejar secara peribadi mulai 15 November. Kalau masih kurang, potong bajet hadiah dan snek dulu, jangan potong makanan utama. Simpanan kecemasan RM100 kekal jangan sentuh.',
  (select id from ajk where nama='Saadah'), 'dipantau', 3),

 ('Penaja tarik diri','Tiada pengesahan bertulis menjelang 15 Oktober','rendah','tinggi',
  'Dapatkan pengesahan bertulis awal. Kalau tarik diri, yuran naik kepada RM300 seorang atau tukar ke chalet lebih murah. Keputusan kena dibuat sebelum 31 Oktober supaya sempat.',
  (select id from ajk where nama='Huda'), 'dipantau', 4),

 ('Katering lewat atau batal saat akhir','Tak dapat dihubungi dua hari sebelum','sederhana','tinggi',
  'Simpan nombor dua kedai masakan lain di Setiu. Sediakan bahan simpanan untuk satu sesi makan mudah — nasi, telur, sardin, mi goreng.',
  (select id from ajk where nama='Ciksu'), 'pelan_sedia', 5),

 ('Bilik tak cukup sebab lebih ramai datang','Pengesahan kehadiran lebih daripada 11 bilik boleh muat','sederhana','sederhana',
  'Tab Kehadiran tunjuk jumlah masa nyata. Kalau lebih, tempah homestay tambahan awal atau susun tidur di ruang tamu untuk yang muda-muda.',
  (select id from ajk where nama='Irfan'), 'dipantau', 6),

 ('Elektrik terputus atau aircond rosak','Chalet lapor masalah, atau ribut petir','rendah','sederhana',
  'Bawa kipas berdiri dua tiga buah dan lampu bateri. Tanya pihak chalet siapa juruteknik on-call dan simpan nombornya.',
  (select id from ajk where nama='Irfan'), 'dipantau', 7),

 ('AJK utama tak dapat hadir saat akhir','AJK tak lapor dalam dua minggu berturut-turut','sederhana','sederhana',
  'Setiap biro kena ada sekurang-kurangnya dua orang tahu kerja yang sama. Pengerusi pantau tab Update Harian — kalau ada yang senyap, terus tanya.',
  (select id from ajk where nama='Huda'), 'dipantau', 8),

 ('Ada yang sakit atau demam masa acara','Ada yang batuk demam sebelum bertolak','sederhana','sederhana',
  'Peti kecemasan ada ubat demam dan gastrik. Sediakan satu bilik sebagai tempat rehat. Yang demam teruk sebelum bertolak, elok tangguh datang.',
  (select id from ajk where nama='Pakdo'), 'dipantau', 9),

 ('Jalan sesak atau banjir masa perjalanan ke Setiu','Amaran banjir monsun Disember di pantai timur','sederhana','tinggi',
  'Disember memang musim tengkujuh pantai timur. Pantau amaran banjir dari seminggu sebelum. Kongsi laluan alternatif dalam group. Yang jauh bertolak awal pagi, jangan malam.',
  (select id from ajk where nama='Huda'), 'dipantau', 10);

-- =====================================================================
--  AGIHAN KERJA — contoh kerja/aktiviti terperinci ikut biro
-- =====================================================================
insert into rancangan_kerja
  (biro_id, tajuk, keterangan, hari, masa, status, pencetus_sandaran, pelan_sandaran, urutan, dicipta_oleh)
values
 (5,'Lari dalam guni','Peringkat kanak-kanak 4–12 tahun. Bahagi ikut kumpulan umur supaya adil.',
  2,'9.30 pagi','sedang_disiapkan','Hujan lebat',
  'Pindah ke ruang tamu, buat versi dalam guna bantal sebagai penghalang laluan.',1,'Sistem'),

 (5,'Tarik tali antara keluarga','Bahagi dua pasukan besar ikut cabang keluarga.',
  2,'11.00 pagi','belum_mula','Hujan lebat',
  'Ganti dengan permainan dalam — kejohanan kecil carrom atau ping pong berpasukan.',2,'Sistem'),

 (5,'Isi air dalam botol (relay)','Guna botol air mineral kosong dan baldi kecil, larian berganti-ganti.',
  2,'9.30 pagi','belum_mula',null,null,3,'Sistem'),

 (5,'Senamrobik pagi','15 minit ringan sebelum sarapan, guna sound system chalet.',
  2,'7.30 pagi','sedia',null,null,4,'Sistem'),

 (4,'Malam BBQ','Bakar daging, ayam dan seafood. Sediakan meja hidang berasingan untuk anak kecil.',
  1,'8.00 malam','sedang_disiapkan','Hujan lebat / ribut petir',
  'Pindah masak bawah bumbung chalet, atau tukar terus kepada masak dalam guna dapur gas.',1,'Sistem'),

 (8,'Malam keluarga & ucapan','Sesi salasilah, ucapan wakil keluarga, sampai hadiah sukaneka dan cabutan bertuah.',
  2,'9.00 malam','belum_mula',null,null,1,'Sistem');

insert into rancangan_pautan (rancangan_id, label, url, urutan) values
 ((select id from rancangan_kerja where tajuk='Lari dalam guni'),
  'Contoh video cara main','https://www.youtube.com/results?search_query=lari+dalam+guni+family+day',1),
 ((select id from rancangan_kerja where tajuk='Tarik tali antara keluarga'),
  'Peraturan ringkas tarik tali','https://www.youtube.com/results?search_query=peraturan+tarik+tali',1);

insert into rancangan_pic (rancangan_id, ajk_id, peranan) values
 ((select id from rancangan_kerja where tajuk='Lari dalam guni'), (select id from ajk where nama='Zieka'), 'PIC utama'),
 ((select id from rancangan_kerja where tajuk='Tarik tali antara keluarga'), (select id from ajk where nama='Makdo'), 'PIC utama'),
 ((select id from rancangan_kerja where tajuk='Senamrobik pagi'), (select id from ajk where nama='Makdo'), null),
 ((select id from rancangan_kerja where tajuk='Malam BBQ'), (select id from ajk where nama='Abe Awi'), 'PIC utama');

insert into rancangan_bahan (rancangan_id, teks, sedia, urutan) values
 ((select id from rancangan_kerja where tajuk='Lari dalam guni'), 'Guni beras (10 helai)', false, 1),
 ((select id from rancangan_kerja where tajuk='Lari dalam guni'), 'Wisel', false, 2),
 ((select id from rancangan_kerja where tajuk='Tarik tali antara keluarga'), 'Tali tambang panjang', false, 1),
 ((select id from rancangan_kerja where tajuk='Malam BBQ'), 'Arang & pemetik api', true, 1),
 ((select id from rancangan_kerja where tajuk='Malam BBQ'), 'Foil & tukul daging', false, 2);

insert into petugas_hari (hari, peranan, ajk_id, nota, urutan) values
 (1,'pic_keseluruhan', (select id from ajk where nama='Huda'), null, 1),
 (2,'pic_keseluruhan', (select id from ajk where nama='Huda'), null, 1),
 (2,'emcee', (select id from ajk where nama='Makdo'), 'Pastikan mic diuji awal pagi', 2),
 (3,'pic_keseluruhan', (select id from ajk where nama='Irfan'), 'Fokus proses check out', 1);

-- kaitkan risiko sedia ada dengan kerja yang terjejas terus kalau hujan
update risiko set rancangan_id = (select id from rancangan_kerja where tajuk='Tarik tali antara keluarga')
where senario = 'Hujan lebat sepanjang hari kedua';
