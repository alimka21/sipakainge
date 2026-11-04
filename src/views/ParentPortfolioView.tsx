import React, { useEffect, useState } from 'react';
import { ScreenId, MuridRecord, RombelRecord, TeacherRecord } from '../types';
import { HABIT_LIST, INITIAL_MURID, INITIAL_ROMBEL, INITIAL_TEACHERS, PRINCIPAL_NAME } from '../data/mockData';
import { getGuruClass, getVisibleMurid, getWaliKelasName } from '../lib/access';
import { formatWitaDateTime, getAcademicPeriod, now, witaDateKey } from '../lib/time';
import { DailyHabitEntry, getDailyHabitLogs } from '../lib/supabase';
import { computeHabitStats, habitStatusLabel } from '../lib/habitStats';

const FASE_LABEL: Record<string, string> = { 'fase-a': 'Fase A', 'fase-b': 'Fase B', 'fase-c': 'Fase C' };
// Titik terluar heptagon radar (urutan = HABIT_LIST), pusat di (160, 160).
const RADAR_VERTICES: [number, number][] = [[160, 30], [270, 75], [295, 190], [220, 285], [100, 285], [25, 190], [50, 75]];
const RADAR_LABELS: { x: number; y: number; anchor: 'start' | 'middle' | 'end'; name: string }[] = [
  { x: 160, y: 20, anchor: 'middle', name: 'Bangun Pagi' },
  { x: 280, y: 70, anchor: 'start', name: 'Beribadah' },
  { x: 305, y: 195, anchor: 'start', name: 'Olahraga' },
  { x: 225, y: 305, anchor: 'middle', name: 'Makan Sehat' },
  { x: 95, y: 305, anchor: 'middle', name: 'Gemar Membaca' },
  { x: 15, y: 195, anchor: 'end', name: 'Santun & Membantu' },
  { x: 35, y: 70, anchor: 'end', name: 'Tidur Tepat' },
];

const formatTanggalLahir = (value?: string) => {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

interface ParentPortfolioViewProps {
  onNavigate: (screen: ScreenId) => void;
  onDownloadReport: () => void;
  userRole?: string;
  muridList?: MuridRecord[];
  parentMuridId?: string;
  rombelList?: RombelRecord[];
  guruId?: string;
  teacherList?: TeacherRecord[];
  principalName?: string;
}

export const ParentPortfolioView: React.FC<ParentPortfolioViewProps> = ({
  onNavigate,
  onDownloadReport,
  userRole = 'orang_tua',
  muridList = INITIAL_MURID,
  parentMuridId,
  rombelList = INITIAL_ROMBEL,
  guruId,
  teacherList = INITIAL_TEACHERS,
  principalName = PRINCIPAL_NAME,
}) => {
  const [activeTab, setActiveTab] = useState<
    'radar' | 'habits' | 'academic' | 'artifacts' | 'awards'
  >('radar');
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isKS = userRole === 'kepala_sekolah';
  const visibleMurid = getVisibleMurid(userRole, muridList, rombelList, parentMuridId, guruId);
  const [selectedClass, setSelectedClass] = useState<string>(
    userRole === 'guru' ? getGuruClass(rombelList, guruId) ?? '' : ''
  );
  const [selectedMuridId, setSelectedMuridId] = useState<string>('');
  const classMuridList = visibleMurid.filter((m) => !selectedClass || m.rombel === selectedClass);
  const activeMurid =
    visibleMurid.find((m) => m.id === selectedMuridId) ?? (isKS ? undefined : classMuridList[0]);

  // Academic grades (Dynamic Merger)
  const activeAcademics = (activeMurid && (activeMurid as any).academics) 
    ? Object.values((activeMurid as any).academics).map((ac: any) => {
        const s = ac.score;
        const pred = s >= 90 ? 'Amat Baik' : s >= 80 ? 'Baik' : s >= 70 ? 'Cukup' : 'Perlu Pendampingan';
        return {
          code: ac.subject.substring(0, 4).toUpperCase(),
          name: ac.subject,
          score: s,
          predicate: pred,
          desc: `Evaluasi Kompetensi Mandiri: ${ac.tasks.map((tk: any) => `${tk.taskName} (Nilai: ${tk.score})`).join(', ')}.`,
          trend: 'Input Guru',
        };
      })
    : [];

  const academicSubjects = activeAcademics;

  // Artifacts (Dynamic Merger)
  const activeArtifacts = (activeMurid && (activeMurid as any).portfolios)
    ? (activeMurid as any).portfolios.map((art: any) => ({
        id: art.id,
        title: art.title,
        category: art.category,
        date: art.date,
        image: art.imageUrl || undefined,
        description: art.description,
        appreciation: art.feedback || 'Praktik baik diunggah oleh Guru Kelas',
      }))
    : [];

  const artifacts = activeArtifacts;


  // Awards (Dynamic Merger)
  const activeAwards = (activeMurid && (activeMurid as any).achievements)
    ? (activeMurid as any).achievements.map((aw: any) => ({
        id: aw.id,
        title: aw.title,
        organizer: aw.description || 'Pemberi Apresiasi: Sekolah',
        date: aw.date,
        level: aw.category,
        badge: 'gold',
      }))
    : [];

  const awards = activeAwards;

  const rerataNilai = academicSubjects.length
    ? Math.round((academicSubjects.reduce((sum: number, sub: any) => sum + Number(sub.score || 0), 0) / academicSubjects.length) * 10) / 10
    : null;
  const predikatNilai = (n: number) => (n >= 90 ? 'Amat Baik (A)' : n >= 80 ? 'Baik (B)' : n >= 70 ? 'Cukup (C)' : 'Perlu Pendampingan (D)');
  const nilaiTertinggi = academicSubjects.reduce<any>((best, sub: any) => (!best || sub.score > best.score ? sub : best), null);

  // Kepatuhan 7 KAIH 30 hari terakhir dari jurnal harian (daily_habits);
  // hari ini diambil dari data murid yang sedang dimuat (paling baru).
  const [habitLogs, setHabitLogs] = useState<Record<string, DailyHabitEntry>>({});
  useEffect(() => {
    if (!activeMurid) return;
    let cancelled = false;
    setHabitLogs({});
    const from = witaDateKey(new Date(now().getTime() - 29 * 24 * 60 * 60 * 1000));
    getDailyHabitLogs(activeMurid.id, from, witaDateKey()).then((logs) => {
      if (!cancelled) setHabitLogs(logs);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMurid?.id]);
  const habitEntries = { ...habitLogs, ...(activeMurid ? { [witaDateKey()]: { habits: activeMurid.habits || {} } } : {}) };
  const habitStats = computeHabitStats(Object.values(habitEntries));
  const radarPoints = HABIT_LIST.map((h, i) => {
    const p = (habitStats.perHabit[h.id].pct ?? 0) / 100;
    const [vx, vy] = RADAR_VERTICES[i];
    return [160 + (vx - 160) * p, 160 + (vy - 160) * p] as [number, number];
  });
  const topHabits = HABIT_LIST.map((h, i) => ({ name: RADAR_LABELS[i].name, pct: habitStats.perHabit[h.id].pct ?? 0 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 2);


  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800 print:bg-white print:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 print:hidden">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
            <span className="material-symbols-outlined text-base">check_circle</span>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Context */}
      <div className="border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-8 print:hidden">
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
              <span className="material-symbols-outlined text-base">badge</span>
              Portofolio & Profil Holistik Murid
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('parent_calendar')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-sm text-teal-700">calendar_month</span>
              Buka Kalender 7 KAIH
            </button>
            <button
              onClick={onDownloadReport}
              disabled={!activeMurid}
              title={!activeMurid ? 'Pilih siswa terlebih dahulu' : 'Unduh seluruh portofolio sebagai PDF'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Unduh Portofolio PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 print:max-w-none print:px-0 print:pt-0">
        {/* Print-only letterhead */}
        {activeMurid && (
          <div className="hidden print:flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-4">
            <div>
              <p className="text-sm font-extrabold">UPT SPF SD NEGERI PERCONTOHAN PAM</p>
              <p className="text-xs">Laporan Portofolio & Profil Holistik Murid</p>
            </div>
            <p className="text-[10px] text-slate-500">Dicetak: {formatWitaDateTime()}</p>
          </div>
        )}

        {/* SELECTOR FOR TEACHERS AND PRINCIPALS */}
        {(userRole === 'kepala_sekolah' || userRole === 'guru') && (
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4 print:hidden">
            <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-800 text-lg">person_search</span>
              <span>Pilih Kelas & Siswa untuk Menampilkan Profil / Portofolio</span>
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
                  {rombelList.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
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
            {/* Child Profile Bento Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-200/70 print:border print:rounded-xl print:break-inside-avoid">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative">
                    {activeMurid.avatar ? (
                      <img
                        src={activeMurid.avatar}
                        alt={activeMurid.name}
                        className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover ring-4 ring-teal-100 shadow-md"
                      />
                    ) : (
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center ring-4 ring-teal-100 shadow-md">
                        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {activeMurid.gender === 'L' ? 'boy' : 'girl'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-600/20">
                        {activeMurid.rombel}{FASE_LABEL[activeMurid.fase] ? ` • ${FASE_LABEL[activeMurid.fase]}` : ''}
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-600/20">
                        Tahun Ajaran {getAcademicPeriod().tahunAjaran}
                      </span>
                    </div>

                    <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                      {activeMurid.name}
                    </h1>

                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs text-slate-500">
                      <div>
                        <span className="font-semibold text-slate-400 block">NISN / NIS:</span>
                        <span className="font-bold text-slate-700">{activeMurid.nisn} / {activeMurid.nis}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Tanggal Lahir:</span>
                        <span className="font-bold text-slate-700">{formatTanggalLahir(activeMurid.tanggalLahir)}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Wali Kelas:</span>
                        <span className="font-bold text-slate-700">
                          {getWaliKelasName(activeMurid.rombel, rombelList, teacherList)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Sekolah:</span>
                        <span className="font-bold text-slate-700">UPT SPF SD NEGERI PERCONTOHAN PAM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Holistic Stats */}
                <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                  <div className="flex items-center gap-3 rounded-2xl bg-teal-50/70 p-3.5 ring-1 ring-teal-600/10">
                    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-teal-700 px-2 text-sm font-bold text-white whitespace-nowrap">
                      {rerataNilai ?? '—'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-teal-900">Rerata Nilai Rapor</p>
                      <p className="text-[11px] text-teal-700">{rerataNilai === null ? 'Belum ada nilai' : `Predikat: ${predikatNilai(rerataNilai)}`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-3.5 ring-1 ring-emerald-600/10">
                    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-emerald-700 px-2 text-sm font-bold text-white whitespace-nowrap">
                      {habitStats.overall === null ? '—' : `${habitStats.overall}%`}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">7 KAIH Anak</p>
                      <p className="text-[11px] text-emerald-700">{habitStats.days ? `Konsistensi ${habitStats.days} hari tercatat` : 'Belum ada jurnal'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Holistic Narration Banner */}
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50 p-4 ring-1 ring-teal-200/60 flex items-start gap-3">
                <span className="material-symbols-outlined text-teal-700 text-2xl shrink-0 mt-0.5">
                  format_quote
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-teal-950 mb-1">
                    Refleksi & Catatan Guru Kelas {activeMurid.rombel} (
                    {getWaliKelasName(activeMurid.rombel, rombelList, teacherList)}):
                  </p>
                  <p className="italic leading-relaxed text-slate-600">
                    {activeMurid.notes ? `"${activeMurid.notes}"` : 'Belum ada catatan dari wali kelas.'}
                  </p>
                </div>
              </div>
            </div>

        {/* Tab Navigation — screen only; the printed PDF includes every section below regardless of active tab */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
          {[
            { id: 'radar', label: 'Ringkasan & Radar Karakter', icon: 'radar' },
            { id: 'habits', label: '7 Kebiasaan Anak Hebat (7 KAIH)', icon: 'verified' },
            { id: 'academic', label: 'Capaian Akademik & TP', icon: 'school' },
            { id: 'artifacts', label: 'Karya & Portofolio Murid', icon: 'draw' },
            { id: 'awards', label: 'Prestasi & Apresiasi', icon: 'emoji_events' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 ring-1 ring-slate-200/60'
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Radar Karakter & Ringkasan Holistik */}
        <div className={`mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 print:block print:space-y-4 print:break-inside-avoid ${activeTab === 'radar' ? '' : 'hidden print:grid'}`}>
            {/* SVG Radar Heptagon (7 Sisi) */}
            <div className="lg:col-span-12 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-700">hub</span>
                    Heptagon Radar 7 KAIH
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dihitung dari jurnal pembiasaan 30 hari terakhir ({habitStats.days} hari terisi)
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                  {habitStats.overall === null ? 'Belum ada data' : `Rerata ${habitStats.overall}%`}
                </span>
              </div>

              {/* Radar Graphic SVG */}
              <div className="mt-6 flex flex-col items-center justify-center">
                <svg className="w-full max-w-[340px] h-[320px]" viewBox="0 0 320 320">
                  {/* Grid Rings */}
                  {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
                    <polygon
                      key={i}
                      points="160,30 270,75 295,190 220,285 100,285 25,190 50,75"
                      transform={`scale(${scale}) translate(${160 * (1 - scale)}, ${
                        160 * (1 - scale)
                      })`}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                      strokeDasharray={scale < 1.0 ? '3 3' : 'none'}
                    />
                  ))}

                  {/* Axis lines from center (160, 160) */}
                  <line x1="160" y1="160" x2="160" y2="30" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="160" y1="160" x2="270" y2="75" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="160" y1="160" x2="295" y2="190" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="160" y1="160" x2="220" y2="285" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="160" y1="160" x2="100" y2="285" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="160" y1="160" x2="25" y2="190" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="160" y1="160" x2="50" y2="75" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Filled Performance Polygon */}
                  {habitStats.days > 0 && (
                    <polygon
                      points={radarPoints.map(([x, y]) => `${x},${y}`).join(' ')}
                      fill="rgba(13, 148, 136, 0.25)"
                      stroke="#0f766e"
                      strokeWidth="3"
                    />
                  )}

                  {/* Data points */}
                  {habitStats.days > 0 && radarPoints.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill="#0f766e" />)}

                  {/* Labels */}
                  {HABIT_LIST.map((h, i) => {
                    const pct = habitStats.perHabit[h.id].pct;
                    const l = RADAR_LABELS[i];
                    return (
                      <text
                        key={h.id}
                        x={l.x}
                        y={l.y}
                        textAnchor={l.anchor}
                        className={`text-[10px] font-bold ${pct !== null && pct < 75 ? 'fill-amber-700' : 'fill-slate-700'}`}
                      >
                        {i + 1}. {l.name} ({pct === null ? '—' : `${pct}%`})
                      </text>
                    );
                  })}
                </svg>

                <p className="mt-4 text-center text-xs text-slate-500">
                  {habitStats.days === 0 ? (
                    'Belum ada jurnal 7 KAIH yang diisi dalam 30 hari terakhir.'
                  ) : (
                    <>
                      Nilai tertinggi pada aspek <span className="font-bold text-teal-800">{topHabits[0].name} ({topHabits[0].pct}%)</span> dan{' '}
                      <span className="font-bold text-teal-800">{topHabits[1].name} ({topHabits[1].pct}%)</span>.
                    </>
                  )}
                </p>
              </div>
            </div>

          </div>

        {/* Tab 2: Detail 7 Kebiasaan */}
        <div className={`mt-6 space-y-4 print:break-inside-avoid ${activeTab === 'habits' ? '' : 'hidden print:block'}`}>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Buku Pantau 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kemitraan Orang Tua dan Sekolah Berbasis Nilai Kearifan Lokal Sipakainge
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('parent_calendar')}
                  className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 transition"
                >
                  Buka Kalender Interaktif
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {HABIT_LIST.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                            <span className="material-symbols-outlined text-xl">{habit.icon}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{habit.title}</h4>
                            <span className="text-[11px] font-semibold text-teal-700">
                              {habit.category}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                            (habitStats.perHabit[habit.id].pct ?? 0) >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {habitStats.perHabit[habit.id].pct === null ? '—' : `${habitStats.perHabit[habit.id].pct}%`}
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                        {habit.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status Capaian:</span>
                      <span className="font-bold text-teal-900">
                        {habitStatusLabel(habitStats.perHabit[habit.id].pct)}
                        {habitStats.days > 0 && ` • ${habitStats.perHabit[habit.id].done}/${habitStats.days} hari`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Tab 3: Capaian Akademik & TP */}
        <div className={`mt-6 space-y-6 print:break-inside-avoid ${activeTab === 'academic' ? '' : 'hidden print:block'}`}>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Capaian Tujuan Pembelajaran & Asesmen Sumatif
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kurikulum Merdeka • {activeMurid.rombel} • {getAcademicPeriod().label}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {nilaiTertinggi && (
                    <span className="rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                      Nilai Tertinggi: {nilaiTertinggi.score} ({nilaiTertinggi.name})
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {academicSubjects.length === 0 && (
                  <p className="text-center p-6 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 italic">
                    Belum ada nilai akademik yang diinput guru untuk ananda.
                  </p>
                )}
                {academicSubjects.map((sub: any) => (
                  <div
                    key={sub.name}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-lg bg-teal-800 px-2 py-0.5 text-xs font-bold text-white">
                          {sub.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{sub.name}</h4>
                        <span className="text-xs font-medium text-emerald-600">{sub.trend}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{sub.desc}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 tabular-nums">
                          {sub.score}
                        </span>
                        <p className="text-[11px] text-slate-400">Skala 100</p>
                      </div>

                      <span className="rounded-xl bg-teal-100 px-3 py-1.5 text-xs font-bold text-teal-800">
                        {sub.predicate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Tab 4: Karya & Portofolio Murid */}
        <div className={`mt-6 space-y-6 print:break-inside-avoid ${activeTab === 'artifacts' ? '' : 'hidden print:block'}`}>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Galeri Karya & Praktik Baik Murid
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dokumentasi hasil karya otentik {activeMurid?.name || 'ananda'} yang dicatat wali kelas
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {artifacts.length === 0 && (
                  <p className="md:col-span-2 text-center p-6 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 italic">
                    Belum ada karya yang dicatat oleh guru untuk ananda.
                  </p>
                )}
                {artifacts.map((art: any) => (
                  <div
                    key={art.id}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition"
                  >
                    <div className="h-52 w-full overflow-hidden bg-slate-100">
                      {(art as any).image ? (
                        <img
                          src={(art as any).image}
                          alt={art.title}
                          className="h-full w-full object-cover transition duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-teal-50 text-6xl">
                          {(art as any).icon || '🖼️'}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                          {art.category}
                        </span>
                        <span className="text-xs text-slate-400">{art.date}</span>
                      </div>
                      <h4 className="mt-2 text-base font-bold text-slate-900">{art.title}</h4>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {art.description}
                      </p>

                      <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200/60 flex items-start gap-2">
                        <span className="material-symbols-outlined text-base shrink-0">
                          verified
                        </span>
                        <span>{art.appreciation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Tab 5: Prestasi & Apresiasi */}
        <div className={`mt-6 space-y-6 print:break-inside-avoid ${activeTab === 'awards' ? '' : 'hidden print:block'}`}>
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Rekam Jejak Prestasi & Penghargaan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Apresiasi akademik, karakter kearifan lokal, dan perlombaan ekstrakurikuler
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {awards.length === 0 && (
                  <p className="text-center p-6 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 italic">
                    Belum ada prestasi yang dicatat untuk ananda.
                  </p>
                )}
                {awards.map((aw: any) => (
                  <div
                    key={aw.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <span className="material-symbols-outlined text-2xl">emoji_events</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{aw.title}</h4>
                        <p className="text-xs text-slate-500">
                          Penyelenggara: {aw.organizer} • {aw.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                        Tingkat {aw.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Print-only signature block */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-10 text-xs">
            <div className="text-center space-y-16">
              <p>Wali Kelas,</p>
              <p className="font-bold border-t border-slate-800 pt-1 inline-block px-6">
                {activeMurid ? getWaliKelasName(activeMurid.rombel, rombelList, teacherList) : '-'}
              </p>
            </div>
            <div className="text-center space-y-16">
              <p>Kepala Sekolah,</p>
              <p className="font-bold border-t border-slate-800 pt-1 inline-block px-6">{principalName}</p>
            </div>
          </div>
          </>
        ) : (
          <div className="text-center p-12 border border-dashed border-slate-200 bg-white rounded-3xl space-y-3">
            <div className="w-16 h-16 bg-teal-50 text-[#00685f] rounded-full flex items-center justify-center mx-auto shadow-3xs animate-pulse">
              <span className="material-symbols-outlined text-3xl">badge</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Portofolio & Profil Murid</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Silakan pilih rombel kelas dan nama siswa terlebih dahulu melalui pilihan di atas untuk memuat profil dan berkas portofolio holistik murid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
