import React, { useState } from 'react';
import { ScreenId, TeacherRecord, SupervisionSession } from '../types';
import { INITIAL_TEACHERS } from '../data/mockData';

interface TeacherSupervisionReportViewProps {
  onNavigate: (screen: ScreenId) => void;
  teacherList?: TeacherRecord[];
  sessionStates: Record<string, SupervisionSession>;
  selectedTeacherId?: string;
  onSelectTeacherId?: (id: string) => void;
}

const KESIMPULAN_COLOR: Record<string, string> = {
  'Sangat Baik': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Baik: 'bg-blue-100 text-blue-800 border-blue-200',
  'Baik dengan Penguatan': 'bg-amber-100 text-amber-800 border-amber-200',
  'Memerlukan Pendampingan Intensif': 'bg-red-100 text-red-800 border-red-200',
};

export const TeacherSupervisionReportView: React.FC<TeacherSupervisionReportViewProps> = ({
  onNavigate,
  teacherList: propTeacherList,
  sessionStates,
  selectedTeacherId: propSelectedTeacherId,
  onSelectTeacherId,
}) => {
  const teacherList = propTeacherList || INITIAL_TEACHERS;
  const [localTeacherId, setLocalTeacherId] = useState<string>(propSelectedTeacherId || teacherList[0]?.id || '');
  const selectedTeacherId = propSelectedTeacherId ?? localTeacherId;

  const handleSelectTeacher = (id: string) => {
    setLocalTeacherId(id);
    if (onSelectTeacherId) onSelectTeacherId(id);
  };

  const teacher = teacherList.find((t) => t.id === selectedTeacherId);
  const session = sessionStates[selectedTeacherId];

  const scores22Entries = session ? Object.entries(session.scores22 || {}) : [];
  const scores22Values = scores22Entries.map(([, v]) => v);
  const avgScore22 = scores22Values.length
    ? scores22Values.reduce((a, b) => a + b, 0) / scores22Values.length
    : 0;
  const maxScorePerItem = 4;
  const avgPercentage = maxScorePerItem ? Math.round((avgScore22 / maxScorePerItem) * 100) : 0;

  const scores17Entries = session ? Object.entries(session.scores17 || {}) : [];
  const scores17Values = scores17Entries.map(([, v]) => v);
  const avgScore17 = scores17Values.length
    ? scores17Values.reduce((a, b) => a + b, 0) / scores17Values.length
    : 0;

  // Donut chart geometry
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - avgPercentage / 100);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="text-slate-400">Ruang Supervisi</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-teal-800">Laporan Hasil Supervisi per Guru</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#6ffbbe] ring-2 ring-white/15 shrink-0">
              <span className="material-symbols-outlined text-2xl">insights</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Laporan Hasil Supervisi per Guru</h1>
              <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                Ringkasan visual hasil observasi klinis, skor penilaian, dan catatan penguatan kepala sekolah untuk
                setiap guru.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Pilih Guru */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3">
          <label className="block text-xs font-bold text-slate-700">Pilih Guru:</label>
          <select
            value={selectedTeacherId}
            onChange={(e) => handleSelectTeacher(e.target.value)}
            className="w-full sm:w-96 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          >
            {teacherList.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.rombel}
              </option>
            ))}
          </select>
        </div>

        {!teacher || !session ? (
          <div className="text-center p-10 border border-dashed border-slate-200 bg-slate-50 rounded-2xl">
            <span className="material-symbols-outlined text-slate-400 text-3xl mb-1 block">description</span>
            <p className="text-xs text-slate-500 font-bold">
              Belum ada data hasil supervisi untuk guru ini.
            </p>
          </div>
        ) : (
          <>
            {/* Teacher Identity + Verdict */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {teacher.avatar ? (
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-teal-600/30"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-bold text-lg">
                      {teacher.initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{teacher.name}</h2>
                    <p className="text-xs text-slate-500">
                      {session.mapel} • {session.kelas}
                    </p>
                  </div>
                </div>
                {session.kesimpulanObs && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border shrink-0 ${
                      KESIMPULAN_COLOR[session.kesimpulanObs] || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Kesimpulan Observasi: {session.kesimpulanObs}
                  </span>
                )}
              </div>
            </div>

            {/* Score Summary + Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center gap-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide self-start">
                  Skor Observasi Kelas
                </h3>
                <svg width="140" height="140" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={avgPercentage >= 80 ? '#059669' : avgPercentage >= 60 ? '#0d9488' : '#d97706'}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="-mt-24 mb-16 text-center">
                  <p className="text-2xl font-black text-slate-900">{avgPercentage}%</p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Rata-rata {avgScore22.toFixed(2)} / {maxScorePerItem}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 text-center">
                  Dihitung dari {scores22Values.length} aspek observasi kelas (Instrumen 22 Aspek)
                </p>
              </div>

              {/* Bar Chart per item */}
              <div className="lg:col-span-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Skor per Aspek Observasi (Instrumen 22 Aspek)
                </h3>
                {scores22Entries.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-100 bg-slate-50/50 rounded-2xl text-slate-400 italic text-xs">
                    Belum ada skor observasi kelas yang tercatat untuk guru ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <svg
                      width={Math.max(scores22Entries.length * 26, 320)}
                      height="160"
                      className="min-w-full"
                    >
                      {scores22Entries.map(([key, value], idx) => {
                        const barHeight = (value / maxScorePerItem) * 120;
                        const barColor = value >= 3 ? '#0d9488' : value >= 2 ? '#f59e0b' : '#ef4444';
                        return (
                          <g key={key} transform={`translate(${idx * 26}, 0)`}>
                            <rect
                              x={4}
                              y={130 - barHeight}
                              width={16}
                              height={barHeight}
                              rx={3}
                              fill={barColor}
                            />
                            <text x={12} y={148} fontSize="9" textAnchor="middle" fill="#64748b">
                              {key}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-700 inline-block"></span> Baik (≥3)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Cukup (2)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Perlu Perbaikan (≤1)
                  </span>
                </div>
              </div>
            </div>

            {/* Perangkat (17 Aspek) mini summary */}
            {scores17Values.length > 0 && (
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Skor Telaah Perangkat Ajar (Instrumen 17 Aspek)
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-teal-700 rounded-full"
                      style={{ width: `${Math.min((avgScore17 / 2) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 shrink-0">
                    Rata-rata {avgScore17.toFixed(2)} / 2
                  </span>
                </div>
              </div>
            )}

            {/* Catatan Kualitatif */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">thumb_up</span>
                  Apresiasi Observer
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {session.apresiasiObs || 'Belum ada catatan apresiasi.'}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">search_insights</span>
                  Temuan Observasi
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {session.temuanObs || 'Belum ada catatan temuan.'}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">handshake</span>
                  Komitmen Guru
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {session.komitmenGuruNew || 'Belum ada komitmen tindak lanjut dari guru.'}
                </p>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  Status Tindak Lanjut
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {session.tindakLanjutKS === 'TIDAK_ADA_TINDAK_LANJUT'
                    ? 'Tidak ada tindak lanjut khusus yang diperlukan.'
                    : session.tindakLanjutKS === 'TINDAK_LANJUT_RINGAN'
                    ? 'Tindak lanjut ringan direkomendasikan.'
                    : session.tindakLanjutKS === 'PERLU_PENDAMPINGAN'
                    ? 'Guru memerlukan pendampingan lanjutan.'
                    : session.tindakLanjutKS === 'PERLU_SUPERVISI_LANJUTAN'
                    ? 'Perlu dijadwalkan supervisi lanjutan.'
                    : 'Belum ditentukan.'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
