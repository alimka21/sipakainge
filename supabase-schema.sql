-- ==============================================================================
-- SIPAKAINGE - UPT SPF SDN PERCONTOHAN PAM MAKASSAR
-- Skema Database Supabase (PostgreSQL)
--
-- Cara pakai: Supabase Dashboard -> SQL Editor -> New Query -> tempel -> Run.
--
-- Script ini idempotent: aman dijalankan berulang kali, dan aman dijalankan di
-- atas database yang sudah memakai versi skema sebelumnya (tabel lama
-- diperluas dengan ALTER TABLE ... ADD COLUMN IF NOT EXISTS, bukan dihapus).
-- Data contoh memakai ON CONFLICT DO NOTHING sehingga tidak menimpa data asli.
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- 0. OPSIONAL: bersihkan data contoh dari skema versi lama
--    Versi lama mengisi guru/murid dengan ID & NISN yang berbeda dari aplikasi
--    sekarang. Jika Anda pernah menjalankan versi lama dan belum ada data asli,
--    hapus tanda "--" pada dua baris DELETE di bawah SEBELUM menjalankan script.
--    PERINGATAN: daily_habits milik murid tersebut ikut terhapus (CASCADE).
-- ------------------------------------------------------------------------------
-- DELETE FROM public.murid    WHERE id IN ('m-4a-1','m-4a-2','m-4a-3','m-4a-4','m-4a-5','m-5b-1','m-5b-2','m-3a-1','m-1b-1','m-6c-1');
-- DELETE FROM public.teachers WHERE id IN ('t-fahmawati','t-siti-aminah','t-bambang','t-dewi-lestari','t-hendra','t-nur-aisyah','t-rizky','t-kartika');


-- ------------------------------------------------------------------------------
-- 1. FUNGSI BANTU: isi otomatis kolom updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


-- ------------------------------------------------------------------------------
-- 2. PENGATURAN SEKOLAH (1 baris) — foto Kepala Sekolah untuk header & landing page
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    school_name TEXT NOT NULL DEFAULT 'UPT SPF SDN Percontohan PAM Makassar',
    principal_name TEXT NOT NULL,
    principal_nip TEXT,
    principal_photo_url TEXT,
    semester_aktif TEXT NOT NULL DEFAULT 'Ganjil 2026/2027',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------
-- 3. GURU & OBSERVER (teachers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY,
    nip TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Guru Kelas',
    rombel TEXT,
    subject TEXT,
    avatar TEXT,
    is_observer BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.teachers
    ADD COLUMN IF NOT EXISTS initials TEXT,
    ADD COLUMN IF NOT EXISTS fase TEXT CHECK (fase IN ('fase-a', 'fase-b', 'fase-c')),
    ADD COLUMN IF NOT EXISTS fase_label TEXT,
    ADD COLUMN IF NOT EXISTS topic TEXT,
    ADD COLUMN IF NOT EXISTS target_schedule TEXT,
    ADD COLUMN IF NOT EXISTS schedule_time TEXT,
    ADD COLUMN IF NOT EXISTS focus_supervision TEXT,
    ADD COLUMN IF NOT EXISTS focus_supervision_desc TEXT,
    ADD COLUMN IF NOT EXISTS stage TEXT CHECK (stage IN ('pra', 'telaah', 'observasi', 'refleksi', 'tuntas')),
    ADD COLUMN IF NOT EXISTS stage_badge_text TEXT,
    ADD COLUMN IF NOT EXISTS stage_badge_type TEXT CHECK (stage_badge_type IN ('primary', 'secondary', 'tertiary', 'error', 'neutral')),
    ADD COLUMN IF NOT EXISTS score NUMERIC(3, 2),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS assigned_observer_name TEXT,
    ADD COLUMN IF NOT EXISTS assigned_at TEXT;


-- ------------------------------------------------------------------------------
-- 4. KELAS / ROMBEL + WALI KELAS (Manajemen Kelas)
--    Satu guru hanya boleh menjadi wali kelas untuk satu rombel.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rombel (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    fase TEXT NOT NULL CHECK (fase IN ('fase-a', 'fase-b', 'fase-c')),
    wali_kelas_id TEXT REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS rombel_wali_kelas_unik
    ON public.rombel (wali_kelas_id)
    WHERE wali_kelas_id IS NOT NULL;


-- ------------------------------------------------------------------------------
-- 5. DATA MURID (murid)
--    NISN unik: akun orang tua login memakai NISN dan terhubung ke tepat 1 murid.
--    Relasi ke rombel ditambahkan di bagian 13 (setelah data kelas terisi).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.murid (
    id TEXT PRIMARY KEY,
    nisn TEXT NOT NULL,
    nis TEXT NOT NULL,
    name TEXT NOT NULL,
    rombel TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('L', 'P')),
    parent_name TEXT,
    parent_phone TEXT,
    wake_up_time TEXT DEFAULT '05:00',
    bed_time TEXT DEFAULT '21:00',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.murid
    ADD COLUMN IF NOT EXISTS fase TEXT CHECK (fase IN ('fase-a', 'fase-b', 'fase-c')),
    ADD COLUMN IF NOT EXISTS tanggal_lahir DATE,
    ADD COLUMN IF NOT EXISTS alamat TEXT,
    ADD COLUMN IF NOT EXISTS avatar TEXT,
    ADD COLUMN IF NOT EXISTS habits JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS prayers JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS notes TEXT;


-- ------------------------------------------------------------------------------
-- 6. JURNAL HARIAN 7 KAIH (daily_habits)
--    Kolom lama dipertahankan agar cocok dengan recordDailyHabit() di
--    src/lib/supabase.ts (upsert onConflict 'murid_id,date').
--    Data dianggap tersimpan resmi setelah divalidasi Wali Kelas.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    murid_id TEXT REFERENCES public.murid(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    wake_up_time TEXT,
    bed_time TEXT,
    habits JSONB DEFAULT '{}'::jsonb,
    prayers JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_murid_date UNIQUE (murid_id, date)
);

-- Versi lama memakai default '[]', padahal aplikasi menyimpan objek {"1": true, ...}
ALTER TABLE public.daily_habits ALTER COLUMN habits SET DEFAULT '{}'::jsonb;

ALTER TABLE public.daily_habits
    ADD COLUMN IF NOT EXISTS divalidasi BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS divalidasi_oleh TEXT REFERENCES public.teachers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS divalidasi_pada TIMESTAMPTZ;

DROP TRIGGER IF EXISTS trg_daily_habits_updated_at ON public.daily_habits;
CREATE TRIGGER trg_daily_habits_updated_at
    BEFORE UPDATE ON public.daily_habits
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ------------------------------------------------------------------------------
-- 7. PRESENSI MURID (satu catatan per murid per tanggal)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.presensi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    murid_id TEXT NOT NULL REFERENCES public.murid(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('Hadir', 'Sakit', 'Izin', 'Alpa')),
    keterangan TEXT,
    dicatat_oleh TEXT REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT presensi_murid_tanggal_unik UNIQUE (murid_id, tanggal)
);


-- ------------------------------------------------------------------------------
-- 8. NILAI AKADEMIK MAPEL (satu baris per tugas/evaluasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nilai_akademik (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    murid_id TEXT NOT NULL REFERENCES public.murid(id) ON DELETE CASCADE,
    mapel TEXT NOT NULL,
    nama_tugas TEXT NOT NULL,
    nilai NUMERIC(5, 2) NOT NULL CHECK (nilai BETWEEN 0 AND 100),
    dicatat_oleh TEXT REFERENCES public.teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------
-- 9. KARYA & PORTOFOLIO MURID
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portofolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    murid_id TEXT NOT NULL REFERENCES public.murid(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    kategori TEXT NOT NULL,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    deskripsi TEXT NOT NULL,
    umpan_balik_guru TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------
-- 10. PRESTASI & APRESIASI MURID
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prestasi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    murid_id TEXT NOT NULL REFERENCES public.murid(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    tingkat TEXT NOT NULL CHECK (tingkat IN ('Kelas', 'Sekolah', 'Kecamatan', 'Kota', 'Provinsi', 'Nasional')),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    deskripsi TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------
-- 11. SESI SUPERVISI KLINIS GURU (sumber data Laporan Hasil Supervisi per Guru)
--     Satu sesi per guru per semester, sehingga riwayat antar-semester tersimpan.
--     scores17 = telaah perangkat ajar (17 aspek, skala 0-2)
--     scores22 = observasi kelas (22 aspek, skala 1-4)
--     Kunci JSON = nomor aspek, contoh: {"1": 3, "2": 4}
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supervision_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    semester TEXT NOT NULL DEFAULT 'Ganjil 2026/2027',
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'DIAJUKAN', 'DISETUJUI', 'TERJADWAL', 'DOKUMEN_DIUPLOAD',
        'PERANGKAT_DINILAI', 'OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA',
        'REFLEKSI_GURU', 'PENGUATAN_KEPALA_SEKOLAH', 'TINDAK_LANJUT', 'SELESAI'
    )),
    mapel TEXT,
    kelas TEXT,
    topik TEXT,
    tujuan TEXT,
    tanggal DATE,
    jam TEXT,
    lokasi TEXT,
    supervisor TEXT,
    catatan_awal TEXT,
    rpp_file_name TEXT,
    rpp_file_size TEXT,
    rpp_upload_date TEXT,
    rpp_url TEXT,
    rpp_status TEXT NOT NULL DEFAULT 'BELUM_DIPERIKSA'
        CHECK (rpp_status IN ('BELUM_DIPERIKSA', 'DIPERIKSA', 'PERLU_PERBAIKAN')),
    scores17 JSONB NOT NULL DEFAULT '{}'::jsonb,
    comments17 JSONB NOT NULL DEFAULT '{}'::jsonb,
    aspect_status14 JSONB NOT NULL DEFAULT '{}'::jsonb,
    aspect_feedback14 JSONB NOT NULL DEFAULT '{}'::jsonb,
    kelebihan15 TEXT,
    kekurangan16 TEXT,
    rekomendasi17 TEXT,
    obs_timer_seconds INTEGER NOT NULL DEFAULT 0,
    obs_notes TEXT,
    reflection1 TEXT,
    reflection2 TEXT,
    reflection3 TEXT,
    reflection4 TEXT,
    reflection5 TEXT,
    reflection6 TEXT,
    penguatan_ks TEXT,
    catatan_khusus_ks TEXT,
    rekomendasi_ks TEXT,
    tindak_lanjut_ks TEXT NOT NULL DEFAULT 'TIDAK_ADA_TINDAK_LANJUT' CHECK (tindak_lanjut_ks IN (
        'TIDAK_ADA_TINDAK_LANJUT', 'TINDAK_LANJUT_RINGAN', 'PERLU_PENDAMPINGAN', 'PERLU_SUPERVISI_LANJUTAN'
    )),
    scores22 JSONB NOT NULL DEFAULT '{}'::jsonb,
    comments22 JSONB NOT NULL DEFAULT '{}'::jsonb,
    apresiasi_obs TEXT,
    temuan_obs TEXT,
    kesimpulan_obs TEXT CHECK (kesimpulan_obs IN (
        'Sangat Baik', 'Baik', 'Baik dengan Penguatan', 'Memerlukan Pendampingan Intensif'
    )),
    komitmen_guru TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT supervisi_guru_semester_unik UNIQUE (teacher_id, semester)
);

DROP TRIGGER IF EXISTS trg_supervision_sessions_updated_at ON public.supervision_sessions;
CREATE TRIGGER trg_supervision_sessions_updated_at
    BEFORE UPDATE ON public.supervision_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_school_settings_updated_at ON public.school_settings;
CREATE TRIGGER trg_school_settings_updated_at
    BEFORE UPDATE ON public.school_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ------------------------------------------------------------------------------
-- 12. INDEKS untuk query per murid / per guru
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_murid_rombel ON public.murid (rombel);
CREATE INDEX IF NOT EXISTS idx_presensi_murid ON public.presensi (murid_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_nilai_murid ON public.nilai_akademik (murid_id, mapel);
CREATE INDEX IF NOT EXISTS idx_portofolio_murid ON public.portofolio (murid_id);
CREATE INDEX IF NOT EXISTS idx_prestasi_murid ON public.prestasi (murid_id);
CREATE INDEX IF NOT EXISTS idx_supervisi_guru ON public.supervision_sessions (teacher_id);


-- ==============================================================================
-- DATA AWAL (SEED) — sama persis dengan data di src/data/mockData.ts & App.tsx
-- ==============================================================================

INSERT INTO public.school_settings (id, principal_name, principal_nip, principal_photo_url)
VALUES (
    1,
    'Fahmawati, S.Pd.',
    '197305111995012002',
    'https://lh3.googleusercontent.com/aida/AEtjO1UklTfGWNtEP7y35w9SEC_qhPmM2GY6gi2KtZIVmMfgt3R0mDdRTuX3UF3NObWCnUOXAhdfhOTeOHa2RByRewhyy6x32XI5_ywK86fmCh-aSvfPYnqQpgc-Rb6NBZqm-5xP4WU4wp5hghAEEyFtNVemogihS69vXboewTsf4zKpCrjlGUPeC29RQCVdl4ysa0_CYeOb5LGzjZRMtFoL-Coc7IKM85Fuwuc-xTKyh4reYNrD4ApB9NtLt6A'
)
ON CONFLICT (id) DO NOTHING;

-- Guru tanpa foto (avatar NULL) — aplikasi menampilkan inisial sebagai gantinya
INSERT INTO public.teachers (
    id, nip, name, role, initials, rombel, fase, fase_label, subject, topic,
    target_schedule, schedule_time, focus_supervision, focus_supervision_desc,
    stage, stage_badge_text, stage_badge_type, score, notes, is_observer,
    assigned_observer_name, assigned_at, avatar
)
VALUES
    ('t-1', '19840212 200801 2 018', 'Ibu Siti Aminah, S.Pd.', 'Guru Kelas / Observer', 'SA', 'Kelas IV-A', 'fase-b', 'Fase B',
     'IPAS (Sains & Lingkungan)', 'Ekosistem & Fotosintesis Tumbuhan', 'Hari Ini, 08:00', '08:00 - 09:15 WITA',
     'Diferensiasi Proses', 'Integrasi LKPD berjenjang untuk pemahaman konsep.',
     'observasi', 'Observasi Terjadwal', 'tertiary', 3.6, NULL, true,
     'Fahmawati, S.Pd. (Kepala Sekolah)', '12 Sep 2025', NULL),
    ('t-2', '19790615 200501 1 009', 'Bpk. Bambang Irawan, S.Pd.', 'Guru Kelas', 'BI', 'Kelas V-B', 'fase-c', 'Fase C',
     'Matematika Operasional', 'Operasi Pecahan & Desimal', 'Hari Ini, 10:00', '10:00 - 11:15 WITA',
     'Pemanfaatan IT', 'Media manipulatif digital pecahan & soal cerita.',
     'telaah', 'Perlu Perbaikan Modul', 'error', NULL,
     'Catatan Review: Alat peraga konkret belum dicantumkan dalam lembar kerja murid.', false,
     'Ibu Siti Aminah, S.Pd. (Guru Observer)', '15 Sep 2025', NULL),
    ('t-3', '19681105 199307 1 002', 'Drs. Ruslan Daeng Rewa', 'Guru Kelas / Observer', 'DR', 'Kelas VI-C', 'fase-c', 'Fase C',
     'Pendidikan Pancasila', 'Budaya Musyawarah & Gotong Royong', 'Kemarin (19 Mar)', 'Observasi Selesai',
     'Budaya Positif', 'Praktik musyawarah kelas & penguatan karakter Profil Pelajar Pancasila.',
     'refleksi', 'Menunggu Refleksi 1:1', 'secondary', NULL, NULL, true,
     'Fahmawati, S.Pd. (Kepala Sekolah)', '10 Sep 2025', NULL),
    ('t-4', '19910408 201903 2 011', 'Ibu Nur Aisyah, S.Pd.', 'Guru Kelas', 'NA', 'Kelas III-A', 'fase-b', 'Fase B',
     'Bahasa Indonesia', 'Teks Deskripsi Lingkungan', 'Hari Ini, 13:00', '13:00 - 14:00 WITA',
     'Literasi Kontekstual', 'Membaca terbimbing dan kosakata kearifan lokal Makassar.',
     'telaah', 'Antrean Verifikasi', 'neutral', NULL, NULL, false,
     'Drs. Ruslan Daeng Rewa (Guru Observer)', '18 Sep 2025', NULL),
    ('t-5', '19870314 201101 2 007', 'Ibu Maria Kusuma, S.Pd.SD', 'Guru Kelas', 'MK', 'Kelas I-B', 'fase-a', 'Fase A',
     'Pendidikan Karakter & Numerasi Awal', '7 Kebiasaan Anak Indonesia Hebat (7 KAIH) & Berhitung Ceria',
     '14 Mar 2026', 'Skor: 94.2 (Amat Baik)', '7 KAIH Anak',
     'Integrasi habit tracker ''Gemar Membaca'' dan kedisiplinan pagi.',
     'tuntas', 'Siklus Tuntas & Arsip', 'tertiary', 3.8, NULL, false,
     'Fahmawati, S.Pd. (Kepala Sekolah)', '05 Sep 2025', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rombel (id, name, fase, wali_kelas_id)
VALUES
    ('r-1b', 'Kelas I-B',   'fase-a', 't-5'),
    ('r-3a', 'Kelas III-A', 'fase-b', 't-4'),
    ('r-4a', 'Kelas IV-A',  'fase-b', 't-1'),
    ('r-5b', 'Kelas V-B',   'fase-c', 't-2'),
    ('r-6c', 'Kelas VI-C',  'fase-c', 't-3')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.murid (
    id, nisn, nis, name, gender, rombel, fase, parent_name, parent_phone,
    wake_up_time, bed_time, habits, prayers, notes
)
VALUES
    ('m-4a-1', '0148928371', '240801', 'Ahmad Faris Al-Fatih', 'L', 'Kelas IV-A', 'fase-b', 'Ibu Rahmawati & Bpk. Irwan', '0812-4291-8821', '05:00', '21:00',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Konsisten bangun mandiri dan sholat berjamaah subuh di musholla.'),
    ('m-4a-2', '0148928372', '240802', 'Andi Siti Nurhaliza', 'P', 'Kelas IV-A', 'fase-b', 'Bpk. Syamsuddin & Ibu Nurlaela', '0813-5512-3490', '04:50', '20:45',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":true,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Sangat gemar membaca cerita rakyat dan santun bertutur kata.'),
    ('m-4a-3', '0148928373', '240803', 'Muhammad Al-Ghifari', 'L', 'Kelas IV-A', 'fase-b', 'Ibu Hasnah M.', '0821-9988-1203', '05:15', '21:10',
     '{"1":true,"2":true,"3":false,"4":true,"5":true,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":true,"dhuha":false,"doaHarian":true}',
     'Perlu dorongan untuk olahraga senam pagi mandiri.'),
    ('m-4a-4', '0148928374', '240804', 'Aisyah Humaira Putri', 'P', 'Kelas IV-A', 'fase-b', 'Ibu Rusmina & Bpk. Anwar', '0852-3344-7711', '04:45', '20:30',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":true,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Pola tidur dan nutrisi buah/sayur sangat baik dan konsisten.'),
    ('m-4a-5', '0148928375', '240805', 'Rizky Pratama Ramadhan', 'L', 'Kelas IV-A', 'fase-b', 'Bpk. Ramli Djafar', '0812-7711-2299', '05:10', '21:15',
     '{"1":true,"2":true,"3":true,"4":false,"5":true,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":false,"dhuha":true,"doaHarian":true}',
     'Aktif olahraga, pendampingan untuk konsumsi sayur saat sarapan.'),
    ('m-4a-6', '0148928376', '240806', 'Fathir Muhammad', 'L', 'Kelas IV-A', 'fase-b', 'Ibu Mardiana', '0813-8822-1133', '05:00', '20:50',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Suka membantu teman di kelas, adab santun (sipakatau) tinggi.'),
    ('m-4a-7', '0148928377', '240807', 'Nayla Az-Zahra', 'P', 'Kelas IV-A', 'fase-b', 'Bpk. Faisal & Ibu Salma', '0822-6655-4433', '04:55', '20:45',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":true,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Tuntas seluruh 7 KAIH dan rajin mengaji Juz 30.'),
    ('m-5b-1', '0137819201', '230701', 'Bilal Ar-Rayyan', 'L', 'Kelas V-B', 'fase-c', 'Bpk. Hendra Wijaya', '0812-9900-1122', '05:00', '21:00',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Kemampuan numerasi & karakter kedisiplinan mandiri.'),
    ('m-5b-2', '0137819202', '230702', 'Syifa Fauziah', 'P', 'Kelas V-B', 'fase-c', 'Ibu Nurjanah', '0813-1122-3344', '04:45', '20:40',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":true,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Sangat tekun membaca dan teratur waktu istirahat.'),
    ('m-5b-3', '0137819203', '230703', 'Dimas Aditya Pratama', 'L', 'Kelas V-B', 'fase-c', 'Bpk. Gunawan', '0821-4455-6677', '05:20', '21:30',
     '{"1":false,"2":true,"3":true,"4":true,"5":false,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":false,"dhuha":true,"doaHarian":true}',
     'Perlu motivasi bangun pagi mandiri.'),
    ('m-3a-1', '0159827361', '250901', 'Keisha Salsabila', 'P', 'Kelas III-A', 'fase-b', 'Ibu Erna Wati', '0852-7788-9900', '05:00', '20:30',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":true,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Literasi membaca dan sholat 5 waktu konsisten.'),
    ('m-3a-2', '0159827362', '250902', 'Farhan Maulana', 'L', 'Kelas III-A', 'fase-b', 'Bpk. Mansyur', '0812-3322-1100', '05:05', '20:55',
     '{"1":true,"2":true,"3":true,"4":true,"5":false,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Aktif bergerak, pembiasaan membaca 15 menit sedang didorong.'),
    ('m-1b-1', '0178923411', '261001', 'Kinan Anindya', 'P', 'Kelas I-B', 'fase-a', 'Ibu Ratna Komala', '0813-4433-2211', '05:00', '20:15',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":true}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":true,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Kemandirian awal Fase A sangat membanggakan.'),
    ('m-1b-2', '0178923412', '261002', 'Raditya Pratama', 'L', 'Kelas I-B', 'fase-a', 'Bpk. Suryadi', '0821-6677-8899', '05:15', '20:45',
     '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"7":false}',
     '{"subuh":true,"dzuhur":true,"ashar":true,"maghrib":true,"isya":false,"tadarus":true,"dhuha":true,"doaHarian":true}',
     'Ceria dan tertib dalam merapikan alat tulis.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.supervision_sessions (
    teacher_id, semester, status, mapel, kelas, topik, tujuan, tanggal, jam, lokasi, supervisor, catatan_awal,
    rpp_file_name, rpp_file_size, rpp_upload_date, rpp_status,
    scores17, comments17, aspect_status14, aspect_feedback14, kelebihan15, kekurangan16, rekomendasi17,
    obs_timer_seconds, obs_notes,
    reflection1, reflection2, reflection3, reflection4, reflection5, reflection6,
    penguatan_ks, catatan_khusus_ks, rekomendasi_ks, tindak_lanjut_ks,
    scores22, comments22, apresiasi_obs, temuan_obs, kesimpulan_obs, komitmen_guru
)
VALUES
    ('t-1', 'Ganjil 2026/2027', 'DOKUMEN_DIUPLOAD', 'IPAS (Sains & Lingkungan)', 'Kelas IV-A', 'Ekosistem & Fotosintesis Tumbuhan',
     '1. Mengidentifikasi rantai makanan. 2. Membuktikan pelepasan oksigen dalam fotosintesis.',
     '2026-10-01', '08:00 - 09:30', 'Ruang Kelas IV-A', 'Fahmawati, S.Pd. (Kepala Sekolah)',
     'Mohon masukan untuk instrumen pancingan bernalar kritis kelompok.',
     'Modul_Ajar_IPAS_FaseB_Siti_Aminah.pdf', '2.4 MB', '24 Sep 2026', 'BELUM_DIPERIKSA',
     '{"1":2,"2":2,"3":1,"4":1,"5":2}', '{}', '{}', '{}', NULL, NULL, NULL,
     0, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, NULL, 'TIDAK_ADA_TINDAK_LANJUT',
     '{}', '{}', NULL, NULL, 'Baik', NULL),

    ('t-2', 'Ganjil 2026/2027', 'DIAJUKAN', 'Matematika Operasional', 'Kelas V-B', 'Operasi Pecahan & Desimal',
     'Murid mampu mengoperasikan penjumlahan pecahan berpenyebut tidak sama.',
     '2026-10-05', '10:00 - 11:30', 'Ruang Kelas V-B', 'Ibu Siti Aminah, S.Pd. (Guru Observer)',
     'Menggunakan visualizer digital interaktif.',
     NULL, NULL, NULL, 'BELUM_DIPERIKSA',
     '{}', '{}', '{}', '{}', NULL, NULL, NULL,
     0, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, NULL, 'TIDAK_ADA_TINDAK_LANJUT',
     '{}', '{}', NULL, NULL, 'Baik', NULL),

    ('t-3', 'Ganjil 2026/2027', 'OBSERVASI_DILAKUKAN', 'Pendidikan Pancasila', 'Kelas VI-C', 'Budaya Musyawarah & Gotong Royong',
     'Murid mampu mempraktikkan musyawarah dalam mufakat di kelas secara terbimbing.',
     '2026-09-25', '09:00 - 10:30', 'Ruang Kelas VI-C', 'Fahmawati, S.Pd. (Kepala Sekolah)',
     'Diferensiasi proses pembelajaran musyawarah.',
     'Modul_Ajar_Pancasila_VI_C_Ruslan.pdf', '1.8 MB', '21 Sep 2026', 'DIPERIKSA',
     '{"1":2,"2":2,"3":2,"4":1,"5":2,"6":2,"7":2,"8":2,"9":1,"10":2,"11":2,"12":2,"13":1,"14":2,"15":2,"16":2,"17":1}',
     '{"1":"Sesuai BSKAP terbaru","4":"Prota perlu sedikit dirapikan"}',
     '{"1":"tidak_revisi","2":"tidak_revisi","3":"tidak_revisi","4":"tidak_revisi","5":"tidak_revisi","6":"tidak_revisi","7":"tidak_revisi","8":"tidak_revisi","9":"tidak_revisi","10":"tidak_revisi","11":"tidak_revisi","12":"tidak_revisi","13":"tidak_revisi","14":"tidak_revisi"}',
     '{"1":"Sangat baik","7":"Langkah mengonstruksi pemahaman kontekstual sangat bagus."}',
     'RPP sangat lengkap dan terstruktur rapi.', 'Waktu presentasi perlu sedikit diketatkan.', 'Pertahankan metode diskusi interaktif.',
     4522, 'Pembelajaran bermula pukul 09.00 tepat. Murid berdiskusi aktif dalam 5 kelompok heterogen untuk merumuskan resolusi konflik mading kelas. Guru berkeliling memberikan umpan balik asertif.',
     NULL, NULL, NULL, NULL, NULL, NULL,
     NULL, NULL, NULL, 'TIDAK_ADA_TINDAK_LANJUT',
     '{"1":3,"2":3,"3":2,"4":2,"5":3,"6":2,"7":3,"8":3,"9":2,"10":2,"11":3,"12":3,"13":3,"14":2,"15":3,"16":2,"17":3,"18":3,"19":2,"20":3,"21":3,"22":3}',
     '{"1":"Suasana sangat positif","10":"Media digital dapat dieksplorasi lebih lanjut"}',
     'Apresiasi yang tinggi atas keaktifan murid berdiskusi secara demokratis.',
     'Beberapa kelompok murid membutuhkan bimbingan teknis penggunaan Chromebook.',
     'Baik dengan Penguatan', 'Mengoptimalkan bimbingan pemanfaatan media digital di sesi berikutnya.'),

    ('t-4', 'Ganjil 2026/2027', 'REFLEKSI_GURU', 'Bahasa Indonesia', 'Kelas III-A', 'Teks Deskripsi Lingkungan',
     'Murid terampil menulis deskripsi singkat tentang taman sekolah.',
     '2026-09-22', '08:00 - 09:30', 'Taman Sekolah & Ruang Kelas III-A', 'Fahmawati, S.Pd. (Kepala Sekolah)',
     'Melibatkan aktivitas fisik di luar kelas.',
     'RPP_BIndo_III_A_Aisyah.pdf', '1.2 MB', '18 Sep 2026', 'DIPERIKSA',
     '{"1":2,"2":2,"3":2,"4":2,"5":2,"6":1,"7":2,"8":2,"9":2,"10":2,"11":2,"12":2,"13":2,"14":2,"15":1,"16":2,"17":2}',
     '{}',
     '{"1":"tidak_revisi","2":"tidak_revisi","3":"tidak_revisi","4":"tidak_revisi","5":"tidak_revisi","6":"tidak_revisi","7":"tidak_revisi","8":"tidak_revisi","9":"tidak_revisi","10":"tidak_revisi","11":"tidak_revisi","12":"tidak_revisi","13":"tidak_revisi","14":"tidak_revisi"}',
     '{}',
     'Luar biasa dalam mengintegrasikan lingkungan hidup.', 'Instrumen diagnostik masih awal.', 'Cocok ditiru oleh pararel pendidik.',
     5400, 'Sesi outdoor di taman sangat rapi. Murid tertib mencatat kosakata panca indera.',
     'Sangat terbantu melihat kegembiraan murid menulis puisi taman.',
     'Aktivitas eksplorasi panca indera di luar kelas.',
     'Manajemen transisi dari luar kelas ke dalam kelas agar tidak gaduh.',
     'Murid Fase B membutuhkan waktu 5-7 menit untuk duduk tenang kembali.',
     'Memberi komando tepuk konsentrasi sebelum kaki melangkah masuk kelas.',
     'Pendampingan sesama guru kelas III untuk menyusun ice breaking.',
     NULL, NULL, NULL, 'TIDAK_ADA_TINDAK_LANJUT',
     '{"1":3,"2":3,"3":3,"4":3,"5":2,"6":2,"7":3,"8":3,"9":3,"10":2,"11":3,"12":3,"13":3,"14":3,"15":3,"16":2,"17":3,"18":3,"19":3,"20":3,"21":2,"22":3}',
     '{}',
     'Sangat baik dalam mengaitkan materi alam dengan minat baca siswa.',
     'Manajemen transisi dari luar kelas ke dalam kelas memakan waktu agak lama.',
     'Baik dengan Penguatan', 'Melakukan ice breaking relaksasi saat masuk kembali ke kelas.'),

    ('t-5', 'Ganjil 2026/2027', 'SELESAI', 'Pendidikan Karakter & Numerasi Awal', 'Kelas I-B',
     '7 Kebiasaan Anak Indonesia Hebat (7 KAIH) & Berhitung Ceria',
     'Integrasi habit tracker ''Gemar Membaca'' dan kedisiplinan pagi.',
     '2026-09-14', '08:00 - 09:15', 'Ruang Kelas I-B', 'Fahmawati, S.Pd. (Kepala Sekolah)',
     'Materi pembiasaan karakter 7 KAIH.',
     'Modul_Ajar_Karakter_FaseA_Maria.pdf', '1.9 MB', '10 Sep 2026', 'DIPERIKSA',
     '{"1":2,"2":2,"3":2,"4":2,"5":2,"6":2,"7":2,"8":2,"9":2,"10":2,"11":2,"12":2,"13":2,"14":2,"15":2,"16":2,"17":2}',
     '{}',
     '{"1":"tidak_revisi","2":"tidak_revisi","3":"tidak_revisi"}',
     '{}',
     'Kemandirian awal Fase A sangat membanggakan.', 'Tidak ada.', 'Diseminasi ke tingkat paralel guru.',
     4500, 'Pola tidur dan nutrisi buah/sayur sangat baik dan konsisten diintegrasikan.',
     'Murid sangat bersemangat bernyanyi lagu karakter.',
     'Pembiasaan membaca mandiri.',
     'Manajemen antrean cuci tangan.',
     'Murid masih suka berebut sabun cuci tangan.',
     'Membuat jadwal giliran piket cuci tangan.',
     'Penyediaan botol sabun cair ekstra.',
     'Guru mendemonstrasikan kesabaran yang luar biasa dalam mendampingi murid kelas 1.',
     'Manajemen kebersihan cuci tangan sudah rapi.',
     'Sangat baik untuk dibagikan di KKG.',
     'TIDAK_ADA_TINDAK_LANJUT',
     '{"1":3,"2":3,"3":3,"4":3,"5":3,"6":3,"7":3,"8":3,"9":3,"10":3,"11":3,"12":3,"13":3,"14":3,"15":3,"16":3,"17":3,"18":3,"19":3,"20":3,"21":3,"22":3}',
     '{}',
     'Sempurna dalam penguatan pembiasaan 7 KAIH.',
     'Tidak ada kendala berarti.',
     'Sangat Baik', 'Konsisten melakukan habit tracking bersama orang tua murid.')
ON CONFLICT (teacher_id, semester) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 13. CONSTRAINT yang butuh data kelas sudah ada
--     (dipasang terpisah agar tetap berhasil di database yang sudah berisi data lama)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'murid_nisn_unik') THEN
    ALTER TABLE public.murid ADD CONSTRAINT murid_nisn_unik UNIQUE (nisn);
  END IF;

  -- Nama kelas di tabel murid harus terdaftar di tabel rombel.
  -- Ganti nama kelas otomatis ikut ke murid; kelas yang masih punya murid tidak bisa dihapus.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'murid_rombel_fkey') THEN
    ALTER TABLE public.murid
      ADD CONSTRAINT murid_rombel_fkey FOREIGN KEY (rombel)
      REFERENCES public.rombel (name) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END;
$$;


-- ==============================================================================
-- 14. VIEW REKAP (dipakai untuk laporan)
--     security_invoker = true supaya kebijakan RLS tabel asal tetap berlaku.
-- ==============================================================================

CREATE OR REPLACE VIEW public.v_rekap_nilai_akademik
WITH (security_invoker = true) AS
SELECT
    n.murid_id,
    m.name AS nama_murid,
    m.rombel,
    n.mapel,
    ROUND(AVG(n.nilai), 1) AS rerata_nilai,
    COUNT(*) AS jumlah_tugas
FROM public.nilai_akademik n
JOIN public.murid m ON m.id = n.murid_id
GROUP BY n.murid_id, m.name, m.rombel, n.mapel;

CREATE OR REPLACE VIEW public.v_rekap_presensi
WITH (security_invoker = true) AS
SELECT
    m.id AS murid_id,
    m.name AS nama_murid,
    m.rombel,
    COUNT(p.id) FILTER (WHERE p.status = 'Hadir') AS hadir,
    COUNT(p.id) FILTER (WHERE p.status = 'Sakit') AS sakit,
    COUNT(p.id) FILTER (WHERE p.status = 'Izin')  AS izin,
    COUNT(p.id) FILTER (WHERE p.status = 'Alpa')  AS alpa,
    COUNT(p.id) AS total_hari
FROM public.murid m
LEFT JOIN public.presensi p ON p.murid_id = m.id
GROUP BY m.id, m.name, m.rombel;

-- Sumber data halaman "Laporan Hasil Supervisi per Guru"
CREATE OR REPLACE VIEW public.v_laporan_supervisi
WITH (security_invoker = true) AS
SELECT
    s.teacher_id,
    t.name AS nama_guru,
    t.rombel,
    s.semester,
    s.status,
    s.mapel,
    s.kesimpulan_obs,
    s.tindak_lanjut_ks,
    (SELECT ROUND(AVG(e.value::numeric), 2) FROM jsonb_each_text(s.scores22) AS e) AS rerata_observasi,
    (SELECT COUNT(*) FROM jsonb_each_text(s.scores22)) AS jumlah_aspek_observasi,
    (SELECT ROUND(AVG(e.value::numeric) / 4 * 100) FROM jsonb_each_text(s.scores22) AS e) AS persen_observasi,
    (SELECT ROUND(AVG(e.value::numeric), 2) FROM jsonb_each_text(s.scores17) AS e) AS rerata_telaah_perangkat,
    s.apresiasi_obs,
    s.temuan_obs,
    s.komitmen_guru,
    s.updated_at
FROM public.supervision_sessions s
JOIN public.teachers t ON t.id = s.teacher_id;


-- ==============================================================================
-- 15. ROW LEVEL SECURITY
--
-- !! PERINGATAN — MODE PENGEMBANGAN !!
-- Aplikasi saat ini belum memakai Supabase Auth; ia terhubung dengan anon key
-- yang ikut terbawa di kode frontend (siapa pun bisa melihatnya). Kebijakan di
-- bawah mengizinkan anon key membaca & menulis SEMUA tabel supaya aplikasi
-- berjalan. Tabel murid berisi data pribadi anak (NISN, tanggal lahir, alamat,
-- nomor HP orang tua). Sebelum dipakai dengan data murid asli, ganti kebijakan
-- ini dengan kebijakan berbasis login (auth.uid()) per peran.
-- ==============================================================================

ALTER TABLE public.school_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rombel               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murid                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nilai_akademik       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portofolio           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestasi             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervision_sessions ENABLE ROW LEVEL SECURITY;

-- Hapus nama kebijakan dari skema versi lama (dua varian penamaan)
DROP POLICY IF EXISTS "Akses Baca Publik Guru" ON public.teachers;
DROP POLICY IF EXISTS "Akses Baca Publik Murid" ON public.murid;
DROP POLICY IF EXISTS "Akses Baca Publik 7 KAIH" ON public.daily_habits;
DROP POLICY IF EXISTS "Akses Baca Guru" ON public.teachers;
DROP POLICY IF EXISTS "Akses Baca Murid" ON public.murid;
DROP POLICY IF EXISTS "Akses Baca 7 KAIH" ON public.daily_habits;
DROP POLICY IF EXISTS "Akses Tulis Guru" ON public.teachers;
DROP POLICY IF EXISTS "Akses Tulis Murid" ON public.murid;
DROP POLICY IF EXISTS "Akses Tulis 7 KAIH" ON public.daily_habits;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'school_settings', 'teachers', 'rombel', 'murid', 'daily_habits', 'presensi',
    'nilai_akademik', 'portofolio', 'prestasi', 'supervision_sessions'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "sipakainge_dev_akses_penuh" ON public.%I', tbl);
    EXECUTE format(
      'CREATE POLICY "sipakainge_dev_akses_penuh" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
      tbl
    );
  END LOOP;
END;
$$;


-- ==============================================================================
-- 16. STORAGE: bucket dokumen RPP / Modul Ajar
--     Dipakai uploadRPPDocument() di src/lib/supabase.ts (upload dengan upsert).
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('rpp_bucket', 'rpp_bucket', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "rpp_bucket_baca" ON storage.objects;
DROP POLICY IF EXISTS "rpp_bucket_unggah" ON storage.objects;
DROP POLICY IF EXISTS "rpp_bucket_ubah" ON storage.objects;

CREATE POLICY "rpp_bucket_baca" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'rpp_bucket');
CREATE POLICY "rpp_bucket_unggah" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'rpp_bucket');
CREATE POLICY "rpp_bucket_ubah" ON storage.objects
    FOR UPDATE TO anon, authenticated USING (bucket_id = 'rpp_bucket') WITH CHECK (bucket_id = 'rpp_bucket');

-- Selesai.
