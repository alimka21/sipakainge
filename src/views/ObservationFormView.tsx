import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types';
import { APP_ASSETS } from '../data/mockData';

interface ObservationFormViewProps {
  onNavigate: (screen: ScreenId) => void;
  onPreviewBeritaAcara: () => void;
  onFinishObservation?: () => void;
}

export const ObservationFormView: React.FC<ObservationFormViewProps> = ({
  onNavigate,
  onPreviewBeritaAcara,
  onFinishObservation,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(48 * 60 + 22);
  const [activeDocTab, setActiveDocTab] = useState<'rpp' | 'pra' | 'fokus'>('rpp');
  const [scores, setScores] = useState({
    ind1_1: 3,
    ind1_2: 4,
    ind2_1: 3,
    ind2_2: 4,
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleScoreChange = (indicator: keyof typeof scores, val: number) => {
    setScores((prev) => ({ ...prev, [indicator]: val }));
    setToastMsg(`Skor Indikator diperbarui: ${val}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSaveDraft = () => {
    setToastMsg('Draf observasi klinis tersimpan ke database lokal.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handlePublish = () => {
    setToastMsg('Observasi selesai dan terbit! Melanjutkan ke tindak lanjut...');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onNavigate('follow_up_plan');
    }, 1200);
  };

  return (
    <div className="w-full pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      {showToast && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium">
          <span className="material-symbols-outlined text-[#6ffbbe] text-base">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Utility Context & Breadcrumbs */}
      <div className="px-6 lg:px-10 pt-6 pb-4 flex flex-col gap-3 bg-[#f8f9ff]">
        {/* Breadcrumb & Observation State */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <button
              onClick={() => onNavigate('supervision_dashboard')}
              className="hover:text-[#00685f] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">school</span>
              Supervisi Guru
            </button>
            <span className="text-slate-300">/</span>
            <span className="hover:text-[#00685f]">Siklus Supervisi Ganjil 2025/2026</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#00685f] font-semibold">Observasi Kelas IV-A</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] text-[#3323cc] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#4b41e1] animate-ping"></span>
              Sesi Klinis Aktif
            </span>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-mono tabular-nums">
              <span className="material-symbols-outlined text-sm">timer</span>
              <span>{formatTimer(secondsElapsed)} Terberjalan</span>
            </div>
          </div>
        </div>

        {/* Observation Target Header Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                className="w-14 h-14 rounded-full object-cover shadow-sm bg-slate-100 ring-2 ring-[#00685f]/20"
                alt="Ibu Siti Aminah"
                src={APP_ASSETS.sitiAminahFormal}
              />
              <div
                className="absolute -bottom-1 -right-1 bg-[#006947] text-white rounded-full p-0.5"
                title="Sertifikasi Pendidik Aktif"
              >
                <span className="material-symbols-outlined text-xs block">verified</span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Ibu Siti Aminah, S.Pd.</h1>
                <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-slate-700 text-xs font-semibold">
                  Guru Kelas IV-A
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-slate-400">badge</span>
                  NIP: 19850412 201001 2 021
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-[#00685f] font-semibold">
                  <span className="material-symbols-outlined text-xs">menu_book</span>
                  IPAS (Transformasi Energi di Sekitar Kita)
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-slate-400">calendar_today</span>
                  Kamis, 25 Sep 2025 • 08:00 - 09:15 WITA
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-slate-400">meeting_room</span>
                  Ruang IV-A SDN PAM
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 text-xs font-semibold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base text-slate-500">save</span>
              <span>Simpan Draf</span>
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Selesaikan & Terbitkan</span>
            </button>
          </div>
        </div>

        {/* Stepper Observation Workflow */}
        <div className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Step 1 */}
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-7 h-7 rounded-full bg-[#6ffbbe] text-[#002113] flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-base">done</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900">Tahap 1: Pra-Observasi</span>
              <span className="text-[11px] text-[#006947]">Telaah Modul Ajar Selesai (92/100)</span>
            </div>
          </div>
          <div className="hidden md:block w-10 h-0.5 bg-[#6ffbbe] shrink-0"></div>

          {/* Step 2 */}
          <div className="flex items-center gap-2.5 flex-1 p-2 rounded-lg bg-[#00685f]/10">
            <div className="w-7 h-7 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#00685f]">Tahap 2: Observasi Kelas</span>
                <span className="px-1.5 py-0.2 bg-[#00685f] text-white text-[10px] rounded-full">Aktif 75%</span>
              </div>
              <span className="text-[11px] text-slate-500">Pencatatan Rubrik & Bukti Nyata</span>
            </div>
          </div>
          <div className="hidden md:block w-10 h-0.5 bg-slate-200 shrink-0"></div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigate('follow_up_plan')}
            className="flex items-center gap-2.5 flex-1 opacity-70 cursor-pointer hover:opacity-100 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold shrink-0">
              <span>3</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-700">Tahap 3: Pascakontrak</span>
              <span className="text-[11px] text-slate-400">Refleksi Umpan Balik & Rencana Aksi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="px-6 lg:px-10 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: RPP & Pedagogical Reference Workspace (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
            {/* Panel Tabs */}
            <div className="flex items-center justify-between bg-[#eff4ff] px-4 pt-2 border-b border-slate-200/60">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('rpp')}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                    activeDocTab === 'rpp'
                      ? 'bg-white text-[#00685f] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  <span>Modul Ajar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('pra')}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                    activeDocTab === 'pra'
                      ? 'bg-white text-[#00685f] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">handshake</span>
                  <span>Kesepakatan Pra</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('fokus')}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-1.5 ${
                    activeDocTab === 'fokus'
                      ? 'bg-white text-[#00685f] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">track_changes</span>
                  <span>Fokus Perilaku</span>
                </button>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">verified</span>
                Skor 92/100
              </span>
            </div>

            {/* Telaah Status Ribbon */}
            <div className="bg-[#eff4ff] px-4 py-2 flex items-center justify-between text-[11px] border-b border-slate-100">
              <span className="flex items-center gap-1 text-[#006947] font-semibold">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                RPP Telah Divalidasi Observer (Fahmawati, S.Pd.)
              </span>
              <span className="text-slate-400">Versi Revisi 2 • 23 Sep 2025</span>
            </div>

            {/* Document Content */}
            <div className="p-5 flex flex-col gap-4 max-h-[640px] overflow-y-auto bg-slate-50/50">
              {/* CP */}
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wide">
                    Capaian Pembelajaran (CP) Fase B
                  </span>
                  <span className="text-[10px] text-slate-400">Kurikulum Merdeka</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Peserta didik mengidentifikasi sumber dan bentuk energi serta menjelaskan proses perubahan bentuk
                  energi dalam kehidupan sehari-hari (contoh: energi kalor, listrik, bunyi, gerak) melalui penyelidikan
                  mandiri dan kolaboratif.
                </p>
              </div>

              {/* TP */}
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100">
                <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wide block mb-1">
                  Tujuan Pembelajaran Khusus (TP)
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
                  <li>
                    Melalui eksperimen senter sederhana dan magnet, murid mampu merumuskan 2 alur transformasi energi
                    secara logis.
                  </li>
                  <li>
                    Melalui diskusi LKPD heterogen, murid mampu mempresentasikan hasil pembuktian kelompok secara percaya
                    diri.
                  </li>
                </ul>
              </div>

              {/* Targeted Behavioral Focus */}
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-[#4b41e1] text-xs font-bold mb-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span>2 Fokus Perilaku Target Supervisi</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white shadow-xs flex items-start gap-2 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#e2dfff] text-[#3323cc] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="text-slate-900 font-semibold">Keterlibatan Inklusif Seluruh Murid</p>
                      <p className="text-slate-600 text-[11px]">
                        Guru memfasilitasi peran aktif setiap anggota kelompok, menghindari dominasi segelintir anak.
                      </p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white shadow-xs flex items-start gap-2 border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-[#e2dfff] text-[#3323cc] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="text-slate-900 font-semibold">Pertanyaan Pemantik Bernalar Kritis</p>
                      <p className="text-slate-600 text-[11px]">
                        Guru mengajukan pertanyaan terbuka tipe eksplorasi ('Mengapa...', 'Bagaimana jika...') bukan
                        pertanyaan hafalan searah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observer Note */}
              <div className="bg-[#00685f]/5 p-4 rounded-xl border border-[#00685f]/15 flex items-start gap-3">
                <span className="material-symbols-outlined text-[#00685f] text-xl shrink-0">rate_review</span>
                <div className="flex flex-col">
                  <span className="text-xs text-[#00685f] font-bold">Catatan Telaah RPP Observer</span>
                  <p className="text-xs text-slate-600 italic mt-0.5 leading-relaxed">
                    “Modul ajar telah memuat diferensiasi konten & lembar observasi anak dengan baik. Pastikan manajemen
                    pembagian kit magnet di kelompok 3 dan 4 termitigasi agar tidak memakan durasi apersepsi.”
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1">
                    — Fahmawati, S.Pd. • Kepala Sekolah (24 Sep 2025, 14:15 WITA)
                  </span>
                </div>
              </div>

              {/* Classroom Photo */}
              <div className="relative rounded-xl overflow-hidden shadow-sm bg-slate-200">
                <img
                  className="w-full h-40 object-cover"
                  alt="Suasana ruang kelas IV SDN Percontohan PAM"
                  src={APP_ASSETS.classroomActivity}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-white text-[11px] flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-xs">photo_camera</span>
                    Dokumentasi Pembiasaan & Tata Meja Kelompok Diferensiasi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Context Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#00685f]">
                <span className="material-symbols-outlined text-lg">psychology</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">Panduan Penilaian SIPAKAINGE</span>
                <span className="text-[11px] text-slate-500">Berdasarkan Regulasi Dirjen GTK No. 7607</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert('Rubrik Penilaian GTK No. 7607: 4 Skala Kinerja (1: Belum Muncul, 2: Mulai Berkembang, 3: Efektif, 4: Sangat Teladan)')}
              className="px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00685f] text-xs font-semibold transition-colors"
            >
              Buka Rubrik
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Live Observation Scoring Rubric & Clinical Notes (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Live Progress Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-lg">fact_check</span>
                <h2 className="text-sm font-bold text-slate-900">Instrumen Observasi Kinerja Mengajar</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#00685f]">6 dari 8 Indikator Terisi</span>
                <span className="text-slate-400">(75%)</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#00685f] rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* SECTION 1: Keteraturan Suasana Kelas */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#00685f] text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Keteraturan Suasana Kelas (Fokus Manajemen)</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">
                2 Indikator
              </span>
            </div>

            {/* Indikator 1.1 */}
            <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                <div className="flex-1">
                  <span className="text-[10px] text-[#00685f] font-bold uppercase tracking-wider">Indikator 1.1</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Guru melakukan komunikasi positif untuk membangun suasana kelas yang aman dan kondusif.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fokus: Penghargaan verbal, kesepakatan bersama, pembawaan suportif.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#6ffbbe] text-[#002113] text-[11px] font-bold shrink-0">
                  Skor: {scores.ind1_1} (Efektif)
                </span>
              </div>

              {/* Scoring Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 1, label: '1 - Belum Muncul' },
                  { val: 2, label: '2 - Mulai Berkembang' },
                  { val: 3, label: '3 - Efektif ✓' },
                  { val: 4, label: '4 - Sangat Teladan' },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => handleScoreChange('ind1_1', btn.val)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all ${
                      scores.ind1_1 === btn.val
                        ? 'bg-[#00685f] text-white shadow-sm ring-2 ring-[#00685f]/30'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Evidence Textarea */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Catatan Bukti Konkret Perilaku Teramati:</span>
                  <span className="text-slate-400 font-normal">Tercatat 08:14 WITA</span>
                </label>
                <textarea
                  defaultValue="Guru menyapa peserta didik dengan hangat dan mengingatkan kesepakatan kelas yang telah disepakati bersama secara santun tanpa ada intonasi menghukum."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00685f] transition-all resize-none shadow-xs"
                />
              </div>
            </div>

            {/* Indikator 1.2 */}
            <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                <div className="flex-1">
                  <span className="text-[10px] text-[#00685f] font-bold uppercase tracking-wider">Indikator 1.2</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Guru memfasilitasi peran dan keterlibatan aktif semua murid dalam aktivitas kelompok.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fokus: Pembagian giliran bicara, pemberian perancah (scaffolding), monitoring meja ke meja.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#e2dfff] text-[#3323cc] text-[11px] font-bold shrink-0">
                  Skor: {scores.ind1_2} (Sangat Teladan)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 1, label: '1 - Belum Muncul' },
                  { val: 2, label: '2 - Mulai Berkembang' },
                  { val: 3, label: '3 - Efektif' },
                  { val: 4, label: '4 - Sangat Teladan ✓' },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => handleScoreChange('ind1_2', btn.val)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all ${
                      scores.ind1_2 === btn.val
                        ? 'bg-[#4b41e1] text-white shadow-sm ring-2 ring-[#4b41e1]/30'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Catatan Bukti Konkret Perilaku Teramati:</span>
                  <span className="text-slate-400 font-normal">Tercatat 08:32 WITA</span>
                </label>
                <textarea
                  defaultValue="Pengelompokan heterogen berjalan dinamis; guru berkeliling memberi perancah (scaffolding) pada kelompok B dan menugaskan murid pemalu menjadi juru catat eksperimen secara suportif."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00685f] transition-all resize-none shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Diferensiasi & Penalaran Kritis */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#00685f] text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">Diferensiasi & Penalaran Kritis</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">
                2 Indikator
              </span>
            </div>

            {/* Indikator 2.1 */}
            <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                <div className="flex-1">
                  <span className="text-[10px] text-[#00685f] font-bold uppercase tracking-wider">Indikator 2.1</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Guru menstimulasi nalar kritis murid melalui pertanyaan pemantik terbuka tingkat tinggi (HOTS).
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fokus: Guru tidak langsung menjawab pertanyaan murid, melainkan melempar kembali untuk didiskusikan.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#6ffbbe] text-[#002113] text-[11px] font-bold shrink-0">
                  Skor: {scores.ind2_1} (Efektif)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 1, label: '1 - Belum Muncul' },
                  { val: 2, label: '2 - Mulai Berkembang' },
                  { val: 3, label: '3 - Efektif ✓' },
                  { val: 4, label: '4 - Sangat Teladan' },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => handleScoreChange('ind2_1', btn.val)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all ${
                      scores.ind2_1 === btn.val
                        ? 'bg-[#00685f] text-white shadow-sm ring-2 ring-[#00685f]/30'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Catatan Bukti Konkret Perilaku Teramati:</span>
                  <span className="text-slate-400 font-normal">Tercatat 08:44 WITA</span>
                </label>
                <textarea
                  defaultValue="Guru mengajukan pertanyaan 'Apa yang terjadi jika baterai senter dipasang terbalik dan mengapa energinya tidak berubah menjadi cahaya?' yang memicu 4 anak berdebat secara konstruktif."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00685f] transition-all resize-none shadow-xs"
                />
              </div>
            </div>

            {/* Indikator 2.2 */}
            <div className="p-4 rounded-xl bg-[#eff4ff] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                <div className="flex-1">
                  <span className="text-[10px] text-[#00685f] font-bold uppercase tracking-wider">Indikator 2.2</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    Pemanfaatan media ajar kontekstual, alat peraga visual, dan teknologi yang interaktif.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fokus: Media eksperimen mudah dimanipulasi, LKPD jelas instruksinya.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#e2dfff] text-[#3323cc] text-[11px] font-bold shrink-0">
                  Skor: {scores.ind2_2} (Sangat Teladan)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 1, label: '1 - Belum Muncul' },
                  { val: 2, label: '2 - Mulai Berkembang' },
                  { val: 3, label: '3 - Efektif' },
                  { val: 4, label: '4 - Sangat Teladan ✓' },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => handleScoreChange('ind2_2', btn.val)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-semibold transition-all ${
                      scores.ind2_2 === btn.val
                        ? 'bg-[#4b41e1] text-white shadow-sm ring-2 ring-[#4b41e1]/30'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Catatan Bukti Konkret Perilaku Teramati:</span>
                  <span className="text-slate-400 font-normal">Tercatat 08:52 WITA</span>
                </label>
                <textarea
                  defaultValue="Media eksperimen magnet, baterai 1.5V, dan lembar LKPD interaktif bergambar digunakan optimal oleh 5 kelompok tanpa kendala keterbacaan."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00685f] transition-all resize-none shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Quick Media Attachment Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Foto dokumentasi aktivitas kelas berhasil dilampirkan!')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#00685f]">add_a_photo</span>
                <span>Tambah Foto Bukti (2 Terlampir)</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Fitur rekam catatan suara (Voice Memo) observer aktif!')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-base text-[#4b41e1]">mic</span>
                <span>Rekam Catatan Suara (Voice Memo)</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <span className="material-symbols-outlined text-sm text-[#006947]">check_circle</span>
              <span>Autosave aktif: 30 detik lalu</span>
            </div>
          </div>

          {/* BOTTOM LIVE SYNTHESIS SUMMARY BOX */}
          <div className="bg-gradient-to-br from-[#eff4ff] via-white to-[#eff4ff] p-6 rounded-2xl shadow-md border border-slate-200/90 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#00685f] text-white rounded-2xl flex flex-col items-center justify-center min-w-[76px] shadow-sm">
                  <span className="text-2xl font-bold leading-none tabular-nums">3.6</span>
                  <span className="text-[10px] text-[#89f5e7] uppercase font-bold tracking-wider mt-0.5">
                    Skala 4.0
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">Amat Baik / Efektif</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold">
                      Direkomendasikan
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Skor sementara kalkulasi otomatis berdasarkan 6 indikator terisi.
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white shadow-xs border border-slate-200 text-xs">
                <span className="material-symbols-outlined text-base text-[#00685f]">analytics</span>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Kesiapan Refleksi</span>
                  <span className="font-bold text-[#00685f]">Tinggi (Ready)</span>
                </div>
              </div>
            </div>

            {/* Strengths & Development Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/70 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[#006947] text-xs font-bold">
                  <span className="material-symbols-outlined text-base">thumb_up</span>
                  <span>Kekuatan Pembelajaran (Strengths)</span>
                </div>
                <textarea
                  defaultValue="Interaksi partisipatif murid sangat hidup dan manajemen pembagian peran kelompok berjalan tanpa dominasi. Asesmen formatif observasi natural menyatu dengan lembar LKPD."
                  rows={3}
                  className="w-full p-2 text-xs text-slate-800 bg-[#eff4ff] rounded-xl border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#006947] resize-none"
                />
              </div>

              <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-200/70 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-[#4b41e1] text-xs font-bold">
                  <span className="material-symbols-outlined text-base">tips_and_updates</span>
                  <span>Rekomendasi Penguatan (Development Area)</span>
                </div>
                <textarea
                  defaultValue="Alokasi waktu fase penutup dan sesi perumusan kesimpulan mandiri oleh murid perlu diberi porsi lebih luwes agar tidak tergesa-gesa menjelang bel pergantian jam."
                  rows={3}
                  className="w-full p-2 text-xs text-slate-800 bg-[#eff4ff] rounded-xl border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#4b41e1] resize-none"
                />
              </div>
            </div>

            {/* Sign-off & Completion */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="material-symbols-outlined text-slate-400 text-base">lock_clock</span>
                <span>Data terlindungi & tersinkronisasi otomatis ke Server Disdik Kota Makassar</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onPreviewBeritaAcara}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-200 transition-colors shadow-xs"
                >
                  Pratinjau Lembar Berita Acara
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onFinishObservation) {
                      onFinishObservation();
                    } else {
                      onNavigate('follow_up_plan');
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] text-white hover:bg-[#008378] font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Lanjut ke Pascakontrak</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
