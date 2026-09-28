import React, { useState } from 'react';
import { ScreenId, MuridRecord, RombelRecord, TeacherRecord } from '../types';
import { HABIT_LIST, INITIAL_MURID, INITIAL_ROMBEL, INITIAL_TEACHERS } from '../data/mockData';
import { getGuruClass, getVisibleMurid, getWaliKelasName } from '../lib/access';
import { formatWitaDateTime } from '../lib/time';

interface ParentPortfolioViewProps {
  onNavigate: (screen: ScreenId) => void;
  onDownloadReport: () => void;
  userRole?: string;
  muridList?: MuridRecord[];
  parentMuridId?: string;
  rombelList?: RombelRecord[];
  guruId?: string;
  teacherList?: TeacherRecord[];
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
          trend: 'Live • Input Guru',
        };
      })
    : [];

  const academicSubjects = [
    ...activeAcademics,
    {
      code: 'IPAS',
      name: 'Ilmu Pengetahuan Alam & Sosial',
      score: 94,
      predicate: 'Amat Baik',
      desc: 'Sangat menguasai pemahaman ekosistem, rantai makanan, fotosintesis, serta berinisiatif aktif saat observasi lingkungan sekolah.',
      trend: '+4 poin dari STS',
    },
    {
      code: 'BIN',
      name: 'Bahasa Indonesia',
      score: 90,
      predicate: 'Amat Baik',
      desc: 'Mampu menyusun teks laporan observasi dengan runtut, artikulatif, dan kaya kosakata kearifan lokal.',
      trend: '+2 poin',
    },
    {
      code: 'MTK',
      name: 'Matematika Operasional',
      score: 88,
      predicate: 'Baik',
      desc: 'Memahami konsep pecahan senilai dan operasi hitung dasar desimal. Perlu sedikit latihan ketelitian soal cerita bertingkat.',
      trend: '+5 poin',
    },
    {
      code: 'PPKN',
      name: 'Pendidikan Pancasila',
      score: 96,
      predicate: 'Amat Baik',
      desc: 'Menjadi teladan dalam musyawarah kelas, menghargai keberagaman, dan aktif bergotong royong.',
      trend: '+1 poin',
    },
    {
      code: 'SBdP',
      name: 'Seni Rupa & Prakarya',
      score: 92,
      predicate: 'Amat Baik',
      desc: 'Kreatif memvisualisasikan kampanye lingkungan, pemilihan warna harmonis dan kerapian detail sangat tinggi.',
      trend: '+3 poin',
    },
    {
      code: 'PJOK',
      name: 'Pendidikan Jasmani & Kesehatan',
      score: 86,
      predicate: 'Baik',
      desc: 'Kebugaran fisik prima, sportivitas tim tinggi. Didorong untuk konsisten berolahraga teratur di hari libur.',
      trend: 'Stabil',
    },
  ];

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

  const artifacts = [
    ...activeArtifacts,
    {
      id: 'art-1',
      title: 'Poster Kampanye: "Hemat Air, Jaga Bumi Kita"',
      category: 'Proyek Seni & Lingkungan',
      date: '18 September 2025',
      icon: '🎨',
      description:
        'Karya poster visual perpaduan cat air dan krayon dalam rangka Pekan Peduli Air Bersih UPT SPF SDN Percontohan PAM.',
      appreciation: 'Dipilih menjadi poster utama di mading sekolah & bernilai 95 oleh Guru Seni.',
    },
    {
      id: 'art-2',
      title: 'Modul Percobaan Mini Fotosintesis Tumbuhan Hydrilla',
      category: 'Praktikum Sains Mandiri',
      date: '12 September 2025',
      icon: '🔬',
      description:
        'Eksperimen membuktikan produksi oksigen pada tumbuhan air saat terkena sinar matahari pagi di laboratorium sekolah.',
      appreciation: 'Dianugerahi presentasi terbaik dalam kelompok kerja Fase B.',
    },
  ];

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

  const awards = [
    ...activeAwards,
    {
      id: 'aw-1',
      title: 'Juara I Lomba Eksperimen Sains Cilik Tingkat Gugus III Makassar',
      organizer: 'Dinas Pendidikan Kota Makassar',
      date: 'Agustus 2025',
      level: 'Kota',
      badge: 'gold',
    },
    {
      id: 'aw-2',
      title: 'Duta Pembiasaan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)',
      organizer: 'UPT SPF SDN Percontohan PAM Makassar',
      date: 'September 2025',
      level: 'Sekolah',
      badge: 'emerald',
    },
    {
      id: 'aw-3',
      title: 'Penghargaan Murid Terdisiplin & Gotong Royong Semester Ganjil',
      organizer: 'Wali Kelas IV-A',
      date: 'September 2025',
      level: 'Kelas',
      badge: 'blue',
    },
  ];

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
              <p className="text-sm font-extrabold">UPT SPF SDN Percontohan PAM Makassar</p>
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
                    <span
                      className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md ring-2 ring-white"
                      title="Terverifikasi Dapodik"
                    >
                      <span className="material-symbols-outlined text-lg">verified</span>
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 ring-1 ring-teal-600/20">
                        {activeMurid.rombel} • {activeMurid.fase === 'fase-c' ? 'Fase C' : 'Fase B'}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/20">
                        Dapodik Terverifikasi RI
                      </span>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-600/20">
                        Tahun Ajaran 2026/2027
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
                        <span className="font-semibold text-slate-400 block">Tempat, Tgl Lahir:</span>
                        <span className="font-bold text-slate-700">
                          {activeMurid.id === 'm-4a-2' ? 'Makassar, 22 April 2015' : 'Makassar, 14 Mei 2015'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Wali Kelas:</span>
                        <span className="font-bold text-slate-700">
                          {getWaliKelasName(activeMurid.rombel, rombelList, teacherList)}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Sekolah:</span>
                        <span className="font-bold text-slate-700">SD Percontohan PAM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Holistic Stats */}
                <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                  <div className="flex items-center gap-3 rounded-2xl bg-teal-50/70 p-3.5 ring-1 ring-teal-600/10">
                    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-teal-700 px-2 text-sm font-bold text-white whitespace-nowrap">
                      {activeMurid.id === 'm-4a-2' ? '94.8' : '92.2'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-teal-900">Rerata Nilai Rapor</p>
                      <p className="text-[11px] text-teal-700">Predikat: Amat Baik (A)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/70 p-3.5 ring-1 ring-emerald-600/10">
                    <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-emerald-700 px-2 text-sm font-bold text-white whitespace-nowrap">
                      {activeMurid.id === 'm-4a-2' ? '100%' : '94.6%'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">7 KAIH Anak</p>
                      <p className="text-[11px] text-emerald-700">Tingkat Konsistensi</p>
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
                    {activeMurid.id === 'm-4a-2' ? (
                      `"Andi Siti Nurhaliza menunjukkan minat yang sangat kuat pada bidang sosial dan bahasa. Ia sangat disiplin, sopan (menerapkan nilai Sipakatau), dan selalu menyelesaikan seluruh pembiasaan karakter dengan konsisten baik di rumah maupun di sekolah."`
                    ) : (
                      `"Ahmad adalah teladan dalam rasa ingin tahu dan keberanian bereksplorasi sains. Ia memiliki kecerdasan sosial yang tinggi dalam memimpin diskusi kelompok, berempati terhadap teman sebaya, serta menunjukkan kedisiplinan beribadah dan gemar membaca yang sangat konsisten baik di kelas maupun di rumah."`
                    )}
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
            {/* Left: SVG Radar Heptagon (7 Sisi) */}
            <div className="lg:col-span-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-700">hub</span>
                    Heptagon Radar 7 KAIH
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visualisasi keseimbangan karakter berdasarkan pembiasaan 30 hari terakhir
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                  Rerata 92%
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
                  <polygon
                    points="160,42 265,82 280,188 205,270 108,272 38,188 56,80"
                    fill="rgba(13, 148, 136, 0.25)"
                    stroke="#0f766e"
                    strokeWidth="3"
                  />

                  {/* Data points */}
                  <circle cx="160" cy="42" r="5" fill="#0f766e" />
                  <circle cx="265" cy="82" r="5" fill="#0f766e" />
                  <circle cx="280" cy="188" r="5" fill="#0f766e" />
                  <circle cx="205" cy="270" r="5" fill="#0f766e" />
                  <circle cx="108" cy="272" r="5" fill="#0f766e" />
                  <circle cx="38" cy="188" r="5" fill="#0f766e" />
                  <circle cx="56" cy="80" r="5" fill="#0f766e" />

                  {/* Labels */}
                  <text x="160" y="20" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                    1. Bangun Pagi (96%)
                  </text>
                  <text x="280" y="70" textAnchor="start" className="text-[10px] font-bold fill-slate-700">
                    2. Beribadah (98%)
                  </text>
                  <text x="305" y="195" textAnchor="start" className="text-[10px] font-bold fill-amber-700">
                    3. Olahraga (75%)
                  </text>
                  <text x="225" y="305" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                    4. Makan Sehat (91%)
                  </text>
                  <text x="95" y="305" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">
                    5. Gemar Membaca (88%)
                  </text>
                  <text x="15" y="195" textAnchor="end" className="text-[10px] font-bold fill-slate-700">
                    6. Santun & Membantu (94%)
                  </text>
                  <text x="35" y="70" textAnchor="end" className="text-[10px] font-bold fill-amber-700">
                    7. Tidur Tepat (72%)
                  </text>
                </svg>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Nilai tertinggi pada aspek <span className="font-bold text-teal-800">Beribadah (98%)</span> dan{' '}
                  <span className="font-bold text-teal-800">Bangun Pagi (96%)</span>.
                </p>
              </div>
            </div>

            {/* Right: Dimension Breakdown & Recommendations */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700">lightbulb</span>
                  Rekomendasi Kolaborasi Rumah & Sekolah
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Disusun oleh Guru Kelas & Guru BK untuk mengoptimalkan potensi anak
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
                    <div className="flex items-center gap-2 text-teal-900">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      <h4 className="text-xs font-bold">Kekuatan Utama yang Perlu Diapresiasi</h4>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Kemandirian ibadah dan kebiasaan membaca sangat membanggakan. Pertahankan dengan
                      memberi akses pada buku ensiklopedia tingkat lanjutan dan ajak Ahmad bercerita
                      kembali saat makan malam.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                    <div className="flex items-center gap-2 text-amber-900">
                      <span className="material-symbols-outlined text-lg">flag</span>
                      <h4 className="text-xs font-bold">Area Pendampingan Bersama</h4>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Jam tidur malam masih sering melampaui pukul 21.30 WITA akibat keasyikan membaca.
                      Disarankan menerapkan alarm "Gawai & Lampu Mati" pada 20.45 WITA agar durasi tidur
                      tetap minimal 8 jam untuk regenerasi fisik dan fokus belajar pagi.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex items-center gap-2 text-blue-900">
                      <span className="material-symbols-outlined text-lg">nature_people</span>
                      <h4 className="text-xs font-bold">Rencana Aktivitas Akhir Pekan</h4>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Jalan santai bersama di Pantai Losari atau CFD Sudirman untuk mendongkrak capaian
                      kebiasaan #3 (Olahraga & Aktivitas Fisik) dari 75% menjadi 90%.
                    </p>
                  </div>
                </div>
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
                            habit.complianceRate >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {habit.complianceRate}%
                        </span>
                      </div>

                      <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                        {habit.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status Capaian:</span>
                      <span className="font-bold text-teal-900">{habit.targetNote}</span>
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
                    Kurikulum Merdeka • Kelas IV-A Semester Ganjil 2025/2026
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                    Nilai Tertinggi: 96 (Pendidikan Pancasila)
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {academicSubjects.map((sub) => (
                  <div
                    key={sub.code}
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
                    Dokumentasi hasil karya otentik Ahmad dalam pembelajaran berbasis proyek (PjBL)
                  </p>
                </div>
                <button
                  onClick={() => showToast('Membuka formulir unggah dokumentasi karya mandiri...')}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  + Tambah Dokumentasi
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {artifacts.map((art) => (
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
                {awards.map((aw) => (
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
