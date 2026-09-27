import React, { useState } from 'react';
import { ScreenId } from '../types';
import { APP_ASSETS, INITIAL_TEACHERS } from '../data/mockData';

interface FollowUpPlanViewProps {
  onNavigate: (screen: ScreenId) => void;
  onDownloadReport: () => void;
  selectedTeacherId?: string;
  onSelectTeacherId?: (id: string) => void;
}

export const FollowUpPlanView: React.FC<FollowUpPlanViewProps> = ({
  onNavigate,
  onDownloadReport,
  selectedTeacherId: propSelectedTeacherId,
  onSelectTeacherId,
}) => {
  const [localTeacherId, setLocalTeacherId] = useState<string>('t-1');
  const selectedTeacherId = propSelectedTeacherId || localTeacherId;
  const setSelectedTeacherId = (id: string) => {
    if (onSelectTeacherId) onSelectTeacherId(id);
    setLocalTeacherId(id);
  };
  const currentTeacher =
    INITIAL_TEACHERS.find((t) => t.id === selectedTeacherId) || INITIAL_TEACHERS[0];

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="w-full pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      {showToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium">
          <span className="material-symbols-outlined text-[#6ffbbe] text-base">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-Navigation / Breadcrumb Bar */}
      <div className="w-full bg-[#eff4ff] px-6 lg:px-10 py-3 shadow-xs border-b border-slate-200/60">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-[#00685f] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">home</span> Beranda
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => onNavigate('supervision_dashboard')}
              className="hover:text-[#00685f] transition-colors"
            >
              Supervisi Guru
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[#00685f] font-semibold">Tindak Lanjut & Riwayat Pertumbuhan</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white text-slate-600 text-xs font-medium border border-slate-200">
              Fokus Penilaian: Kemitraan & Pertumbuhan Bebas Hukuman
            </span>
            <span className="px-3 py-1 rounded-full bg-[#6ffbbe] text-[#002113] text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00855b]"></span>
              Siklus Berkelanjutan Aktif
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        {/* ======================================================== */}
        {/* LANGKAH 1: PILIH GURU YANG DISUPERVISI (DROPDOWN)        */}
        {/* ======================================================== */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Langkah 1: Pilih Guru untuk Rencana Tindak Lanjut (RTL)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Siklus Kolaboratif Tanpa Penghakiman
            </span>
          </div>

          <div className="max-w-md">
            <label htmlFor="teacher-select" className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Nama Guru / Pendidik:
            </label>
            <select
              id="teacher-select"
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            >
              {INITIAL_TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (NIP: {t.nip}) — {t.rombel} [{t.subject}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Header Profile & Score Bento */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Profile Card (8 cols) */}
          <div className="xl:col-span-8 bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#89f5e7]/15 pointer-events-none blur-2xl"></div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-xs text-[#00685f] uppercase font-bold tracking-wider">
                    SIPAKAINGE Kemitraan Edukatif
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight mt-0.5">
                    Rencana Tindak Lanjut & Riwayat Supervisi Kolaboratif
                  </h1>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#6ffbbe] text-[#002113] text-xs font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                  Pengembangan Positif Tanpa Peringkat
                </span>
              </div>

              {/* Teacher Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#eff4ff] p-4 rounded-2xl border border-slate-200/60 mt-3">
                <div className="relative shrink-0">
                  <img
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-4 ring-white"
                    alt={currentTeacher.name}
                    src={currentTeacher.avatar || APP_ASSETS.sitiAminahBatik}
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006947] text-white flex items-center justify-center text-xs shadow-xs"
                    title="Terverifikasi Aktif"
                  >
                    <span className="material-symbols-outlined text-xs">check</span>
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 truncate">
                      {currentTeacher.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-white text-slate-600 text-xs font-medium border border-slate-200">
                      NIP: {currentTeacher.nip}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {currentTeacher.rombel} • {currentTeacher.subject}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#00685f]">event_available</span>
                      <span>Siklus 1 (TA 2025/2026)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base text-[#4b41e1]">record_voice_over</span>
                      <span>
                        Observer: <strong className="text-slate-900">{currentTeacher.assignedObserverName || 'Fahmawati, S.Pd. (Kepala Sekolah)'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span className="text-[#00685f] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">step</span>
                  Progres Alur Observasi Klinis
                </span>
                <span className="text-slate-900 font-bold">Tahap 3 dari 4: Tindak Lanjut Kolaboratif</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="h-2 rounded-full bg-[#00855b]"></div>
                <div className="h-2 rounded-full bg-[#00855b]"></div>
                <div className="h-2 rounded-full bg-[#00685f] animate-pulse"></div>
                <div className="h-2 rounded-full bg-slate-200"></div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
                <span className="text-[#006947] font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">check_circle</span> Pra-Observasi
                </span>
                <span className="text-[#006947] font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">check_circle</span> Observasi Kelas
                </span>
                <span className="text-[#00685f] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">play_circle</span> Tindak Lanjut
                </span>
                <span className="text-slate-400">Refleksi Akhir</span>
              </div>
            </div>
          </div>

          {/* Qualitative Score Tile (4 cols) */}
          <div className="xl:col-span-4 bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Capaian Pedagogik Siklus
                </span>
                <span className="material-symbols-outlined text-[#006947] bg-[#6ffbbe]/40 p-1.5 rounded-lg text-lg">
                  spa
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-slate-900 tabular-nums">91.5</span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6ffbbe] text-[#002113] text-xs font-bold mt-2">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>Amat Baik — Bertumbuh Positif</span>
              </div>
              <p className="text-xs text-slate-600 mt-4 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                “Ibu Siti menunjukkan keberanian mencoba pendekatan kontekstual berbasis karakter{' '}
                <em>7 Kebiasaan Anak Indonesia Hebat (7 KAIH)</em>. Ruang diskusi interaktif terbangun dengan hangat.”
              </p>
            </div>

            <div className="mt-4 pt-3 bg-[#eff4ff] p-4 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Iklim Pembelajaran Terbuka</span>
                <span className="text-[#006947] font-bold">96%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00855b] h-full rounded-full" style={{ width: '96%' }}></div>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <span className="text-slate-600">Penyelarasan Nilai 7 KAIH</span>
                <span className="text-[#00685f] font-bold">88%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#00685f] h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Lembar Kesepakatan Tindak Lanjut Kolaboratif */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
                <h2 className="text-lg font-bold text-[#0b1c30]">Lembar Kesepakatan Tindak Lanjut Kolaboratif</h2>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Komitmen pengembangan diri yang disepakati secara setara antara Guru dan Kepala Sekolah/Observer.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => triggerToast('Daftar status komitmen disaring')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span>Semua Status</span>
              </button>
              <button
                type="button"
                onClick={() => triggerToast('Modal formulir rencana aksi baru dibuka')}
                className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span>Tambah Rencana Aksi</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commitment Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#89f5e7]/40 flex items-center justify-center text-[#00685f]">
                      <span className="material-symbols-outlined text-xl">psychology_alt</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#00685f] font-bold uppercase tracking-wider">
                        Fokus Pengembangan 1
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        Pemberian Refleksi Mandiri Berkelanjutan (Exit Ticket 7 KAIH)
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#e2dfff] text-[#3323cc] text-xs font-semibold whitespace-nowrap flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4b41e1]"></span>
                    Sedang Berjalan
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 bg-[#eff4ff] p-4 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#006947]">target</span>
                      Sasaran Perubahan:
                    </span>
                    <p className="mt-1 leading-relaxed">
                      Mendorong peserta didik merumuskan 1 kesimpulan materi pembelajaran IPAS dan mengaitkannya dengan
                      pembiasaan <em>Gemar Membaca & Bangun Pagi</em>.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#00685f]">checklist</span>
                      Rencana Tindakan Spesifik:
                    </span>
                    <p className="mt-1 leading-relaxed">
                      Memakai media kartu refleksi fisik warna-warni & form singkat jurnal mandiri 5 menit sebelum jam
                      istirahat pertama.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/50">
                    <div>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-xs text-slate-400">calendar_month</span>
                        Target Penyelesaian:
                      </span>
                      <span className="text-slate-900 font-medium">15 Oktober 2025</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-xs text-[#4b41e1]">handshake</span>
                        Dukungan Sekolah:
                      </span>
                      <span className="text-slate-900 font-medium">Modul Refleksi & Peer Coaching</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Tingkat Keterlaksanaan Aksi</span>
                    <span className="font-bold text-[#00685f]">60% Tuntas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#00685f] h-full rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    3 dari 5 target kelas uji coba telah terlaksana dengan catatan refleksi harian.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => triggerToast('Catatan refleksi Ibu Siti diperbarui')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  <span>Perbarui Catatan Refleksi</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Unggah bukti pelaksanaan tindak lanjut berhasil')}
                  className="px-3.5 py-2 bg-[#006947] text-white hover:bg-[#00855b] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Unggah Bukti Pelaksanaan</span>
                </button>
              </div>
            </div>

            {/* Commitment Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e2dfff]/50 flex items-center justify-center text-[#4b41e1]">
                      <span className="material-symbols-outlined text-xl">auto_awesome_motion</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#4b41e1] font-bold uppercase tracking-wider">
                        Fokus Pengembangan 2
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        Penguatan Diferensiasi Produk Hasil Belajar Peserta Didik
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold whitespace-nowrap flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Terjadwal Diskusi
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 bg-[#eff4ff] p-4 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#006947]">target</span>
                      Sasaran Perubahan:
                    </span>
                    <p className="mt-1 leading-relaxed">
                      Memfasilitasi murid menyajikan laporan eksperimen IPAS dalam berbagai opsi format (infografis
                      sederhana, komik sains, atau rekaman audio pendek).
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#00685f]">checklist</span>
                      Rencana Tindakan Spesifik:
                    </span>
                    <p className="mt-1 leading-relaxed">
                      Mengintegrasikan pojok literasi digital kelas IV-A dengan panduan rubrik asesmen ramah anak yang
                      mudah dipahami mandiri.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/50">
                    <div>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-xs text-slate-400">calendar_month</span>
                        Target Penyelesaian:
                      </span>
                      <span className="text-slate-900 font-medium">28 Oktober 2025</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-xs text-[#4b41e1]">handshake</span>
                        Dukungan Sekolah:
                      </span>
                      <span className="text-slate-900 font-medium">Akses Tab Lab Komputer PAM</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Tingkat Keterlaksanaan Aksi</span>
                    <span className="font-bold text-slate-700">25% (Persiapan Alat & Rubrik)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#4b41e1] h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Rencana pembagian kelompok minat telah diverifikasi bersama Kepala Sekolah.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => triggerToast('Jadwal pendampingan ditambahkan ke kalender')}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">event</span>
                  <span>Atur Jadwal Pendampingan</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Menampilkan rincian dokumen rencana aksi')}
                  className="px-3.5 py-2 bg-[#00685f] text-white hover:bg-[#008378] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>Lihat Rincian Rencana</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Linimasa Pertumbuhan Pedagogik Berkelanjutan */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006947]">query_stats</span>
                <h2 className="text-lg font-bold text-[#0b1c30]">Linimasa Pertumbuhan Pedagogik Berkelanjutan</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Merekam proses evolusi profesionalitas guru antarsiklus tanpa sistem pemeringkatan atau sanksi
                administratif.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#6ffbbe]/25 p-3 rounded-2xl border border-[#6ffbbe]/40">
              <div className="w-10 h-10 rounded-xl bg-[#006947] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">moving</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#006947]">+24% Efektivitas Pembelajaran</div>
                <div className="text-[11px] text-slate-500">Peningkatan kumulatif dalam 3 siklus supervisi</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SVG Trend Chart & Observer Quote (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-[#eff4ff] rounded-2xl p-5 border border-slate-200/60">
              <div>
                <span className="text-xs text-slate-700 uppercase font-bold tracking-wider">
                  Tren Skor Observasi Klinis (Skala 4.0)
                </span>

                {/* SVG Trend Chart */}
                <div className="w-full mt-3 bg-white rounded-xl p-3 shadow-xs border border-slate-200/60">
                  <svg className="w-full h-28 overflow-visible" fill="none" viewBox="0 0 320 120">
                    <line
                      className="text-slate-200"
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      x1="10"
                      x2="310"
                      y1="20"
                      y2="20"
                    />
                    <line
                      className="text-slate-200"
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      x1="10"
                      x2="310"
                      y1="60"
                      y2="60"
                    />
                    <line
                      className="text-slate-200"
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      x1="10"
                      x2="310"
                      y1="100"
                      y2="100"
                    />

                    {/* Gradient Area */}
                    <path
                      className="text-[#89f5e7]/30"
                      d="M 40 90 L 160 55 L 280 28 L 280 110 L 40 110 Z"
                      fill="currentColor"
                    />

                    {/* Path Line */}
                    <path
                      className="text-[#00685f]"
                      d="M 40 90 L 160 55 L 280 28"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />

                    {/* Node 1 */}
                    <circle className="fill-white stroke-[#00685f]" cx="40" cy="90" r="5" strokeWidth="3" />
                    <text className="text-[10px] fill-slate-800 font-bold" textAnchor="middle" x="40" y="80">
                      2.9
                    </text>
                    <text className="text-[9px] fill-slate-400" textAnchor="middle" x="40" y="115">
                      Ganjil 24
                    </text>

                    {/* Node 2 */}
                    <circle className="fill-white stroke-[#00685f]" cx="160" cy="55" r="5" strokeWidth="3" />
                    <text className="text-[10px] fill-slate-800 font-bold" textAnchor="middle" x="160" y="45">
                      3.3
                    </text>
                    <text className="text-[9px] fill-slate-400" textAnchor="middle" x="160" y="115">
                      Genap 24
                    </text>

                    {/* Node 3 */}
                    <circle className="fill-[#006947] stroke-white" cx="280" cy="28" r="6" strokeWidth="2.5" />
                    <text className="text-[10px] fill-[#006947] font-bold" textAnchor="middle" x="280" y="18">
                      3.6 ★
                    </text>
                    <text className="text-[9px] fill-[#006947] font-semibold" textAnchor="middle" x="280" y="115">
                      Saat Ini
                    </text>
                  </svg>
                </div>
              </div>

              {/* Observer Quote */}
              <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-1.5 text-[#00685f] text-xs font-bold mb-1">
                  <span className="material-symbols-outlined text-base">mark_chat_read</span>
                  <span>Catatan Apresiasi Observer</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  “Ibu Siti konsisten membuka diri terhadap masukan supervisi. Perubahan suasana kelas menjadi sangat
                  hidup dan partisipatif adalah bukti nyata dedikasi beliau.”
                </p>
                <div className="mt-2 text-right">
                  <span className="text-[11px] text-slate-800 font-bold">— Fahmawati, S.Pd. (Kepala Sekolah)</span>
                </div>
              </div>
            </div>

            {/* Right: Stepped Timeline Stream (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Timeline Item 1 */}
              <div className="flex items-start gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center shadow-xs z-10">
                    <span className="material-symbols-outlined text-base">radio_button_checked</span>
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 -mt-1"></div>
                </div>
                <div className="flex-1 bg-[#eff4ff] p-4 rounded-2xl border border-slate-200/60 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Siklus 1 Semester Ganjil TA 2025/2026 (Sedang Berjalan)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#89f5e7] text-[#005049] text-[10px] font-bold">
                        Aktif
                      </span>
                    </div>
                    <div className="text-xs text-[#00685f] font-bold tabular-nums">
                      Skor: 3.6 <span className="text-slate-400 font-normal">/ 4.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Fokus Pengamatan:</strong> Integrasi Pendekatan Berdiferensiasi & Manajemen Kelas Inklusif
                    Berdasarkan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH).
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    <span className="text-[#006947] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">sync</span>
                      Tindak Lanjut Mandiri Sedang Berjalan (60%)
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('observation_form')}
                      className="text-[#00685f] hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <span>Buka Lembar Observasi</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex items-start gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#6ffbbe] text-[#002113] flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-base">check</span>
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 -mt-1"></div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">Siklus 2 Semester Genap TA 2024/2025</span>
                    <div className="text-xs text-slate-700 font-bold tabular-nums">
                      Skor: 3.3 <span className="text-slate-400 font-normal">/ 4.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Fokus Pengamatan:</strong> Pemanfaatan Asesmen Formatif Digital Berbasis Gamifikasi Kuis
                    Singkat & Refleksi Murid.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    <span className="text-[#006947] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">task_alt</span>
                      Tindak Lanjut Selesai 100% (Verifikasi Lengkap)
                    </span>
                    <span className="text-slate-400">• 4 Sesi Peer Tutoring Terlaksana</span>
                  </div>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex items-start gap-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined text-base">history</span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      Siklus 1 Semester Ganjil TA 2024/2025 (Titik Awal Pengamatan)
                    </span>
                    <div className="text-xs text-slate-700 font-bold tabular-nums">
                      Skor: 2.9 <span className="text-slate-400 font-normal">/ 4.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    <strong>Fokus Pengamatan:</strong> Pengelolaan Waktu Transisi Antarmateri & Pembiasaan Budaya Positif di
                    Awal Jam Belajar.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#00685f]">school</span>
                      Ditingkatkan Melalui Workshop Internal Manajemen Kelas SDN Percontohan PAM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action & Collaborative Footer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#00685f] shrink-0">
              <span className="material-symbols-outlined text-2xl">handshake</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kemitraan & Refleksi Lanjutan</h3>
              <p className="text-xs text-slate-500">
                Dokumentasi rencana tindak lanjut ini sah dan disepakati untuk siklus pembinaan semester berjalan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={onDownloadReport}
              className="px-4 py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span>Unduh Berita Acara & Rekomendasi (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast('Sesi konseling refleksi dijadwalkan pada Jumat, 26 Sep')}
              className="px-4 py-2.5 bg-[#4b41e1] hover:bg-[#645efb] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">calendar_add_on</span>
              <span>Jadwalkan Sesi Konseling Refleksi</span>
            </button>
            <button
              type="button"
              onClick={() => triggerToast('Pesan kolaboratif terkirim ke Observer Fahmawati, S.Pd.')}
              className="px-4 py-2.5 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              <span>Kirim Pesan Kolaboratif ke Observer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
