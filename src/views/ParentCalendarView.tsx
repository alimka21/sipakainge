import React, { useState } from 'react';
import { ScreenId } from '../types';
import { APP_ASSETS, HABIT_LIST, CALENDAR_DAYS, INITIAL_MURID } from '../data/mockData';

interface ParentCalendarViewProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenQuickRecord: () => void;
  userRole?: string;
}

export const ParentCalendarView: React.FC<ParentCalendarViewProps> = ({
  onNavigate,
  onOpenQuickRecord,
  userRole = 'orang_tua',
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    userRole === 'kepala_sekolah' ? '' : 'Kelas IV-A'
  );
  const [selectedMuridId, setSelectedMuridId] = useState<string>(
    userRole === 'kepala_sekolah' ? '' : 'm-4a-1'
  );

  const isKS = userRole === 'kepala_sekolah';
  const classMuridList = INITIAL_MURID.filter(m => !selectedClass || m.rombel === selectedClass);
  const activeMurid = selectedMuridId 
    ? INITIAL_MURID.find(m => m.id === selectedMuridId)
    : (isKS ? undefined : INITIAL_MURID[0]);

  const [selectedDay, setSelectedDay] = useState<number>(25);
  const [activeFilter, setActiveFilter] = useState<'all' | number>('all');
  const [daysData, setDaysData] = useState(CALENDAR_DAYS);
  const [wakeTime, setWakeTime] = useState('05:00');
  const [bedTime, setBedTime] = useState('21:00');
  const [prayersCheck, setPrayersCheck] = useState<Record<string, boolean>>({
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: false,
    tadarus: true,
    dhuha: true,
  });
  const [dayChecklist, setDayChecklist] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: true,
    5: true,
    6: true,
    7: false,
  });
  const [parentNote, setParentNote] = useState(
    'Ahmad hari ini sangat bersemangat menjelaskan fotosintesis tumbuhan saat sarapan pagi bersama keluarga.'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleHabit = (id: number) => {
    setDayChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const completedCount = Object.values(next).filter(Boolean).length;
      
      // Update the day record
      setDaysData((prevDays) =>
        prevDays.map((d) => {
          if (d.day === selectedDay) {
            return {
              ...d,
              habitsDone: completedCount,
              status: completedCount === 7 ? 'lengkap' : completedCount >= 4 ? 'sebagian' : 'hari_ini',
            };
          }
          return d;
        })
      );
      showToast(`Kebiasaan #${id} diperbarui untuk tanggal ${selectedDay} September!`);
      return next;
    });
  };

  const selectedDayLog = daysData.find((d) => d.day === selectedDay);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 animate-fade-in">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
            <span className="material-symbols-outlined text-base">check_circle</span>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Context Bar */}
      <div className="border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <button
              onClick={() => onNavigate('parent_dashboard')}
              className="hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-base">home</span>
              Beranda Wali Murid
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-teal-700 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Kalender Pembiasaan 7 Karakter
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sinkronisasi Dapodik Aktif
            </span>
            <button
              onClick={() => {
                showToast('Menyiapkan dokumen Rekap Bulanan PDF...');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
            >
              <span className="material-symbols-outlined text-sm text-slate-500">picture_as_pdf</span>
              Unduh Rekap Bulanan
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
        {/* SELECTOR FOR TEACHERS AND PRINCIPALS */}
        {(userRole === 'kepala_sekolah' || userRole === 'guru') && (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-800 text-lg">person_search</span>
              <span>Pilih Kelas & Siswa untuk Menampilkan Kalender Jurnal 7 KAIH</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Rombel / Kelas:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedMuridId('');
                  }}
                  disabled={userRole === 'guru'} // Guru is locked to Kelas IV-A
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:opacity-75"
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
                <label className="block text-xs font-bold text-slate-700">Nama Siswa:</label>
                <select
                  value={selectedMuridId}
                  onChange={(e) => setSelectedMuridId(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:opacity-50"
                >
                  <option value="">-- Pilih Siswa --</option>
                  {classMuridList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (NISN: {m.nisn})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeMurid ? (
          <>
            {/* Child Header Card */}
            <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-800 p-6 sm:p-8 text-white shadow-xl shadow-teal-950/15">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none"></div>
              <div className="absolute left-1/3 bottom-0 -mb-20 h-48 w-48 rounded-full bg-emerald-300/10 blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4 sm:gap-5">
                  <img
                    src={activeMurid.avatar || APP_ASSETS.studentAhmad}
                    alt={activeMurid.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-500/25 px-2.5 py-0.5 text-xs font-semibold text-teal-200 backdrop-blur-sm">
                        {activeMurid.rombel} • {activeMurid.rombel.includes('V') ? 'Fase C' : 'Fase B'}
                      </span>
                      <span className="rounded-full bg-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-200 backdrop-blur-sm">
                        ★ Bintang Kebiasaan Pekan Ini
                      </span>
                    </div>
                    <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
                      {activeMurid.name}
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-teal-100/90 flex flex-wrap items-center gap-3">
                      <span>NISN: {activeMurid.nisn}</span>
                      <span>•</span>
                      <span>Wali Kelas: {activeMurid.rombel === 'Kelas V-B' ? 'Bpk. Bambang Irawan, S.Pd.' : 'Ibu Siti Aminah, S.Pd.'}</span>
                      <span>•</span>
                      <span>UPT SPF SDN Percontohan PAM Makassar</span>
                    </p>
                  </div>
                </div>

            {/* Quick Metrics Bento */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
              <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md ring-1 ring-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-medium">
                  <span className="material-symbols-outlined text-base">local_fire_department</span>
                  Streak
                </div>
                <p className="mt-1 text-2xl font-bold text-white tabular-nums">18 Hari</p>
                <p className="text-[11px] text-teal-200/80">Tanpa Terputus</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md ring-1 ring-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-300 text-xs font-medium">
                  <span className="material-symbols-outlined text-base">verified</span>
                  Kepatuhan
                </div>
                <p className="mt-1 text-2xl font-bold text-white tabular-nums">94.6%</p>
                <p className="text-[11px] text-teal-200/80">Kategori Amat Baik</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md ring-1 ring-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-300 text-xs font-medium">
                  <span className="material-symbols-outlined text-base">calendar_check</span>
                  Terisi
                </div>
                <p className="mt-1 text-2xl font-bold text-white tabular-nums">24 / 25</p>
                <p className="text-[11px] text-teal-200/80">Hari Bulan Ini</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md ring-1 ring-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-purple-300 text-xs font-medium">
                  <span className="material-symbols-outlined text-base">chat</span>
                  Apresiasi
                </div>
                <p className="mt-1 text-2xl font-bold text-white tabular-nums">6 Guru</p>
                <p className="text-[11px] text-teal-200/80">Catatan Positif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Habits Navigation Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Filter Tampilan:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua 7 KAIH
            </button>
            {HABIT_LIST.slice(0, 4).map((h) => (
              <button
                key={h.id}
                onClick={() => setActiveFilter(h.id)}
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  activeFilter === h.id
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{h.title.split('.')[1] || h.title}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenQuickRecord}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-700/20 hover:from-teal-800 hover:to-emerald-800 transition"
            >
              <span className="material-symbols-outlined text-base">add_task</span>
              Input Jurnal Cepat (1-Klik)
            </button>
          </div>
        </div>

        {/* Main Grid: Calendar on Left, Selected Day Detail on Right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Calendar Section (7 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm ring-1 ring-slate-200/70">
              {/* Calendar Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-700">calendar_month</span>
                    September 2025
                  </h2>
                  <p className="text-xs text-slate-500">
                    Bulan Aktif Pelaksanaan Pembiasaan Mandiri Rumah & Sekolah
                  </p>
                </div>

                {/* Legend Chips */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-emerald-500 ring-2 ring-emerald-200"></span>
                    <span>7/7 Lengkap</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-amber-400 ring-2 ring-amber-200"></span>
                    <span>Sebagian (4-6)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md bg-purple-500 ring-2 ring-purple-200"></span>
                    <span>Mandiri + Refleksi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md border border-dashed border-teal-500 bg-teal-50"></span>
                    <span>Hari Ini</span>
                  </div>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 pt-5 pb-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span className="text-rose-400">Sab</span>
                <span className="text-rose-500">Min</span>
              </div>

              {/* Calendar Grid Days */}
              <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
                {daysData.map((d) => {
                  const isSelected = selectedDay === d.day;
                  const isToday = d.status === 'hari_ini';
                  const isSpecial = d.status === 'mandiri_istimewa';
                  const isPartial = d.status === 'sebagian';
                  const isComplete = d.status === 'lengkap';

                  return (
                    <button
                      key={d.day}
                      onClick={() => setSelectedDay(d.day)}
                      className={`group relative flex flex-col items-center justify-between rounded-2xl p-2.5 sm:p-3 text-left transition-all min-h-[76px] sm:min-h-[88px] ${
                        isSelected
                          ? 'ring-2 ring-teal-600 shadow-md bg-teal-50/50 scale-[1.02]'
                          : 'hover:bg-slate-50 ring-1 ring-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isToday
                              ? 'flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-white'
                              : isSelected
                              ? 'text-teal-900 font-extrabold'
                              : 'text-slate-700'
                          }`}
                        >
                          {d.day}
                        </span>

                        {isSpecial && (
                          <span className="text-amber-500 text-xs sm:text-sm" title="Mandiri Istimewa">
                            ★
                          </span>
                        )}
                        {isToday && (
                          <span className="h-2 w-2 rounded-full bg-teal-500 animate-ping"></span>
                        )}
                      </div>

                      {/* Status indicator bar / icon */}
                      <div className="mt-2 w-full">
                        {isToday ? (
                          <span className="inline-block w-full text-center rounded-md bg-teal-100/80 px-1 py-0.5 text-[10px] font-bold text-teal-800">
                            Hari Ini
                          </span>
                        ) : isSpecial ? (
                          <div className="flex items-center justify-between rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                            <span>7/7</span>
                            <span className="text-[9px]">Hebat</span>
                          </div>
                        ) : isComplete ? (
                          <div className="flex items-center justify-between rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            <span>7/7</span>
                            <span className="material-symbols-outlined text-[12px] text-emerald-600">
                              check
                            </span>
                          </div>
                        ) : isPartial ? (
                          <div className="flex items-center justify-between rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                            <span>{d.habitsDone}/7</span>
                            <span className="text-[9px]">Sebagian</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Kosong</span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Trailing empty days to complete grid */}
                {[26, 27, 28, 29, 30].map((day) => (
                  <div
                    key={`next-${day}`}
                    className="flex flex-col items-center justify-between rounded-2xl p-2.5 sm:p-3 bg-slate-50/50 opacity-40 ring-1 ring-slate-100 min-h-[76px] sm:min-h-[88px]"
                  >
                    <span className="text-xs font-semibold text-slate-400">{day}</span>
                    <span className="text-[10px] text-slate-400">Terjadwal</span>
                  </div>
                ))}
              </div>

              {/* Habit Summary Progress Bar */}
              <div className="mt-8 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 text-teal-800">
                    <span className="material-symbols-outlined text-base">analytics</span>
                    Progres Keseluruhan 7 KAIH Bulan September
                  </span>
                  <span className="text-teal-700 font-bold">24 dari 25 Hari Terlaksana (96%)</span>
                </div>
                <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: '80%' }}
                    title="80% Lengkap Sempurna"
                  ></div>
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: '12%' }}
                    title="12% Mandiri Istimewa"
                  ></div>
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: '4%' }}
                    title="4% Sebagian"
                  ></div>
                  <div
                    className="h-full bg-slate-300 transition-all duration-500"
                    style={{ width: '4%' }}
                    title="4% Belum Diisi"
                  ></div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  <span>20 Hari Lengkap (7/7)</span>
                  <span>3 Hari Bintang Mandiri</span>
                  <span>1 Hari Sebagian</span>
                  <span>1 Hari Sedang Berjalan</span>
                </div>
              </div>
            </div>

            {/* 7 Habits Performance Overview */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">task_alt</span>
                Analisis Kepatuhan Masing-Masing dari 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Berdasarkan rekap harian oleh Orang Tua dan verifikasi tim Guru Kelas IV-A
              </p>

              <div className="mt-5 space-y-3.5">
                {HABIT_LIST.map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                        <span className="material-symbols-outlined text-xl">{h.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{h.title}</h4>
                        <p className="text-xs text-slate-500">{h.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="w-24 sm:w-28 text-right">
                        <span className="text-xs font-bold text-slate-800 tabular-nums">
                          {h.complianceRate}%
                        </span>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              h.complianceRate >= 90
                                ? 'bg-emerald-500'
                                : h.complianceRate >= 80
                                ? 'bg-teal-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${h.complianceRate}%` }}
                          ></div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                          h.status === 'Sangat Konsisten' || h.status === 'Konsisten' || h.status === 'Sangat Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day Inspector & Interactive Checklist (5 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-20 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                    Inspeksi Jurnal Harian
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedDayLog?.dateStr || `Tanggal ${selectedDay} Sep 2025`}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    selectedDay === 25
                      ? 'bg-teal-100 text-teal-800 ring-1 ring-teal-600/20'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedDay === 25 ? 'Hari Ini' : 'Terverifikasi'}
                </span>
              </div>

              {/* Habits Checkboxes for Selected Day */}
              <div className="mt-5 space-y-2.5">
                <p className="text-xs font-semibold text-slate-500">
                  Daftar 7 KAIH — Klik untuk memperbarui:
                </p>

                {HABIT_LIST.map((habit) => {
                  const isChecked = dayChecklist[habit.id] ?? false;
                  return (
                    <div key={habit.id} className="space-y-1.5">
                      <button
                        onClick={() => handleToggleHabit(habit.id)}
                        className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-all ${
                          isChecked
                            ? 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-950'
                            : 'bg-slate-50 border border-slate-200/70 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                              isChecked
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && (
                              <span className="material-symbols-outlined text-sm font-bold">check</span>
                            )}
                          </span>
                          <div>
                            <p className="text-xs font-bold leading-tight">{habit.title}</p>
                            <p className="text-[10px] text-slate-500">{habit.category}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold ${
                            isChecked ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {isChecked ? 'Terpenuhi' : 'Belum'}
                        </span>
                      </button>

                      {/* Sub-input for Habit 1: Bangun Pagi */}
                      {habit.id === 1 && (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-teal-50/60 rounded-lg text-[11px] border border-teal-100">
                          <span className="font-semibold text-teal-900">Catat Waktu Bangun:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={wakeTime}
                              onChange={(e) => {
                                setWakeTime(e.target.value);
                                showToast(`Jam bangun disetel ke ${e.target.value} WITA`);
                              }}
                              className="rounded border border-teal-300 bg-white px-1.5 py-0.5 font-bold text-teal-800 text-[11px]"
                            />
                            <span className="text-[10px] text-slate-500">WITA</span>
                          </div>
                        </div>
                      )}

                      {/* Sub-input for Habit 2: 5 Waktu Sholat Wajib + Ibadah Lainnya */}
                      {habit.id === 2 && (
                        <div className="p-2.5 bg-teal-50/70 rounded-xl text-[11px] border border-teal-200/80 space-y-1.5">
                          <div className="flex items-center justify-between text-teal-950 font-bold">
                            <span>5 Waktu Sholat Wajib:</span>
                            <span className="text-[10px] text-teal-700">
                              {Object.values(prayersCheck).filter(Boolean).length}/7 Dikerjakan
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((prKey) => {
                              const done = prayersCheck[prKey];
                              return (
                                <button
                                  key={prKey}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPrayersCheck((p) => ({ ...p, [prKey]: !p[prKey] }));
                                  }}
                                  className={`rounded py-1 text-center text-[10px] font-bold capitalize transition ${
                                    done
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'bg-white border border-slate-200 text-slate-500'
                                  }`}
                                >
                                  {done ? `✓ ${prKey}` : prKey}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrayersCheck((p) => ({ ...p, tadarus: !p.tadarus }));
                              }}
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${
                                prayersCheck.tadarus
                                  ? 'bg-teal-700 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600'
                              }`}
                            >
                              {prayersCheck.tadarus ? '✓ Tadarus / Mengaji' : 'Tadarus'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrayersCheck((p) => ({ ...p, dhuha: !p.dhuha }));
                              }}
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold transition ${
                                prayersCheck.dhuha
                                  ? 'bg-teal-700 text-white'
                                  : 'bg-white border border-slate-200 text-slate-600'
                              }`}
                            >
                              {prayersCheck.dhuha ? '✓ Sholat Dhuha' : 'Dhuha'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sub-input for Habit 7: Tidur Cepat */}
                      {habit.id === 7 && (
                        <div className="flex items-center justify-between px-3 py-1.5 bg-teal-50/60 rounded-lg text-[11px] border border-teal-100">
                          <span className="font-semibold text-teal-900">Catat Waktu Tidur:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={bedTime}
                              onChange={(e) => {
                                setBedTime(e.target.value);
                                showToast(`Jam tidur disetel ke ${e.target.value} WITA`);
                              }}
                              className="rounded border border-teal-300 bg-white px-1.5 py-0.5 font-bold text-teal-800 text-[11px]"
                            />
                            <span className="text-[10px] text-slate-500">WITA</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Parent Journal Note for this day */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-700">
                  Catatan Harian Orang Tua:
                </label>
                <textarea
                  rows={3}
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  placeholder="Tuliskan catatan apresiasi atau pembiasaan anak hari ini..."
                ></textarea>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Tersimpan otomatis</span>
                  <button
                    onClick={() => {
                      showToast('Catatan harian orang tua berhasil disimpan!');
                    }}
                    className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-bold text-white hover:bg-teal-800 transition"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </div>

              {/* Teacher Feedback for this day */}
              <div className="mt-5 rounded-2xl bg-amber-50/80 p-3.5 ring-1 ring-amber-200/60">
                <div className="flex items-center gap-2 text-amber-900">
                  <span className="material-symbols-outlined text-base">school</span>
                  <span className="text-xs font-bold">Apresiasi Wali Kelas</span>
                </div>
                <p className="mt-1.5 text-xs text-amber-800 leading-relaxed">
                  "Terima kasih Mama Ahmad. Kami melihat Ahmad sangat disiplin dan suka membantu
                  teman saat kegiatan sains siang tadi. Terus pertahankan!"
                </p>
                <p className="mt-1 text-[10px] font-semibold text-amber-900/70">
                  — Ibu Siti Aminah, S.Pd. (14:30 WITA)
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => onNavigate('parent_portfolio')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                >
                  <span className="material-symbols-outlined text-base text-teal-700">badge</span>
                  Lihat Portofolio Holistik Lengkap
                </button>
                <button
                  onClick={() => onNavigate('parent_dashboard')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                >
                  Kembali ke Beranda Perkembangan
                </button>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          <div className="text-center p-12 border border-dashed border-slate-200 bg-white rounded-3xl space-y-3">
            <div className="w-16 h-16 bg-teal-50 text-[#00685f] rounded-full flex items-center justify-center mx-auto shadow-3xs animate-pulse">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Kalender Jurnal 7 KAIH</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Silakan pilih rombel kelas dan nama siswa terlebih dahulu melalui pilihan di atas untuk memuat kalender pembiasaan harian 7 KAIH murid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
