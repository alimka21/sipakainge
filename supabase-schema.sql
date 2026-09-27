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
-- 0. OPSIONAL: hapus SEMUA data guru & murid yang sudah ada di database
--    (misalnya data contoh dari versi script sebelumnya). Data Kepala Sekolah
--    (school_settings) dan daftar kelas tetap ada.
--    Hapus tanda "--" pada tiga baris di bawah, jalankan SEKALI, lalu beri
--    tanda "--" lagi. Ikut terhapus: jurnal 7 KAIH, presensi, nilai,
--    portofolio, prestasi, dan sesi supervisi (CASCADE).
-- ------------------------------------------------------------------------------
-- DELETE FROM public.murid;
-- DELETE FROM public.teachers;
-- UPDATE public.rombel SET wali_kelas_id = NULL;


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
-- DATA AWAL (SEED) — hanya pengaturan sekolah (Kepala Sekolah) dan daftar kelas.
-- Data guru & murid diisi lewat aplikasi (Manajemen Pengguna / Import CSV).
-- ==============================================================================

INSERT INTO public.school_settings (id, principal_name, principal_nip, principal_photo_url)
VALUES (
    1,
    'Fahmawati, S.Pd.',
    '197305111995012002',
    'https://lh3.googleusercontent.com/aida/AEtjO1UklTfGWNtEP7y35w9SEC_qhPmM2GY6gi2KtZIVmMfgt3R0mDdRTuX3UF3NObWCnUOXAhdfhOTeOHa2RByRewhyy6x32XI5_ywK86fmCh-aSvfPYnqQpgc-Rb6NBZqm-5xP4WU4wp5hghAEEyFtNVemogihS69vXboewTsf4zKpCrjlGUPeC29RQCVdl4ysa0_CYeOb5LGzjZRMtFoL-Coc7IKM85Fuwuc-xTKyh4reYNrD4ApB9NtLt6A'
)
ON CONFLICT (id) DO NOTHING;

-- Old class list (superseded 2026-09-28). Removed only where no student still
-- references them — murid_rombel_fkey is ON DELETE RESTRICT, so deleting a
-- class that still has students would abort this whole script; the NOT EXISTS
-- guard skips those instead and leaves them in place until their students are
-- moved to one of the new classes below.
DELETE FROM public.rombel r
WHERE r.id IN ('r-1b', 'r-3a', 'r-4a', 'r-5b', 'r-6c')
  AND NOT EXISTS (SELECT 1 FROM public.murid m WHERE m.rombel = r.name);

INSERT INTO public.rombel (id, name, fase, wali_kelas_id)
VALUES
    ('r-1-1', 'Kelas 1.1', 'fase-a', NULL),
    ('r-1-2', 'Kelas 1.2', 'fase-a', NULL),
    ('r-1-3', 'Kelas 1.3', 'fase-a', NULL),
    ('r-2-1', 'Kelas 2.1', 'fase-a', NULL),
    ('r-2-2', 'Kelas 2.2', 'fase-a', NULL),
    ('r-3-1', 'Kelas 3.1', 'fase-b', NULL),
    ('r-3-2', 'Kelas 3.2', 'fase-b', NULL),
    ('r-3-3', 'Kelas 3.3', 'fase-b', NULL),
    ('r-4-1', 'Kelas 4.1', 'fase-b', NULL),
    ('r-4-2', 'Kelas 4.2', 'fase-b', NULL),
    ('r-4-3', 'Kelas 4.3', 'fase-b', NULL),
    ('r-5-1', 'Kelas 5.1', 'fase-c', NULL),
    ('r-5-2', 'Kelas 5.2', 'fase-c', NULL),
    ('r-5-3', 'Kelas 5.3', 'fase-c', NULL),
    ('r-6-1', 'Kelas 6.1', 'fase-c', NULL),
    ('r-6-2', 'Kelas 6.2', 'fase-c', NULL)
ON CONFLICT (id) DO NOTHING;



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
