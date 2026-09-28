import React, { useState } from 'react';
import { ScreenId, TeacherRecord, SupervisionSession } from '../types';
import { INITIAL_TEACHERS } from '../data/mockData';
import { formatWitaDateTime } from '../lib/time';

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

const TINDAK_LANJUT_LABEL: Record<string, string> = {
  TIDAK_ADA_TINDAK_LANJUT: 'Tidak ada tindak lanjut khusus yang diperlukan.',
  TINDAK_LANJUT_RINGAN: 'Tindak lanjut ringan direkomendasikan.',
  PERLU_PENDAMPINGAN: 'Guru memerlukan pendampingan lanjutan.',
  PERLU_SUPERVISI_LANJUTAN: 'Perlu dijadwalkan supervisi lanjutan.',
};

const REFLECTION_QUESTIONS: { key: keyof SupervisionSession; label: string }[] = [
  { key: 'reflection1', label: '1. Apa hal positif yang dirasakan dari proses pembelajaran hari ini?' },
  { key: 'reflection2', label: '2. Bagian pembelajaran apa yang sudah berjalan baik?' },
  { key: 'reflection3', label: '3. Hal apa yang perlu diperbaiki?' },
  { key: 'reflection4', label: '4. Mengapa bagian tersebut perlu diperbaiki?' },
  { key: 'reflection5', label: '5. Apa rencana perbaikannya?' },
  { key: 'reflection6', label: '6. Dukungan apa yang diperlukan?' },
];

const QualCard: React.FC<{ icon: string; color: string; title: string; text?: string; placeholder: string }> = ({
  icon,
  color,
  title,
  text,
  placeholder,
}) => (
  <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3 print:break-inside-avoid">
    <h3 className={`text-xs font-bold ${color} uppercase tracking-wide flex items-center gap-1.5`}>
      <span className="material-symbols-outlined text-sm print:hidden">{icon}</span>
      {title}
    </h3>
    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{text || placeholder}</p>
  </div>
);

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
  const isFinished = session?.status === 'SELESAI';

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

  const hasAnyReflection = session
    ? REFLECTION_QUESTIONS.some((q) => (session[q.key] as string | undefined)?.trim())
    : false;
  const hasPenguatanKS = session && (session.penguatanKS || session.catatanKhususKS || session.rekomendasiKS);
  const hasTelaah17 = session && (session.kelebihan15 || session.kekurangan16 || session.rekomendasi17);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] print:bg-white print:pb-0">
      {/* Breadcrumb — screen only */}
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-8 print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="text-slate-400">Ruang Supervisi</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-teal-800">Laporan Hasil Supervisi per Guru</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6 print:px-0 print:py-0 print:max-w-none print:space-y-4">
        {/* Print-only letterhead */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-slate-800 pb-3 mb-2">
          <div>
            <p className="text-sm font-extrabold">UPT SPF SDN Percontohan PAM Makassar</p>
            <p className="text-xs">Laporan Hasil Supervisi Klinis Pendidik</p>
          </div>
          <p className="text-[10px] text-slate-500">Dicetak: {formatWitaDateTime()}</p>
        </div>

        {/* Banner — screen only */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-md print:hidden">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#6ffbbe] ring-2 ring-white/15 shrink-0">
              <span className="material-symbols-outlined text-2xl">insights</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Laporan Hasil Supervisi per Guru</h1>
              <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                Ringkasan visual hasil observasi klinis, skor penilaian, refleksi guru, dan catatan penguatan kepala
                sekolah untuk setiap guru.
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Pilih Guru + Unduh PDF — screen only */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1.5 flex-1">
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
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!session || !isFinished}
              title={
                !session
                  ? 'Belum ada data supervisi untuk guru ini'
                  : !isFinished
                  ? 'Laporan bisa diunduh setelah siklus supervisi berstatus Selesai'
                  : 'Unduh laporan sebagai PDF'
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              Unduh PDF
            </button>
          </div>
          {session && !isFinished && (
            <p className="text-[11px] text-amber-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              Siklus supervisi guru ini belum berstatus "Selesai" ({session.status}) — unduh laporan diaktifkan
              setelah Kepala Sekolah menuntaskan siklus supervisi.
            </p>
          )}
        </div>

        {!teacher || !session ? (
          <div className="text-center p-10 border border-dashed border-slate-200 bg-slate-50 rounded-2xl print:hidden">
            <span className="material-symbols-outlined text-slate-400 text-3xl mb-1 block">description</span>
            <p className="text-xs text-slate-500 font-bold">
              Belum ada data hasil supervisi untuk guru ini.
            </p>
          </div>
        ) : (
          <>
            {/* Teacher Identity + Verdict */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 print:border print:rounded-xl print:break-inside-avoid">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {teacher.avatar ? (
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-teal-600/30 print:hidden"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 font-bold text-lg print:hidden">
                      {teacher.initials}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{teacher.name}</h2>
                    <p className="text-xs text-slate-500">NIP. {teacher.nip}</p>
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
              {/* Session metadata */}
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Mata Pelajaran</p>
                  <p className="font-semibold text-slate-800">{session.mapel || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Kelas</p>
                  <p className="font-semibold text-slate-800">{session.kelas || '-'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Tanggal & Jam</p>
                  <p className="font-semibold text-slate-800">
                    {session.tanggal || '-'} {session.jam ? `• ${session.jam}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Supervisor</p>
                  <p className="font-semibold text-slate-800">{session.supervisor || '-'}</p>
                </div>
              </div>
            </div>

            {/* Score Summary + Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:gap-3">
              <div className="lg:col-span-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col items-center justify-center gap-3 print:border print:rounded-xl print:break-inside-avoid">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide self-start">
                  Skor Observasi Kelas
                </h3>
                <svg width="140" height="140" viewBox="0 0 100 100" className="-rotate-90 print:w-24 print:h-24">
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
                <div className="-mt-24 mb-16 text-center print:-mt-16 print:mb-8">
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
              <div className="lg:col-span-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3 print:border print:rounded-xl print:break-inside-avoid">
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
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-3 print:border print:rounded-xl print:break-inside-avoid">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Skor Telaah Perangkat Ajar (Instrumen 17 Aspek)
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden print:hidden">
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

            {/* Telaah Perangkat Ajar — catatan kualitatif 15-17 */}
            {hasTelaah17 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-3">
                <QualCard
                  icon="checklist"
                  color="text-teal-800"
                  title="15. Kelebihan Perencanaan Pembelajaran"
                  text={session.kelebihan15}
                  placeholder="Belum ada catatan."
                />
                <QualCard
                  icon="edit_note"
                  color="text-amber-800"
                  title="16. Perlu Ditingkatkan dari Perencanaan"
                  text={session.kekurangan16}
                  placeholder="Belum ada catatan."
                />
                <QualCard
                  icon="lightbulb"
                  color="text-indigo-800"
                  title="17. Rekomendasi Perencanaan Pembelajaran"
                  text={session.rekomendasi17}
                  placeholder="Belum ada catatan."
                />
              </div>
            )}

            {/* Refleksi Diri Guru (6 Pertanyaan) */}
            {hasAnyReflection && (
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4 print:border print:rounded-xl print:break-inside-avoid">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm print:hidden">psychology_alt</span>
                  Refleksi Diri Guru (Dialog Reflektif Pasca-Observasi)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {REFLECTION_QUESTIONS.map((q) => (
                    <div key={q.key} className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-700">{q.label}</p>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {(session[q.key] as string | undefined)?.trim() || 'Belum diisi.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Catatan Kualitatif Observasi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-3">
              <QualCard
                icon="thumb_up"
                color="text-emerald-800"
                title="Apresiasi Observer"
                text={session.apresiasiObs}
                placeholder="Belum ada catatan apresiasi."
              />
              <QualCard
                icon="search_insights"
                color="text-amber-800"
                title="Temuan Observasi"
                text={session.temuanObs}
                placeholder="Belum ada catatan temuan."
              />
              <QualCard
                icon="handshake"
                color="text-teal-800"
                title="Komitmen Guru"
                text={session.komitmenGuruNew}
                placeholder="Belum ada komitmen tindak lanjut dari guru."
              />
              <QualCard
                icon="flag"
                color="text-slate-700"
                title="Status Tindak Lanjut"
                text={TINDAK_LANJUT_LABEL[session.tindakLanjutKS] || 'Belum ditentukan.'}
                placeholder="Belum ditentukan."
              />
            </div>

            {/* Penguatan & Rekomendasi Kepala Sekolah */}
            {hasPenguatanKS && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-3">
                <QualCard
                  icon="military_tech"
                  color="text-teal-900"
                  title="Penguatan Kepala Sekolah"
                  text={session.penguatanKS}
                  placeholder="Belum ada catatan penguatan."
                />
                <QualCard
                  icon="priority_high"
                  color="text-rose-800"
                  title="Catatan Khusus"
                  text={session.catatanKhususKS}
                  placeholder="Tidak ada catatan khusus."
                />
                <QualCard
                  icon="assignment_turned_in"
                  color="text-indigo-900"
                  title="Rekomendasi Tindak Lanjut"
                  text={session.rekomendasiKS}
                  placeholder="Belum ada rekomendasi."
                />
              </div>
            )}

            {/* Print-only signature block */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-10 text-xs">
              <div className="text-center space-y-16">
                <p>Guru yang Disupervisi,</p>
                <p className="font-bold border-t border-slate-800 pt-1 inline-block px-6">{teacher.name}</p>
              </div>
              <div className="text-center space-y-16">
                <p>Kepala Sekolah / Supervisor,</p>
                <p className="font-bold border-t border-slate-800 pt-1 inline-block px-6">{session.supervisor || '-'}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
