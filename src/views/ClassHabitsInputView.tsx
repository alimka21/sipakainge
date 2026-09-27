import React, { useState } from 'react';
import { ScreenId, MuridRecord, PrayerTimesChecklist, UserRole } from '../types';
import { INITIAL_MURID, HABIT_LIST } from '../data/mockData';

type WorkspaceTab = 'habits' | 'academics' | 'portfolios' | 'awards' | 'attendance';

interface ClassHabitsInputViewProps {
  onNavigate: (screen: ScreenId) => void;
  muridList?: MuridRecord[];
  userRole?: UserRole;
  onUpdateMuridHabits?: (muridId: string, updated: Partial<MuridRecord>) => void;
  onUpdateMuridList?: React.Dispatch<React.SetStateAction<MuridRecord[]>>;
  /** When set, the view opens directly on this workspace tab and hides the tab switcher,
   * so it behaves as a standalone page reached from its own sidebar menu. */
  lockedTab?: WorkspaceTab;
}

const TAB_META: Record<WorkspaceTab, { breadcrumb: string; title: string }> = {
  habits: { breadcrumb: 'Isian & Verifikasi 7 KAIH', title: 'Isian & Pemantauan 7 KAIH' },
  academics: { breadcrumb: 'Input Nilai Akademik Mapel', title: 'Input Nilai Akademik Mapel' },
  portfolios: { breadcrumb: 'Karya & Portofolio Murid', title: 'Karya & Portofolio Murid' },
  awards: { breadcrumb: 'Prestasi & Apresiasi Murid', title: 'Prestasi & Apresiasi Murid' },
  attendance: { breadcrumb: 'Presensi Murid', title: 'Presensi Murid' },
};

export const ClassHabitsInputView: React.FC<ClassHabitsInputViewProps> = ({
  onNavigate,
  muridList: propMuridList,
  userRole = 'guru',
  onUpdateMuridList,
  lockedTab,
}) => {
  // Current active teacher is Ibu Siti Aminah (Wali Kelas IV-A)
  const currentTeacher = {
    name: 'Ibu Siti Aminah, S.Pd.',
    nip: '19840212 200801 2 018',
    assignedClass: 'Kelas IV-A',
    fase: 'Fase B',
  };

  const [muridData, setMuridData] = useState<MuridRecord[]>(propMuridList || INITIAL_MURID);
  const [selectedClass, setSelectedClass] = useState<string>(
    userRole === 'kepala_sekolah' ? '' : currentTeacher.assignedClass
  );
  const [selectedMuridId, setSelectedMuridId] = useState<string>(
    userRole === 'kepala_sekolah' ? '' : 'm-4a-1'
  );
  const [selectedDate, setSelectedDate] = useState<string>('25 September 2026 (Hari Ini)');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [guruNote, setGuruNote] = useState<string>(
    'Ananda sangat disiplin mengikuti sholat dhuha berjamaah dan aktif membaca buku cerita di pojok baca kelas.'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Workspace tab: habits, academics, portfolios, awards, attendance
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>(lockedTab || 'habits');
  const currentTabMeta = TAB_META[lockedTab || 'habits'];

  // New attendance states
  const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Sakit' | 'Izin' | 'Alpa'>('Hadir');
  const [attendanceNote, setAttendanceNote] = useState<string>('');

  // New academic grade states
  const [selectedAcademicSubject, setSelectedAcademicSubject] = useState<string>('Ilmu Pengetahuan Alam & Sosial');
  const [academicTaskName, setAcademicTaskName] = useState<string>('');
  const [academicScore, setAcademicScore] = useState<string>('');

  // New portfolio upload states
  const [portfolioTitle, setPortfolioTitle] = useState<string>('');
  const [portfolioCategory, setPortfolioCategory] = useState<string>('Proyek Seni & Lingkungan');
  const [portfolioDescription, setPortfolioDescription] = useState<string>('');
  const [portfolioFeedback, setPortfolioFeedback] = useState<string>('');

  // New student achievements states
  const [awardTitle, setAwardTitle] = useState<string>('');
  const [awardCategory, setAwardCategory] = useState<string>('Kelas');
  const [awardDescription, setAwardDescription] = useState<string>('');

  const handleSaveAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMurid) {
      showToast('Silakan pilih murid terlebih dahulu!');
      return;
    }
    if (!academicTaskName.trim() || !academicScore) {
      showToast('Harap lengkapi nama tugas dan nilai!');
      return;
    }

    const scoreNum = Number(academicScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      showToast('Nilai harus berupa angka antara 0 dan 100!');
      return;
    }

    const updater = (prevList: MuridRecord[]) => {
      return prevList.map((m) => {
        if (m.id === activeMurid.id) {
          const currentAcademics = (m as any).academics || {};
          const currentSubjectData = currentAcademics[selectedAcademicSubject] || {
            subject: selectedAcademicSubject,
            score: scoreNum,
            tasks: [],
          };
          const updatedTasks = [
            ...currentSubjectData.tasks,
            { taskId: `task-${Date.now()}`, taskName: academicTaskName, score: scoreNum },
          ];
          const avgScore = Math.round(updatedTasks.reduce((acc, t) => acc + t.score, 0) / updatedTasks.length);

          return {
            ...m,
            academics: {
              ...currentAcademics,
              [selectedAcademicSubject]: {
                subject: selectedAcademicSubject,
                score: avgScore,
                tasks: updatedTasks,
              },
            },
          };
        }
        return m;
      });
    };

    setMuridData(updater);
    if (onUpdateMuridList) {
      onUpdateMuridList(updater);
    }
    setAcademicTaskName('');
    setAcademicScore('');
    showToast(`✓ Berhasil menyimpan nilai akademik untuk ${activeMurid.name}!`);
  };

  const handleSavePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMurid) {
      showToast('Silakan pilih murid terlebih dahulu!');
      return;
    }
    if (!portfolioTitle.trim() || !portfolioDescription.trim()) {
      showToast('Harap lengkapi judul karya dan deskripsi!');
      return;
    }

    const newPortfolio = {
      id: `p-${Date.now()}`,
      title: portfolioTitle,
      category: portfolioCategory,
      date: '25 September 2026',
      description: portfolioDescription,
      feedback: portfolioFeedback || 'Karya luar biasa yang terdokumentasi dengan baik.',
    };

    const updater = (prevList: MuridRecord[]) => {
      return prevList.map((m) => {
        if (m.id === activeMurid.id) {
          const currentPortfolios = (m as any).portfolios || [];
          return {
            ...m,
            portfolios: [...currentPortfolios, newPortfolio],
          };
        }
        return m;
      });
    };

    setMuridData(updater);
    if (onUpdateMuridList) {
      onUpdateMuridList(updater);
    }
    setPortfolioTitle('');
    setPortfolioDescription('');
    setPortfolioFeedback('');
    showToast(`✓ Portofolio berhasil diunggah untuk ${activeMurid.name}!`);
  };

  const handleSaveAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMurid) {
      showToast('Silakan pilih murid terlebih dahulu!');
      return;
    }
    if (!awardTitle.trim() || !awardDescription.trim()) {
      showToast('Harap lengkapi judul prestasi dan keterangan!');
      return;
    }

    const newAward = {
      id: `aw-${Date.now()}`,
      title: awardTitle,
      category: awardCategory,
      date: 'September 2026',
      description: awardDescription,
    };

    const updater = (prevList: MuridRecord[]) => {
      return prevList.map((m) => {
        if (m.id === activeMurid.id) {
          const currentAchievements = (m as any).achievements || [];
          return {
            ...m,
            achievements: [...currentAchievements, newAward],
          };
        }
        return m;
      });
    };

    setMuridData(updater);
    if (onUpdateMuridList) {
      onUpdateMuridList(updater);
    }
    setAwardTitle('');
    setAwardDescription('');
    showToast(`✓ Prestasi & apresiasi berhasil ditambahkan untuk ${activeMurid.name}!`);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMurid) {
      showToast('Silakan pilih murid terlebih dahulu!');
      return;
    }

    const newAttendance = {
      id: `att-${Date.now()}`,
      date: selectedDate,
      status: attendanceStatus,
      note: attendanceNote,
    };

    const updater = (prevList: MuridRecord[]) => {
      return prevList.map((m) => {
        if (m.id === activeMurid.id) {
          const currentAttendance = (m as any).attendance || [];
          return {
            ...m,
            attendance: [newAttendance, ...currentAttendance],
          };
        }
        return m;
      });
    };

    setMuridData(updater);
    if (onUpdateMuridList) {
      onUpdateMuridList(updater);
    }
    setAttendanceNote('');
    showToast(`✓ Presensi ${activeMurid.name} berhasil dicatat: ${attendanceStatus}!`);
  };

  // If role is guru, strictly filter to the assigned class set by Kepala Sekolah (Kelas IV-A)
  const availableClasses = ['Semua Kelas', 'Kelas IV-A', 'Kelas V-B', 'Kelas III-A', 'Kelas I-B', 'Kelas VI-C'];

  const filteredByClass = muridData.filter((m) => {
    if (userRole === 'guru') {
      return m.rombel === currentTeacher.assignedClass;
    }
    if (!selectedClass) return false;
    if (selectedClass === 'Semua Kelas') return true;
    return m.rombel === selectedClass;
  });

  const displayMuridList = filteredByClass.filter(
    (m) =>
      m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.nisn.includes(searchFilter) ||
      m.nis.includes(searchFilter)
  );

  const activeMurid = selectedMuridId
    ? displayMuridList.find((m) => m.id === selectedMuridId)
    : (userRole === 'kepala_sekolah' ? undefined : displayMuridList[0] || muridData[0]);

  const isHomeHabitsValidated = !!(activeMurid as any)?.homeHabitsValidated;

  // Handler for Guru School Prayers (Dhuha & Dhuhur)
  const handleTogglePrayer = (muridId: string, pKey: keyof PrayerTimesChecklist) => {
    setMuridData((prev) =>
      prev.map((m) => {
        if (m.id === muridId) {
          const current = m.prayers[pKey];
          const next = !current;
          const label = pKey === 'dhuha' ? 'Sholat Dhuha' : pKey === 'dzuhur' ? 'Sholat Dhuhur' : pKey;
          showToast(`${m.name}: ${label} ${next ? '✓ Selesai Terpantau' : 'Belum Selesai'}`);
          return {
            ...m,
            prayers: { ...m.prayers, [pKey]: next },
          };
        }
        return m;
      })
    );
  };

  const handleValidateHomeHabits = () => {
    if (!activeMurid) return;
    const alreadyValidated = !!(activeMurid as any).homeHabitsValidated;

    const updater = (prevList: MuridRecord[]) => {
      return prevList.map((m) => {
        if (m.id === activeMurid.id) {
          return {
            ...m,
            homeHabitsValidated: !alreadyValidated,
            homeHabitsValidatedAt: !alreadyValidated ? selectedDate : undefined,
          };
        }
        return m;
      });
    };

    setMuridData(updater);
    if (onUpdateMuridList) {
      onUpdateMuridList(updater);
    }

    showToast(
      alreadyValidated
        ? `Validasi Pembiasaan Rumah ${activeMurid.name} dibatalkan.`
        : `✓ Pembiasaan Rumah ${activeMurid.name} berhasil divalidasi & tersimpan oleh Wali Kelas!`
    );
  };

  const handleSaveGuruNotes = () => {
    if (!activeMurid) return;
    showToast(`Catatan jurnal perkembangan ${activeMurid.name} berhasil disimpan.`);
  };

  const calculateDoneHabits = (m: MuridRecord) => {
    return Object.values(m.habits).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 animate-fade-in">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
            <span className="material-symbols-outlined text-base">verified</span>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Context Bar */}
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="text-slate-400">Ruang Pendidik</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">
              {userRole === 'kepala_sekolah' ? 'Supervisi Karakter KS' : 'Wali Kelas IV-A'}
            </span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-teal-800">
              {currentTabMeta.breadcrumb}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
              <span className="material-symbols-outlined text-sm text-teal-700">lock_clock</span>
              <span>{selectedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
        {/* Banner Wewenang & Hak Akses Kelas */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#6ffbbe] ring-2 ring-white/15 shrink-0">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold">
                    {!lockedTab || lockedTab === 'habits'
                      ? userRole === 'kepala_sekolah'
                        ? 'Pemantauan 7 KAIH Seluruh Kelas (Kepala Sekolah)'
                        : `Isian & Pemantauan 7 KAIH (${currentTeacher.assignedClass})`
                      : `${currentTabMeta.title} (${userRole === 'kepala_sekolah' ? 'Seluruh Kelas' : currentTeacher.assignedClass})`}
                  </h1>
                  <span className="rounded-full bg-[#6ffbbe]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#6ffbbe] border border-[#6ffbbe]/30">
                    {userRole === 'kepala_sekolah' ? 'Super Admin' : 'Wali Kelas Resmi'}
                  </span>
                </div>
                <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                  {!lockedTab || lockedTab === 'habits' ? (
                    userRole === 'guru' ? (
                      <>
                        Sebagai <strong>Wali Kelas {currentTeacher.assignedClass}</strong>, Anda berwenang mengisi ibadah jam sekolah (<strong>Shalat Dhuha & Dhuhur</strong>) serta memvalidasi pembiasaan rumah yang dilaporkan oleh orang tua murid.
                      </>
                    ) : (
                      <>
                        Kepala Sekolah memiliki wewenang memantau seluruh kelas, mengawasi keterisian jurnal harian 7 KAIH murid, dan memastikan verifikasi wali kelas berjalan tertib.
                      </>
                    )
                  ) : (
                    <>
                      Pilih kelas dan murid terlebih dahulu, lalu catat <strong>{currentTabMeta.title.toLowerCase()}</strong> untuk murid tersebut.
                    </>
                  )}
                </p>
              </div>
            </div>


          </div>
        </div>

        {/* ======================================================== */}
        {/* LANGKAH 1: PILIH KELAS & SISWA TERLEBIH DAHULU (STACKED) */}
        {/* ======================================================== */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Langkah 1: Pilih Kelas & Murid
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 pl-8">
                {userRole === 'guru'
                  ? `Khusus murid ${currentTeacher.assignedClass} sesuai penugasan resmi Kepala Sekolah`
                  : selectedClass
                  ? `Daftar siswa pada ${selectedClass}`
                  : 'Silakan pilih rombel kelas terlebih dahulu'}
              </p>
            </div>

            {/* Search Box */}
            {userRole !== 'kepala_sekolah' && (
              <div className="flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs w-full sm:w-64 border border-slate-200">
                <span className="material-symbols-outlined text-slate-400 mr-2 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Cari nama atau NISN..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          {userRole === 'kepala_sekolah' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Pilih Rombel / Kelas:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedMuridId('');
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                >
                  <option value="">-- Pilih Kelas --</option>
                  <option value="Kelas I-B">Kelas I-B</option>
                  <option value="Kelas III-A">Kelas III-A</option>
                  <option value="Kelas IV-A">Kelas IV-A</option>
                  <option value="Kelas V-B">Kelas V-B</option>
                  <option value="Kelas VI-C">Kelas VI-C</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Pilih Nama Siswa:</label>
                <select
                  value={selectedMuridId}
                  onChange={(e) => setSelectedMuridId(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:opacity-50"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {displayMuridList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (NISN: {m.nisn})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Grid Murid Cards (Only for Guru) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
              {displayMuridList.map((murid) => {
                const doneCount = calculateDoneHabits(murid);
                const isSelected = activeMurid?.id === murid.id;

                return (
                  <div
                    key={murid.id}
                    onClick={() => setSelectedMuridId(murid.id)}
                    className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/70 shadow-sm ring-2 ring-teal-600/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {murid.avatar ? (
                        <img
                          src={murid.avatar}
                          alt={murid.name}
                          className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shrink-0">
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {murid.gender === 'L' ? 'boy' : 'girl'}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate">{murid.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {murid.rombel} • NISN: {murid.nisn}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              doneCount >= 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {doneCount}/7 KAIH
                          </span>
                          {isSelected && (
                            <span className="text-[9px] text-teal-700 font-extrabold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[11px]">check_circle</span>
                              Terpilih
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {userRole === 'kepala_sekolah' && !selectedClass && (
            <div className="text-center p-6 border border-dashed border-slate-200 bg-slate-50 rounded-2xl">
              <span className="material-symbols-outlined text-slate-400 text-3xl mb-1 block">grid_view</span>
              <p className="text-xs text-slate-500 font-bold">Silakan pilih kelas terlebih dahulu pada pilihan di atas.</p>
            </div>
          )}

          {userRole === 'kepala_sekolah' && selectedClass && !selectedMuridId && (
            <div className="text-center p-6 border border-dashed border-slate-200 bg-slate-50 rounded-2xl">
              <span className="material-symbols-outlined text-[#00685f] text-3xl mb-1 block">person_search</span>
              <p className="text-xs text-slate-500 font-bold">Silakan pilih salah satu siswa dari daftar kelas ini pada pilihan di atas.</p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* LANGKAH 2: IDENTITAS SISWA TERPILIH (STACKED DI BAWAH)   */}
        {/* ======================================================== */}
        {activeMurid && (
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Langkah 2: Identitas Murid Terpilih
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
              <div className="flex items-center gap-4">
                {activeMurid.avatar ? (
                  <img
                    src={activeMurid.avatar}
                    alt={activeMurid.name}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-teal-600/30 shrink-0"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shrink-0">
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {activeMurid.gender === 'L' ? 'boy' : 'girl'}
                    </span>
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{activeMurid.name}</h3>
                    <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                      {activeMurid.rombel}
                    </span>
                    <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      Jenis Kelamin: {activeMurid.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>NISN: <strong>{activeMurid.nisn}</strong></span>
                    <span>•</span>
                    <span>NIS: <strong>{activeMurid.nis}</strong></span>
                    <span>•</span>
                    <span>Orang Tua/Wali: <strong>{activeMurid.parentName}</strong> ({activeMurid.parentPhone})</span>
                    {activeMurid.tanggalLahir && (
                      <>
                        <span>•</span>
                        <span>Tanggal Lahir: <strong>{activeMurid.tanggalLahir}</strong></span>
                      </>
                    )}
                    {activeMurid.alamat && (
                      <>
                        <span>•</span>
                        <span>Alamat: <strong>{activeMurid.alamat}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="rounded-xl bg-white px-3 py-2 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Tidur & Bangun</span>
                  <span className="text-xs font-bold text-slate-800">
                    {activeMurid.wakeUpTime} - {activeMurid.bedTime} WITA
                  </span>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold">Karakter 7 KAIH</span>
                  <span className="text-xs font-bold text-teal-700">
                    {calculateDoneHabits(activeMurid)} / 7 Tuntas
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Tab Bar */}
        {activeMurid && !lockedTab && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
            <button
              onClick={() => setActiveWorkspaceTab('habits')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all duration-150 ${
                activeWorkspaceTab === 'habits'
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                <span>Jurnal & Pantau 7 KAIH</span>
              </div>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('academics')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all duration-150 ${
                activeWorkspaceTab === 'academics'
                  ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">auto_stories</span>
                <span>Input Nilai Akademik Mapel</span>
              </div>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('portfolios')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all duration-150 ${
                activeWorkspaceTab === 'portfolios'
                  ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">photo_library</span>
                <span>Karya & Portofolio Murid</span>
              </div>
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('awards')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-all duration-150 ${
                activeWorkspaceTab === 'awards'
                  ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">stars</span>
                <span>Prestasi & Apresiasi Murid</span>
              </div>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* WORKSPACE TAB RENDERING                                 */}
        {/* ======================================================== */}
        {activeMurid && activeWorkspaceTab === 'habits' && (
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Langkah 3: Lembar Isian & Pembagian Wewenang 7 KAIH
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kolaborasi Sekolah & Keluarga: Guru mencatat di sekolah, Orang Tua mencatat di rumah
                  </p>
                </div>
              </div>
            </div>

            {/* BAGIAN A: WEWENANG GURU DI SEKOLAH */}
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/40 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-xl">school</span>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      A. Wewenang Pengisian Guru / Wali Kelas (Terpantau di Sekolah)
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      Sesuai arahan: Guru mengisi pelaksanaan ibadah selama jam belajar di sekolah (Dhuha & Dhuhur)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold max-w-fit">
                  Aktif untuk Guru
                </span>
              </div>

              {/* Dua Checklist Ibadah Sekolah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shalat Dhuha */}
                <div
                  onClick={() => handleTogglePrayer(activeMurid.id, 'dhuha')}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between ${
                    activeMurid.prayers.dhuha
                      ? 'border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        activeMurid.prayers.dhuha ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined">wb_sunny</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Shalat Dhuha di Sekolah</p>
                      <p className="text-[10px] text-slate-500">Istirahat Pagi • Musholla / Ruang Kelas</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      activeMurid.prayers.dhuha
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {activeMurid.prayers.dhuha ? '✓ Terlaksana' : 'Belum'}
                  </span>
                </div>

                {/* Shalat Dhuhur Berjamaah */}
                <div
                  onClick={() => handleTogglePrayer(activeMurid.id, 'dzuhur')}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-center justify-between ${
                    activeMurid.prayers.dzuhur
                      ? 'border-emerald-600 bg-white shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        activeMurid.prayers.dzuhur ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <span className="material-symbols-outlined">brightness_5</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Shalat Dhuhur Berjamaah</p>
                      <p className="text-[10px] text-slate-500">Jam Siang Sebelum Pulang Sekolah</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      activeMurid.prayers.dzuhur
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {activeMurid.prayers.dzuhur ? '✓ Terlaksana' : 'Belum'}
                  </span>
                </div>
              </div>

              {/* Catatan Jurnal Wali Kelas */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan Apresiasi & Karakter Murid Hari Ini (Oleh Wali Kelas):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={guruNote}
                    onChange={(e) => setGuruNote(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    placeholder="Tuliskan catatan apresiasi karakter murid..."
                  />
                  <button
                    onClick={handleSaveGuruNotes}
                    className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shrink-0"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </div>
            </div>

            {/* BAGIAN B: WEWENANG ORANG TUA DI RUMAH */}
            <div
              className={`rounded-2xl border p-5 space-y-4 transition-colors ${
                isHomeHabitsValidated
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-amber-300 bg-amber-50/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-xl">home</span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      B. Wewenang Pengisian Orang Tua Murid (Pembiasaan di Rumah)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Diisi oleh orang tua melalui akun Portal Orang Tua. Data pembiasaan rumah baru dianggap
                      tersimpan resmi setelah divalidasi oleh Wali Kelas.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isHomeHabitsValidated ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Tervalidasi & Tersimpan
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">hourglass_top</span>
                      Menunggu Validasi
                    </span>
                  )}
                  <button
                    onClick={handleValidateHomeHabits}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition shadow-xs ${
                      isHomeHabitsValidated
                        ? 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isHomeHabitsValidated ? 'undo' : 'done_all'}
                    </span>
                    <span>{isHomeHabitsValidated ? 'Batalkan Validasi' : 'Validasi & Simpan (Wali Kelas)'}</span>
                  </button>
                </div>
              </div>

              {!isHomeHabitsValidated && (
                <div className="rounded-xl bg-white/70 border border-dashed border-amber-300 px-3 py-2 text-[11px] text-amber-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>
                    Data di bawah ini masih berupa laporan orang tua dan <strong>belum tersimpan resmi</strong>.
                    Klik tombol "Validasi & Simpan" setelah memeriksa kebenarannya.
                  </span>
                </div>
              )}

              {/* Rincian Status Pembiasaan Rumah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-xl bg-white p-3 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">#1 Bangun Pagi</p>
                    <p className="text-[10px] text-slate-500">Jam {activeMurid.wakeUpTime} WITA</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Diisi Ortu
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">#2 Ibadah Subuh & Maghrib</p>
                    <p className="text-[10px] text-slate-500">
                      Subuh: {activeMurid.prayers.subuh ? '✓' : '—'} • Maghrib: {activeMurid.prayers.maghrib ? '✓' : '—'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Diisi Ortu
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">#3 Makan Makanan Sehat</p>
                    <p className="text-[10px] text-slate-500">Sayur, buah, & air putih</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {activeMurid.habits[4] ? '✓ Dilakukan' : 'Belum'}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">#4 Gemar Membaca (Literasi)</p>
                    <p className="text-[10px] text-slate-500">15-30 menit buku bacaan</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {activeMurid.habits[5] ? '✓ Dilakukan' : 'Belum'}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">#5 Berolahraga</p>
                    <p className="text-[10px] text-slate-500">Aktivitas fisik teratur</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {activeMurid.habits[3] ? '✓ Dilakukan' : 'Belum'}
                  </span>
                </div>

                <div className="rounded-xl bg-white p-3 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-900">#6 Tidur Cepat / Tepat Waktu</p>
                    <p className="text-[10px] text-slate-500">Jam {activeMurid.bedTime} WITA</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Diisi Ortu
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMurid && activeWorkspaceTab === 'academics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form */}
            <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">edit_note</span>
                Input Nilai Akademik
              </h3>
              <form onSubmit={handleSaveAcademic} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran:</label>
                  <select
                    value={selectedAcademicSubject}
                    onChange={(e) => setSelectedAcademicSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                  >
                    <option value="Ilmu Pengetahuan Alam & Sosial">Ilmu Pengetahuan Alam & Sosial (IPAS)</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Matematika Operasional">Matematika Operasional</option>
                    <option value="Pendidikan Pancasila">Pendidikan Pancasila</option>
                    <option value="Seni Rupa & Prakarya">Seni Rupa & Prakarya</option>
                    <option value="Pendidikan Jasmani & Kesehatan">Pendidikan Jasmani & Kesehatan (PJOK)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Tugas / Aktivitas Evaluasi:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tes Formatif Bab Fotosintesis, Tugas Menulis Deskripsi"
                    value={academicTaskName}
                    onChange={(e) => setAcademicTaskName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nilai Evaluasi (0 - 100):</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    placeholder="Contoh: 92"
                    value={academicScore}
                    onChange={(e) => setAcademicScore(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Simpan Nilai Akademik</span>
                </button>
              </form>
            </div>

            {/* Right: Summary List of Academics */}
            <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Rekapitulasi Nilai Akademik: {activeMurid.name}</span>
                <span className="rounded-full bg-teal-50 text-teal-800 px-3 py-1 text-xs font-bold">Aktif • Real-time</span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(() => {
                  const subjectMap = (activeMurid as any).academics || {};
                  const subjectKeys = Object.keys(subjectMap);

                  if (subjectKeys.length === 0) {
                    return (
                      <div className="text-center p-8 border border-dashed border-slate-100 bg-slate-50/50 rounded-2xl text-slate-400 italic text-xs">
                        Belum ada input nilai akademik baru yang terekam untuk siswa ini. Silakan input tugas pertama di form sebelah kiri.
                      </div>
                    );
                  }

                  return subjectKeys.map((subjName) => {
                    const subjData = subjectMap[subjName];
                    const score = subjData.score;
                    const badgeColor = score >= 90 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : score >= 80 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200';
                    return (
                      <div key={subjName} className="rounded-2xl p-4 border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">{subjName}</h4>
                            <p className="text-[10px] text-slate-400">Pendidikan Karakter & Kompetensi</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                            Rerata: {score}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-100/60">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Daftar Aktivitas Tugas ({subjData.tasks?.length || 0}):</p>
                          <div className="flex flex-wrap gap-2">
                            {subjData.tasks?.map((task: any, tIdx: number) => (
                              <span key={task.taskId || tIdx} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-[10px] font-medium text-slate-600 border border-slate-100 shadow-2xs">
                                <span>{task.taskName}</span>
                                <strong className="text-teal-700 font-extrabold">{task.score}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {activeMurid && activeWorkspaceTab === 'portfolios' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form */}
            <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">photo_camera</span>
                Unggah Karya & Portofolio Murid
              </h3>
              <form onSubmit={handleSavePortfolio} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judul Karya / Projek Murid:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Poster Hemat Air Berkelanjutan, Miniatur Kincir Angin"
                    value={portfolioTitle}
                    onChange={(e) => setPortfolioTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Karya:</label>
                  <select
                    value={portfolioCategory}
                    onChange={(e) => setPortfolioCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                  >
                    <option value="Proyek Seni & Lingkungan">Proyek Seni & Lingkungan</option>
                    <option value="Praktikum Sains Mandiri">Praktikum Sains Mandiri</option>
                    <option value="Esai & Karya Literasi">Esai & Karya Literasi</option>
                    <option value="Teknologi & Digital Kreatif">Teknologi & Digital Kreatif</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deskripsi Proses Belajar & Nilai Karakter:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Murid mendesain dan melukis secara mandiri poster kampanye hemat air bersih, melatih kemandirian dan gotong royong dalam tim."
                    value={portfolioDescription}
                    onChange={(e) => setPortfolioDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Umpan Balik Apresiasi Guru (Feedback):</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Karya yang sangat inspiratif! Pewarnaan harmonis dan detail gambar menunjukkan bakat seni digital yang kuat."
                    value={portfolioFeedback}
                    onChange={(e) => setPortfolioFeedback(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">cloud_upload</span>
                  <span>Unggah Karya ke Portofolio</span>
                </button>
              </form>
            </div>

            {/* Right: Portfolios Showcase */}
            <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Portofolio & Praktik Baik: {activeMurid.name}</span>
                <span className="rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-bold">Holistik</span>
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {(() => {
                  const portList = (activeMurid as any).portfolios || [];

                  if (portList.length === 0) {
                    return (
                      <div className="text-center p-8 border border-dashed border-slate-100 bg-slate-50/50 rounded-2xl text-slate-400 italic text-xs">
                        Belum ada karya portofolio baru yang diunggah. Gunakan form di sebelah kiri untuk mendokumentasikan karya/projek pertama murid.
                      </div>
                    );
                  }

                  return portList.map((port: any) => (
                    <div key={port.id} className="rounded-2xl p-4 border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 text-2xl shrink-0">
                        🎨
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-800">{port.title}</h4>
                          <span className="px-2 py-0.5 rounded bg-teal-100 text-[9px] font-bold text-teal-800">
                            {port.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{port.date}</p>
                        <p className="text-xs text-slate-600 pt-1 leading-relaxed">{port.description}</p>
                        <div className="mt-2 bg-white/70 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                          <strong className="text-teal-800">Apresiasi Guru:</strong> {port.feedback}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {activeMurid && activeWorkspaceTab === 'awards' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form */}
            <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">stars</span>
                Input Prestasi & Apresiasi Murid
              </h3>
              <form onSubmit={handleSaveAward} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Judul Prestasi / Penghargaan / Apresiasi:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Juara II Pidato Khas Sulsel, Murid Berakhlak Mulia"
                    value={awardTitle}
                    onChange={(e) => setAwardTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tingkat / Kategori:</label>
                  <select
                    value={awardCategory}
                    onChange={(e) => setAwardCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                  >
                    <option value="Kelas">Tingkat Kelas</option>
                    <option value="Sekolah">Tingkat Sekolah</option>
                    <option value="Kecamatan">Tingkat Kecamatan</option>
                    <option value="Kota">Tingkat Kota (Makassar)</option>
                    <option value="Provinsi">Tingkat Provinsi</option>
                    <option value="Nasional">Tingkat Nasional</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Deskripsi & Keterangan Tambahan:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Contoh: Memperoleh piala dan piagam penghargaan dari Kepala Sekolah atas kedisiplinan beribadah dan akhlak mulia selama Siklus Supervisi PAM."
                    value={awardDescription}
                    onChange={(e) => setAwardDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">stars</span>
                  <span>Simpan Prestasi & Apresiasi</span>
                </button>
              </form>
            </div>

            {/* Right: Awards Showcase */}
            <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Prestasi & Penghargaan: {activeMurid.name}</span>
                <span className="rounded-full bg-yellow-50 text-yellow-800 px-3 py-1 text-xs font-bold">Piala & Piagam</span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(() => {
                  const awardList = (activeMurid as any).achievements || [];

                  if (awardList.length === 0) {
                    return (
                      <div className="text-center p-8 border border-dashed border-slate-100 bg-slate-50/50 rounded-2xl text-slate-400 italic text-xs">
                        Belum ada rekam prestasi/apresiasi baru yang ditambahkan. Gunakan form di sebelah kiri untuk mencatat prestasi pertama murid.
                      </div>
                    );
                  }

                  return awardList.map((aw: any) => (
                    <div key={aw.id} className="rounded-2xl p-4 border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 text-lg shrink-0">
                        🏆
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{aw.title}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">
                            {aw.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{aw.date || 'September 2026'}</p>
                        <p className="text-xs text-slate-600 pt-1">{aw.description}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {activeMurid && activeWorkspaceTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form */}
            <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">fact_check</span>
                Catat Presensi Murid
              </h3>
              <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal:</label>
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600">
                    {selectedDate}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Kehadiran:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Hadir', 'Sakit', 'Izin', 'Alpa'] as const).map((status) => (
                      <button
                        type="button"
                        key={status}
                        onClick={() => setAttendanceStatus(status)}
                        className={`py-2 rounded-xl text-[11px] font-bold border transition ${
                          attendanceStatus === status
                            ? 'bg-teal-800 text-white border-teal-800'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Keterangan (Opsional):</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Izin acara keluarga, Sakit demam sejak pagi"
                    value={attendanceNote}
                    onChange={(e) => setAttendanceNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Simpan Presensi</span>
                </button>
              </form>
            </div>

            {/* Right: Attendance History */}
            <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Riwayat Presensi: {activeMurid.name}</span>
                <span className="rounded-full bg-teal-50 text-teal-800 px-3 py-1 text-xs font-bold">Aktif • Real-time</span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {(() => {
                  const attendanceList = (activeMurid as any).attendance || [];

                  if (attendanceList.length === 0) {
                    return (
                      <div className="text-center p-8 border border-dashed border-slate-100 bg-slate-50/50 rounded-2xl text-slate-400 italic text-xs">
                        Belum ada rekam presensi yang tercatat untuk siswa ini. Silakan catat presensi hari ini di form sebelah kiri.
                      </div>
                    );
                  }

                  const statusColor: Record<string, string> = {
                    Hadir: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    Sakit: 'bg-amber-100 text-amber-800 border-amber-200',
                    Izin: 'bg-blue-100 text-blue-800 border-blue-200',
                    Alpa: 'bg-red-100 text-red-800 border-red-200',
                  };

                  return attendanceList.map((att: any) => (
                    <div key={att.id} className="rounded-2xl p-4 border border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">{att.date}</p>
                        {att.note && <p className="text-[11px] text-slate-500 mt-0.5">{att.note}</p>}
                      </div>
                      <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor[att.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {att.status}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
