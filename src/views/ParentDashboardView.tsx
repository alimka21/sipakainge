import React, { useState, useEffect } from 'react';
import { ScreenId, MuridRecord, RombelRecord, TeacherRecord } from '../types';
import { APP_ASSETS, HABIT_LIST, INITIAL_MURID, INITIAL_ROMBEL, INITIAL_TEACHERS } from '../data/mockData';
import { getGuruClass, getVisibleMurid, getWaliKelasName } from '../lib/access';
import { formatWitaDate } from '../lib/time';

interface ParentDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenQuickRecord: () => void;
  userRole?: string;
  muridList?: MuridRecord[];
  principalPhotoUrl?: string;
  parentMuridId?: string;
  rombelList?: RombelRecord[];
  guruId?: string;
  teacherList?: TeacherRecord[];
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  onNavigate,
  onOpenQuickRecord,
  userRole = 'orang_tua',
  muridList = INITIAL_MURID,
  principalPhotoUrl,
  parentMuridId,
  rombelList = INITIAL_ROMBEL,
  guruId,
  teacherList = INITIAL_TEACHERS,
}) => {
  const isOrangTua = userRole === 'orang_tua';
  const isKS = userRole === 'kepala_sekolah';
  const visibleMurid = getVisibleMurid(userRole, muridList, rombelList, parentMuridId, guruId);
  const [selectedMuridId, setSelectedMuridId] = useState<string>('');
  const [todayLabel, setTodayLabel] = useState(() => formatWitaDate());

  useEffect(() => {
    const interval = setInterval(() => setTodayLabel(formatWitaDate()), 30000);
    return () => clearInterval(interval);
  }, []);

  const activeMurid = isOrangTua
    ? visibleMurid[0]
    : visibleMurid.find((m) => m.id === selectedMuridId);

  const calculateDoneHabits = (m: MuridRecord) => {
    return Object.values(m.habits).filter(Boolean).length;
  };

  return (
    <div className="w-full pb-16 font-['Plus_Jakarta_Sans',sans-serif] px-6 lg:px-10 py-6 space-y-6">
      {/* SECTION 1: Student Selection (Kepala Sekolah / Guru monitor multiple students) */}
      {!isOrangTua && (
        <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">person_search</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Langkah 1: Pilih Peserta Didik / Siswa
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isKS
                  ? 'Kepala Sekolah dapat memantau seluruh siswa dari semua kelas.'
                  : `Hanya siswa ${getGuruClass(rombelList, guruId) ?? 'kelas perwalian Anda'} yang dapat dipantau.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Pilih Siswa / Ananda:</label>
              <select
                value={selectedMuridId}
                onChange={(e) => setSelectedMuridId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              >
                <option value="">-- Silakan Pilih Siswa --</option>
                {visibleMurid.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.rombel} • NISN: {m.nisn})
                  </option>
                ))}
              </select>
            </div>

            {activeMurid && (
              <div className="rounded-2xl bg-teal-50/50 p-3.5 border border-teal-100 flex items-center justify-between gap-4 animate-scale-up">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shrink-0">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {activeMurid.gender === 'L' ? 'boy' : 'girl'}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">{activeMurid.name}</p>
                    <p className="text-[10px] text-slate-500">Orang Tua: {activeMurid.parentName}</p>
                  </div>
                </div>
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-bold text-teal-800 shrink-0">
                  {activeMurid.rombel}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Conditional rendering depending on whether a student is selected */}
      {!activeMurid ? (
        <div className="text-center p-12 border border-dashed border-slate-200 bg-white rounded-3xl space-y-3">
          <span className="material-symbols-outlined text-slate-300 text-5xl block">person_search</span>
          <h3 className="text-base font-bold text-slate-800">Menunggu Pemilihan Siswa</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Gunakan kotak pilihan di atas untuk menentukan siswa yang ingin dipantau perkembangan karakter harian dan laporannya.
          </p>
        </div>
      ) : (
        <>
          {/* SECTION 2: Personal Welcome & Immediate Action Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00685f] via-[#008378] to-[#006947] p-6 sm:p-8 lg:p-10 shadow-md text-white">
            <div className="absolute -right-16 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
            <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-[#89f5e7]/10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left: Identity & Greeting */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-2xl">
                <div className="relative shrink-0">
                  {isKS ? (
                    <img
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md ring-4 ring-white/20"
                      alt="Ibu Fahmawati, S.Pd."
                      src={principalPhotoUrl || APP_ASSETS.principalPhoto}
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/15 text-white flex items-center justify-center shadow-md ring-4 ring-white/20">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        woman
                      </span>
                    </div>
                  )}
                  <span
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[#6ffbbe] text-[#002113] rounded-full flex items-center justify-center shadow-xs"
                    title={isKS ? "Manajemen Mutu Sekolah" : "Kemitraan Rumah Aktif"}
                  >
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isKS ? 'admin_panel_settings' : 'spa'}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="inline-flex items-center gap-2 mb-1">
                    <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] text-[#89f5e7] uppercase font-bold tracking-wider">
                      {isKS ? "Pemantauan Mutu Karakter" : "Kemitraan Rumah & Sekolah"}
                    </span>
                    <span className="text-xs text-white/80">• {todayLabel}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    {isKS 
                      ? `Selamat Datang, Ibu Fahmawati, S.Pd.!` 
                      : `Selamat Datang, Bapak/Ibu Wali dari ${activeMurid.name}!`}
                  </h1>
                  <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
                    {isKS ? (
                      <>
                        Selamat datang di panel pemantauan 7 KAIH. Anda dapat memantau keterisian dan konsistensi pembiasaan karakter seluruh siswa secara holistik.
                      </>
                    ) : (
                      <>
                        Mari pantau benih kebiasaan baik dan keceriaan ananda{' '}
                        <strong className="text-[#89f5e7] font-bold">{activeMurid.name}</strong> ({activeMurid.rombel}) hari ini dengan penuh kasih sayang.
                      </>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-white/80">
                    {isKS ? (
                      <>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">shield_person</span> Jabatan: Kepala Sekolah
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">badge</span> NIP: 197305111995012002
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">badge</span> NIS: {activeMurid.nis}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">badge</span> NISN: {activeMurid.nisn}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Daily Quick Action Callout */}
              <div className="bg-white text-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col justify-between max-w-sm w-full shrink-0 border border-slate-100">
                {isKS ? (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
                        <span className="text-xs uppercase tracking-wider text-[#00685f] font-bold">Rangkuman Sekolah</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Semua kelas aktif memantau pembiasaan karakter murid di sekolah dan mensinkronisasikan laporan orang tua murid.
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('class_habits_input')}
                      className="w-full bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">fact_check</span>
                      <span>Kelola 7 KAIH Semua Kelas</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4b41e1] animate-ping"></span>
                        <span className="text-xs uppercase tracking-wider text-[#4b41e1] font-bold">Agenda Mandiri Hari Ini</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Terpantau
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Luangkan 1 menit bersama ananda untuk merefleksikan 7 kebiasaan sehat sebelum istirahat malam.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenQuickRecord}
                      className="w-full bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">edit_calendar</span>
                      <span>+ Catat 7 KAIH Hari Ini (1 Menit)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3: Overview Metric Cards (Bento 3-Card Grid) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Kehadiran */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Kehadiran Sekolah</span>
                  <span className="text-xs text-slate-500 mt-0.5">Semester Ganjil 2026/2027</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#006947]/10 text-[#006947] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">98.4%</span>
                <span className="text-xs text-[#006947] font-bold bg-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
                  Sangat Rajin
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#00855b] h-full rounded-full" style={{ width: '98.4%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-[#006947] font-semibold">
                    <span className="material-symbols-outlined text-xs">verified</span> Tepat Waktu & Konsisten
                  </span>
                  <span>0 Hari Alpa / Sakit 1</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Capaian Belajar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                    Rerata Perkembangan Belajar
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">Asesmen Formatif & Portofolio</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#e2dfff] text-[#4b41e1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_stories
                  </span>
                </div>
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {(() => {
                    const academics = (activeMurid as any).academics || {};
                    const scores = Object.values(academics).map((a: any) => a.score);
                    if (scores.length > 0) {
                      return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
                    }
                    return 88.5; // fallback default
                  })()}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
                <span className="text-xs text-[#00685f] font-bold bg-[#89f5e7]/40 px-2 py-0.5 rounded-full">
                  Kompeten
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-medium text-slate-700 truncate max-w-[200px]">
                    Wali Kelas: {getWaliKelasName(activeMurid.rombel, rombelList, teacherList)}
                  </span>
                  <span className="text-[#00685f] font-bold">Tercapai Optimal</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Konsistensi 7 Kebiasaan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Konsistensi 7 KAIH</span>
                  <span className="text-xs text-slate-500 mt-0.5">Pekan ke-4 September</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#89f5e7] text-[#005049] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </div>
              </div>
              <div className="my-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {Math.round((calculateDoneHabits(activeMurid) / 7) * 100)}%
                </span>
                <span className="text-xs text-[#006947] font-bold bg-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
                  Tuntas Terverifikasi
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#00685f] h-full rounded-full"
                    style={{ width: `${Math.round((calculateDoneHabits(activeMurid) / 7) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Sinkronisasi Guru & Orang Tua</span>
                  <span className="font-bold text-slate-900">{calculateDoneHabits(activeMurid)} / 7 Jurnal</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) Grid */}
          <section className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    stars
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                    Pantauan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH): {activeMurid.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pendekatan pembiasaan positif tanpa pelabelan negatif. Menumbuhkan kesadaran diri ananda secara bertahap dan gembira.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs bg-[#6ffbbe]/30 text-[#006947] px-3 py-1 rounded-full font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#00855b]"></span> Terbiasa Baik
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-[#eff4ff] text-[#4b41e1] px-3 py-1 rounded-full font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#4b41e1]"></span> Terpantau Sistem
                </span>
              </div>
            </div>

            {/* 7 Habits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {HABIT_LIST.map((h) => {
                const isCompleted = activeMurid.habits[h.id] ?? false;
                return (
                  <div
                    key={h.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between hover:shadow-xs transition-all ${
                      isCompleted
                        ? 'bg-[#eff4ff] border-[#c3c0ff]'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCompleted ? 'bg-[#e2dfff] text-[#3323cc]' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">{h.icon}</span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isCompleted ? 'Konsisten' : 'Pembiasaan'}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900">{h.title}</h3>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{h.description}</p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-200/50 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#006947]">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span>{isCompleted ? 'Terlaksana' : 'Sedang Didorong'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Character Badge Widget */}
              <div className="bg-gradient-to-br from-[#008378] to-[#00685f] text-white p-5 rounded-2xl flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#89f5e7]">Karakter Profil</span>
                    <span className="material-symbols-outlined text-[#89f5e7] text-lg">verified</span>
                  </div>
                  <h3 className="text-base font-bold mt-2">Karakter Gemilang</h3>
                  <p className="text-xs text-white/90 mt-1 leading-relaxed">
                    Ananda {activeMurid.name} aktif mengikuti sholat dhuha berjamaah dan membudayakan 5S (Senyum, Sapa, Salam, Sopan, Santun) berbasis Sipakatau.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-white/20 flex items-center justify-between">
                  <span className="text-[11px] text-white/70">SIPAKAINGE SDN PAM</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('parent_portfolio')}
                    className="text-xs text-[#89f5e7] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Rapor</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
