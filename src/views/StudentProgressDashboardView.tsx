import React, { useState } from 'react';
import { ScreenId, DayHabitLog, PrayerTimesChecklist, MuridRecord } from '../types';
import { APP_ASSETS, HABIT_LIST, CALENDAR_DAYS, INITIAL_MURID } from '../data/mockData';
import { PublicNavbar } from '../components/PublicNavbar';

interface StudentProgressDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenQuickRecord?: () => void;
}

export const StudentProgressDashboardView: React.FC<StudentProgressDashboardViewProps> = ({
  onNavigate,
  onOpenQuickRecord,
}) => {
  const [filterMode, setFilterMode] = useState<'harian' | 'bulanan'>('harian');
  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [selectedMonth, setSelectedMonth] = useState<string>('September 2025');

  // Murid selection state
  const [selectedRombel, setSelectedRombel] = useState<string>('Kelas IV-A');
  const [selectedMuridId, setSelectedMuridId] = useState<string>('m-4a-1');

  const rombelOptions = ['Semua Kelas', 'Kelas I-B', 'Kelas III-A', 'Kelas IV-A', 'Kelas V-B', 'Kelas VI-C'];

  const availableMuridList =
    selectedRombel === 'Semua Kelas'
      ? INITIAL_MURID
      : INITIAL_MURID.filter((m) => m.rombel === selectedRombel);

  const activeMurid =
    INITIAL_MURID.find((m) => m.id === selectedMuridId) ||
    availableMuridList[0] ||
    INITIAL_MURID[0];

  // Daily time inputs for Bangun & Tidur
  const [wakeUpTime, setWakeUpTime] = useState<string>(activeMurid.wakeUpTime || '05:00');
  const [bedTime, setBedTime] = useState<string>(activeMurid.bedTime || '21:00');

  // Daily 5 obligatory prayers + other worships
  const [prayers, setPrayers] = useState<PrayerTimesChecklist>(activeMurid.prayers);

  // Daily checklist for the 7 habits (id 1..7)
  const [habitStatus, setHabitStatus] = useState<Record<number, boolean>>(activeMurid.habits);

  const handleSelectMurid = (mId: string) => {
    setSelectedMuridId(mId);
    const m = INITIAL_MURID.find((x) => x.id === mId);
    if (m) {
      setWakeUpTime(m.wakeUpTime);
      setBedTime(m.bedTime);
      setPrayers(m.prayers);
      setHabitStatus(m.habits);
      showToast(`Memuat data 7 KAIH ananda: ${m.name}`);
    }
  };

  // Monthly table mock data: 30 days matrix
  const [monthlyDays, setMonthlyDays] = useState<
    Array<{
      day: number;
      dateStr: string;
      habits: Record<number, boolean>;
      wakeTime: string;
      sleepTime: string;
      prayersDone: number;
    }>
  >(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const d = i + 1;
      const isPast = d < 25;
      return {
        day: d,
        dateStr: `${d} Sep 2025`,
        habits: {
          1: true,
          2: true,
          3: isPast ? (d % 3 !== 0) : true,
          4: true,
          5: isPast ? (d % 4 !== 0) : true,
          6: true,
          7: isPast ? (d % 5 !== 0) : false,
        },
        wakeTime: d % 2 === 0 ? '05:00' : '05:15',
        sleepTime: d % 5 === 0 ? '21:30' : '20:55',
        prayersDone: isPast ? 8 : 6,
      };
    });
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleHabit = (id: number) => {
    setHabitStatus((prev) => {
      const updated = !prev[id];
      showToast(
        `${HABIT_LIST.find((h) => h.id === id)?.title || 'Kebiasaan'} ditandai ${
          updated ? 'Sudah Dilakukan (✓)' : 'Belum Selesai'
        }`
      );
      return { ...prev, [id]: updated };
    });
  };

  const togglePrayer = (key: keyof PrayerTimesChecklist) => {
    setPrayers((prev) => {
      const updated = !prev[key];
      const prayerNames: Record<keyof PrayerTimesChecklist, string> = {
        subuh: 'Sholat Subuh',
        dzuhur: 'Sholat Dzuhur',
        ashar: 'Sholat Ashar',
        maghrib: 'Sholat Maghrib',
        isya: 'Sholat Isya',
        tadarus: 'Tadarus Al-Qur’an / Mengaji',
        dhuha: 'Sholat Dhuha / Doa Pagi',
        doaHarian: 'Doa Harian & Dzikir',
      };
      showToast(`${prayerNames[key]} diperbarui menjadi: ${updated ? '✓ Sudah' : 'Belum'}`);
      return { ...prev, [key]: updated };
    });
  };

  const toggleMonthlyHabit = (day: number, habitId: number) => {
    setMonthlyDays((prev) =>
      prev.map((item) => {
        if (item.day === day) {
          const current = item.habits[habitId] ?? false;
          return {
            ...item,
            habits: { ...item.habits, [habitId]: !current },
          };
        }
        return item;
      })
    );
    showToast(`Data tanggal ${day} September Kebiasaan #${habitId} diperbarui.`);
  };

  const completedHabitsCount = Object.values(habitStatus).filter(Boolean).length;
  const completedPrayersCount = Object.values(prayers).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800 flex flex-col">
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
      <PublicNavbar currentScreen="student_dashboard" onNavigate={onNavigate} />

      {/* Main Content */}
      <main className="w-full pt-20 flex-1">
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
                <span className="material-symbols-outlined text-base">diversity_1</span>
                Dasbor Rekap 7 KAIH (Murid)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('teacher_dashboard')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <span className="material-symbols-outlined text-sm text-[#00685f]">school</span>
                Buka Rekap Supervisi (Guru)
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00685f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#008378] transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">lock_open</span>
                Masuk Ruang Karakter Orang Tua
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
          {/* Header Banner Transparansi 7 KAIH */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
            <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-teal-500/25 px-3 py-0.5 text-xs font-bold text-teal-200 uppercase tracking-wider">
                    Transparansi Rekapitulasi Sekolah
                  </span>
                  <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-200">
                    7 Kebiasaan Anak Indonesia Hebat (7 KAIH)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                  Dasbor Rekap 7 KAIH (Murid)
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                  Transparansi progres pembiasaan karakter 7 Kebiasaan Anak Indonesia Hebat (7 KAIH), sholat 5 waktu wajib + doa, serta pencatatan waktu bangun pagi dan tidur cepat seluruh murid UPT SPF SDN Percontohan PAM Makassar.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-teal-300">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Diperiksa & diverifikasi harian oleh Wali Kelas & Guru Pembina Karakter</span>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Kepatuhan 7 KAIH</span>
                  <p className="text-2xl font-black text-white tabular-nums">94.6%</p>
                  <span className="text-[10px] text-emerald-300">Amat Baik</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Sholat 5 Waktu + Sunnah</span>
                  <p className="text-2xl font-black text-white tabular-nums">
                    {completedPrayersCount}/8
                  </p>
                  <span className="text-[10px] text-amber-300">Hari Ini</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Rata-rata Bangun</span>
                  <p className="text-xl font-black text-white tabular-nums">{wakeUpTime} WITA</p>
                  <span className="text-[10px] text-teal-200">Tepat Waktu</span>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                  <span className="text-xs text-teal-200">Rata-rata Tidur</span>
                  <p className="text-xl font-black text-white tabular-nums">{bedTime} WITA</p>
                  <span className="text-[10px] text-teal-200">Target &lt; 21.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Edukatif Keterbukaan Publik vs Ruang Karakter Orang Tua */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/90 p-4 sm:p-5 text-teal-950 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-200 text-teal-900">
                <span className="material-symbols-outlined text-2xl">info</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-900">
                    Transparansi Publik & Akses Orang Tua
                  </span>
                  <span className="text-xs font-semibold text-teal-800">Filter Harian & Bulanan</span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-teal-900/90 leading-relaxed">
                  Laman ini menampilkan rekapan progres <strong>7 Kebiasaan Anak Indonesia Hebat (7 KAIH)</strong>. Bagi Orang Tua / Wali Murid yang ingin melakukan pengisian buku pantau harian atau mengunggah dokumentasi kegiatan anak, silakan masuk ke Ruang Karakter Orang Tua.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-teal-200">
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00685f] text-white text-xs font-bold hover:bg-[#008378] transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>
                <span>Masuk Ruang Karakter Orang Tua</span>
              </button>
            </div>
          </div>

        {/* Filter Toggle Control (Harian vs Bulanan) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mode Filter Progres:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setFilterMode('harian')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  filterMode === 'harian'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">today</span>
                Filter Harian (Detail Waktu & Sholat)
              </button>
              <button
                onClick={() => setFilterMode('bulanan')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  filterMode === 'bulanan'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-sm">calendar_view_month</span>
                Filter Bulanan (Matriks Tabel Progres)
              </button>
            </div>
          </div>

          {/* Rombel & Murid Selector Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Pilih Rombel:</span>
              <select
                value={selectedRombel}
                onChange={(e) => {
                  const r = e.target.value;
                  setSelectedRombel(r);
                  const first =
                    r === 'Semua Kelas'
                      ? INITIAL_MURID[0]
                      : INITIAL_MURID.find((m) => m.rombel === r) || INITIAL_MURID[0];
                  handleSelectMurid(first.id);
                }}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-teal-600 focus:outline-none"
              >
                {rombelOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Pilih Murid:</span>
              <select
                value={activeMurid.id}
                onChange={(e) => handleSelectMurid(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-teal-900 focus:border-teal-600 focus:outline-none"
              >
                {availableMuridList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.rombel})
                  </option>
                ))}
              </select>
            </div>

            {filterMode === 'harian' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Pilih Tanggal:</span>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-teal-600 focus:outline-none"
                >
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d} September 2025 {d === 25 ? '(Hari Ini)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Pilih Bulan:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-teal-600 focus:outline-none"
                >
                  <option value="September 2025">September 2025 (Bulan Berjalan)</option>
                  <option value="Agustus 2025">Agustus 2025</option>
                  <option value="Juli 2025">Juli 2025</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAMPILAN 1: FILTER HARIAN DENGAN TABEL PROGRES & CENTANG */}
        {/* ========================================================= */}
        {filterMode === 'harian' && (
          <div className="space-y-6">
            {/* Banner Informasi Mode Tinjauan Publik (Read-Only) */}
            <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 flex items-center justify-between gap-4 text-xs text-teal-950">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-700 text-xl shrink-0">
                  visibility
                </span>
                <div>
                  <span className="font-bold block">
                    Mode Rekapitulasi Publik (Hanya Tinjauan / Read-Only):
                  </span>
                  <span className="text-teal-900/80">
                    Laman ini hanya berfungsi menampilkan capaian pembiasaan 7 KAIH dan ibadah murid. Pengisian atau pengeditan data hanya dapat dilakukan di <strong>Dashboard Manajemen Guru (Wali Kelas)</strong> atau <strong>Ruang Karakter Orang Tua</strong>.
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 shrink-0 rounded-xl bg-teal-700 px-3.5 py-1.5 font-bold text-white hover:bg-teal-800 transition shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Login Pengisian Data</span>
              </button>
            </div>

            {/* Tabel Progres 7 Kebiasaan Harian */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-700">fact_check</span>
                    Tabel Progres Pembiasaan Harian — {selectedDay} September 2025
                  </h2>
                  <p className="text-xs text-slate-500">
                    Status pembiasaan harian ananda <strong>{activeMurid.name}</strong> ({activeMurid.rombel})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                    {completedHabitsCount} dari 7 KAIH Tuntas
                  </span>
                </div>
              </div>

              {/* Tabel Progres Kebiasaan */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 rounded-l-xl">No & Kebiasaan</th>
                      <th className="py-3 px-4">Kategori Karakter</th>
                      <th className="py-3 px-4">Detail Waktu / Keterangan</th>
                      <th className="py-3 px-4">Target Standar</th>
                      <th className="py-3 px-4 text-center">Status Capaian</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Ketercapaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* 1. Bangun Pagi */}
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                          1
                        </span>
                        <span>Bangun Pagi Mandiri</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Kedisiplinan Diri</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">Jam Bangun:</span>
                          <span className="rounded-lg border border-teal-200 px-2.5 py-1 font-bold text-teal-900 bg-teal-50/60">
                            {wakeUpTime} WITA
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Pukul 04.45 - 05.15 WITA</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            habitStatus[1]
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {habitStatus[1] ? '✓ Sudah Tuntas' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            habitStatus[1]
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Status Pembiasaan #1"
                        >
                          {habitStatus[1] ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>

                    {/* 2. Beribadah (5 Waktu Sholat Wajib + Ibadah Lainnya) */}
                    <tr className="bg-teal-50/30 hover:bg-teal-50/50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 text-white font-bold">
                          2
                        </span>
                        <div>
                          <span>Beribadah Sesuai Agama</span>
                          <span className="block text-[10px] text-teal-700 font-normal">
                            5 Waktu Sholat Wajib + Ibadah Lainnya
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Spiritual & Moral</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 text-[11px]">
                          <span className="font-bold text-teal-900">
                            {completedPrayersCount}/8 Ibadah Terpenuhi
                          </span>
                          <span className="text-[10px] text-slate-500">(Lihat rincian di bawah)</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">5 Sholat Fardhu Lengkap</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            habitStatus[2]
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {habitStatus[2] ? '✓ Sudah Tuntas' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            habitStatus[2]
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Status Pembiasaan #2"
                        >
                          {habitStatus[2] ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>

                    {/* 3. Olahraga */}
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                          3
                        </span>
                        <span>Olahraga & Kebugaran</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Kesehatan Fisik</td>
                      <td className="py-3.5 px-4 text-slate-600">Senam pagi & jalan sehat 25 menit</td>
                      <td className="py-3.5 px-4 text-slate-600">Minimal 20-30 menit</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            habitStatus[3]
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {habitStatus[3] ? '✓ Sudah Tuntas' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            habitStatus[3]
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Status Pembiasaan #3"
                        >
                          {habitStatus[3] ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>

                    {/* 4. Makanan Sehat */}
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                          4
                        </span>
                        <span>Makan Sehat & Bergizi Seimbang</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Nutrisi & Tumbuh Kembang</td>
                      <td className="py-3.5 px-4 text-slate-600">Bekal sayur, buah pepaya & air putih 8 gelas</td>
                      <td className="py-3.5 px-4 text-slate-600">Menu 4 Bintang & Sayur Buah</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            habitStatus[4]
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {habitStatus[4] ? '✓ Sudah Tuntas' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            habitStatus[4]
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Status Pembiasaan #4"
                        >
                          {habitStatus[4] ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>

                    {/* 5. Gemar Membaca */}
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                          5
                        </span>
                        <span>Gemar Membaca & Literasi</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Literasi & Kecerdasan</td>
                      <td className="py-3.5 px-4 text-slate-600">Membaca buku Ensiklopedia Sains Laut (25 mnt)</td>
                      <td className="py-3.5 px-4 text-slate-600">Minimal 15 menit/hari</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            habitStatus[5]
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {habitStatus[5] ? '✓ Sudah Tuntas' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            habitStatus[5]
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Status Pembiasaan #5"
                        >
                          {habitStatus[5] ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>

                    {/* 6. Santun & Membantu */}
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                          6
                        </span>
                        <span>Membantu & Berperilaku Santun</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Karakter Sipakatau & Gotong Royong</td>
                      <td className="py-3.5 px-4 text-slate-600">Merapikan piring sarapan & santun pamit sekolah</td>
                      <td className="py-3.5 px-4 text-slate-600">Membantu tugas rumah mandiri</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            habitStatus[6]
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {habitStatus[6] ? '✓ Sudah Tuntas' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            habitStatus[6]
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Status Pembiasaan #6"
                        >
                          {habitStatus[6] ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>

                    {/* 7. Tidur Tepat Waktu */}
                    <tr className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold">
                          7
                        </span>
                        <span>Tidur Tepat Waktu (≥ 8 Jam)</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Istirahat & Kebugaran</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">Target Tidur:</span>
                          <span className="rounded-lg border border-teal-200 px-2.5 py-1 font-bold text-teal-900 bg-teal-50/60">
                            {bedTime} WITA
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Maksimal 21.00 WITA</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            habitStatus[7]
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {habitStatus[7] ? '✓ Sudah Tuntas' : 'Menunggu Malam'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                            habitStatus[7]
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                          title="Status Pembiasaan #7"
                        >
                          {habitStatus[7] ? '✓' : '—'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* RINCIAN KHUSUS KEBIASAAN IBADAH (5 WAKTU SHOLAT WAJIB + IBADAH LAINNYA) */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm ring-1 ring-slate-200/70 border-l-4 border-teal-700">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                    <span className="material-symbols-outlined text-2xl">mosque</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Rincian Kebiasaan Ibadah: 5 Waktu Sholat Wajib & Ibadah Lainnya
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pantauan ibadah harian berbasis kesadaran religius dan bimbingan orang tua/guru
                    </p>
                  </div>
                </div>

                <span className="rounded-xl bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                  {completedPrayersCount} dari 8 Ibadah Terlaksana
                </span>
              </div>

              {/* 5 Waktu Sholat Wajib Grid */}
              <div className="mt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  A. 5 Waktu Sholat Wajib (Fardhu):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'subuh', name: '1. Subuh', time: '04:50 WITA' },
                    { key: 'dzuhur', name: '2. Dzuhur', time: '12:05 WITA' },
                    { key: 'ashar', name: '3. Ashar', time: '15:15 WITA' },
                    { key: 'maghrib', name: '4. Maghrib', time: '18:10 WITA' },
                    { key: 'isya', name: '5. Isya', time: '19:20 WITA' },
                  ].map((p) => {
                    const isDone = prayers[p.key as keyof PrayerTimesChecklist];
                    return (
                      <div
                        key={p.key}
                        className={`flex flex-col items-start justify-between rounded-2xl p-3.5 text-left border ${
                          isDone
                            ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 text-slate-600'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-xs font-bold">{p.name}</span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold ${
                              isDone
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300 bg-white text-slate-300'
                            }`}
                          >
                            {isDone ? '✓' : '—'}
                          </span>
                        </div>
                        <span className="mt-2 text-[10px] text-slate-500">{p.time}</span>
                        <span
                          className={`mt-1 text-[11px] font-bold ${
                            isDone ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {isDone ? '✓ Sudah Sholat' : 'Belum Terlaksana'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ibadah Lainnya Grid */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  B. Ibadah Tambahan & Penguatan Akhlak:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      key: 'tadarus',
                      title: 'Tadarus / Mengaji Al-Qur’an',
                      desc: 'Juz Amma / Iqro 15 menit ba’da Maghrib',
                      icon: 'menu_book',
                    },
                    {
                      key: 'dhuha',
                      title: 'Sholat Dhuha / Doa Pagi',
                      desc: 'Dilaksanakan di musholla sekolah',
                      icon: 'sunny',
                    },
                    {
                      key: 'doaHarian',
                      title: 'Doa Harian & Dzikir Pagi/Petang',
                      desc: 'Doa sebelum makan, belajar, & bepergian',
                      icon: 'volunteer_activism',
                    },
                  ].map((extra) => {
                    const isDone = prayers[extra.key as keyof PrayerTimesChecklist];
                    return (
                      <div
                        key={extra.key}
                        className={`flex items-start justify-between rounded-2xl p-4 text-left border ${
                          isDone
                            ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 text-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-teal-700 text-xl mt-0.5">
                            {extra.icon}
                          </span>
                          <div>
                            <p className="text-xs font-bold">{extra.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{extra.desc}</p>
                            <span
                              className={`mt-2 inline-block text-[11px] font-bold ${
                                isDone ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                            >
                              {isDone ? '✓ Dilaksanakan' : 'Belum Terlaksana'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                            isDone
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white text-slate-300'
                          }`}
                        >
                          {isDone ? '✓' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAMPILAN 2: FILTER BULANAN DENGAN TABEL PROGRES & CENTANG */}
        {/* ========================================================= */}
        {filterMode === 'bulanan' && (
          <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm ring-1 ring-slate-200/70 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700">calendar_month</span>
                  Matriks Tabel Progres Bulanan — {selectedMonth}
                </h2>
                <p className="text-xs text-slate-500">
                  Rekapitulasi tanda centang (✓) harian untuk 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  94.6% Ketercapaian Kumulatif
                </span>
              </div>
            </div>

            {/* Matriks Bulanan Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-3 rounded-l-xl">Tanggal</th>
                    <th className="py-3 px-2 text-center" title="1. Bangun Pagi">
                      #1 Bangun
                    </th>
                    <th className="py-3 px-2 text-center" title="2. Sholat 5 Waktu & Ibadah">
                      #2 Ibadah (5 Sholat)
                    </th>
                    <th className="py-3 px-2 text-center" title="3. Olahraga">
                      #3 Olahraga
                    </th>
                    <th className="py-3 px-2 text-center" title="4. Makan Sehat">
                      #4 Nutrisi
                    </th>
                    <th className="py-3 px-2 text-center" title="5. Gemar Membaca">
                      #5 Literasi
                    </th>
                    <th className="py-3 px-2 text-center" title="6. Santun & Membantu">
                      #6 Santun
                    </th>
                    <th className="py-3 px-2 text-center" title="7. Tidur Tepat Waktu">
                      #7 Tidur
                    </th>
                    <th className="py-3 px-3 text-center">Rerata</th>
                    <th className="py-3 px-3 text-center rounded-r-xl">Status Rekap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyDays.map((row) => {
                    const doneCount = Object.values(row.habits).filter(Boolean).length;
                    const percent = Math.round((doneCount / 7) * 100);
                    const isToday = row.day === 25;

                    return (
                      <tr
                        key={row.day}
                        className={`hover:bg-slate-50/70 transition ${
                          isToday ? 'bg-teal-50/40 font-semibold' : ''
                        }`}
                      >
                        {/* Tanggal */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isToday ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {row.day}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {row.dateStr}
                              {isToday && <span className="ml-1 text-[10px] text-teal-700">(Hari Ini)</span>}
                            </span>
                          </div>
                        </td>

                        {/* 7 Kolom Kebiasaan dengan Tanda Centang Interaktif */}
                        {[1, 2, 3, 4, 5, 6, 7].map((habitId) => {
                          const isDone = row.habits[habitId] ?? false;
                          return (
                            <td key={habitId} className="py-2.5 px-2 text-center">
                              <button
                                onClick={() => toggleMonthlyHabit(row.day, habitId)}
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                }`}
                                title={`Kebiasaan #${habitId} pada tanggal ${row.day}: Klik untuk ubah`}
                              >
                                {isDone ? '✓' : '—'}
                              </button>
                            </td>
                          );
                        })}

                        {/* Persentase */}
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {percent}%
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              percent === 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : percent >= 70
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {percent === 100 ? 'Lengkap (7/7)' : `${doneCount}/7 Tuntas`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Monthly Summary Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-white font-bold text-[10px]">
                    ✓
                  </span>
                  <span>Tuntas & Terverifikasi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-400 font-bold text-[10px]">
                    —
                  </span>
                  <span>Belum Terlaksana</span>
                </div>
              </div>

              <span className="text-teal-800 font-semibold">
                Tersinkronisasi otomatis dengan Buku Pemantauan Murid UPT SPF SDN Percontohan PAM
              </span>
            </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
};
