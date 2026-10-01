import React, { useState, useEffect } from 'react';
import { ScreenId, SupervisionSession, SupervisionStatus, MuridRecord, TeacherRecord } from '../types';
import { APP_ASSETS, INITIAL_TEACHERS, INITIAL_MURID } from '../data/mockData';
import { OBSERVASI_MENDALAM_ITEMS } from './ObservationFormView';
import { uploadRPPDocument } from '../lib/supabase';
import { formatWitaDate, getAcademicPeriod } from '../lib/time';
import { canTransition, describeBlockedTransition } from '../lib/supervisionStateMachine';

interface TeacherSelfSupervisionViewProps {
  onNavigate: (screen: ScreenId) => void;
  sessionStates: Record<string, SupervisionSession>;
  onUpdateSessionStates: React.Dispatch<React.SetStateAction<Record<string, SupervisionSession>>>;
  muridList?: MuridRecord[];
  onUpdateMuridList?: React.Dispatch<React.SetStateAction<MuridRecord[]>>;
  teacherList?: TeacherRecord[];
  guruId?: string;
}

export const TeacherSelfSupervisionView: React.FC<TeacherSelfSupervisionViewProps> = ({
  onNavigate,
  sessionStates,
  onUpdateSessionStates,
  muridList: propMuridList,
  onUpdateMuridList,
  teacherList = INITIAL_TEACHERS,
  guruId,
}) => {
  // Fallback to local state if parent did not provide muridList
  const [localMuridList, setLocalMuridList] = useState<MuridRecord[]>(INITIAL_MURID);
  const currentMuridList = propMuridList || localMuridList;
  const updateMuridList = (newVal: any) => {
    if (onUpdateMuridList) {
      onUpdateMuridList(newVal);
    } else {
      setLocalMuridList(newVal);
    }
  };

  // Simulator Switcher - let testing users select which teacher they want to act as!
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(guruId || teacherList[0]?.id || '');
  const teacher = teacherList.find((t) => t.id === selectedTeacherId) || teacherList[0];

  const [activeTab, setActiveTab] = useState<'stepper' | 'identitas' | 'modul' | 'refleksi' | 'hasil' | 'data_murid'>('stepper');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Read the live shared session from parent state
  const activeSession = sessionStates[selectedTeacherId] || {
    status: 'DRAFT',
    mapel: teacher.subject,
    kelas: teacher.rombel,
    topik: teacher.topic,
    tujuan: '',
    tanggal: '',
    jam: teacher.scheduleTime,
    lokasi: 'Ruang Kelas ' + teacher.rombel.split(' ')[1] || 'Ruang Kelas',
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
  const observedScores = Object.values(activeSession.scores22 || {}) as number[];

  // Local copy for draft inputs before submitting
  const [draftMapel, setDraftMapel] = useState(activeSession.mapel);
  const [draftKelas, setDraftKelas] = useState(activeSession.kelas);
  const [draftTopik, setDraftTopik] = useState(activeSession.topik);
  const [draftTujuan, setDraftTujuan] = useState(activeSession.tujuan);
  const [draftTanggal, setDraftTanggal] = useState(activeSession.tanggal);
  const [draftJam, setDraftJam] = useState(activeSession.jam);
  const [draftLokasi, setDraftLokasi] = useState(activeSession.lokasi);
  const [draftSupervisor, setDraftSupervisor] = useState(activeSession.supervisor);
  const [draftCatatanAwal, setDraftCatatanAwal] = useState(activeSession.catatanAwal);

  // Sync draft states when teacher or session changes
  useEffect(() => {
    setDraftMapel(activeSession.mapel || teacher.subject);
    setDraftKelas(activeSession.kelas || teacher.rombel);
    setDraftTopik(activeSession.topik || teacher.topic);
    setDraftTujuan(activeSession.tujuan || '');
    setDraftTanggal(activeSession.tanggal || '');
    setDraftJam(activeSession.jam || teacher.scheduleTime);
    setDraftLokasi(activeSession.lokasi || 'Ruang ' + teacher.rombel);
    setDraftSupervisor(activeSession.supervisor || 'Fahmawati, S.Pd. (Kepala Sekolah)');
    setDraftCatatanAwal(activeSession.catatanAwal || '');
  }, [selectedTeacherId, activeSession.status]);

  // Form refleksi states
  const [reflection1, setReflection1] = useState(activeSession.reflection1);
  const [reflection2, setReflection2] = useState(activeSession.reflection2);
  const [reflection3, setReflection3] = useState(activeSession.reflection3);
  const [reflection4, setReflection4] = useState(activeSession.reflection4);
  const [reflection5, setReflection5] = useState(activeSession.reflection5);
  const [reflection6, setReflection6] = useState(activeSession.reflection6);

  useEffect(() => {
    setReflection1(activeSession.reflection1);
    setReflection2(activeSession.reflection2);
    setReflection3(activeSession.reflection3);
    setReflection4(activeSession.reflection4);
    setReflection5(activeSession.reflection5);
    setReflection6(activeSession.reflection6);
  }, [selectedTeacherId, activeSession.reflection3]);

  // Form states for Student Data Management
  const [selectedRombel, setSelectedRombel] = useState<string>('');
  const [selectedMuridId, setSelectedMuridId] = useState<string>('');

  // Academic form
  const [academicSubjectInput, setAcademicSubjectInput] = useState<string>('');
  const [academicTaskName, setAcademicTaskName] = useState<string>('');
  const [academicScore, setAcademicScore] = useState<number>(85);

  // Portfolio form
  const [portfolioTitle, setPortfolioTitle] = useState<string>('');
  const [portfolioCategory, setPortfolioCategory] = useState<string>('Proyek Seni & Lingkungan');
  const [portfolioDesc, setPortfolioDescription] = useState<string>('');
  const [portfolioFeedback, setPortfolioFeedback] = useState<string>('');

  // Achievement form
  const [achievementTitle, setAchievementTitle] = useState<string>('');
  const [achievementCategory, setAchievementCategory] = useState<string>('Sekolah');
  const [achievementDesc, setAchievementDesc] = useState<string>('');

  // Sync default values when active teacher / simulation changes
  useEffect(() => {
    setSelectedRombel(teacher.rombel || '');
    const isMapel = teacher.subject && !teacher.subject.toLowerCase().includes('guru kelas') && !teacher.subject.toLowerCase().includes('tematik');
    setAcademicSubjectInput(isMapel ? teacher.subject : 'Matematika');
    setSelectedMuridId('');
  }, [selectedTeacherId]);

  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMuridId) {
      alert('Harap pilih murid terlebih dahulu!');
      return;
    }
    if (!academicSubjectInput.trim() || !academicTaskName.trim()) {
      alert('Harap isi mata pelajaran dan nama tugas!');
      return;
    }

    const updatedList = currentMuridList.map(m => {
      if (m.id === selectedMuridId) {
        const currentAcademics = (m as any).academics || {};
        const subjectKey = academicSubjectInput.trim().toUpperCase();
        const existingSubject = currentAcademics[subjectKey] || { subject: academicSubjectInput.trim(), tasks: [] };
        
        const newTasks = [...existingSubject.tasks, { taskName: academicTaskName.trim(), score: Number(academicScore) }];
        
        // Compute average score of all tasks to get active subject score
        const total = newTasks.reduce((sum: number, t: any) => sum + t.score, 0);
        const avg = Math.round(total / newTasks.length);

        return {
          ...m,
          academics: {
            ...currentAcademics,
            [subjectKey]: {
              subject: academicSubjectInput.trim(),
              tasks: newTasks,
              score: avg
            }
          }
        };
      }
      return m;
    });

    updateMuridList(updatedList);
    setAcademicTaskName('');
    showToast(`✓ Berhasil menyimpan Nilai Akademik untuk ${currentMuridList.find(m => m.id === selectedMuridId)?.name}!`);
  };

  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMuridId) {
      alert('Harap pilih murid terlebih dahulu!');
      return;
    }
    if (!portfolioTitle.trim() || !portfolioDesc.trim()) {
      alert('Harap isi judul karya dan deskripsi!');
      return;
    }

    const updatedList = currentMuridList.map(m => {
      if (m.id === selectedMuridId) {
        const currentPortfolios = (m as any).portfolios || [];
        const newPortfolioItem = {
          id: `port-${Date.now()}`,
          title: portfolioTitle.trim(),
          category: portfolioCategory,
          description: portfolioDesc.trim(),
          feedback: portfolioFeedback.trim(),
          imageUrl: '',
          date: formatWitaDate(),
        };
        return {
          ...m,
          portfolios: [newPortfolioItem, ...currentPortfolios]
        };
      }
      return m;
    });

    updateMuridList(updatedList);
    setPortfolioTitle('');
    setPortfolioDescription('');
    setPortfolioFeedback('');
    showToast(`✓ Berhasil mengunggah Dokumentasi Portofolio Karya untuk ${currentMuridList.find(m => m.id === selectedMuridId)?.name}!`);
  };

  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMuridId) {
      alert('Harap pilih murid terlebih dahulu!');
      return;
    }
    if (!achievementTitle.trim() || !achievementDesc.trim()) {
      alert('Harap isi judul apresiasi dan deskripsi!');
      return;
    }

    const updatedList = currentMuridList.map(m => {
      if (m.id === selectedMuridId) {
        const currentAchievements = (m as any).achievements || [];
        const newAchievementItem = {
          id: `ach-${Date.now()}`,
          title: achievementTitle.trim(),
          category: achievementCategory, // e.g. Kota, Provinsi, Nasional, Sekolah, Kelas
          description: achievementDesc.trim(),
          date: formatWitaDate(),
        };
        return {
          ...m,
          achievements: [newAchievementItem, ...currentAchievements]
        };
      }
      return m;
    });

    updateMuridList(updatedList);
    setAchievementTitle('');
    setAchievementDesc('');
    showToast(`✓ Berhasil mencatat Prestasi & Apresiasi untuk ${currentMuridList.find(m => m.id === selectedMuridId)?.name}!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateSession = (fields: Partial<SupervisionSession>) => {
    if (fields.status && !canTransition(activeSession.status, fields.status)) {
      showToast(describeBlockedTransition(activeSession.status, fields.status));
      return;
    }
    onUpdateSessionStates((prev) => ({
      ...prev,
      [selectedTeacherId]: {
        ...activeSession,
        ...fields,
      }
    }));
  };

  const handleSaveDraft = () => {
    updateSession({
      mapel: draftMapel,
      kelas: draftKelas,
      topik: draftTopik,
      tujuan: draftTujuan,
      tanggal: draftTanggal,
      jam: draftJam,
      lokasi: draftLokasi,
      supervisor: draftSupervisor,
      catatanAwal: draftCatatanAwal,
      status: 'DRAFT'
    });
    showToast('✓ Identitas pembelajaran disimpan sebagai DRAFT.');
  };

  const handleAjukanJadwal = () => {
    if (!draftTanggal) {
      alert('Harap isi Hari/Tanggal supervisi sebelum mengajukan!');
      return;
    }
    updateSession({
      mapel: draftMapel,
      kelas: draftKelas,
      topik: draftTopik,
      tujuan: draftTujuan,
      tanggal: draftTanggal,
      jam: draftJam,
      lokasi: draftLokasi,
      supervisor: draftSupervisor,
      catatanAwal: draftCatatanAwal,
      status: 'DIAJUKAN'
    });
    showToast('✓ Pengajuan jadwal supervisi berhasil dikirim! Status berubah menjadi DIAJUKAN.');
  };

  const handleSimulateApproval = () => {
    updateSession({ status: 'DISETUJUI' });
    showToast('✓ [SIMULATOR] Jadwal disetujui Kepala Sekolah! Silakan upload RPP Anda.');
  };

  const handleSimulateRPPCheck = (status: 'DIPERIKSA' | 'PERLU_PERBAIKAN') => {
    updateSession({ rppStatus: status });
    showToast(`✓ [SIMULATOR] Status RPP diubah menjadi: ${status}`);
  };

  const handleUploadRPP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      showToast('Sedang memproses & mengunggah dokumen...');
      const res = await uploadRPPDocument(file);
      if (res.success) {
        updateSession({
          rppFileName: res.name,
          rppFileSize: res.size,
          rppUploadDate: res.date,
          rppStatus: 'BELUM_DIPERIKSA',
          status: 'DOKUMEN_DIUPLOAD'
        });
        showToast(res.message || '✓ Modul ajar/RPP berhasil diunggah! Berkas dalam antrean telaah.');
      } else {
        showToast('❌ Gagal mengunggah berkas.');
      }
    }
  };

  const handleSaveReflection = () => {
    if (!reflection3.trim()) {
      alert('Pertanyaan #3 ("Hal apa yang perlu saya perbaiki?") wajib diisi sebelum menyimpan/mengirim!');
      return;
    }
    updateSession({
      reflection1,
      reflection2,
      reflection3,
      reflection4,
      reflection5,
      reflection6,
      status: 'REFLEKSI_GURU'
    });
    showToast('✓ Lembar refleksi diri berhasil disimpan dan dikunci. Menunggu penguatan Kepala Sekolah.');
  };

  // MAPPING STATUS TO GURU PROGRESS STEPPER
  // 7 Steppers requested in letter O: Jadwal, RPP, Penilaian, Observasi, Refleksi, Penguatan, Selesai
  const getStepperStatus = () => {
    const s = activeSession.status;
    const isJadwalOk = ['DISETUJUI', 'TERJADWAL', 'DOKUMEN_DIUPLOAD', 'PERANGKAT_DINILAI', 'OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA', 'REFLEKSI_GURU', 'SELESAI'].includes(s);
    const isRPPOk = ['DOKUMEN_DIUPLOAD', 'PERANGKAT_DINILAI', 'OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA', 'REFLEKSI_GURU', 'SELESAI'].includes(s);
    const isPenilaianOk = ['PERANGKAT_DINILAI', 'OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA', 'REFLEKSI_GURU', 'SELESAI'].includes(s);
    const isObservasiOk = ['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA', 'REFLEKSI_GURU', 'SELESAI'].includes(s);
    const isRefleksiOk = ['REFLEKSI_GURU', 'SELESAI'].includes(s);
    const isPenguatanOk = ['SELESAI'].includes(s);
    const isSelesaiOk = s === 'SELESAI';

    return {
      jadwal: isJadwalOk ? '✓' : (s === 'DRAFT' || s === 'DIAJUKAN' ? '●' : '○'),
      rpp: isRPPOk ? '✓' : (s === 'DISETUJUI' || s === 'TERJADWAL' ? '●' : '○'),
      penilaian: isPenilaianOk ? '✓' : (s === 'DOKUMEN_DIUPLOAD' ? '●' : '○'),
      observasi: isObservasiOk ? '✓' : (s === 'PERANGKAT_DINILAI' ? '●' : '○'),
      refleksi: isRefleksiOk ? '✓' : (s === 'OBSERVASI_DILAKUKAN' || s === 'HASIL_SUPERVISI_TERSEDIA' ? '●' : '○'),
      penguatan: isPenguatanOk ? '✓' : (s === 'REFLEKSI_GURU' ? '●' : '○'),
      selesai: isSelesaiOk ? '✓' : '○'
    };
  };

  const stepsState = getStepperStatus();

  // Helper score calculator (Doc 1)
  const calculateTotalScore = () => {
    return Object.values(activeSession.scores17 || {}).reduce((a, b) => a + b, 0);
  };
  const naScore = Math.round((calculateTotalScore() / 34) * 100 * 100) / 100;
  const getPredicateStr = (na: number) => {
    if (na >= 91) return 'A (Sangat Baik)';
    if (na >= 81) return 'B (Baik)';
    if (na >= 71) return 'C (Cukup)';
    return 'K (Kurang)';
  };

  return (
    <div className="w-full pb-16 font-['Plus_Jakarta_Sans',sans-serif] bg-slate-50 min-h-screen text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-[#6ffbbe] text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Context & Simulation Dropdown */}
      <div className="w-full bg-white px-6 lg:px-10 py-3 shadow-xs border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <span className="text-slate-400">Portal Guru</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Pengembangan Mutu</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#00685f] font-semibold">Supervisi Saya</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600">Tahun Ajaran {getAcademicPeriod().tahunAjaran}</span>
          </div>

          {/* SIMULATION ZONE CARD */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 p-1.5 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider pl-2 shrink-0">
              [Simulasi Guru] :
            </span>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                showToast(`Beralih ke sesi supervisi: ${teacherList.find(t => t.id === e.target.value)?.name}`);
              }}
              className="rounded-xl border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {teacherList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.rombel})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        {/* Banner Identitas Guru yang Diobservasi */}
        <div className="rounded-3xl bg-gradient-to-r from-[#004d46] via-[#00685f] to-[#04332d] p-6 lg:p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative shrink-0">
                {teacher.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-100 text-teal-900 font-bold flex items-center justify-center text-2xl ring-4 ring-white/30 shadow-lg">
                    {teacher.initials}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-[#6ffbbe] text-teal-950 rounded-full p-1 shadow-xs">
                  <span className="material-symbols-outlined text-xs block font-bold">verified</span>
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{teacher.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                    {activeSession.kelas} • {teacher.faseLabel}
                  </span>
                </div>
                <p className="text-xs text-teal-100 font-mono">NIP: {teacher.nip}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-teal-100/90 mt-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#89f5e7]">menu_book</span>
                    Mapel: {activeSession.mapel}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#89f5e7]">supervisor_account</span>
                    Supervisor: <strong className="text-white ml-0.5">{activeSession.supervisor}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15 text-center sm:text-left space-y-1">
                <span className="text-[10px] text-teal-200 block uppercase font-bold tracking-wider">Status Siklus</span>
                <span className="text-sm font-extrabold text-[#89f5e7] block">{activeSession.status}</span>
                {calculateTotalScore() > 0 && (
                  <span className="text-[11px] text-white/70 block">Nilai Perangkat: {naScore} ({getPredicateStr(naScore)})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS STEPPER (O. DASHBOARD GURU - VISUAL STEPPER) */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 pl-1">
            Indikator Progress Supervisi Aktif Anda (Siklus 7-Langkah)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { id: 'jadwal', title: 'Jadwal', val: stepsState.jadwal, sub: activeSession.status === 'DIAJUKAN' ? 'Diajukan' : 'Disetujui' },
              { id: 'rpp', title: 'RPP/Modul', val: stepsState.rpp, sub: activeSession.rppFileName ? 'Diunduh' : 'Belum Upload' },
              { id: 'penilaian', title: 'Penilaian', val: stepsState.penilaian, sub: calculateTotalScore() > 0 ? 'Selesai' : 'Belum Dinilai' },
              { id: 'observasi', title: 'Observasi', val: stepsState.observasi, sub: activeSession.obsNotes ? 'Terlaksana' : 'Belum Kelas' },
              { id: 'refleksi', title: 'Refleksi', val: stepsState.refleksi, sub: activeSession.reflection3 ? 'Tuntas diisi' : 'Harus diisi' },
              { id: 'penguatan', title: 'Penguatan', val: stepsState.penguatan, sub: activeSession.penguatanKS ? 'Selesai' : 'Menunggu' },
              { id: 'selesai', title: 'Selesai', val: stepsState.selesai, sub: activeSession.status === 'SELESAI' ? 'Tuntas' : '—' }
            ].map((st) => {
              const isChecked = st.val === '✓';
              const isActive = st.val === '●';
              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isActive
                      ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-600/20'
                      : isChecked
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-slate-100 bg-white opacity-55'
                  }`}
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{st.title}</p>
                  <div className="my-2.5 flex items-center justify-center">
                    <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm ${
                      isChecked ? 'bg-emerald-600 text-white shadow-xs' : isActive ? 'bg-teal-800 text-white animate-pulse' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {st.val}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 truncate">{st.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigasi Dokumen & Tahapan */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stepper')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'stepper'
                ? 'border-[#00685f] text-[#00685f] bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            <span>Dashboard Kemajuan</span>
          </button>
          <button
            onClick={() => setActiveTab('identitas')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'identitas'
                ? 'border-[#00685f] text-[#00685f] bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            <span>1. Identitas & Usulan Jadwal</span>
          </button>
          <button
            onClick={() => setActiveTab('modul')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'modul'
                ? 'border-[#00685f] text-[#00685f] bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">upload_file</span>
            <span>2. Upload RPP / Modul</span>
          </button>
          <button
            onClick={() => setActiveTab('refleksi')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'refleksi'
                ? 'border-[#00685f] text-[#00685f] bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">psychology_alt</span>
            <span>3. Lembar Refleksi Guru</span>
          </button>
          <button
            onClick={() => setActiveTab('hasil')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'hasil'
                ? 'border-[#00685f] text-[#00685f] bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">task_alt</span>
            <span>4. Rapor & Penguatan Akhir</span>
          </button>
          <button
            onClick={() => setActiveTab('data_murid')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'data_murid'
                ? 'border-purple-600 text-purple-900 bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-purple-600">assignment_ind</span>
            <span>5. Entri Akademik & Porto Murid</span>
          </button>
        </div>

        {/* TAB 0: DASHBOARD KEMAJUAN (SUMMARY & STATUS BANNERS) */}
        {activeTab === 'stepper' && (
          <div className="space-y-6">
            {/* Status-specific welcome guide */}
            {activeSession.status === 'DRAFT' && (
              <div className="p-6 bg-blue-50 border border-blue-200 text-blue-950 rounded-3xl space-y-2">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-800">edit_note</span>
                  <span>Tahap 1: Pengisian Identitas Belum Diajukan</span>
                </h4>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Supervisi akademik Anda masih berstatus <strong>DRAFT</strong>. Silakan isi identitas pembelajaran, tujuan pembelajaran, dan tentukan rencana jadwal pelaksanaan di tab <strong>"1. Identitas & Usulan Jadwal"</strong> kemudian ajukan ke Kepala Sekolah.
                </p>
              </div>
            )}

            {activeSession.status === 'DIAJUKAN' && (
              <div className="p-6 bg-amber-50 border border-amber-200 text-amber-950 rounded-3xl space-y-3">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-800">pending_actions</span>
                  <span>Tahap 2: Menunggu Persetujuan Jadwal Supervisi</span>
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Jadwal Anda telah dikirim dan berstatus <strong>DIAJUKAN</strong>. Saat ini Kepala Sekolah/Supervisor sedang memeriksa kecocokan tanggal pengamatan di kelas.
                </p>
                <div className="pt-2 border-t border-amber-200 flex gap-2">
                  <button
                    onClick={handleSimulateApproval}
                    className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                  >
                    [Simulasikan Persetujuan KS]
                  </button>
                </div>
              </div>
            )}

            {['DISETUJUI', 'TERJADWAL'].includes(activeSession.status) && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-3xl space-y-2">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800">verified</span>
                  <span>Tahap 3: Jadwal Disetujui! Segera Unggah RPP / Modul Ajar</span>
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Jadwal supervisi akademik Anda telah disetujui Kepala Sekolah untuk dilaksanakan pada tanggal <strong>{activeSession.tanggal || teacher.targetSchedule}</strong>. Silakan beralih ke tab <strong>"2. Upload RPP / Modul"</strong> untuk menyerahkan modul pembelajaran.
                </p>
              </div>
            )}

            {activeSession.status === 'DOKUMEN_DIUPLOAD' && (
              <div className="p-6 bg-purple-50 border border-purple-200 text-purple-950 rounded-3xl space-y-3">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-800">menu_book</span>
                  <span>Tahap 4: Modul Ajar Telah Diunggah & Menunggu Telaah</span>
                </h4>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Berkas <strong>{activeSession.rppFileName}</strong> berhasil diserahkan ke sistem. Kepala Sekolah/Supervisor sedang melakukan verifikasi kelengkapan administrasi 17 komponen instrumen.
                </p>
                <div className="pt-2 border-t border-purple-200 flex gap-2">
                  <button
                    onClick={() => {
                      updateSession({ status: 'PERANGKAT_DINILAI' });
                      showToast('✓ [SIMULATOR] Status diubah ke PERANGKAT DINILAI!');
                    }}
                    className="bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                  >
                    [Simulasikan Penilaian Selesai]
                  </button>
                </div>
              </div>
            )}

            {activeSession.status === 'PERANGKAT_DINILAI' && (
              <div className="p-6 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-3xl space-y-3">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-800">co_present</span>
                  <span>Tahap 5: Perangkat Selesai Dinilai & Sesi Observasi Kelas Sedang Berjalan</span>
                </h4>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  Perencanaan pembelajaran Anda memperoleh skor <strong>{naScore} ({getPredicateStr(naScore)})</strong>. Saat ini Kepala Sekolah/Observer sedang melakukan kunjungan lapangan langsung di kelas untuk mengamati keselarasan KBM.
                </p>
                <div className="pt-2 border-t border-indigo-200 flex gap-2">
                  <button
                    onClick={() => {
                      updateSession({ status: 'OBSERVASI_DILAKUKAN', obsNotes: 'Guru mengajar dengan baik dan menyenangkan...' });
                      showToast('✓ [SIMULATOR] Observasi rampung! Lembar refleksi guru dibuka.');
                    }}
                    className="bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                  >
                    [Simulasikan Observasi Selesai]
                  </button>
                </div>
              </div>
            )}

            {activeSession.status === 'OBSERVASI_DILAKUKAN' && (
              <div className="p-6 bg-rose-50 border border-rose-200 text-rose-950 rounded-3xl space-y-2">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-800">rate_review</span>
                  <span>Tahap 6: WAJIB Mengisi Lembar Refleksi Pasca-Supervisi</span>
                </h4>
                <p className="text-xs text-rose-900 leading-relaxed">
                  Sesi observasi kelas telah selesai. Sesuai regulasi supervisi klinis sekolah, Anda <strong>wajib</strong> mengisi 6 pertanyaan umpan balik di tab <strong>"3. Lembar Refleksi Guru"</strong> sebelum Kepala Sekolah memberikan catatan penguatan akhir.
                </p>
              </div>
            )}

            {activeSession.status === 'REFLEKSI_GURU' && (
              <div className="p-6 bg-teal-50 border border-teal-200 text-teal-950 rounded-3xl space-y-3">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-800">hourglass_empty</span>
                  <span>Tahap 7: Menunggu Penguatan & Tindak Lanjut Kepala Sekolah</span>
                </h4>
                <p className="text-xs text-teal-900 leading-relaxed">
                  Refleksi Anda telah terkirim. Saat ini Kepala Sekolah sedang menyusun catatan penguatan, apresiasi pembelajaran, serta menentukan klasifikasi tindak lanjut.
                </p>
                <div className="pt-2 border-t border-teal-200 flex gap-2">
                  <button
                    onClick={() => {
                      updateSession({ status: 'SELESAI', penguatanKS: 'Sangat baik dalam melibatkan murid aktif.', catatanKhususKS: 'Tidak ada.', rekomendasiKS: 'Pertahankan praktik ini.' });
                      showToast('✓ [SIMULATOR] Seluruh siklus tuntas dan SELESAI!');
                    }}
                    className="bg-[#00685f] hover:bg-teal-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                  >
                    [Simulasikan Penguatan Akhir & Tuntaskan Siklus]
                  </button>
                </div>
              </div>
            )}

            {activeSession.status === 'SELESAI' && (
              <div className="p-6 bg-teal-800 text-white rounded-3xl space-y-2 shadow-sm">
                <h4 className="font-extrabold text-sm flex items-center gap-2 text-teal-300">
                  <span className="material-symbols-outlined">task_alt</span>
                  <span>Siklus Supervisi Selesai Tuntas!</span>
                </h4>
                <p className="text-xs text-teal-50 leading-relaxed">
                  Luar biasa! Seluruh siklus supervisi pembelajaran Anda untuk Semester ini telah tuntas, divalidasi, dan ditandatangani Kepala Sekolah. Anda dapat mencetak rapor kualitatif Anda di tab <strong>"4. Rapor & Penguatan Akhir"</strong>.
                </p>
              </div>
            )}

            {/* General cycle summary card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Jadwal Sesi</h4>
                <div className="text-xs text-slate-700 space-y-1">
                  <p>Tanggal: <strong>{activeSession.tanggal || 'Belum diusulkan'}</strong></p>
                  <p>Jam: <strong>{activeSession.jam || 'Belum diset'}</strong></p>
                  <p>Lokasi: <strong>{activeSession.lokasi || 'Belum ditentukan'}</strong></p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Berkas RPP</h4>
                <div className="text-xs text-slate-700 space-y-1">
                  <p>Nama File: <span className="font-mono text-[11px] font-bold text-slate-900 break-all">{activeSession.rppFileName || '—'}</span></p>
                  <p>Tanggal Upload: <strong>{activeSession.rppUploadDate || '—'}</strong></p>
                  <p>Pemeriksaan: 
                    <span className={`ml-1 px-2 py-0.2 rounded-full font-bold text-[10px] ${
                      activeSession.rppStatus === 'DIPERIKSA' ? 'bg-emerald-100 text-emerald-800' :
                      activeSession.rppStatus === 'PERLU_PERBAIKAN' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {activeSession.rppStatus.replace(/_/g, ' ')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pendampingan</h4>
                <div className="text-xs text-slate-700 space-y-1">
                  <p>Kategori: <strong className="text-purple-900">{activeSession.tindakLanjutKS.replace(/_/g, ' ')}</strong></p>
                  <p>Observer: <strong>{teacher.assignedObserverName || 'Kepala Sekolah'}</strong></p>
                  <p>Asistensi: <strong>Diseminasi Komunitas Belajar</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: IDENTITAS PEMBELAJARAN & USULAN JADWAL (C. TAHAP 1) */}
        {activeTab === 'identitas' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">1</span>
                <h3 className="text-sm font-bold text-slate-900">Langkah 1: Isi Identitas & Rencana Jadwal</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Formulir Guru</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Guru:</label>
                <input
                  type="text"
                  value={teacher.name}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mata Pelajaran:</label>
                <input
                  type="text"
                  value={draftMapel}
                  onChange={(e) => setDraftMapel(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                  placeholder="Contoh: IPAS (Sains & Lingkungan)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kelas / Rombel:</label>
                <input
                  type="text"
                  value={draftKelas}
                  onChange={(e) => setDraftKelas(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                  placeholder="Contoh: Kelas IV-A"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Materi / Topik Pembelajaran:</label>
                <input
                  type="text"
                  value={draftTopik}
                  onChange={(e) => setDraftTopik(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                  placeholder="Contoh: Fotosintesis & Rantai Makanan"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Tujuan Pembelajaran (TP) Khusus:</label>
                <textarea
                  rows={2}
                  value={draftTujuan}
                  onChange={(e) => setDraftTujuan(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                  placeholder="Tuliskan tujuan pembelajaran terukur..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Rencana Hari/Tanggal Supervisi:</label>
                <input
                  type="date"
                  value={draftTanggal}
                  onChange={(e) => setDraftTanggal(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Jam Pembelajaran (Sesi):</label>
                <input
                  type="text"
                  value={draftJam}
                  onChange={(e) => setDraftJam(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                  placeholder="Contoh: 08:00 - 09:30 WITA"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Ruang / Lokasi:</label>
                <input
                  type="text"
                  value={draftLokasi}
                  onChange={(e) => setDraftLokasi(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                  placeholder="Contoh: Ruang Kelas IV-A"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Supervisor / Observer Penilai:</label>
                <input
                  type="text"
                  value={draftSupervisor}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500 font-bold"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Catatan Tambahan untuk Supervisor:</label>
                <input
                  type="text"
                  value={draftCatatanAwal}
                  onChange={(e) => setDraftCatatanAwal(e.target.value)}
                  disabled={activeSession.status !== 'DRAFT'}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-teal-600 bg-white"
                  placeholder="Contoh: Mohon masukan khusus pada diferensiasi proses murid kelompok C"
                />
              </div>
            </div>

            {/* Save Actions */}
            {activeSession.status === 'DRAFT' ? (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs"
                >
                  Simpan Draft
                </button>
                <button
                  type="button"
                  onClick={handleAjukanJadwal}
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-sm"
                >
                  Ajukan Jadwal Supervisi ➔
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 text-xs font-medium border border-slate-200/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-800 text-base">lock</span>
                <span>Portofolio identitas terkunci untuk pengeditan karena status saat ini: <strong>{activeSession.status}</strong>.</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPLOAD RPP / MODUL AJAR (E. TAHAP 3) */}
        {activeTab === 'modul' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">2</span>
                <h3 className="text-sm font-bold text-slate-900">Langkah 2: Upload RPP / Modul Ajar Pembelajaran</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">Berkas Terverifikasi</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah jadwal supervisi disetujui oleh Kepala Sekolah, Anda wajib menyerahkan berkas perencanaan berupa RPP / Modul Ajar lengkap yang memuat CP, ATP, skenario langkah, dan perangkat penilaian formatif.
            </p>

            {/* Upload Area */}
            {!activeSession.rppFileName ? (
              <div className="p-8 border-2 border-dashed border-slate-200 hover:border-teal-600 rounded-3xl bg-slate-50/50 text-center transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleUploadRPP}
                  disabled={!['DISETUJUI', 'TERJADWAL'].includes(activeSession.status)}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="space-y-3">
                  <span className="material-symbols-outlined text-slate-400 text-4xl block">cloud_upload</span>
                  <div className="text-xs">
                    <p className="font-extrabold text-slate-800">Klik atau seret file PDF / DOCX RPP di sini</p>
                    <p className="text-slate-400 mt-1">Maksimum ukuran file: 10 MB</p>
                  </div>
                  {!['DISETUJUI', 'TERJADWAL'].includes(activeSession.status) && (
                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-lg max-w-sm mx-auto">
                      ⚠ Tombol upload akan terbuka setelah jadwal disetujui / terjadwal oleh Kepala Sekolah!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-800 text-white font-extrabold flex items-center justify-center text-xs shadow-3xs shrink-0">
                      PDF
                    </div>
                    <div className="text-xs">
                      <h4 className="font-extrabold text-slate-900 break-all">{activeSession.rppFileName}</h4>
                      <p className="text-slate-500 mt-1">Ukuran: {activeSession.rppFileSize} • Diunggah: {activeSession.rppUploadDate}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      updateSession({ rppFileName: '', rppFileSize: '', rppUploadDate: '', rppStatus: 'BELUM_DIPERIKSA' });
                    }}
                    disabled={!['DOKUMEN_DIUPLOAD', 'DISETUJUI', 'TERJADWAL'].includes(activeSession.status)}
                    className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg text-xs font-bold transition disabled:opacity-30"
                  >
                    Hapus Berkas
                  </button>
                </div>

                <div className="pt-3 border-t border-teal-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Status Pemeriksaan:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      activeSession.rppStatus === 'DIPERIKSA' ? 'bg-emerald-100 text-emerald-800' :
                      activeSession.rppStatus === 'PERLU_PERBAIKAN' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {activeSession.rppStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Simulator action helper */}
                  {activeSession.status === 'DOKUMEN_DIUPLOAD' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold">[Simulasi Pemeriksa]:</span>
                      <button
                        onClick={() => handleSimulateRPPCheck('DIPERIKSA')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-3xs"
                      >
                        Tandai Sesuai
                      </button>
                      <button
                        onClick={() => handleSimulateRPPCheck('PERLU_PERBAIKAN')}
                        className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-[11px] font-bold shadow-3xs"
                      >
                        Minta Revisi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEMBAR REFLEKSI GURU (K. TAHAP 7 - WAJIB DIISI) */}
        {activeTab === 'refleksi' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-800 text-white font-extrabold text-xs flex items-center justify-center">3</span>
                <h3 className="text-sm font-bold text-slate-900">Langkah 3: Lembar Refleksi Pasca-Supervisi Guru</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800">Wajib Diisi Guru</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah selesai melaksanakan pembelajaran di kelas yang dihadiri oleh Kepala Sekolah/Observer, Anda <strong>wajib mengisi evaluasi reflektif secara asertif dan jujur</strong>. Isian ini sangat vital bagi perumusan tindak lanjut.
            </p>

            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">1. Apa hal positif yang saya rasakan dari proses pembelajaran hari ini?</label>
                <textarea
                  rows={2}
                  value={reflection1}
                  onChange={(e) => setReflection1(e.target.value)}
                  disabled={!['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA'].includes(activeSession.status)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  placeholder="Ceritakan kepuasan batin atau respon murid yang menyenangkan..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">2. Bagian pembelajaran apa yang menurut saya sudah berjalan baik?</label>
                <textarea
                  rows={2}
                  value={reflection2}
                  onChange={(e) => setReflection2(e.target.value)}
                  disabled={!['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA'].includes(activeSession.status)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  placeholder="Contoh: Penggunaan media daun konkret berhasil merangsang rasa tahu murid..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 text-red-700 flex items-center gap-1.5">
                  <span>3. Hal apa yang perlu saya perbaiki? (PERTANYAAN UTAMA WAJIB):</span>
                  <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.1 rounded font-bold">Harus Diisi</span>
                </label>
                <textarea
                  rows={3}
                  value={reflection3}
                  onChange={(e) => setReflection3(e.target.value)}
                  disabled={!['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA'].includes(activeSession.status)}
                  className="w-full rounded-xl border-2 border-red-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white font-medium"
                  placeholder="Tuliskan analisis kekurangan atau kendala KBM yang teramati..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">4. Mengapa bagian tersebut perlu diperbaiki?</label>
                <textarea
                  rows={2}
                  value={reflection4}
                  onChange={(e) => setReflection4(e.target.value)}
                  disabled={!['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA'].includes(activeSession.status)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  placeholder="Analisis penyebab kendala kelas tersebut..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">5. Apa rencana saya untuk memperbaikinya?</label>
                <textarea
                  rows={2}
                  value={reflection5}
                  onChange={(e) => setReflection5(e.target.value)}
                  disabled={!['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA'].includes(activeSession.status)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  placeholder="Sebutkan langkah mitigasi atau pelatihan mandiri ajar..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">6. Dukungan apa yang saya perlukan?</label>
                <textarea
                  rows={2}
                  value={reflection6}
                  onChange={(e) => setReflection6(e.target.value)}
                  disabled={!['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA'].includes(activeSession.status)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50/50 focus:bg-white"
                  placeholder="Misalnya pendampingan guru senior, alat peraga tambahan..."
                />
              </div>
            </div>

            {/* Reflection Submit actions */}
            {['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA'].includes(activeSession.status) ? (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-sm"
                >
                  Kunci & Kirim Lembar Refleksi Diri ➔
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 text-xs font-medium border border-slate-200/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-base">lock</span>
                <span>
                  {['REFLEKSI_GURU', 'SELESAI'].includes(activeSession.status)
                    ? '✓ Refleksi diri telah berhasil terkirim dan dikunci.'
                    : '⚠ Formulir refleksi diri akan terbuka setelah sesi observasi kelas diselesaikan Kepala Sekolah.'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: RAPOR & PENGUATAN AKHIR (J. HASIL & L. PENGUATAN) */}
        {activeTab === 'hasil' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">4</span>
                  <h3 className="text-sm font-bold text-slate-900">Langkah 4: Hasil Rapor Evaluasi & Rekomendasi Supervisi</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800">Dokumen Resmi Sekolah</span>
              </div>

              {calculateTotalScore() === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50 text-slate-500 text-xs">
                  <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">pending</span>
                  <p>Rapor supervisi Anda belum diterbitkan. Berkas modul ajar Anda belum dinilai oleh Kepala Sekolah.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Digital Score Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-1 relative overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Skor Perolehan</p>
                      <p className="text-3xl font-extrabold text-teal-300 tabular-nums">{calculateTotalScore()} <span className="text-sm font-semibold text-slate-400">/ 34</span></p>
                      <p className="text-[10px] text-slate-400 mt-1">Berdasarkan 17 kriteria kelengkapan</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-1 relative overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nilai Akhir Perangkat (NA)</p>
                      <p className="text-3xl font-extrabold text-teal-300 tabular-nums">{naScore}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold text-amber-300">{getPredicateStr(naScore)}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-1 relative overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IPK Observasi Kelas</p>
                      <p className="text-3xl font-extrabold text-teal-300 tabular-nums">
                        {observedScores.length ? (observedScores.reduce((a, b) => a + b, 0) / observedScores.length).toFixed(2) : '—'}
                        <span className="text-sm font-semibold text-slate-400"> / 4.0</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold text-amber-300">Kesimpulan: {activeSession.kesimpulanObs || 'Belum ada'}</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-1 relative overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Supervisi</p>
                      <p className="text-xl font-extrabold text-emerald-300 mt-2 flex items-center justify-center gap-1.5 uppercase">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        {activeSession.status}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2">Tahun Ajaran {getAcademicPeriod().tahunAjaran}</p>
                    </div>
                  </div>

                  {/* 17 Items assessment accordion summary */}
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-3 bg-slate-50/40">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">description</span>
                      <span>Tinjauan 17 Kriteria Kelengkapan Perangkat (Doc 1)</span>
                    </h4>
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs space-y-2.5">
                      <div className="grid grid-cols-12 gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px] pb-1">
                        <span className="col-span-1 text-center">No</span>
                        <span className="col-span-8">Komponen Perangkat Ajar</span>
                        <span className="col-span-3 text-center">Skor Terverifikasi</span>
                      </div>
                      {[
                        'Capaian Pembelajaran (CP) terbaru BSKAP',
                        'Alur Tujuan Pembelajaran (ATP) logis & runtut',
                        'Modul Ajar / RPP lengkap & sistematis',
                        'Program Tahunan (Prota) pembagian JP',
                        'Program Semester (Promes) rincian bulanan',
                        'Instrumen Asesmen Awal (Diagnostik) siswa',
                        'Instrumen Asesmen Formatif (Rubrik/Observasi)',
                        'Instrumen Asesmen Sumatif (Kunci/Kisi-kisi)',
                        'KKTP (Kriteria Ketercapaian Tujuan Pembelajaran)',
                        'Bahan Ajar / Modul Pendukung Cetak/Digital',
                        'Lembar Kerja Peserta Didik (LKPD) nalar kritis',
                        'Media Pembelajaran & Alat Peraga Konkret',
                        'Kalender Pendidikan ber-agenda internal',
                        'Jadwal Mengajar & Rincian Beban Kerja Guru',
                        'Buku Absensi & Catatan Perkembangan Siswa',
                        'Jurnal Harian Mengajar Guru kelas',
                        'Program Pengayaan & Remedial terarah'
                      ].map((title, i) => {
                        const score = activeSession.scores17[i + 1] ?? 0;
                        return (
                          <div key={i} className="grid grid-cols-12 gap-2 pt-2 items-center text-slate-700 font-medium">
                            <span className="col-span-1 text-center font-bold text-slate-400">{i + 1}</span>
                            <span className="col-span-8">{title}</span>
                            <span className="col-span-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-extrabold text-xs ${
                                score === 2 ? 'bg-emerald-100 text-emerald-800' :
                                score === 1 ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {score}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 22 Items Classroom Observation assessment summary */}
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-3 bg-purple-50/20">
                    <h4 className="text-xs font-extrabold text-[#5c3acc] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">co_present</span>
                      <span>Tinjauan 22 Indikator Observasi Kelas - Pembelajaran Mendalam (Doc 3)</span>
                    </h4>
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1 text-xs space-y-2.5">
                      <div className="grid grid-cols-12 gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px] pb-1">
                        <span className="col-span-1 text-center">No</span>
                        <span className="col-span-8">Aspek Pengamatan KBM Mendalam & 7 KAIH</span>
                        <span className="col-span-3 text-center">Skor Evaluasi</span>
                      </div>
                      {OBSERVASI_MENDALAM_ITEMS.map((item, idx) => {
                        const score = activeSession.scores22?.[item.id];
                        return (
                          <div key={item.id} className="grid grid-cols-12 gap-2 pt-2 items-center text-slate-700 font-medium">
                            <span className="col-span-1 text-center font-bold text-slate-400">{idx + 1}</span>
                            <span className="col-span-8 truncate" title={item.title}>{item.title}</span>
                            <span className="col-span-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-extrabold text-xs ${
                                score === 4 ? 'bg-indigo-100 text-indigo-800' :
                                score === 3 ? 'bg-emerald-100 text-emerald-800' :
                                score === 2 ? 'bg-amber-100 text-amber-800' :
                                score === undefined ? 'bg-slate-100 text-slate-400' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {score === undefined ? 'Belum dinilai' : `${score} / 4`}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary of feedback & reinforcement (L. TAHAP 8) */}
                  <div className="rounded-3xl border border-slate-200 p-6 space-y-4 bg-white">
                    <h4 className="text-xs font-extrabold text-[#00685f] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">reviews</span>
                      <span>Umpan Balik Kemitraan & Penguatan Akhir Supervisor</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                        <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">thumb_up</span>
                          <span>Praktik Baik yang Teramati (Penguatan):</span>
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          {activeSession.penguatanKS || 'Kepala Sekolah sedang merumuskan apresiasi kelas Anda...'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
                        <p className="font-extrabold text-rose-950 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">warning</span>
                          <span>Catatan Khusus (Area yang Perlu Diperhatikan):</span>
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          {activeSession.catatanKhususKS || 'Menunggu validasi hasil supervisi.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 md:col-span-2 space-y-2">
                        <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#00685f]">tips_and_updates</span>
                          <span>Rencana Tindak Lanjut & Rekomendasi Karir:</span>
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                          {activeSession.rekomendasiKS || 'Menunggu arahan rekomendasi dari Kepala Sekolah.'}
                        </p>
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Klasifikasi Tindak Lanjut:</span>
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-extrabold rounded-full">
                            {activeSession.tindakLanjutKS.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {activeSession.status === 'SELESAI' && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => alert('Mengunduh Rapor Resmi Hasil Supervisi Akademik Guru PDF...')}
                        className="rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs py-2.5 px-6 hover:shadow transition inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>Unduh Sertifikat & Rapor Hasil Supervisi PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
