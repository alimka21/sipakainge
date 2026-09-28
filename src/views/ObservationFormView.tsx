import React, { useState, useEffect } from 'react';
import { ScreenId, UserRole, SupervisionSession, TeacherRecord } from '../types';
import { APP_ASSETS, INITIAL_TEACHERS } from '../data/mockData';
import { uploadRPPDocument } from '../lib/supabase';
import { canTransition, describeBlockedTransition, canStartReflection, describeMissingReflectionPrereqs } from '../lib/supervisionStateMachine';

interface ObservationFormViewProps {
  onNavigate: (screen: ScreenId) => void;
  onPreviewBeritaAcara: () => void;
  onFinishObservation?: () => void;
  userRole?: UserRole;
  sessionStates: Record<string, SupervisionSession>;
  onUpdateSessionStates: React.Dispatch<React.SetStateAction<Record<string, SupervisionSession>>>;
  selectedTeacherId?: string;
  onSelectTeacherId?: (id: string) => void;
  teacherList?: TeacherRecord[];
}

// 17 Komponen Kelengkapan Perangkat Pembelajaran (Doc 1)
const DOKUMEN_KELENGKAPAN_ITEMS = [
  { id: 1, category: 'I. DOKUMEN UTAMA PERENCANAAN', title: 'Capaian Pembelajaran (CP), Kesesuaian dengan Keputusan BSKAP terbaru' },
  { id: 2, category: 'I. DOKUMEN UTAMA PERENCANAAN', title: 'Alur Tujuan Pembelajaran (ATP) Memuat cakupan materi, alokasi waktu, dan urutan logis pencapaian kompetensi' },
  { id: 3, category: 'I. DOKUMEN UTAMA PERENCANAAN', title: 'Modul Ajar / RPP Memuat identitas, Tujuan Pembelajaran, Kegiatan Pembelajaran dan Asesmen' },
  { id: 4, category: 'I. DOKUMEN UTAMA PERENCANAAN', title: 'Program Tahunan (Prota), Pemetaan alokasi waktu 1 tahun ajaran' },
  { id: 5, category: 'I. DOKUMEN UTAMA PERENCANAAN', title: 'Program Semester (Promes), Rincian pembagian JP per bulan/minggu' },
  { id: 6, category: 'II. PERANGKAT ASESMEN / PENILAIAN', title: 'Instrumen Asesmen Awal (Diagnostik) , Kognitif & non-kognitif' },
  { id: 7, category: 'II. PERANGKAT ASESMEN / PENILAIAN', title: 'Instrumen Asesmen Formatif, Lembar observasi, rubrik, atau kuis proses' },
  { id: 8, category: 'II. PERANGKAT ASESMEN / PENILAIAN', title: 'Instrumen Asesmen Sumatif, Soal, kunci jawaban, dan kisi-kisi penilaian akhir lingkup materi/semester' },
  { id: 9, category: 'II. PERANGKAT ASESMEN / PENILAIAN', title: 'KKTP (Kriteria Ketercapaian Tujuan Pembelajaran), Pendekatan deskripsi, rubrik, atau interval nilai' },
  { id: 10, category: 'III. MEDIA DAN MATERIAL AJAR', title: 'Bahan Ajar / Handout / Modul Pendukung , Cetak atau digital' },
  { id: 11, category: 'III. MEDIA DAN MATERIAL AJAR', title: 'Lembar Kerja Peserta Didik (LKPD) , Dirancang mengarah pada pembentukan nalar kritis/kreatif' },
  { id: 12, category: 'III. MEDIA DAN MATERIAL AJAR', title: 'Media Pembelajaran, Alat peraga, presentasi digital, atau pemanfaatan PMM/sumber belajar local' },
  { id: 13, category: 'IV. DOKUMEN MANAJEMEN KELAS & ADMINISTRASI GURU', title: 'Kalender Pendidikan, Ditandai agenda internal SMPN 6 Moncongloe & Dinas Pendidikan' },
  { id: 14, category: 'IV. DOKUMEN MANAJEMEN KELAS & ADMINISTRASI GURU', title: 'Jadwal Mengajar & Rincian Beban Kerja Guru' },
  { id: 15, category: 'IV. DOKUMEN MANAJEMEN KELAS & ADMINISTRASI GURU', title: 'Buku Absensi & Catatan Perkembangan Peserta Didik' },
  { id: 16, category: 'IV. DOKUMEN MANAJEMEN KELAS & ADMINISTRASI GURU', title: 'Jurnal Harian Mengajar Guru' },
  { id: 17, category: 'IV. DOKUMEN MANAJEMEN KELAS & ADMINISTRASI GURU', title: 'Program Pengayaan & Remedial' }
];

// 14 Aspek Telaah Perencanaan Pembelajaran Mendalam (Doc 2)
const TELAAH_MENDALAM_ITEMS = [
  { id: 1, category: 'Keselarasan', title: 'Tujuan pembelajaran, langkah pembelajaran, dan asesmen pembelajaran sudah mengarah pada pencapaian Visi Sekolah, Dimensi Profil Lulusan, dan Capaian Pembelajaran' },
  { id: 2, category: 'Keselarasan', title: 'Tujuan pembelajaran, asesmen, and langkah pembelajaran sudah selaras' },
  { id: 3, category: 'Kerangka Pembelajaran', title: 'Praktik pedagogis yang dituliskan sudah tergambar pada langkah pembelajaran dan/atau asesmen pembelajaran' },
  { id: 4, category: 'Kerangka Pembelajaran', title: 'Lingkungan belajar yang dituliskan sudah tergambar pada langkah pembelajaran dan/atau asesmen pembelajaran' },
  { id: 5, category: 'Kerangka Pembelajaran', title: 'Kemitraan pembelajaran yang dituliskan sudah tergambar pada langkah pembelajaran dan/atau asesmen pembelajaran' },
  { id: 6, category: 'Kerangka Pembelajaran', title: 'Pemanfaatan digital yang dituliskan sudah tergambar pada langkah pembelajaran dan/atau asesmen pembelajaran' },
  { id: 7, category: 'Langkah Pembelajaran', title: 'Langkah pembelajaran dapat memfasilitasi murid untuk merasakan pengalaman belajar MEMAHAMI (terlibat aktif mengonstruksi pengetahuan agar dapat memahami secara mendalam konsep atau materi dari berbagai sumber dan konteks).' },
  { id: 8, category: 'Langkah Pembelajaran', title: 'Langkah pembelajaran dapat memfasilitasi murid untuk merasakan pengalaman belajar MENGAPLIKASI (mengaplikasi pemahaman secara kontekstual dalam kehidupan nyata sebagai bagian dari pendalaman pengetahuan)' },
  { id: 9, category: 'Langkah Pembelajaran', title: 'Langkah pembelajaran dapat memfasilitasi murid untuk merasakan pengalaman belajar MEREFLEKSI (mengevaluasi dan memaknai proses serta hasil dari tindakan atau praktik nyata yang telah mereka lakukan dan menentukan tindak lanjut ke depan; serta mengelola proses belajarnya secara mandiri).' },
  { id: 10, category: 'Langkah Pembelajaran', title: 'Prinsip pembelajaran mendalam berupa berkesadaran, bermakna, dan/atau menggembirakan sudah tergambar pada setiap pengalaman belajar di langkah pembelajaran' },
  { id: 11, category: 'Langkah Pembelajaran', title: 'Perencanaan pembelajaran sudah mengakomodir pengalaman belajar yang sesuai dengan karakteristik peserta didik' },
  { id: 12, category: 'Asesmen', title: 'Perencanaan Pembelajaran sudah memuat asesmen yang digunakan untuk memberikan umpan balik guna memperbaiki proses pembelajaran.' },
  { id: 13, category: 'Asesmen', title: 'Perencanaan Pembelajaran sudah memuat asesmen yang dapat mengukur ketercapaian tujuan pembelajaran sesuai karakteristik peserta didik' },
  { id: 14, category: 'Asesmen', title: 'Asesmen sudah memiliki kriteria yang jelas dalam mengukur ketercapaian tujuan pembelajaran' }
];

// 22 Indikator Observasi Pelaksanaan Pembelajaran Mendalam (Deeps Learning Instrument)
export const OBSERVASI_MENDALAM_ITEMS = [
  { id: 1, category: 'I. PENGELOLAAN LINGKUNGAN BELAJAR', title: 'Menciptakan suasana kelas yang kondusif, aman, nyaman, dan saling menghargai antarmurid.' },
  { id: 2, category: 'I. PENGELOLAAN LINGKUNGAN BELAJAR', title: 'Menata tata letak ruang kelas yang luwes guna mendukung interaksi, diskusi kelompok, dan kolaborasi aktif.' },
  { id: 3, category: 'I. PENGELOLAAN LINGKUNGAN BELAJAR', title: 'Menunjukkan kepekaan dan responsivitas tinggi terhadap kebutuhan emosional serta sosial peserta didik.' },
  { id: 4, category: 'I. PENGELOLAAN LINGKUNGAN BELAJAR', title: 'Menerapkan disiplin positif dan kesepakatan kelas bersama yang disepakati secara konsekuen.' },
  
  { id: 5, category: 'II. PEDAGOGIK PEMBELAJARAN MENDALAM', title: 'Merangsang rasa ingin tahu dan nalar kritis murid lewat pertanyaan pemantik/pemecahan masalah yang mendalam.' },
  { id: 6, category: 'II. PEDAGOGIK PEMBELAJARAN MENDALAM', title: 'Memfasilitasi murid melakukan investigasi dan mengonstruksi pengetahuan secara mandiri (Mengalami).' },
  { id: 7, category: 'II. PEDAGOGIK PEMBELAJARAN MENDALAM', title: 'Menghubungkan konsep ajar dengan kehidupan nyata serta pemecahan masalah kontekstual lokal (Mengaplikasi).' },
  { id: 8, category: 'II. PEDAGOGIK PEMBELAJARAN MENDALAM', title: 'Mendorong murid mengevaluasi dan merefleksikan proses belajar serta kesimpulan materi secara terbuka (Merefleksi).' },
  { id: 9, category: 'II. PEDAGOGIK PEMBELAJARAN MENDALAM', title: 'Mengakomodasi gaya belajar dan karakteristik murid lewat diferensiasi konten, proses, maupun produk.' },
  { id: 10, category: 'II. PEDAGOGIK PEMBELAJARAN MENDALAM', title: 'Mengintegrasikan media pembelajaran interaktif digital (Chromebook/PMM) atau alat peraga konkret secara bermakna.' },
  
  { id: 11, category: 'III. KOLABORASI & KOMUNIKASI', title: 'Memfasilitasi diskusi dan kerja kelompok kooperatif yang terstruktur dengan pembagian peran yang jelas.' },
  { id: 12, category: 'III. KOLABORASI & KOMUNIKASI', title: 'Melatih kemampuan mendengar aktif, empati, dan saling menyempurnakan argumen di antara murid.' },
  { id: 13, category: 'III. KOLABORASI & KOMUNIKASI', title: 'Mendorong murid mengomunikasikan hasil karya atau pemikiran secara sistematis dan percaya diri.' },
  { id: 14, category: 'III. KOLABORASI & KOMUNIKASI', title: 'Mengajarkan kolaborasi inklusif yang melibatkan seluruh anggota kelompok tanpa terkecuali.' },
  
  { id: 15, category: 'IV. PENGEMBANGAN KARAKTER', title: 'Mengintegrasikan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) secara eksplisit selama pembelajaran.' },
  { id: 16, category: 'IV. PENGEMBANGAN KARAKTER', title: 'Membangun etos kerja keras, tanggung jawab, dan kemandirian murid dalam menuntaskan tantangan.' },
  { id: 17, category: 'IV. PENGEMBANGAN KARAKTER', title: 'Menumbuhkan kepedulian sosial, kesantunan bertutur (Adab Sipakatau), dan sikap gotong royong.' },
  { id: 18, category: 'IV. PENGEMBANGAN KARAKTER', title: 'Menanamkan pola pikir tumbuh (Growth Mindset) dan ketahanan menghadapi kegagalan belajar.' },
  
  { id: 19, category: 'V. ASESMEN DAN UMPAN BALIK', title: 'Melakukan pemantauan pemahaman murid secara berkala lewat asesmen formatif proses (kuis, lembar observasi).' },
  { id: 20, category: 'V. ASESMEN DAN UMPAN BALIK', title: 'Memberikan umpan balik (feedback) lisan/tertulis secara individual yang spesifik, suportif, dan asertif.' },
  { id: 21, category: 'V. ASESMEN DAN UMPAN BALIK', title: 'Melatih peserta didik melakukan asesmen mandiri (Self-Assessment) atau penilaian antar-teman (Peer-Assessment).' },
  { id: 22, category: 'V. ASESMEN DAN UMPAN BALIK', title: 'Memanfaatkan hasil asesmen formatif langsung untuk mengadaptasi langkah atau kecepatan mengajar.' }
];

export const ObservationFormView: React.FC<ObservationFormViewProps> = ({
  onNavigate,
  onPreviewBeritaAcara,
  onFinishObservation,
  userRole = 'kepala_sekolah',
  sessionStates,
  onUpdateSessionStates,
  selectedTeacherId: propSelectedTeacherId,
  onSelectTeacherId,
  teacherList = INITIAL_TEACHERS,
}) => {
  // 1. Selector for current active teacher / session
  const [localTeacherId, setLocalTeacherId] = useState<string>('');
  const selectedTeacherId = propSelectedTeacherId || localTeacherId;
  const setSelectedTeacherId = (id: string) => {
    if (onSelectTeacherId) onSelectTeacherId(id);
    setLocalTeacherId(id);
  };
  const currentTeacher = teacherList.find((t) => t.id === selectedTeacherId) || teacherList[0];

  // 2. Active Tab of the 8-Step Stepper
  const [activeStepTab, setActiveStepTab] = useState<number>(3); // Default to Step 4: Penilaian

  const activeSession = sessionStates[selectedTeacherId] || {
    status: 'DRAFT',
    mapel: currentTeacher?.subject || '',
    kelas: currentTeacher?.rombel || '',
    topik: '',
    tujuan: '',
    tanggal: '',
    jam: '',
    lokasi: currentTeacher?.rombel ? `Ruang ${currentTeacher.rombel}` : '',
    supervisor: 'Fahmawati, S.Pd. (Kepala Sekolah)',
    catatanAwal: '',
    rppFileName: '',
    rppFileSize: '',
    rppUploadDate: '',
    rppStatus: 'BELUM_DIPERIKSA',
    scores17: {},
    comments17: {},
    aspectStatus14: {},
    aspectFeedback14: {},
    kelebihan15: '',
    kekurangan16: '',
    rekomendasi17: '',
    obsTimerSeconds: 0,
    obsNotes: '',
    reflection1: '', reflection2: '', reflection3: '', reflection4: '', reflection5: '', reflection6: '',
    penguatanKS: '', catatanKhususKS: '', rekomendasiKS: '',
    tindakLanjutKS: 'TIDAK_ADA_TINDAK_LANJUT',
  };

  // Helper function to update current session state fields
  const updateSession = (fields: Partial<any>) => {
    if (fields.status && !canTransition(activeSession.status, fields.status)) {
      triggerToast(describeBlockedTransition(activeSession.status, fields.status));
      return;
    }
    onUpdateSessionStates((prev) => ({
      ...prev,
      [selectedTeacherId]: {
        ...(prev[selectedTeacherId] || activeSession),
        ...fields,
      }
    }));
  };

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Score calculations (17 Komponen Doc 1)
  const calculateTotalScore = () => {
    return Object.values(activeSession.scores17 || {}).reduce((a: number, b: number) => a + b, 0);
  };

  const calculateFinalValue = () => {
    const total = calculateTotalScore();
    return Math.round((total / 34) * 100 * 100) / 100;
  };

  const getPredicate = (na: number) => {
    if (na >= 91) return { pred: 'A (Sangat Baik)', desc: 'Perangkat sangat lengkap, kontekstual, dan siap diaplikasikan dalam pembelajaran.' };
    if (na >= 81) return { pred: 'B (Baik)', desc: 'Perangkat lengkap, terdapat penyesuaian minor pada aspek asesmen atau media.' };
    if (na >= 71) return { pred: 'C (Cukup)', desc: 'Perangkat cukup lengkap, beberapa dokumen utama memerlukan revisi/penyempurnaan.' };
    return { pred: 'K (Kurang)', desc: 'Perangkat belum siap, memerlukan pembinaan khusus dan pendampingan intensif.' };
  };

  const naScore = calculateFinalValue();
  const predicateInfo = getPredicate(naScore);

  // Tab configuration for workflow panel
  const steps = [
    { num: 1, title: 'Identitas', subtitle: 'Isian Pembelajaran' },
    { num: 2, title: 'Jadwal', subtitle: 'Pengajuan & Verifikasi' },
    { num: 3, title: 'RPP / Modul', subtitle: 'Upload Berkas' },
    { num: 4, title: 'Penilaian', subtitle: 'Instrumen Doc 1 & 2' },
    { num: 5, title: 'Observasi', subtitle: 'Sesi Kelas Live' },
    { num: 6, title: 'Refleksi', subtitle: 'Evaluasi Mandiri Guru' },
    { num: 7, title: 'Penguatan', subtitle: 'Tindak Lanjut Akhir' },
    { num: 8, title: 'Selesai', subtitle: 'Supervisi Selesai' }
  ];

  // Auto-sync activeStepTab to reflect session status
  useEffect(() => {
    if (activeSession.status === 'DRAFT') setActiveStepTab(0);
    else if (activeSession.status === 'DIAJUKAN') setActiveStepTab(1);
    else if (activeSession.status === 'TERJADWAL') setActiveStepTab(2);
    else if (activeSession.status === 'DOKUMEN_DIUPLOAD') setActiveStepTab(3);
    else if (activeSession.status === 'PERANGKAT_DINILAI') setActiveStepTab(4);
    else if (activeSession.status === 'OBSERVASI_DILAKUKAN') setActiveStepTab(5);
    else if (activeSession.status === 'REFLEKSI_GURU') setActiveStepTab(6);
    else if (activeSession.status === 'SELESAI') setActiveStepTab(7);
  }, [activeSession.status, selectedTeacherId]);

  // State sub-tabs for Penilaian Perangkat (17 Komponen vs 14 Aspek Telaah)
  const [evaluationTab, setEvaluationTab] = useState<'components' | 'in_depth'>('components');

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-in">
          <span className="material-symbols-outlined text-teal-400 text-lg">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Breadcrumb & Header Zone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>SIPAKAINGE</span>
            <span>/</span>
            <span>Supervisi Pembelajaran Mendalam</span>
            <span>/</span>
            <span className="text-teal-800 font-bold">Detail & Alur Supervisi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pusat Siklus & Detail Alur Supervisi Pembelajaran
          </h1>
          <p className="text-xs text-slate-500">
            Sistem pengamatan, instrumen, dan penuntasan rekam jejak pengembangan mutu pendidik secara dua arah.
          </p>
        </div>

        {/* Dropdown Selector for Teachers */}
        <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label className="text-xs font-bold text-slate-600 shrink-0 sm:mr-1">
            Pilih Sesi Guru:
          </label>
          <select
            value={selectedTeacherId}
            onChange={(e) => {
              setSelectedTeacherId(e.target.value);
              triggerToast(`Beralih ke sesi supervisi: ${teacherList.find(t => t.id === e.target.value)?.name}`);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          >
            {teacherList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.rombel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE SESSION METADATA BAR */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300 ring-1 ring-white/15 shrink-0 text-xl font-bold font-serif">
              {currentTeacher.name.split(' ')[1]?.[0] || 'G'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-teal-300 uppercase">
                  SMPN 6 MONCONGLOE
                </span>
                <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30">
                  Status Alur: {activeSession.status}
                </span>
              </div>
              <h2 className="text-lg font-bold mt-1 text-white">{currentTeacher.name}</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                NIP: {currentTeacher.nip} • Mapel: <strong>{activeSession.mapel}</strong> ({activeSession.topik})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="rounded-xl bg-white/5 px-4 py-2 border border-white/10">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Ruang / Kelas</span>
              <span className="font-bold text-teal-100">{activeSession.kelas}</span>
            </div>
            <div className="rounded-xl bg-white/5 px-4 py-2 border border-white/10">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Hari & Tanggal</span>
              <span className="font-bold text-teal-100">{activeSession.tanggal}</span>
            </div>
            <div className="rounded-xl bg-white/5 px-4 py-2 border border-white/10">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Supervisor</span>
              <span className="font-bold text-teal-100">{activeSession.supervisor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WORKFLOW HORIZONTAL STEPPER GRAPHIC */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 pl-1">
          Kemajuan Siklus Supervisi Digital (8 Tahap Linier)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {steps.map((st, idx) => {
            const isCompleted = activeStepTab > idx;
            const isActive = activeStepTab === idx;
            return (
              <button
                key={st.num}
                onClick={() => {
                  // idx 5 = Refleksi, 6 = Penguatan, 7 = Selesai — all require
                  // Penilaian/Telaah Administrasi/Observasi to be fully scored first.
                  if (idx >= 5 && !canStartReflection(activeSession)) {
                    triggerToast(describeMissingReflectionPrereqs(activeSession));
                    return;
                  }
                  setActiveStepTab(idx);
                  triggerToast(`Membuka panel langkah: ${st.title}`);
                }}
                className={`text-left p-3.5 rounded-2xl transition-all border ${
                  isActive
                    ? 'border-teal-700 bg-teal-50/70 shadow-sm ring-2 ring-teal-600/30'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50 text-slate-600'
                    : 'border-slate-100 bg-white text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-teal-800 text-white' : isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : st.num}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide truncate">{st.title}</span>
                </div>
                <p className="text-[9px] text-slate-500 mt-1 leading-tight truncate">
                  {st.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE ACTIVE WORKSPACE SPLIT (Tab Contents based on selected step) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: ACTIVE STEP FORM (8 cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* ======================================================== */}
          {/* STEP 1: IDENTITAS PEMBELAJARAN                            */}
          {/* ======================================================== */}
          {activeStepTab === 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">1</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 1: Identitas & Deskripsi Rencana Mengajar</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Formulir Guru</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mata Pelajaran:</label>
                  <input
                    type="text"
                    value={activeSession.mapel}
                    onChange={(e) => updateSession({ mapel: e.target.value })}
                    disabled={userRole !== 'guru' || activeSession.status !== 'DRAFT'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kelas / Rombel:</label>
                  <input
                    type="text"
                    value={activeSession.kelas}
                    onChange={(e) => updateSession({ kelas: e.target.value })}
                    disabled={userRole !== 'guru' || activeSession.status !== 'DRAFT'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Materi Pokok / Bahasan:</label>
                  <input
                    type="text"
                    value={activeSession.topik}
                    onChange={(e) => updateSession({ topik: e.target.value })}
                    disabled={userRole !== 'guru' || activeSession.status !== 'DRAFT'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Tujuan Pembelajaran Khusus (TP):</label>
                  <textarea
                    rows={2}
                    value={activeSession.tujuan}
                    onChange={(e) => updateSession({ tujuan: e.target.value })}
                    disabled={userRole !== 'guru' || activeSession.status !== 'DRAFT'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Catatan Awal untuk Supervisor:</label>
                  <input
                    type="text"
                    value={activeSession.catatanAwal}
                    onChange={(e) => updateSession({ catatanAwal: e.target.value })}
                    disabled={userRole !== 'guru' || activeSession.status !== 'DRAFT'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              {activeSession.status === 'DRAFT' && userRole === 'guru' && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      updateSession({ status: 'DIAJUKAN' });
                      triggerToast('✓ Identitas disimpan & status berubah menjadi DIAJUKAN!');
                    }}
                    className="rounded-xl bg-teal-800 text-white font-bold text-xs py-2.5 px-4 hover:bg-teal-900 transition shadow-sm"
                  >
                    Ajukan Jadwal Sekarang ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: JADWAL & VERIFIKASI                               */}
          {/* ======================================================== */}
          {activeStepTab === 1 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">2</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 2: Usulan Jadwal, Lokasi & Verifikasi</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800">Verifikasi KS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tanggal Rencana:</label>
                  <input
                    type="date"
                    value={activeSession.tanggal}
                    onChange={(e) => updateSession({ tanggal: e.target.value })}
                    disabled={userRole !== 'kepala_sekolah' && activeSession.status !== 'DRAFT' && activeSession.status !== 'DIAJUKAN'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Waktu Pembelajaran:</label>
                  <input
                    type="text"
                    value={activeSession.jam}
                    onChange={(e) => updateSession({ jam: e.target.value })}
                    disabled={userRole !== 'kepala_sekolah' && activeSession.status !== 'DRAFT' && activeSession.status !== 'DIAJUKAN'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:ring-1 focus:ring-teal-600"
                    placeholder="Contoh: 08:00 - 09:30 WITA"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Lokasi / Ruang Kelas:</label>
                  <input
                    type="text"
                    value={activeSession.lokasi}
                    onChange={(e) => updateSession({ lokasi: e.target.value })}
                    disabled={userRole !== 'kepala_sekolah' && activeSession.status !== 'DRAFT' && activeSession.status !== 'DIAJUKAN'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Supervisor:</label>
                  <input
                    type="text"
                    value={activeSession.supervisor}
                    onChange={(e) => updateSession({ supervisor: e.target.value })}
                    disabled={userRole !== 'kepala_sekolah' && activeSession.status !== 'DRAFT' && activeSession.status !== 'DIAJUKAN'}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* KS Action Buttons for proposed schedule */}
              {activeSession.status === 'DIAJUKAN' && userRole === 'kepala_sekolah' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => {
                      updateSession({ status: 'DRAFT' });
                      triggerToast('Sesi dikembalikan ke DRAFT untuk diperbaiki guru.');
                    }}
                    className="rounded-xl border border-slate-300 text-slate-700 font-bold text-xs py-2.5 px-4 hover:bg-slate-50 transition"
                  >
                    Minta Penyesuaian
                  </button>
                  <button
                    onClick={() => {
                      updateSession({ status: 'TERJADWAL' });
                      triggerToast('✓ Jadwal disetujui & status berubah menjadi TERJADWAL!');
                    }}
                    className="rounded-xl bg-teal-800 text-white font-bold text-xs py-2.5 px-4 hover:bg-teal-900 transition shadow-sm"
                  >
                    Setujui & Jadwalkan Sesi ✓
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: UPLOAD RPP / MODUL AJAR                           */}
          {/* ======================================================== */}
          {activeStepTab === 2 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">3</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 3: Unggah Perangkat / Modul Ajar PDF</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#eff4ff] text-slate-600">Formulir Guru</span>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-200/80 bg-slate-50 rounded-2xl text-center space-y-3">
                <span className="material-symbols-outlined text-slate-400 text-4xl block">cloud_upload</span>
                <div className="text-xs text-slate-500">
                  <p className="font-bold text-slate-700">Tarik berkas RPP / Modul Ajar ke sini</p>
                  <p className="mt-1">Format PDF ukuran maksimal 10 MB</p>
                </div>
                
                <input
                  type="file"
                  accept=".pdf"
                  id="rpp-pdf-upload-file-picker"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      triggerToast('Sedang memproses & mengunggah dokumen...');
                      const res = await uploadRPPDocument(file);
                      if (res.success) {
                        updateSession({
                          status: 'DOKUMEN_DIUPLOAD',
                          rppFileName: res.name,
                          rppFileSize: res.size,
                          rppUploadDate: res.date,
                          rppStatus: 'BELUM_DIPERIKSA'
                        });
                        triggerToast(res.message || '✓ Berkas RPP/Modul Ajar PDF berhasil diunggah!');
                      } else {
                        triggerToast('❌ Gagal mengunggah berkas.');
                      }
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('rpp-pdf-upload-file-picker')?.click();
                  }}
                  className="rounded-xl border border-teal-800 text-teal-800 bg-white font-bold text-xs py-2.5 px-4 hover:bg-teal-50 transition shadow-xs"
                >
                  Pilih File Dari Komputer (Mendukung PDF)
                </button>
              </div>

              {activeSession.rppFileName && (
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-2">
                  <p className="text-xs font-bold text-teal-950 uppercase tracking-wide">Berkas Terunggah Saat Ini:</p>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-teal-800 text-lg">picture_as_pdf</span>
                      <div>
                        <p className="font-bold text-slate-900">{activeSession.rppFileName}</p>
                        <p className="text-[10px] text-slate-500">{activeSession.rppFileSize} • Diunggah pada {activeSession.rppUploadDate}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                      {activeSession.rppStatus === 'BELUM_DIPERIKSA' ? 'BELUM DIPERIKSA' : 'DIPERIKSA'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: PENILAIAN PERANGKAT (MENGGUNAKAN SUMBER UTAMA)    */}
          {/* ======================================================== */}
          {activeStepTab === 3 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">4</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 4: Penilaian Kelengkapan & Telaah Mendalam</h3>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
                  <button
                    onClick={() => setEvaluationTab('components')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      evaluationTab === 'components' ? 'bg-white text-teal-800 shadow-3xs' : 'text-slate-500'
                    }`}
                  >
                    17 Komponen Kelengkapan
                  </button>
                  <button
                    onClick={() => setEvaluationTab('in_depth')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      evaluationTab === 'in_depth' ? 'bg-white text-teal-800 shadow-3xs' : 'text-slate-500'
                    }`}
                  >
                    14 Aspek Telaah Perencanaan
                  </button>
                </div>
              </div>

              {/* RPP Status Banner */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-teal-800">description</span>
                <div className="text-xs">
                  <p className="font-bold text-teal-950">Dokumen Acuan Terlampir:</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Nama File: <strong className="text-slate-800">{activeSession.rppFileName || 'Belum diupload'}</strong>
                  </p>
                  {userRole === 'kepala_sekolah' && activeSession.rppFileName && (
                    <button
                      onClick={() => alert(`Mengunduh file ${activeSession.rppFileName}...`)}
                      className="mt-2 text-xs text-teal-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Unduh Modul PDF Untuk Ditelaah</span>
                      <span className="material-symbols-outlined text-xs">download</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SUBTAB 1: 17 KOMPONEN KELENGKAPAN PERANGKAT (Doc 1) */}
              {evaluationTab === 'components' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <p className="font-bold text-slate-800">PETUNJUK PENSKORAN & RUMUS SKOR ACUAN:</p>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 leading-relaxed">
                      <li>Skor 0 : Tidak Ada / Tidak Memiliki Dokumen</li>
                      <li>Skor 1 : Ada, Kurang Lengkap / Tidak Sesuai Kriteria</li>
                      <li>Skor 2 : Ada, Lengkap, Sesuai, dan Sangat Baik</li>
                    </ul>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-teal-950 font-bold">
                      <span>Perhitungan Nilai Akhir (NA): (Total Skor Perolehan / 34) × 100</span>
                      <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded">MKS = 34</span>
                    </div>
                  </div>

                  {/* 17 Items list */}
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    {DOKUMEN_KELENGKAPAN_ITEMS.map((item) => {
                      const currentScore = activeSession.scores17[item.id] ?? 0;
                      const comment = activeSession.comments17[item.id] || '';

                      return (
                        <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <span className="text-[9px] font-bold text-teal-800 uppercase tracking-wide block">{item.category}</span>
                            <p className="text-xs font-bold text-slate-900 leading-snug">{item.id}. {item.title}</p>
                            <input
                              type="text"
                              value={comment}
                              placeholder="Masukkan catatan khusus per item..."
                              disabled={userRole !== 'kepala_sekolah'}
                              onChange={(e) => {
                                const updatedComments = { ...activeSession.comments17, [item.id]: e.target.value };
                                updateSession({ comments17: updatedComments });
                              }}
                              className="w-full mt-1.5 rounded-lg border border-slate-200 p-1.5 text-[11px] placeholder-slate-400 bg-slate-50 focus:bg-white"
                            />
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold">Pilih Skor Kelengkapan:</span>
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                              {[0, 1, 2].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  disabled={userRole !== 'kepala_sekolah'}
                                  onClick={() => {
                                    const updatedScores = { ...activeSession.scores17, [item.id]: s };
                                    updateSession({ scores17: updatedScores });
                                    triggerToast(`✓ Item #${item.id} diset skor: ${s}`);
                                  }}
                                  className={`w-10 py-1.5 text-center text-xs font-bold rounded-lg transition-all ${
                                    currentScore === s
                                      ? 'bg-teal-800 text-white shadow-3xs'
                                      : 'text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Automatic score recap card */}
                  <div className="p-5 rounded-3xl bg-slate-900 text-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center shadow-md">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Skor Perolehan</p>
                      <p className="text-3xl font-extrabold text-teal-300 mt-1 tabular-nums">{calculateTotalScore()} <span className="text-sm font-semibold text-slate-400">/ 34</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nilai Akhir (NA)</p>
                      <p className="text-3xl font-extrabold text-teal-300 mt-1 tabular-nums">{naScore}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Predikat Kualitatif</p>
                      <p className="text-lg font-extrabold text-amber-300 mt-2">{predicateInfo.pred}</p>
                    </div>
                    <div className="sm:col-span-3 border-t border-white/10 pt-3 text-[11px] text-slate-300">
                      <strong>Hasil:</strong> {predicateInfo.desc}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: 14 ASPEK TELAAH PERENCANAAN MENDALAM (Doc 2) */}
              {evaluationTab === 'in_depth' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/60 text-xs text-purple-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      INSTRUMEN TELAAH PERENCANAAN PEMBELAJARAN MENDALAM
                    </p>
                    <p className="text-purple-800">
                      Berikan umpan balik dan status tindak lanjut (Revisi / Tidak Revisi) pada 14 aspek keselarasan dan kerangka belajar.
                    </p>
                  </div>

                  {/* 14 Aspects List */}
                  <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                    {TELAAH_MENDALAM_ITEMS.map((item) => {
                      const currentStatus = activeSession.aspectStatus14[item.id] || 'tidak_revisi';
                      const feedback = activeSession.aspectFeedback14[item.id] || '';

                      return (
                        <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-2">
                            <div className="flex-1">
                              <span className="text-[9px] font-bold text-purple-800 uppercase tracking-wide block">{item.category}</span>
                              <p className="text-xs font-bold text-slate-900 leading-snug">{item.id}. {item.title}</p>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              <label className="text-[10px] font-bold text-slate-500">Tindak Lanjut:</label>
                              <select
                                value={currentStatus}
                                disabled={userRole !== 'kepala_sekolah'}
                                onChange={(e) => {
                                  const updatedStatus = { ...activeSession.aspectStatus14, [item.id]: e.target.value as any };
                                  updateSession({ aspectStatus14: updatedStatus });
                                }}
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none"
                              >
                                <option value="tidak_revisi">Tidak Revisi</option>
                                <option value="revisi">Revisi</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 block">Umpan Balik Supervisor:</label>
                            <input
                              type="text"
                              value={feedback}
                              disabled={userRole !== 'kepala_sekolah'}
                              placeholder="Masukkan umpan balik kualitatif pendampingan..."
                              onChange={(e) => {
                                const updatedFeedback = { ...activeSession.aspectFeedback14, [item.id]: e.target.value };
                                updateSession({ aspectFeedback14: updatedFeedback });
                              }}
                              className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-purple-600 bg-slate-50/50"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Questions (15, 16, 17) */}
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-900">Umpan Balik Ringkasan (Bagian 15, 16, 17)</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">15. Kelebihan Perencanaan Pembelajaran:</label>
                        <textarea
                          rows={2}
                          value={activeSession.kelebihan15}
                          disabled={userRole !== 'kepala_sekolah'}
                          onChange={(e) => updateSession({ kelebihan15: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                          placeholder="Tuliskan aspek-aspek perencanaan ajar yang sangat kuat..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">16. Hal yang Perlu Ditingkatkan dari Perencanaan:</label>
                        <textarea
                          rows={2}
                          value={activeSession.kekurangan16}
                          disabled={userRole !== 'kepala_sekolah'}
                          onChange={(e) => updateSession({ kekurangan16: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                          placeholder="Tuliskan catatan area kriteria perencanaan yang perlu direvisi..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">17. Rekomendasi untuk Perencanaan Pembelajaran:</label>
                        <textarea
                          rows={2}
                          value={activeSession.rekomendasi17}
                          disabled={userRole !== 'kepala_sekolah'}
                          onChange={(e) => updateSession({ rekomendasi17: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                          placeholder="Berikan langkah konkret peningkatan mutu modul ajar..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Penilaian Button (Only for KS) */}
              {activeSession.status === 'DOKUMEN_DIUPLOAD' && userRole === 'kepala_sekolah' && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      updateSession({ status: 'PERANGKAT_DINILAI' });
                      triggerToast('✓ Penilaian perangkat selesai divalidasi!');
                    }}
                    className="rounded-xl bg-teal-800 text-white font-bold text-xs py-2.5 px-4 hover:bg-teal-900 transition shadow-sm"
                  >
                    Simpan & Publikasikan Penilaian Perangkat
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 5: OBSERVASI KELAS (INSTRUMEN PEMBELAJARAN MENDALAM)*/}
          {/* ======================================================== */}
          {activeStepTab === 4 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">5</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 5: Observasi Pelaksanaan Pembelajaran di Kelas</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800">Sesi Lapangan</span>
              </div>

              {/* Pedoman Penilaian Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/50 text-xs text-amber-950 space-y-1.5">
                <p className="font-extrabold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">info</span>
                  PETUNJUK OBSERVASI KELAS - PENERAPAN PEMBELAJARAN MENDALAM (DEEP LEARNING):
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Amatilah aktivitas KBM guru dan murid di kelas secara seksama. Berikan penilaian pada 22 aspek keselarasan, pedagogi, kolaborasi, penguatan karakter 7 KAIH, serta asesmen proses.
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 font-medium">
                  <li>Skor 1 : Belum Terlihat (Guru tidak mempraktikkan aspek ini selama KBM)</li>
                  <li>Skor 2 : Mulai Terlihat (Ada upaya mempraktikkan, namun belum konsisten/optimal)</li>
                  <li>Skor 3 : Berkembang / Baik (Dipraktikkan dengan baik, runtut, dan melibatkan murid)</li>
                  <li>Skor 4 : Membudaya / Sangat Baik (Sangat baik, menginspirasi, kontekstual, dan berpusat pada murid)</li>
                </ul>
              </div>

              {/* 22 Items List */}
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
                {OBSERVASI_MENDALAM_ITEMS.map((item) => {
                  const currentScore = activeSession.scores22?.[item.id] ?? 1;
                  const comment = activeSession.comments22?.[item.id] || '';

                  return (
                    <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <span className="text-[9px] font-bold text-teal-800 uppercase tracking-wide block">{item.category}</span>
                        <p className="text-xs font-bold text-slate-900 leading-snug">{item.id}. {item.title}</p>
                        <input
                          type="text"
                          value={comment}
                          placeholder="Tulis bukti perilaku/bukti teramati untuk indikator ini..."
                          disabled={userRole !== 'kepala_sekolah'}
                          onChange={(e) => {
                            const updatedComments = { ...(activeSession.comments22 || {}), [item.id]: e.target.value };
                            updateSession({ comments22: updatedComments });
                          }}
                          className="w-full mt-1.5 rounded-lg border border-slate-200 p-1.5 text-[11px] placeholder-slate-400 bg-slate-50 focus:bg-white"
                        />
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold">Skor Pengamatan:</span>
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          {[1, 2, 3, 4].map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={userRole !== 'kepala_sekolah'}
                              onClick={() => {
                                const updatedScores = { ...(activeSession.scores22 || {}), [item.id]: s };
                                updateSession({ scores22: updatedScores });
                                triggerToast(`✓ Item #${item.id} diset skor: ${s}`);
                              }}
                              className={`w-9 py-1 text-center text-xs font-bold rounded-lg transition-all ${
                                currentScore === s
                                  ? 'bg-teal-800 text-white shadow-3xs'
                                  : 'text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Real-time calculated observation scores & Qualitative Conclusion */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center items-center">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Skor Observasi</p>
                    <p className="text-2xl font-extrabold text-teal-300 mt-1 tabular-nums">
                      {Object.values(activeSession.scores22 || {}).reduce((a: number, b: number) => a + b, 0) || 22} 
                      <span className="text-xs font-semibold text-slate-400"> / 88</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rata-rata Skor (IPK)</p>
                    <p className="text-3xl font-extrabold text-teal-300 mt-1 tabular-nums">
                      {((Object.values(activeSession.scores22 || {}).reduce((a: number, b: number) => a + b, 0) || 22) / 22).toFixed(2)}
                      <span className="text-sm font-semibold text-slate-400"> / 4.0</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kesimpulan Kualitatif</p>
                    <select
                      value={activeSession.kesimpulanObs || 'Baik'}
                      disabled={userRole !== 'kepala_sekolah'}
                      onChange={(e) => updateSession({ kesimpulanObs: e.target.value as any })}
                      className="mt-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-extrabold outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Baik dengan Penguatan">Baik dengan Penguatan</option>
                      <option value="Memerlukan Pendampingan Intensif">Memerlukan Pendampingan Intensif</option>
                    </select>
                  </div>
                </div>

                {/* Qualitative Review Inputs */}
                <div className="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="space-y-1">
                    <label className="font-bold text-white block">Apresiasi & Praktik Baik Teramati (Apresiasi):</label>
                    <textarea
                      rows={2}
                      value={activeSession.apresiasiObs || ''}
                      disabled={userRole !== 'kepala_sekolah'}
                      onChange={(e) => updateSession({ apresiasiObs: e.target.value })}
                      placeholder="Tuliskan apresiasi, kesiapan mengajar guru, respon aktif siswa..."
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 placeholder-slate-500 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-white block">Tantangan & Bukti Perlu Penguatan (Temuan):</label>
                    <textarea
                      rows={2}
                      value={activeSession.temuanObs || ''}
                      disabled={userRole !== 'kepala_sekolah'}
                      onChange={(e) => updateSession({ temuanObs: e.target.value })}
                      placeholder="Tuliskan aspek KBM yang dirasa perlu diintervensi atau dievaluasi..."
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 placeholder-slate-500 focus:border-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-white block">Komitmen / Rencana Aksi Guru ke Depan (RTL):</label>
                    <textarea
                      rows={2}
                      value={activeSession.komitmenGuruNew || ''}
                      disabled={userRole !== 'kepala_sekolah'}
                      onChange={(e) => updateSession({ komitmenGuruNew: e.target.value })}
                      placeholder="Aspek komitmen apa yang akan segera ditingkatkan guru pasca observasi..."
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 placeholder-slate-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Field Notes (Catatan Tambahan Lapangan) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Catatan Tambahan & Berita Acara Observasi:</label>
                <textarea
                  rows={3}
                  value={activeSession.obsNotes}
                  disabled={userRole !== 'kepala_sekolah'}
                  onChange={(e) => updateSession({ obsNotes: e.target.value })}
                  placeholder="Tuliskan catatan tambahan jalannya KBM di kelas..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-slate-50/50 focus:bg-white"
                />
              </div>

              {activeSession.status === 'PERANGKAT_DINILAI' && userRole === 'kepala_sekolah' && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      // Initialize scores if empty
                      const defaultScores = { ...(activeSession.scores22 || {}) };
                      OBSERVASI_MENDALAM_ITEMS.forEach(item => {
                        if (defaultScores[item.id] === undefined) {
                          defaultScores[item.id] = 3; // Default to 'Berkembang' for realism
                        }
                      });
                      updateSession({ 
                        status: 'OBSERVASI_DILAKUKAN', 
                        obsTimerSeconds: 3600,
                        scores22: defaultScores
                      });
                      triggerToast('✓ Sesi observasi kelas berhasil disimpan dengan 22 Indikator Pembelajaran Mendalam!');
                    }}
                    className="rounded-xl bg-teal-800 text-white font-bold text-xs py-2.5 px-4 hover:bg-teal-900 transition shadow-sm"
                  >
                    Selesaikan Pengamatan Kelas ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 6: REFLEKSI GURU (TAHAP 6 - GURU WAJIB MENGISI)       */}
          {/* ======================================================== */}
          {activeStepTab === 5 && !canStartReflection(activeSession) && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">lock</span>
                <h3 className="text-sm font-bold text-slate-900">Refleksi Belum Terbuka</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {describeMissingReflectionPrereqs(activeSession)}
              </p>
            </div>
          )}

          {activeStepTab === 5 && canStartReflection(activeSession) && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">6</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 6: Lembar Refleksi Pasca-Supervisi Guru</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">Wajib diisi Guru</span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Proses pembelajaran telah selesai diobservasi. Mohon luangkan waktu untuk menjawab 6 pertanyaan evaluasi diri di bawah ini dengan bijak demi pengembangan kualitas mengajar.
              </p>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">1. Apa hal positif yang saya rasakan dari proses pembelajaran hari ini?</label>
                  <textarea
                    rows={2}
                    value={activeSession.reflection1}
                    disabled={userRole !== 'guru'}
                    onChange={(e) => updateSession({ reflection1: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">2. Bagian pembelajaran apa yang menurut saya sudah berjalan baik?</label>
                  <textarea
                    rows={2}
                    value={activeSession.reflection2}
                    disabled={userRole !== 'guru'}
                    onChange={(e) => updateSession({ reflection2: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 text-[#ba1a1a]">3. Hal apa yang perlu saya perbaiki? (Pertanyaan Utama):</label>
                  <textarea
                    rows={2}
                    value={activeSession.reflection3}
                    disabled={userRole !== 'guru'}
                    onChange={(e) => updateSession({ reflection3: e.target.value })}
                    className="w-full rounded-xl border-2 border-rose-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                    placeholder="Wajib menuliskan analisis kekurangan mengajar..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">4. Mengapa bagian tersebut perlu diperbaiki?</label>
                  <textarea
                    rows={2}
                    value={activeSession.reflection4}
                    disabled={userRole !== 'guru'}
                    onChange={(e) => updateSession({ reflection4: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">5. Apa rencana saya untuk memperbaikinya?</label>
                  <textarea
                    rows={2}
                    value={activeSession.reflection5}
                    disabled={userRole !== 'guru'}
                    onChange={(e) => updateSession({ reflection5: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">6. Dukungan apa yang saya perlukan?</label>
                  <textarea
                    rows={2}
                    value={activeSession.reflection6}
                    disabled={userRole !== 'guru'}
                    onChange={(e) => updateSession({ reflection6: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {activeSession.status === 'OBSERVASI_DILAKUKAN' && userRole === 'guru' && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      if (!activeSession.reflection3.trim()) {
                        alert('Silakan isi terlebih dahulu area perbaikan pada pertanyaan #3!');
                        return;
                      }
                      updateSession({ status: 'REFLEKSI_GURU' });
                      triggerToast('✓ Lembar refleksi Anda telah dikunci & dikirim ke Kepala Sekolah!');
                    }}
                    className="rounded-xl bg-teal-800 text-white font-bold text-xs py-2.5 px-4 hover:bg-teal-900 transition shadow-sm"
                  >
                    Kunci & Kirim Lembar Refleksi Diri ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 7: PENGUATAN SUPERVISOR & TINDAK LANJUT             */}
          {/* ======================================================== */}
          {activeStepTab === 6 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">7</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 7: Penguatan, Catatan Khusus & Tindak Lanjut</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800">Verifikasi Akhir KS</span>
              </div>

              {/* Show filled reflection as read-only for KS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">rate_review</span>
                  <span>Review Refleksi yang Ditulis Guru:</span>
                </p>
                <div className="text-xs space-y-2 text-slate-600">
                  <p><strong>Hal yang Perlu Diperbaiki:</strong> "{activeSession.reflection3 || 'Belum diisi'}"</p>
                  <p><strong>Rencana Perbaikan:</strong> "{activeSession.reflection5 || 'Belum diisi'}"</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kelebihan / Catatan Positif Guru (Penguatan):</label>
                  <textarea
                    rows={2}
                    value={activeSession.penguatanKS}
                    disabled={userRole !== 'kepala_sekolah'}
                    onChange={(e) => updateSession({ penguatanKS: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Catatan Khusus (Area yang Perlu Diperhatikan):</label>
                  <textarea
                    rows={2}
                    value={activeSession.catatanKhususKS}
                    disabled={userRole !== 'kepala_sekolah'}
                    onChange={(e) => updateSession({ catatanKhususKS: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Rencana Tindak Lanjut Supervisi (Rekomendasi):</label>
                  <textarea
                    rows={2}
                    value={activeSession.rekomendasiKS}
                    disabled={userRole !== 'kepala_sekolah'}
                    onChange={(e) => updateSession({ rekomendasiKS: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Klasifikasi Kategori Tindak Lanjut:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'TIDAK_ADA_TINDAK_LANJUT', label: 'TIDAK ADA TINDAK LANJUT' },
                      { id: 'TINDAK_LANJUT_RINGAN', label: 'TINDAK LANJUT RINGAN' },
                      { id: 'PERLU_PENDAMPINGAN', label: 'PERLU PENDAMPINGAN' },
                      { id: 'PERLU_SUPERVISI_LANJUTAN', label: 'PERLU SUPERVISI LANJUTAN' }
                    ].map((tl) => (
                      <button
                        key={tl.id}
                        type="button"
                        disabled={userRole !== 'kepala_sekolah'}
                        onClick={() => updateSession({ tindakLanjutKS: tl.id as any })}
                        className={`p-3 rounded-xl border text-xs text-left font-bold transition-all ${
                          activeSession.tindakLanjutKS === tl.id
                            ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-3xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {tl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {activeSession.status === 'REFLEKSI_GURU' && userRole === 'kepala_sekolah' && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      updateSession({ status: 'SELESAI' });
                      triggerToast('✓ Proses supervisi selesai dan terkunci secara permanen!');
                    }}
                    className="rounded-xl bg-teal-800 text-white font-bold text-xs py-2.5 px-4 hover:bg-teal-900 transition shadow-sm"
                  >
                    Kunci & Selesaikan Siklus Supervisi ✓
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 8: SELESAI & RINGKASAN PDF                           */}
          {/* ======================================================== */}
          {activeStepTab === 7 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-6">
              <div className="text-center p-8 bg-teal-50/40 rounded-3xl border border-teal-100 space-y-4">
                <div className="w-16 h-16 bg-teal-800 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <span className="material-symbols-outlined text-3xl">task_alt</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900">Siklus Supervisi Selesai Tuntas!</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Seluruh tahapan, penilaian perangkat kelengkapan, telaah mendalam perencanaan, observasi kelas, refleksi guru, serta umpan balik penguatan telah terkunci secara digital di Dapodik sekolah.
                  </p>
                </div>
                <button
                  onClick={() => alert('Mengunduh Berita Acara & Rapor Supervisi PDF...')}
                  className="rounded-xl bg-teal-800 text-white font-bold text-xs py-2.5 px-5 hover:bg-teal-900 transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Unduh Dokumen Hasil Supervisi PDF</span>
                </button>
              </div>

              {/* Final score card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REKAP NILAI PERANGKAT</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">{naScore}</span>
                    <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">{predicateInfo.pred}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{predicateInfo.desc}</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KATEGORI TINDAK LANJUT</p>
                  <p className="text-sm font-extrabold text-purple-900 bg-purple-50 px-3 py-1 rounded border border-purple-200 w-fit mt-1">
                    {activeSession.tindakLanjutKS.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[11px] text-slate-500">Telah divalidasi oleh Kepala Sekolah SMPN 6 Moncongloe.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: STATE & WORKFLOW SUMMARY (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active status card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Status & Kontrol Alur Kerja
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Berjalan</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-950 text-xs font-bold border border-teal-200 mt-1">
                  <span className="w-2 h-2 rounded-full bg-teal-800 animate-pulse"></span>
                  {activeSession.status}
                </span>
              </div>

              {/* Progress Stepper List Widget */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Riwayat Transisi</span>
                <div className="space-y-1.5 text-[11px] text-slate-600 font-semibold pl-1">
                  <p className={activeSession.status !== 'DRAFT' ? 'text-emerald-700' : ''}>
                    {activeSession.status !== 'DRAFT' ? '✓' : '●'} 1. Identitas Pembelajaran
                  </p>
                  <p className={activeSession.status !== 'DRAFT' && activeSession.status !== 'DIAJUKAN' ? 'text-emerald-700' : ''}>
                    {activeSession.status !== 'DRAFT' && activeSession.status !== 'DIAJUKAN' ? '✓' : '●'} 2. Persetujuan Jadwal
                  </p>
                  <p className={['PERANGKAT_DINILAI', 'OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'SELESAI'].includes(activeSession.status) ? 'text-emerald-700' : ''}>
                    {['PERANGKAT_DINILAI', 'OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'SELESAI'].includes(activeSession.status) ? '✓' : '●'} 3. Berkas RPP Diunggah
                  </p>
                  <p className={['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'SELESAI'].includes(activeSession.status) ? 'text-emerald-700' : ''}>
                    {['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'SELESAI'].includes(activeSession.status) ? '✓' : '●'} 4. Evaluasi Perangkat (Doc 1 & 2)
                  </p>
                  <p className={['REFLEKSI_GURU', 'SELESAI'].includes(activeSession.status) ? 'text-emerald-700' : ''}>
                    {['REFLEKSI_GURU', 'SELESAI'].includes(activeSession.status) ? '✓' : '●'} 5. Pengamatan Sesi Kelas
                  </p>
                  <p className={activeSession.status === 'SELESAI' ? 'text-emerald-700' : ''}>
                    {activeSession.status === 'SELESAI' ? '✓' : '●'} 6. Refleksi & Umpan Balik Akhir
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="bg-gradient-to-br from-[#00685f] to-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-300">
              <span className="material-symbols-outlined text-lg">school</span>
              <h4 className="text-xs font-bold uppercase tracking-wider">Pedoman Supervisi Klinis</h4>
            </div>
            <p className="text-xs text-slate-200/95 leading-relaxed">
              "Sipakainge, Sipakalebbi, Sipakatau" — Mengutamakan prinsip transparansi dan pertumbuhan berkelanjutan bagi seluruh pendidik SMPN 6 Moncongloe.
            </p>
            <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400">
              Sistem Digital Supervisi Akademik © 2026/2027
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
