import React, { useState, useEffect } from 'react';
import { ScreenId, TeacherRecord } from '../types';
import { APP_ASSETS, INITIAL_TEACHERS } from '../data/mockData';
import { PublicNavbar } from '../components/PublicNavbar';
import { formatWitaDate } from '../lib/time';

interface TeacherSupervisionDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenObservationForm?: () => void;
  onOpenReport?: () => void;
  sessionStates?: Record<string, any>;
  teacherList?: TeacherRecord[];
}

export const TeacherSupervisionDashboardView: React.FC<TeacherSupervisionDashboardViewProps> = ({
  onNavigate,
  onOpenObservationForm,
  onOpenReport,
  sessionStates,
  teacherList = INITIAL_TEACHERS,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('Semester Ganjil 2026/2027');
  const [todayLabel, setTodayLabel] = useState(() => formatWitaDate());

  useEffect(() => {
    const interval = setInterval(() => setTodayLabel(formatWitaDate()), 30000);
    return () => clearInterval(interval);
  }, []);
  const [faseFilter, setFaseFilter] = useState<'all' | 'fase-a' | 'fase-b' | 'fase-c' | 'mapel'>('all');
  const [observerFilter, setObserverFilter] = useState<'all' | 'observer_only' | 'regular_only'>('all');
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<TeacherRecord | null>(null);

  // Teacher supervision stage completion tracking for all teachers
  // 5 Stages: 1. Pra-Observasi, 2. Telaah Modul, 3. Observasi Kelas, 4. Refleksi Sipakainge, 5. RTL
  const getDynamicTeacherStagesMap = () => {
    const map: Record<
      string,
      {
        t1: boolean;
        t2: boolean;
        t3: boolean;
        t4: boolean;
        t5: boolean;
        status: 'Tuntas' | 'Dalam Proses' | 'Terjadwal' | 'Belum Mulai';
        score: string;
      }
    > = {};

    if (sessionStates) {
      Object.keys(sessionStates).forEach((teacherId) => {
        const sess = sessionStates[teacherId];
        const status = sess.status;

        // Map 12 process states to 5 stages
        const t1 = !['DRAFT', 'DIAJUKAN', 'PERLU_PENYESUAIAN', 'DITOLAK'].includes(status);
        const t2 = ['DOKUMEN_DIUPLOAD', 'PERANGKAT_DINILAI', 'OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA', 'REFLEKSI_GURU', 'SELESAI'].includes(status);
        const t3 = ['OBSERVASI_DILAKUKAN', 'HASIL_SUPERVISI_TERSEDIA', 'REFLEKSI_GURU', 'SELESAI'].includes(status);
        const t4 = ['REFLEKSI_GURU', 'SELESAI'].includes(status);
        const t5 = status === 'SELESAI';

        // Count scores
        let totalScore = 0;
        let obsAvg = 0;
        if (sess.scores22) {
          const vals = Object.values(sess.scores22);
          if (vals.length > 0) {
            const totalObs = vals.reduce((a: any, b: any) => a + b, 0) as number;
            obsAvg = totalObs / vals.length;
          }
        }
        const scoreStr = obsAvg > 0 ? `${obsAvg.toFixed(2)} / 4.0` : '—';

        let statusStr: 'Tuntas' | 'Dalam Proses' | 'Terjadwal' = 'Terjadwal';
        if (status === 'SELESAI') statusStr = 'Tuntas';
        else if (status !== 'DRAFT') statusStr = 'Dalam Proses';

        map[teacherId] = {
          t1,
          t2,
          t3,
          t4,
          t5,
          status: statusStr,
          score: scoreStr,
        };
      });
    }

    return map;
  };

  const teacherStagesMap = getDynamicTeacherStagesMap();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStage = (teacherId: string, stageKey: 't1' | 't2' | 't3' | 't4' | 't5') => {
    showToast('Tinjauan rekapitulasi publik bersifat read-only.');
  };

  // Filter teachers
  const filteredTeachers = teacherList.filter((teacher) => {
    if (faseFilter !== 'all') {
      if (faseFilter === 'mapel' && !teacher.subject.includes('PAI') && !teacher.subject.includes('PJOK')) {
        return false;
      }
      if (faseFilter !== 'mapel' && teacher.fase !== faseFilter) {
        return false;
      }
    }
    if (observerFilter === 'observer_only' && !teacher.isObserver) return false;
    if (observerFilter === 'regular_only' && teacher.isObserver) return false;
    return true;
  });

  // KPI calculations
  const totalTeachers = teacherList.length;
  const completedSupervisions = Object.values(teacherStagesMap).filter((s) => s.status === 'Tuntas').length;
  const inProgressSupervisions = Object.values(teacherStagesMap).filter((s) => s.status === 'Dalam Proses').length;
  const activeObservers = teacherList.filter((t) => t.isObserver).length + 1; // +1 for Kepala Sekolah

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 animate-fade-in">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
            <span className="material-symbols-outlined text-base">check_circle</span>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Reusable Public Navbar */}
      <PublicNavbar currentScreen="teacher_dashboard" onNavigate={onNavigate} />

      {/* Main Container */}
      <main className="w-full pt-20 flex-1 pb-20">
        {/* Breadcrumb Context Bar */}
        <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
              <button
                onClick={() => onNavigate('landing')}
                className="hover:text-teal-700 flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-base">home</span>
                Beranda
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-[#00685f] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-base">school</span>
                Dasbor Rekap Supervisi (Guru)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('student_dashboard')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="material-symbols-outlined text-sm text-[#00685f]">diversity_1</span>
                Buka Rekap 7 KAIH (Murid)
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00685f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#008378] transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                Masuk Ruang Kerja Supervisi
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
          {/* Header Banner Transparansi Supervisi */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-950 p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-teal-500/25 px-3 py-0.5 text-xs font-bold text-teal-200 uppercase tracking-wider">
                    Transparansi Rekapitulasi Sekolah
                  </span>
                  <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-200">
                    Siklus 1x Per Semester
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                  Dasbor Rekap Supervisi (Guru)
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-200/90 leading-relaxed">
                  Keterbukaan informasi pelaksanaan supervisi klinis reflektif berkelanjutan (*Sipakainge, Sipakalebbi, Sipakatau*) bagi seluruh pendidik UPT SPF SDN Percontohan PAM Makassar.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-teal-300">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Super Admin & Penanggung Jawab Mutu: <strong>Fahmawati, S.Pd.</strong> (Kepala Sekolah) • NIP. 197305111995012002</span>
                </div>
              </div>

              {/* KPI Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Total Guru</span>
                  <p className="text-2xl font-black text-white tabular-nums">{totalTeachers}</p>
                  <span className="text-[10px] text-slate-300">Pendidik Aktif</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Tuntas 5 Tahap</span>
                  <p className="text-2xl font-black text-emerald-300 tabular-nums">{completedSupervisions}</p>
                  <span className="text-[10px] text-emerald-200">{totalTeachers ? Math.round((completedSupervisions / totalTeachers) * 100) : 0}% Capaian</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Dalam Proses</span>
                  <p className="text-2xl font-black text-amber-300 tabular-nums">{inProgressSupervisions}</p>
                  <span className="text-[10px] text-amber-200">Jadwal Berjalan</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Tim Observer</span>
                  <p className="text-2xl font-black text-teal-200 tabular-nums">{activeObservers}</p>
                  <span className="text-[10px] text-teal-100">KS & Guru SK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Edukatif Regulasi Supervisi: 1 Semester 1 Kali */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 text-amber-950 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
                <span className="material-symbols-outlined text-2xl">info</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Ketetapan Regulasi Supervisi Guru
                  </span>
                  <span className="text-xs font-semibold text-amber-800">1 Semester 1 Kali</span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                  Supervisi akademik guru dilaksanakan <strong>1 semester 1 kali</strong> melalui 5 tahapan dialogis tanpa penghakiman. Oleh karena itu, dasbor rekap supervisi guru <strong>tidak menggunakan filter harian atau bulanan</strong>.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-amber-200">
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                <span>Masuk Ruang Kerja Guru</span>
              </button>
            </div>
          </div>

          {/* Filter Controls: Semester & Jenjang / Peran */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Semester Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Semester:
                </span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-teal-600 focus:outline-none"
                >
                  <option value="Semester Ganjil 2025/2026">Semester Ganjil 2025/2026 (Aktif)</option>
                  <option value="Semester Genap 2024/2025">Semester Genap 2024/2025</option>
                  <option value="Semester Ganjil 2024/2025">Semester Ganjil 2024/2025</option>
                </select>
              </div>

              {/* Fase Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Fase:
                </span>
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
                  <button
                    onClick={() => setFaseFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      faseFilter === 'all' ? 'bg-[#00685f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({teacherList.length})
                  </button>
                  <button
                    onClick={() => setFaseFilter('fase-a')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      faseFilter === 'fase-a' ? 'bg-[#00685f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fase A (Kls 1-2)
                  </button>
                  <button
                    onClick={() => setFaseFilter('fase-b')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      faseFilter === 'fase-b' ? 'bg-[#00685f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fase B (Kls 3-4)
                  </button>
                  <button
                    onClick={() => setFaseFilter('fase-c')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      faseFilter === 'fase-c' ? 'bg-[#00685f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fase C (Kls 5-6)
                  </button>
                  <button
                    onClick={() => setFaseFilter('mapel')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      faseFilter === 'mapel' ? 'bg-[#00685f] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mapel Khusus
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Peran Observer */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Peran:</span>
              <select
                value={observerFilter}
                onChange={(e) => setObserverFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:outline-none"
              >
                <option value="all">Semua Guru</option>
                <option value="observer_only">Hanya Guru Observer</option>
                <option value="regular_only">Guru Peserta Saja</option>
              </select>
            </div>
          </div>

          {/* Banner Informasi Mode Tinjauan (Read-Only) */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 flex items-center justify-between gap-4 text-xs text-indigo-950">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-700 text-xl shrink-0">
                visibility
              </span>
              <div>
                <span className="font-bold block">
                  Mode Rekapitulasi Publik (Hanya Tinjauan / Read-Only):
                </span>
                <span className="text-indigo-900/80">
                  Laman ini berfungsi menampilkan rekap status 5 tahap supervisi klinis. Perubahan data, penilaian rubrik, dan telaah modul hanya dapat dilakukan di Dashboard Manajemen Kepala Sekolah & Guru Observer.
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-indigo-700 px-3.5 py-1.5 font-bold text-white hover:bg-indigo-800 transition shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">login</span>
              <span>Login Manajemen</span>
            </button>
          </div>

          {/* TABEL REKAPITULASI PROGRES SUPERVISI SELURUH GURU */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <div className="border-b border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f]">table_chart</span>
                  <span>Tabel Rekap Progres Supervisi Guru — {selectedSemester}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tanda centang (✓) menunjukkan tahapan supervisi klinis reflektif yang telah selesai diverifikasi oleh observer.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-white text-[11px] font-bold">✓</span>
                  <span>Selesai</span>
                </span>
                <span className="inline-flex items-center gap-1 ml-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-400 text-[11px] font-bold">○</span>
                  <span>Dalam Proses / Terjadwal</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Nama Guru & NIP</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Rombel / Fase</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Peran & Observer</th>
                    <th className="py-3.5 px-2.5 text-center min-w-[90px]" title="Tahap 1: Pra-Observasi & Kesepakatan">
                      1. Pra-Obs
                    </th>
                    <th className="py-3.5 px-2.5 text-center min-w-[90px]" title="Tahap 2: Telaah & Verifikasi Modul Ajar">
                      2. Telaah
                    </th>
                    <th className="py-3.5 px-2.5 text-center min-w-[90px]" title="Tahap 3: Pelaksanaan Observasi Kelas">
                      3. Obs Kelas
                    </th>
                    <th className="py-3.5 px-2.5 text-center min-w-[90px]" title="Tahap 4: Dialog Reflektif Pasca-Observasi (Sipakainge)">
                      4. Refleksi
                    </th>
                    <th className="py-3.5 px-2.5 text-center min-w-[90px]" title="Tahap 5: Laporan Hasil Supervisi">
                      5. Laporan
                    </th>
                    <th className="py-3.5 px-4 text-center min-w-[110px]">Status Capaian</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]" title="Skor rata-rata dari 22 indikator pelaksanaan KBM Pembelajaran Mendalam">Rerata Skor Obs</th>
                    <th className="py-3.5 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((teacher, idx) => {
                    const stageRecord = teacherStagesMap[teacher.id] || {
                      t1: false,
                      t2: false,
                      t3: false,
                      t4: false,
                      t5: false,
                      status: 'Belum Mulai' as const,
                      score: '—',
                    };

                    return (
                      <tr
                        key={teacher.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {teacher.avatar ? (
                              <img
                                src={teacher.avatar}
                                alt={teacher.name}
                                className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                                {teacher.initials}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-[#00685f] transition-colors">
                                {teacher.name}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                NIP. {teacher.nip}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{teacher.rombel}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{teacher.faseLabel} • {teacher.subject}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {teacher.isObserver ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                                <span className="material-symbols-outlined text-xs">verified</span>
                                Guru Observer
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                Guru Peserta
                              </span>
                            )}
                            <p className="text-[10px] text-slate-500">
                              Observer: <strong>{teacher.assignedObserverName || 'Fahmawati, S.Pd.'}</strong>
                            </p>
                          </div>
                        </td>

                        {/* Tahap 1: Pra-Observasi */}
                        <td className="py-3.5 px-2.5 text-center">
                          <span
                            title={stageRecord.t1 ? 'Tahap 1: Pra-Observasi Selesai' : 'Tahap 1: Pra-Observasi Belum'}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              stageRecord.t1
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {stageRecord.t1 ? '✓' : '—'}
                          </span>
                        </td>

                        {/* Tahap 2: Telaah Modul Ajar */}
                        <td className="py-3.5 px-2.5 text-center">
                          <span
                            title={stageRecord.t2 ? 'Tahap 2: Telaah Modul Ajar Selesai' : 'Tahap 2: Telaah Modul Ajar Belum'}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              stageRecord.t2
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {stageRecord.t2 ? '✓' : '—'}
                          </span>
                        </td>

                        {/* Tahap 3: Pelaksanaan Observasi Kelas */}
                        <td className="py-3.5 px-2.5 text-center">
                          <span
                            title={stageRecord.t3 ? 'Tahap 3: Observasi Kelas Selesai' : 'Tahap 3: Observasi Kelas Belum'}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              stageRecord.t3
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {stageRecord.t3 ? '✓' : '—'}
                          </span>
                        </td>

                        {/* Tahap 4: Dialog Reflektif Pasca-Observasi */}
                        <td className="py-3.5 px-2.5 text-center">
                          <span
                            title={stageRecord.t4 ? 'Tahap 4: Refleksi Sipakainge Selesai' : 'Tahap 4: Refleksi Sipakainge Belum'}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              stageRecord.t4
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {stageRecord.t4 ? '✓' : '—'}
                          </span>
                        </td>

                        {/* Tahap 5: Laporan Hasil Supervisi */}
                        <td className="py-3.5 px-2.5 text-center">
                          <span
                            title={stageRecord.t5 ? 'Tahap 5: Laporan Selesai' : 'Tahap 5: Laporan Belum'}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              stageRecord.t5
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {stageRecord.t5 ? '✓' : '—'}
                          </span>
                        </td>

                        {/* Status Capaian */}
                        <td className="py-3.5 px-4 text-center">
                          {stageRecord.status === 'Tuntas' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-600/20">
                              <span className="material-symbols-outlined text-xs">verified</span>
                              Tuntas 5 Tahap
                            </span>
                          ) : stageRecord.status === 'Dalam Proses' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-600/20">
                              <span className="material-symbols-outlined text-xs">pending</span>
                              Dalam Proses
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                              {stageRecord.status}
                            </span>
                          )}
                        </td>

                        {/* Skor Refleksi */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {stageRecord.score}
                        </td>

                        {/* Aksi: Buka Detail */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedTeacherModal(teacher)}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-[#00685f] hover:bg-teal-50 transition"
                            title="Lihat Detail Siklus Supervisi Guru"
                          >
                            <span>Detail</span>
                            <span className="material-symbols-outlined text-xs">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Summary Table */}
            <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <p>
                Menampilkan <strong>{filteredTeachers.length}</strong> dari <strong>{teacherList.length}</strong> pendidik UPT SPF SDN Percontohan PAM Makassar.
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Siklus Semester Aktif
                </span>
                <span>•</span>
                <span>Terakhir diperbarui: {todayLabel}</span>
              </div>
            </div>
          </div>

          {/* Section: Penjelasan 5 Tahapan Siklus Supervisi Klinis Reflektif */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00685f]">sync_alt</span>
              <span>Alur Siklus 5 Tahapan Supervisi Klinis Reflektif (1 Semester 1 Kali)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Tahap 1</span>
                <p className="font-bold text-xs text-slate-900">Pra-Observasi</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Dialog kesepakatan fokus area pengembangan pedagogik, jadwal observasi kelas, dan rubrik asesmen.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Tahap 2</span>
                <p className="font-bold text-xs text-slate-900">Telaah Modul Ajar</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Verifikasi kesesuaian ATP, diferensiasi konten & proses, rubrik asesmen formatif otentik, dan LKPD.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Tahap 3</span>
                <p className="font-bold text-xs text-slate-900">Observasi Kelas</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pengamatan klinis interaksi guru-murid di ruang kelas tanpa penghakiman oleh Kepala Sekolah atau Observer.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Tahap 4</span>
                <p className="font-bold text-xs text-slate-900">Pasca-Obs / Sipakainge</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Percakapan refleksi kemitraan 1:1, menggali kekuatan praktik baik guru dan solusi tantangan kelas.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Tahap 5</span>
                <p className="font-bold text-xs text-slate-900">Laporan Hasil Supervisi</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Laporan hasil supervisi guru disusun dan didiseminasikan di Komunitas Belajar / KKG sekolah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Detail Transparansi Siklus Guru */}
      {selectedTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                {selectedTeacherModal.avatar ? (
                  <img
                    src={selectedTeacherModal.avatar}
                    alt={selectedTeacherModal.name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-teal-100"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-lg">
                    {selectedTeacherModal.initials}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedTeacherModal.name}</h3>
                  <p className="text-xs text-slate-500">
                    NIP. {selectedTeacherModal.nip} • {selectedTeacherModal.rombel} ({selectedTeacherModal.faseLabel})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTeacherModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Observer Assignment & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Observer Yang Bertugas</span>
                <p className="font-bold text-slate-900">
                  {selectedTeacherModal.assignedObserverName || 'Fahmawati, S.Pd. (Kepala Sekolah)'}
                </p>
                <span className="text-[10px] text-teal-700 font-medium">SK Penugasan Observer Semester Ganjil</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Fokus Pengembangan Mutu</span>
                <p className="font-bold text-slate-900">{selectedTeacherModal.focusSupervision}</p>
                <p className="text-[11px] text-slate-500 leading-snug">{selectedTeacherModal.focusSupervisionDesc}</p>
              </div>
            </div>

            {/* Stages Checklist in Modal */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Progres 5 Tahapan Supervisi:
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                {[
                  { key: 't1', label: '1. Perencanaan & Kesepakatan Pra-Observasi', desc: 'Indikator fokus rubrik & jadwal pelaksanaan' },
                  { key: 't2', label: '2. Verifikasi Modul Ajar (RPP)', desc: 'ATP, LKPD berjenjang, dan asesmen formatif otentik' },
                  { key: 't3', label: '3. Pelaksanaan Observasi Kelas', desc: `Pengamatan di ruang ${selectedTeacherModal.rombel}` },
                  { key: 't4', label: '4. Dialog Reflektif Pasca-Observasi (Sipakainge)', desc: 'Refleksi mandiri kemitraan & penguatan praktik baik' },
                  { key: 't5', label: '5. Laporan Hasil Supervisi & KKG', desc: 'Diseminasi praktik baik di komunitas belajar sekolah' },
                ].map((s) => {
                  const currentStatus = teacherStagesMap[selectedTeacherModal.id];
                  const isDone = currentStatus ? currentStatus[s.key as keyof typeof currentStatus] : false;
                  return (
                    <div key={s.key} className="p-3 flex items-center justify-between gap-3 bg-white hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">{s.label}</p>
                        <p className="text-[11px] text-slate-500">{s.desc}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {isDone ? '✓ Tuntas' : 'Dalam Proses'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions CTA */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedTeacherModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Tutup Pratinjau
              </button>

              <button
                onClick={() => {
                  setSelectedTeacherModal(null);
                  onNavigate('login');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00685f] text-white text-xs font-bold hover:bg-[#008378] transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                <span>Masuk Ruang Kerja Untuk Kelola Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
