import React, { useState } from 'react';
import { ScreenId, MuridRecord, PrayerTimesChecklist } from '../types';
import { APP_ASSETS, INITIAL_MURID, HABIT_LIST } from '../data/mockData';

interface ClassHabitsInputViewProps {
  onNavigate: (screen: ScreenId) => void;
  muridList?: MuridRecord[];
  onUpdateMuridHabits?: (muridId: string, updated: Partial<MuridRecord>) => void;
}

export const ClassHabitsInputView: React.FC<ClassHabitsInputViewProps> = ({
  onNavigate,
  muridList: propMuridList,
}) => {
  // Current active teacher is Ibu Siti Aminah (Wali Kelas IV-A)
  const currentTeacher = {
    name: 'Ibu Siti Aminah, S.Pd.',
    nip: '19840212 200801 2 018',
    assignedClass: 'Kelas IV-A',
    fase: 'Fase B',
    avatar: APP_ASSETS.sitiAminahAvatar,
  };

  const [muridData, setMuridData] = useState<MuridRecord[]>(propMuridList || INITIAL_MURID);
  const [selectedMuridId, setSelectedMuridId] = useState<string>('m-4a-1');
  const [selectedDate, setSelectedDate] = useState<string>('25 September 2025 (Hari Ini)');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Only students in the teacher's assigned class as Wali Kelas (Kelas IV-A)
  const classMuridList = muridData.filter(
    (m) => m.rombel === currentTeacher.assignedClass
  );

  const filteredClassMurid = classMuridList.filter((m) =>
    m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.nisn.includes(searchFilter) ||
    m.nis.includes(searchFilter)
  );

  const activeMurid = muridData.find((m) => m.id === selectedMuridId) || classMuridList[0];

  const handleToggleHabit = (muridId: string, habitId: number) => {
    setMuridData((prev) =>
      prev.map((m) => {
        if (m.id === muridId) {
          const current = m.habits[habitId] ?? false;
          const next = !current;
          const habitTitle = HABIT_LIST.find((h) => h.id === habitId)?.title || `Kebiasaan #${habitId}`;
          showToast(
            `${m.name}: ${habitTitle} diperbarui menjadi ${next ? '✓ Selesai' : 'Belum Selesai'}`
          );
          return {
            ...m,
            habits: { ...m.habits, [habitId]: next },
          };
        }
        return m;
      })
    );
  };

  const handleTogglePrayer = (muridId: string, pKey: keyof PrayerTimesChecklist) => {
    setMuridData((prev) =>
      prev.map((m) => {
        if (m.id === muridId) {
          const current = m.prayers[pKey];
          const next = !current;
          showToast(`${m.name}: Sholat/Ibadah ${pKey.toUpperCase()} diperbarui.`);
          return {
            ...m,
            prayers: { ...m.prayers, [pKey]: next },
          };
        }
        return m;
      })
    );
  };

  const handleTimeChange = (muridId: string, field: 'wakeUpTime' | 'bedTime', val: string) => {
    setMuridData((prev) =>
      prev.map((m) => {
        if (m.id === muridId) {
          return { ...m, [field]: val };
        }
        return m;
      })
    );
    showToast(`Jam ${field === 'wakeUpTime' ? 'bangun' : 'tidur'} ${activeMurid.name} disimpan: ${val} WITA`);
  };

  const calculateDoneHabits = (m: MuridRecord) => {
    return Object.values(m.habits).filter(Boolean).length;
  };

  const calculateDonePrayers = (m: MuridRecord) => {
    return Object.values(m.prayers).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800">
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
            <button
              onClick={() => onNavigate('teacher_dashboard')}
              className="hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-base">school</span>
              Rekap Supervisi Guru
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[#00685f] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">fact_check</span>
              Pengisian 7 KAIH Per Murid (Wali Kelas)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
              <span className="material-symbols-outlined text-sm">lock</span>
              Wali Kelas Khusus: {currentTeacher.assignedClass}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
        {/* Guru Wali Kelas Profile Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={currentTeacher.avatar}
                alt={currentTeacher.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-teal-400/30"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="rounded-full bg-teal-500/25 px-2.5 py-0.5 text-xs font-bold text-teal-200">
                    WALI KELAS RESMI
                  </span>
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200">
                    {currentTeacher.assignedClass} ({currentTeacher.fase})
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif">{currentTeacher.name}</h1>
                <p className="text-xs text-teal-100/90 mt-0.5">
                  NIP. {currentTeacher.nip} • UPT SPF SDN Percontohan PAM Makassar
                </p>
              </div>
            </div>

            {/* Quick Metrics of Assigned Class */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                <span className="text-[11px] text-teal-200">Total Murid Kelas</span>
                <p className="text-2xl font-black text-white tabular-nums">{classMuridList.length}</p>
                <span className="text-[10px] text-emerald-300">Kelas Binaan</span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                <span className="text-[11px] text-teal-200">Rerata 7 KAIH</span>
                <p className="text-2xl font-black text-white tabular-nums">94.2%</p>
                <span className="text-[10px] text-teal-200">Hari Ini</span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md text-center">
                <span className="text-[11px] text-teal-200">Status Entri</span>
                <p className="text-xl font-bold text-emerald-300">Aktif</p>
                <span className="text-[10px] text-teal-100">25 Sep 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kebijakan Otoritas Wali Kelas */}
        <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-4 flex items-start gap-3 text-xs text-teal-950">
          <span className="material-symbols-outlined text-teal-700 text-xl shrink-0 mt-0.5">
            verified_user
          </span>
          <div className="leading-relaxed">
            <span className="font-bold text-teal-950 block mb-0.5">
              Kebijakan Hak Akses Pengisian 7 KAIH:
            </span>
            <span>
              Sesuai sistem tata kelola SIPAKAINGE, Guru hanya berwenang mengisi dan memverifikasi data <strong>7 Kebiasaan Anak Indonesia Hebat (7 KAIH)</strong> berdasarkan kelas yang ditanganinya sebagai <strong>Wali Kelas ({currentTeacher.assignedClass})</strong>. Data murid dari kelas lain hanya dapat dipantau melalui rekapitulasi atau oleh Kepala Sekolah (Super Admin).
            </span>
          </div>
        </div>

        {/* Main Content: Split List Murid & Form Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Daftar Murid di Kelas Binaan */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-teal-700 text-base">groups</span>
                    Daftar Murid {currentTeacher.assignedClass}
                  </h3>
                  <p className="text-[11px] text-slate-500">Pilih murid untuk mengisi 7 KAIH</p>
                </div>
                <span className="rounded-xl bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                  {filteredClassMurid.length} Murid
                </span>
              </div>

              {/* Search Murid */}
              <div className="mb-3">
                <div className="flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs">
                  <span className="material-symbols-outlined text-slate-400 mr-2 text-sm">search</span>
                  <input
                    type="text"
                    placeholder="Cari nama atau NISN murid..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* List of Murid Cards */}
              <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                {filteredClassMurid.map((murid) => {
                  const doneCount = calculateDoneHabits(murid);
                  const isSelected = activeMurid.id === murid.id;

                  return (
                    <div
                      key={murid.id}
                      onClick={() => setSelectedMuridId(murid.id)}
                      className={`cursor-pointer rounded-2xl p-3.5 transition-all border ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {murid.avatar ? (
                            <img
                              src={murid.avatar}
                              alt={murid.name}
                              className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-bold text-xs">
                              {murid.gender === 'L' ? '👦' : '👧'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-slate-900">{murid.name}</p>
                            <p className="text-[10px] text-slate-500">
                              NISN: {murid.nisn} • {murid.parentName}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              doneCount >= 6
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {doneCount}/7 KAIH
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {calculateDonePrayers(murid)}/8 Ibadah
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Lembar Isian 7 KAIH Per Murid Terpilih */}
          <div className="lg:col-span-7 space-y-4">
            {activeMurid && (
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 space-y-6">
                {/* Header Profil Murid yang Sedang Diisi */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    {activeMurid.avatar ? (
                      <img
                        src={activeMurid.avatar}
                        alt={activeMurid.name}
                        className="h-12 w-12 rounded-2xl object-cover ring-2 ring-teal-600/30"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-bold text-base">
                        {activeMurid.gender === 'L' ? '👦' : '👧'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{activeMurid.name}</h2>
                        <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                          {activeMurid.rombel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        NISN: {activeMurid.nisn} • Wali/Ortu: {activeMurid.parentName} ({activeMurid.parentPhone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{selectedDate}</span>
                  </div>
                </div>

                {/* Input Jam Bangun Pagi & Tidur Malam */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-teal-50/70 p-4 border border-teal-100">
                  <div>
                    <label className="font-bold text-teal-950 text-xs block mb-1">
                      #1 Jam Bangun Pagi Murid:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={activeMurid.wakeUpTime}
                        onChange={(e) =>
                          handleTimeChange(activeMurid.id, 'wakeUpTime', e.target.value)
                        }
                        className="rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                      <span className="text-xs text-teal-800 font-semibold">WITA (Target 05.00)</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-teal-950 text-xs block mb-1">
                      #7 Jam Tidur Malam Murid:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={activeMurid.bedTime}
                        onChange={(e) =>
                          handleTimeChange(activeMurid.id, 'bedTime', e.target.value)
                        }
                        className="rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                      <span className="text-xs text-teal-800 font-semibold">WITA (Target &le; 21.00)</span>
                    </div>
                  </div>
                </div>

                {/* Checklist 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Checklist 7 Kebiasaan Anak Indonesia Hebat (7 KAIH):
                    </h3>
                    <span className="text-xs font-bold text-teal-800">
                      {calculateDoneHabits(activeMurid)}/7 Selesai
                    </span>
                  </div>

                  <div className="space-y-2">
                    {HABIT_LIST.map((habit) => {
                      const isDone = activeMurid.habits[habit.id] ?? false;
                      return (
                        <div
                          key={habit.id}
                          onClick={() => handleToggleHabit(activeMurid.id, habit.id)}
                          className={`cursor-pointer rounded-2xl p-3 flex items-center justify-between transition-all border ${
                            isDone
                              ? 'border-emerald-300 bg-emerald-50/50 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`material-symbols-outlined text-lg p-2 rounded-xl ${
                                isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {habit.icon}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{habit.title}</p>
                              <p className="text-[11px] text-slate-500">{habit.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-[11px] font-bold ${
                                isDone ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                            >
                              {isDone ? '✓ Dilaksanakan' : 'Belum'}
                            </span>
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                                isDone
                                  ? 'border-emerald-600 bg-emerald-600 text-white font-bold text-xs'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}
                            >
                              ✓
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5 Waktu Sholat Wajib + Ibadah Lainnya */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-teal-700 text-base">mosque</span>
                      5 Waktu Sholat Fardhu & Ibadah Lainnya:
                    </h4>
                    <span className="text-xs font-bold text-teal-800">
                      {calculateDonePrayers(activeMurid)}/8 Dikerjakan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { k: 'subuh', label: '1. Subuh' },
                      { k: 'dzuhur', label: '2. Dzuhur' },
                      { k: 'ashar', label: '3. Ashar' },
                      { k: 'maghrib', label: '4. Maghrib' },
                      { k: 'isya', label: '5. Isya' },
                    ].map((p) => {
                      const done = activeMurid.prayers[p.k as keyof PrayerTimesChecklist];
                      return (
                        <button
                          key={p.k}
                          type="button"
                          onClick={() =>
                            handleTogglePrayer(activeMurid.id, p.k as keyof PrayerTimesChecklist)
                          }
                          className={`rounded-xl py-2 px-2 text-center text-xs font-bold border transition ${
                            done
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {done ? `✓ ${p.label}` : p.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                    {[
                      { k: 'tadarus', label: 'Tadarus / Mengaji' },
                      { k: 'dhuha', label: 'Sholat Dhuha' },
                      { k: 'doaHarian', label: 'Doa Harian & Adab' },
                    ].map((extra) => {
                      const done = activeMurid.prayers[extra.k as keyof PrayerTimesChecklist];
                      return (
                        <button
                          key={extra.k}
                          type="button"
                          onClick={() =>
                            handleTogglePrayer(activeMurid.id, extra.k as keyof PrayerTimesChecklist)
                          }
                          className={`rounded-xl py-2 px-3 text-left text-xs font-semibold border flex items-center justify-between transition ${
                            done
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{extra.label}</span>
                          <span>{done ? '✓' : '—'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Catatan Khusus Wali Kelas */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan Khusus Wali Kelas untuk Murid ini:
                  </label>
                  <textarea
                    rows={2}
                    value={activeMurid.notes || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMuridData((prev) =>
                        prev.map((m) => (m.id === activeMurid.id ? { ...m, notes: val } : m))
                      );
                    }}
                    placeholder="Tuliskan motivasi, apresiasi kebiasaan baik, atau catatan pendampingan..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                {/* Save Confirmation */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    Data tersinkron otomatis ke Buku Pemantauan Murid UPT SPF SDN Percontohan PAM
                  </span>
                  <button
                    onClick={() =>
                      showToast(
                        `Berhasil menyimpan dan memperbarui data 7 KAIH untuk ${activeMurid.name}!`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    Simpan Data Murid Ini
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
