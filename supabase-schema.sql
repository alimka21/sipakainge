-- ==============================================================================
-- SIPAKAINGE - UPT SPF SDN PERCONTOHAN PAM MAKASSAR
-- Skema Database Supabase PostgreSQL
-- Silakan jalankan script SQL ini di: Supabase Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Tabel Guru & Tim Observer (teachers)
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

-- 2. Tabel Data Murid (murid)
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

-- 3. Tabel Catatan Pembiasaan Harian 7 KAIH (daily_habits)
CREATE TABLE IF NOT EXISTS public.daily_habits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    murid_id TEXT REFERENCES public.murid(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    wake_up_time TEXT,
    bed_time TEXT,
    habits JSONB DEFAULT '[]'::jsonb,
    prayers JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_murid_date UNIQUE (murid_id, date)
);

-- 4. Tabel Siklus Supervisi Klinis Guru (supervision_cycles)
CREATE TABLE IF NOT EXISTS public.supervision_cycles (
    id TEXT PRIMARY KEY,
    teacher_id TEXT REFERENCES public.teachers(id) ON DELETE CASCADE,
    semester TEXT DEFAULT 'Ganjil 2025/2026',
    t1 BOOLEAN DEFAULT false,
    t2 BOOLEAN DEFAULT false,
    t3 BOOLEAN DEFAULT false,
    t4 BOOLEAN DEFAULT false,
    t5 BOOLEAN DEFAULT false,
    rubrics JSONB DEFAULT '{}'::jsonb,
    catatan TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.murid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervision_cycles ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Baca Publik (Anonim dapat membaca untuk Rekapitulasi)
CREATE POLICY "Akses Baca Publik Guru" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Akses Baca Publik Murid" ON public.murid FOR SELECT USING (true);
CREATE POLICY "Akses Baca Publik 7 KAIH" ON public.daily_habits FOR SELECT USING (true);
CREATE POLICY "Akses Baca Publik Supervisi" ON public.supervision_cycles FOR SELECT USING (true);

-- Kebijakan Menulis & Mengubah Data
CREATE POLICY "Akses Tulis Guru" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Akses Tulis Murid" ON public.murid FOR ALL USING (true);
CREATE POLICY "Akses Tulis 7 KAIH" ON public.daily_habits FOR ALL USING (true);
CREATE POLICY "Akses Tulis Supervisi" ON public.supervision_cycles FOR ALL USING (true);

-- ==============================================================================
-- DATA AWAL (SEED DATA) GURU & MURID SDN PERCONTOHAN PAM MAKASSAR
-- ==============================================================================

INSERT INTO public.teachers (id, nip, name, role, rombel, subject, avatar, is_observer)
VALUES
    ('t-fahmawati', '197204151996032004', 'Fahmawati, S.Pd.', 'Kepala Sekolah', 'Semua Kelas', 'Manajerial & Supervisi', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjiJx7sf7-J9B2uubjtp0C4gR8AqCRuVAqqkiowxu9yH3cXch9zlk_3uUSRzzaZiAFLKDCrdG19ZBSkSnU0-V-LHbastza5HoP1GOTpf2J4P2fcTA_igkI15SRem3PCKk1LPk8xS74cYsj2FnQ8yyfgNu_rw5ymj9bwZosskIJ6RferStO5eTI-HQ_0KPkrkR7IBzkaQCP-tnFTbTGXu9h5LNtvnPZMWPJOlXTQEeuTGhRRGVg7api', true),
    ('t-siti-aminah', '198506122009022003', 'Siti Aminah, S.Pd., Gr.', 'Guru Kelas / Observer', 'Kelas IV-A', 'Tematik Terpadu', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqes8nFA22U0mLF6d0gWBEI3qQfM89MtKIXBNQ8jertWiFt-ipY7SM47DCH4ZwVitXqK6Jbr_LmQvVE5rFLoiTxj35gM9DNBV3UogyhW5eRmeVQQhTvwzedTlvdZb1i1ZAekydeKO3xnVU1MxnXKKboVVIZ_H8kCaORpS4i9gCoOGqKBIFLrCXI6sEMepehMV7AAHobG7GvGwvtHorA2mDd4wJNoczkqBi5Uu654C3Oe9QQ80jr83P', true),
    ('t-bambang', '198203102006041008', 'Bambang Sudarsono, S.Pd.', 'Guru Kelas / Observer', 'Kelas V-B', 'Tematik Terpadu', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', true),
    ('t-dewi-lestari', '199011242015032002', 'Dewi Lestari, S.Pd.', 'Guru Kelas', 'Kelas III-A', 'Tematik Terpadu', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', false),
    ('t-hendra', '198804052011011009', 'Hendra Wijaya, S.Pd.', 'Guru Mapel PJOK / Observer', 'Semua Kelas', 'PJOK', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
    ('t-nur-aisyah', '199208152019032014', 'Nur Aisyah, S.Pd.I.', 'Guru Mapel PAI', 'Semua Kelas', 'Pendidikan Agama Islam', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', false),
    ('t-rizky', '199401182020121004', 'Rizky Pratama, S.Pd.', 'Guru Kelas', 'Kelas I-B', 'Fase A Awal', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', false),
    ('t-kartika', '198709032010012011', 'Kartika Sari, S.Pd.', 'Guru Kelas', 'Kelas VI-C', 'Tematik Persiapan Lulus', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.murid (id, nisn, nis, name, rombel, gender, parent_name, parent_phone, wake_up_time, bed_time)
VALUES
    ('m-4a-1', '0134882190', '240801', 'Ahmad Faris Al-Fatih', 'Kelas IV-A', 'L', 'Ir. M. Ridwan, M.T. & Ny. Fatimah', '0812-4211-9081', '04:50', '21:00'),
    ('m-4a-2', '0134882191', '240802', 'Nabila Zahra Putri', 'Kelas IV-A', 'P', 'dr. Hendra Saputra', '0813-5566-7788', '05:00', '21:00'),
    ('m-4a-3', '0134882192', '240803', 'Muhammad Rayhan Pratama', 'Kelas IV-A', 'L', 'H. Syafruddin, S.E.', '0852-9988-1122', '05:05', '21:15'),
    ('m-4a-4', '0134882193', '240804', 'Aisyah Humaira', 'Kelas IV-A', 'P', 'Drs. Usman Ali', '0821-3344-5566', '04:45', '20:50'),
    ('m-4a-5', '0134882194', '240805', 'Daffa Ibnu Malik', 'Kelas IV-A', 'L', 'Irfan Bachdim, S.T.', '0811-2233-4455', '05:10', '21:00'),
    ('m-5b-1', '0129883401', '230712', 'Fauzan Azhim', 'Kelas V-B', 'L', 'H. Ilham Arif, S.Sos.', '0813-4455-6677', '04:55', '21:00'),
    ('m-5b-2', '0129883402', '230713', 'Khalisa Nur Ramadhani', 'Kelas V-B', 'P', 'Ir. Ahmad Zaki', '0853-2211-4433', '04:50', '20:45'),
    ('m-3a-1', '0141122390', '250901', 'Andi Muh. Dzaky', 'Kelas III-A', 'L', 'Andi Baso Rahmat', '0812-7788-9900', '05:15', '20:30'),
    ('m-1b-1', '0165544321', '261001', 'Kinara Sakinah', 'Kelas I-B', 'P', 'Budi Santoso, M.Pd.', '0852-6677-8899', '05:30', '20:00'),
    ('m-6c-1', '0118899776', '220601', 'Rian Hidayat', 'Kelas VI-C', 'L', 'H. Hidayatullah', '0811-9988-7766', '04:40', '21:30')
ON CONFLICT (id) DO NOTHING;
