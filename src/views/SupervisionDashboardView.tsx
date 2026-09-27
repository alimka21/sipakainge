import React, { useState } from 'react';
import { ScreenId, TeacherRecord } from '../types';
import { INITIAL_TEACHERS, APP_ASSETS } from '../data/mockData';

interface SupervisionDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectTeacherForObservation: (teacherId: string) => void;
  onOpenScheduleModal: () => void;
  searchQuery: string;
}

export const SupervisionDashboardView: React.FC<SupervisionDashboardViewProps> = ({
  onNavigate,
  onSelectTeacherForObservation,
  onOpenScheduleModal,
  searchQuery,
}) => {
  const [selectedFase, setSelectedFase] = useState<'all' | 'fase-a' | 'fase-b' | 'fase-c'>('all');
  const [selectedStage, setSelectedStage] = useState<'all' | 'pra' | 'telaah' | 'observasi' | 'refleksi' | 'tuntas'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const effectiveSearch = (searchQuery || localSearch).toLowerCase();

  const filteredTeachers = INITIAL_TEACHERS.filter((t) => {
    const matchFase = selectedFase === 'all' || t.fase === selectedFase;
    const matchStage = selectedStage === 'all' || t.stage === selectedStage;
    const matchSearch =
      !effectiveSearch ||
      t.name.toLowerCase().includes(effectiveSearch) ||
      t.nip.toLowerCase().includes(effectiveSearch) ||
      t.subject.toLowerCase().includes(effectiveSearch) ||
      t.rombel.toLowerCase().includes(effectiveSearch);

    return matchFase && matchStage && matchSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-medium">
          <span className="material-symbols-outlined text-[#6ffbbe] text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Title & Quick Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5eeff] text-[#0b1c30]">
            <span className="w-2 h-2 rounded-full bg-[#00685f] animate-ping"></span>
            <span className="text-xs uppercase tracking-wider text-[#00685f] font-bold">
              Portal Supervisi Akademik Guru
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-xs text-slate-600">Siklus Genap 2025/2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
            Dashboard Pengamat & Supervisi Akademik
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Sistem Pembelajaran Kolaboratif Berbasis Data, Asesmen, Refleksi dan Transformasi — UPT SPF SDN Percontohan
            PAM Kota Makassar
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <div className="inline-flex items-center bg-white px-3.5 py-2 rounded-xl shadow-sm gap-2 text-slate-600 border border-slate-200/80">
            <span className="material-symbols-outlined text-base text-[#00685f]">calendar_today</span>
            <span className="text-xs font-semibold text-slate-800">Kamis, 20 Maret 2026</span>
          </div>

          <button
            type="button"
            onClick={() => triggerToast('Filter Periode / Rombel disetel ke Semester Genap')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#dce9ff] hover:bg-[#d3e4fe] text-slate-800 text-xs font-semibold transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base text-slate-600">filter_list</span>
            <span>Filter Periode / Rombel</span>
          </button>

          <button
            type="button"
            onClick={onOpenScheduleModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold transition-all shadow-sm transform hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ Jadwalkan Supervisi Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Jadwal Hari Ini</span>
            <div className="w-8 h-8 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                co_present
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">2</span>
            <span className="text-xs text-slate-500">Sesi Kelas</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6ffbbe] text-[#002113]">
              Tepat Waktu
            </span>
            <span className="text-[11px] text-slate-500">Fase B & C</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Menunggu Telaah</span>
            <div className="w-8 h-8 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#4b41e1]">
              <span className="material-symbols-outlined text-base">menu_book</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">3</span>
            <span className="text-xs text-slate-500">Modul Ajar</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-xs text-[#ba1a1a]">priority_high</span>
            <span className="text-[11px] text-[#ba1a1a] font-medium">1 Perlu revisi TP</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Sedang Berjalan</span>
            <div className="w-8 h-8 rounded-full bg-[#6ffbbe] flex items-center justify-center text-[#006947]">
              <span className="material-symbols-outlined text-base animate-pulse">live_tv</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">1</span>
            <span className="text-xs text-slate-500">Kelas Aktif</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#00855b] animate-ping"></span>
            <span className="text-[11px] text-[#006947] font-semibold">Kelas IV-A (Ruang 4)</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#00855b] h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Menunggu Refleksi</span>
            <div className="w-8 h-8 rounded-full bg-[#dce9ff] flex items-center justify-center text-slate-800">
              <span className="material-symbols-outlined text-base">record_voice_over</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">4</span>
            <span className="text-xs text-slate-500">Pendidik</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-xs text-[#00685f]">schedule</span>
            <span className="text-[11px] text-slate-600">Batas 48 Jam observasi</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#6bd8cb] h-full rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>

        {/* KPI 5: Annual Progress */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Capaian Tahunan</span>
            <div className="w-8 h-8 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-base">pie_chart</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#00685f] tabular-nums">70.4%</span>
            <span className="text-xs text-slate-500 font-medium">(38/54 Guru)</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-xs text-[#006947]">trending_up</span>
            <span className="text-[11px] text-[#006947] font-medium">+12% vs Semester Lalu</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: '70.4%' }}></div>
          </div>
        </div>
      </div>

      {/* Section 2: Antrean Observasi & Telaah Hari Ini */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#00685f] rounded-full"></div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">Antrean Observasi & Telaah Hari Ini</h2>
              <p className="text-xs text-slate-500">
                Prioritas kehadiran langsung pengamat di ruang pembelajaran dan validasi dokumen pra-observasi
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#eff4ff] text-slate-600 font-medium">
            3 Tindakan Menunggu Eksekusi
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue Card 1: Ibu Siti Aminah */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between relative group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#00685f] rounded-t-2xl"></div>
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00855b] animate-ping"></span>
                  08:00 - 09:15 WITA
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#eff4ff] text-slate-600 font-medium">
                  Sesi 1
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-[#00685f]/20"
                  alt="Ibu Siti Aminah"
                  src={APP_ASSETS.sitiAminahAvatar}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Ibu Siti Aminah, S.Pd.</h3>
                  <p className="text-[11px] text-slate-400">NIP. 19840212 200801 2 018</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#dce9ff] text-slate-800 font-medium">
                      Kelas IV-A
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-[#00685f] font-semibold">Fase B</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#eff4ff] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mata Pelajaran & Topik</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] font-semibold">
                    RPP Disetujui
                  </span>
                </div>
                <p className="text-xs text-slate-900 font-bold">IPAS: Ekosistem & Fotosintesis Tumbuhan</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Fokus Observasi: Diferensiasi konten & asesmen formatif lembar observasi anak.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectTeacherForObservation('t-1');
                  onNavigate('observation_form');
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-base">play_arrow</span>
                <span>Mulai Observasi Kelas</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Membuka ringkasan Modul Ajar IPAS Kelas IV-A')}
                className="p-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-600 transition-colors"
                title="Lihat Panduan & Modul"
              >
                <span className="material-symbols-outlined text-base">description</span>
              </button>
            </div>
          </div>

          {/* Queue Card 2: Bpk. Bambang Irawan */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between relative group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#ba1a1a] rounded-t-2xl"></div>
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#eff4ff] text-slate-800 text-xs font-semibold">
                  <span className="material-symbols-outlined text-xs text-slate-400">schedule</span>
                  10:00 - 11:15 WITA
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#eff4ff] text-slate-600 font-medium">
                  Sesi 2
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-slate-200"
                  alt="Bpk. Bambang Irawan"
                  src={APP_ASSETS.bambangIrawanAvatar}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Bpk. Bambang Irawan, S.Pd.</h3>
                  <p className="text-[11px] text-slate-400">NIP. 19790615 200501 1 009</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#dce9ff] text-slate-800 font-medium">
                      Kelas V-B
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-[#4b41e1] font-semibold">Fase C</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#eff4ff] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mata Pelajaran & Topik</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-semibold">
                    Perlu Revisi TP
                  </span>
                </div>
                <p className="text-xs text-slate-900 font-bold">Matematika: Operasi Pecahan & Desimal</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Catatan Review: Alat peraga konkret belum dicantumkan dalam lembar kerja siswa.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerToast('Membuka Telaah RPP & Catatan Revisi Bpk. Bambang')}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white text-[#00685f] hover:bg-[#eff4ff] border border-[#00685f]/30 text-xs font-bold transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-base">rate_review</span>
                <span>Buka Telaah RPP & Catatan</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Pengingat WhatsApp terkirim ke Bpk. Bambang')}
                className="p-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-600 transition-colors"
                title="Kirim Pengingat WhatsApp"
              >
                <span className="material-symbols-outlined text-base">chat</span>
              </button>
            </div>
          </div>

          {/* Queue Card 3: Ibu Nur Aisyah */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between relative group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4b41e1] rounded-t-2xl"></div>
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#eff4ff] text-slate-800 text-xs font-semibold">
                  <span className="material-symbols-outlined text-xs text-slate-400">schedule</span>
                  13:00 - 14:00 WITA
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-[#eff4ff] text-slate-600 font-medium">
                  Sesi 3
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-slate-200"
                  alt="Ibu Nur Aisyah"
                  src={APP_ASSETS.nurAisyahAvatar}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Ibu Nur Aisyah, S.Pd.</h3>
                  <p className="text-[11px] text-slate-400">NIP. 19910408 201903 2 011</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#dce9ff] text-slate-800 font-medium">
                      Kelas III-A
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-[#00685f] font-semibold">Fase B</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#eff4ff] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mata Pelajaran & Topik</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#3323cc] font-semibold">
                    Menunggu Review
                  </span>
                </div>
                <p className="text-xs text-slate-900 font-bold">Bahasa Indonesia: Teks Deskripsi Lingkungan</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Modul diunggah kemarin pukul 16:40 WITA. Menunggu persetujuan observer.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerToast('Form review Modul Ajar Bahasa Indonesia dibuka')}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#dce9ff] hover:bg-[#d3e4fe] text-slate-900 text-xs font-bold transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-base text-[#00685f]">fact_check</span>
                <span>Review Modul Ajar</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Modul Ajar PDF Ibu Nur Aisyah sedang diunduh...')}
                className="p-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-600 transition-colors"
                title="Unduh Modul PDF"
              >
                <span className="material-symbols-outlined text-base">download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: 5 Tahapan Supervisi Siklus Reflektif */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Pipeline Siklus Observasi</span>
            <h2 className="text-lg font-bold text-[#0b1c30]">5 Tahapan Supervisi Siklus Reflektif</h2>
          </div>
          <p className="text-xs text-slate-500">Klik tahapan untuk memfilter tabel guru di bawah</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setSelectedStage(selectedStage === 'pra' ? 'all' : 'pra')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              selectedStage === 'pra'
                ? 'bg-[#008378] text-white shadow-md border-transparent'
                : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  selectedStage === 'pra' ? 'bg-white text-[#00685f]' : 'bg-[#d3e4fe] text-slate-700'
                }`}
              >
                1
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/30 text-current font-semibold">
                10 Guru
              </span>
            </div>
            <span className="mt-2 text-xs font-bold">Pra-Observasi & Jadwal</span>
            <span className="text-[11px] opacity-80">Penyepakatan rubrik fokus</span>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => setSelectedStage(selectedStage === 'telaah' ? 'all' : 'telaah')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              selectedStage === 'telaah'
                ? 'bg-[#008378] text-white shadow-md border-transparent'
                : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  selectedStage === 'telaah' ? 'bg-white text-[#00685f]' : 'bg-[#e2dfff] text-[#3323cc]'
                }`}
              >
                2
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/30 text-current font-semibold">
                6 Guru
              </span>
            </div>
            <span className="mt-2 text-xs font-bold">Telaah RPP / Modul</span>
            <span className="text-[11px] opacity-80">Verifikasi rubrik & media</span>
          </button>

          {/* Step 3 (Active highlight default) */}
          <button
            type="button"
            onClick={() => setSelectedStage(selectedStage === 'observasi' ? 'all' : 'observasi')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              selectedStage === 'observasi'
                ? 'bg-[#008378] text-white shadow-md border-transparent'
                : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  selectedStage === 'observasi' ? 'bg-white text-[#00685f]' : 'bg-[#6ffbbe] text-[#002113]'
                }`}
              >
                3
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/30 text-current font-semibold">
                2 Hari Ini
              </span>
            </div>
            <span className="mt-2 text-xs font-bold">Observasi Kelas</span>
            <span className="text-[11px] opacity-80">Pengamatan interaksi murid</span>
          </button>

          {/* Step 4 */}
          <button
            type="button"
            onClick={() => setSelectedStage(selectedStage === 'refleksi' ? 'all' : 'refleksi')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              selectedStage === 'refleksi'
                ? 'bg-[#008378] text-white shadow-md border-transparent'
                : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  selectedStage === 'refleksi' ? 'bg-white text-[#00685f]' : 'bg-[#d3e4fe] text-slate-700'
                }`}
              >
                4
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/30 text-current font-semibold">
                4 Guru
              </span>
            </div>
            <span className="mt-2 text-xs font-bold">Refleksi & Umpan Balik</span>
            <span className="text-[11px] opacity-80">Diskusi pasca-observasi</span>
          </button>

          {/* Step 5 */}
          <button
            type="button"
            onClick={() => setSelectedStage(selectedStage === 'tuntas' ? 'all' : 'tuntas')}
            className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
              selectedStage === 'tuntas'
                ? 'bg-[#008378] text-white shadow-md border-transparent'
                : 'bg-[#eff4ff] hover:bg-[#e5eeff] text-slate-800 border-transparent'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  selectedStage === 'tuntas' ? 'bg-white text-[#00685f]' : 'bg-[#6ffbbe] text-[#002113]'
                }`}
              >
                5
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/30 text-current font-semibold">
                32 Tuntas
              </span>
            </div>
            <span className="mt-2 text-xs font-bold">Rencana Tindak Lanjut</span>
            <span className="text-[11px] opacity-80">Transformasi praktik kelas</span>
          </button>
        </div>
      </div>

      {/* Section 4: Daftar Guru dalam Siklus Supervisi (Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#0b1c30]">Daftar Guru dalam Siklus Supervisi</h2>
            <p className="text-xs text-slate-500">
              Kelola status observasi, telaah rubrik instrumen, dan cetak berita acara resmi sekolah
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Fase Tabs */}
            <div className="flex items-center bg-[#eff4ff] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setSelectedFase('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFase === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Fase
              </button>
              <button
                type="button"
                onClick={() => setSelectedFase('fase-a')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFase === 'fase-a'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fase A (Kls 1-2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFase('fase-b')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFase === 'fase-b'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fase B (Kls 3-4)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFase('fase-c')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFase === 'fase-c'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fase C (Kls 5-6)
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-60">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama guru / NIP..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-[#eff4ff] pl-9 pr-3 py-2 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#00685f] border border-transparent transition-all"
              />
            </div>

            {/* Export Report */}
            <button
              type="button"
              onClick={() => triggerToast('Ekspor Rekap Supervisi Excel berhasil diunduh.')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 text-xs font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#00685f]">download</span>
              <span>Rekap Excel</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#eff4ff] text-slate-600 border-b border-slate-100">
                <th className="py-3 px-4 uppercase tracking-wider font-semibold rounded-l-xl">Pendidik & Profil</th>
                <th className="py-3 px-4 uppercase tracking-wider font-semibold">Rombel / Mapel</th>
                <th className="py-3 px-4 uppercase tracking-wider font-semibold">Jadwal Target</th>
                <th className="py-3 px-4 uppercase tracking-wider font-semibold">Fokus Supervisi</th>
                <th className="py-3 px-4 uppercase tracking-wider font-semibold">Status Tahapan</th>
                <th className="py-3 px-4 uppercase tracking-wider font-semibold text-right rounded-r-xl">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-[#eff4ff]/50 transition-colors group">
                  {/* Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {t.avatar ? (
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#00685f]/10 text-[#00685f] flex items-center justify-center font-bold text-xs">
                          {t.initials}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{t.name}</span>
                        <span className="text-[11px] text-slate-400">{t.nip}</span>
                      </div>
                    </div>
                  </td>

                  {/* Rombel & Subject */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{t.rombel}</span>
                    <span className="text-[11px] text-slate-500">{t.subject}</span>
                  </td>

                  {/* Schedule */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block">{t.targetSchedule}</span>
                    <span
                      className={`text-[11px] font-medium ${
                        t.stageBadgeType === 'error'
                          ? 'text-[#ba1a1a]'
                          : t.stageBadgeType === 'tertiary'
                          ? 'text-[#006947]'
                          : 'text-slate-500'
                      }`}
                    >
                      {t.scheduleTime}
                    </span>
                  </td>

                  {/* Focus */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eff4ff] text-slate-700">
                      {t.focusSupervision}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-1">{t.focusSupervisionDesc}</p>
                  </td>

                  {/* Stage Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        t.stageBadgeType === 'tertiary'
                          ? 'bg-[#6ffbbe] text-[#002113]'
                          : t.stageBadgeType === 'error'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : t.stageBadgeType === 'secondary'
                          ? 'bg-[#e2dfff] text-[#3323cc]'
                          : 'bg-[#eff4ff] text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.stageBadgeType === 'tertiary'
                            ? 'bg-[#00855b]'
                            : t.stageBadgeType === 'error'
                            ? 'bg-[#ba1a1a]'
                            : t.stageBadgeType === 'secondary'
                            ? 'bg-[#4b41e1]'
                            : 'bg-slate-400'
                        }`}
                      ></span>
                      {t.stageBadgeText}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {t.id === 't-1' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTeacherForObservation('t-1');
                              onNavigate('observation_form');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            Instrumen
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast('Membuka folder RPP Ibu Siti Aminah')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                            title="Lihat RPP"
                          >
                            <span className="material-symbols-outlined text-base">folder_open</span>
                          </button>
                        </>
                      ) : t.id === 't-2' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => triggerToast('Buka catatan Telaah RPP Bpk. Bambang')}
                            className="px-3 py-1.5 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-slate-800 font-semibold text-xs transition-colors"
                          >
                            Telaah RPP
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast('Riwayat catatan telaah ditampilkan')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                            title="Riwayat Catatan"
                          >
                            <span className="material-symbols-outlined text-base">history_edu</span>
                          </button>
                        </>
                      ) : t.id === 't-3' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onNavigate('follow_up_plan')}
                            className="px-3 py-1.5 rounded-lg bg-[#4b41e1] hover:bg-[#645efb] text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            Sesi Refleksi
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast('Mencetak lembar berita acara supervisi...')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                            title="Cetak Berita Acara"
                          >
                            <span className="material-symbols-outlined text-base">print</span>
                          </button>
                        </>
                      ) : t.id === 't-5' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onNavigate('follow_up_plan')}
                            className="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 font-semibold text-xs transition-colors"
                          >
                            Lihat Rapor
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast('Berita acara resmi terverifikasi dinas')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                            title="Verifikasi Resmi"
                          >
                            <span className="material-symbols-outlined text-base text-[#006947]">verified</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => triggerToast(`Validasi berkas ${t.name}`)}
                            className="px-3 py-1.5 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-slate-800 font-semibold text-xs transition-colors"
                          >
                            Validasi RPP
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast(`Mengunduh berkas ${t.name}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                            title="Unduh Berkas"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend & Pagination Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center flex-wrap gap-4 text-slate-600">
            <span className="font-semibold text-slate-400">Legenda Indikator:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00855b]"></span>
              <span>Tuntas / Disetujui</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4b41e1]"></span>
              <span>Menunggu Refleksi / Telaah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
              <span>Perlu Revisi Guru</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 mr-2">Menampilkan {filteredTeachers.length} dari 54 Pendidik</span>
            <button
              type="button"
              disabled
              className="p-1 rounded bg-slate-100 text-slate-400 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <span className="px-2.5 py-0.5 rounded bg-[#00685f] text-white font-bold text-xs">1</span>
            <button type="button" className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-600">
              2
            </button>
            <button type="button" className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-600">
              3
            </button>
            <button type="button" className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200">
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Observational Reminder Banner */}
      <div className="p-6 rounded-2xl bg-[#dce9ff]/60 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00685f] text-white flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-2xl">psychology_alt</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Prinsip Supervisi SIPAKAINGE SDN Percontohan PAM</h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mt-0.5">
              "Sipakainge, Sipakalebbi, Sipakatau" — Supervisi akademik bukan untuk menghakimi atau mencari kesalahan,
              melainkan wadah reflektif pendidik untuk bertumbuh dan memfasilitasi kebutuhan murid secara humanis.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => triggerToast('Membuka Panduan Rubrik 2026')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#00685f] text-xs font-semibold shadow-sm border border-slate-200 shrink-0"
        >
          Pelajari Panduan Rubrik 2026
        </button>
      </div>
    </div>
  );
};
