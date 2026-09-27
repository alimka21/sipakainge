import React, { useState } from 'react';
import { ScreenId, TeacherRecord, MuridRecord } from '../types';
import { INITIAL_TEACHERS, APP_ASSETS, INITIAL_MURID } from '../data/mockData';

interface SupervisionDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectTeacherForObservation: (teacherId: string) => void;
  searchQuery: string;
  sessionStates?: Record<string, any>;
  onUpdateSessionStates?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  teacherList?: TeacherRecord[];
  muridList?: MuridRecord[];
}

export const SupervisionDashboardView: React.FC<SupervisionDashboardViewProps> = ({
  onNavigate,
  onSelectTeacherForObservation,
  searchQuery,
  sessionStates,
  onUpdateSessionStates,
  teacherList = INITIAL_TEACHERS,
  muridList = INITIAL_MURID,
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

  // Dynamic Session status calculations
  const getDynamicCounts = () => {
    let pra = 0;
    let telaah = 0;
    let observasi = 0;
    let refleksi = 0;
    let tuntas = 0;

    teacherList.forEach(t => {
      const sess = sessionStates?.[t.id];
      const status = sess?.status || t.stage.toUpperCase();
      
      if (['DRAFT', 'DIAJUKAN', 'DISETUJUI', 'TERJADWAL', 'PRA', 'OBSERVASI TERJADWAL'].includes(status) || status.startsWith('OBSERVASI TERJADWAL')) {
        pra++;
      } else if (['DOKUMEN_DIUPLOAD', 'TELAAH', 'PERLU_PERBAIKAN', 'ANTREAN VERIFIKASI', 'PERLU PERBAIKAN MODUL'].includes(status) || status.startsWith('PERLU') || status.startsWith('ANTREAN')) {
        telaah++;
      } else if (['PERANGKAT_DINILAI', 'OBSERVASI', 'OBSERVASI_TERJADWAL'].includes(status)) {
        observasi++;
      } else if (['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'REFLEKSI', 'MENUNGGU REFLEKSI'].includes(status) || status.startsWith('MENUNGGU')) {
        refleksi++;
      } else if (['SELESAI', 'TUNTAS', 'SIKLUS TUNTAS'].includes(status) || status.startsWith('SIKLUS')) {
        tuntas++;
      } else {
        if (t.stage === 'pra') pra++;
        else if (t.stage === 'telaah') telaah++;
        else if (t.stage === 'observasi') observasi++;
        else if (t.stage === 'refleksi') refleksi++;
        else if (t.stage === 'tuntas') tuntas++;
      }
    });

    return { pra, telaah, observasi, refleksi, tuntas };
  };

  const dynamicCounts = getDynamicCounts();

  // Calculate average compliance for each of the 7 habits across all students
  const getHabitStats = () => {
    const stats = [
      { id: 1, name: 'Bangun Pagi Mandiri', rate: 0, icon: 'alarm', color: 'bg-teal-500', desc: 'Siswa bangun sendiri sebelum 05:30 WITA' },
      { id: 2, name: 'Beribadah Sesuai Agama', rate: 0, icon: 'mosque', color: 'bg-emerald-500', desc: 'Melaksanakan shalat wajib/ibadah harian' },
      { id: 3, name: 'Olahraga & Aktivitas', rate: 0, icon: 'directions_run', color: 'bg-blue-500', desc: 'Melakukan senam/olahraga 30 menit harian' },
      { id: 4, name: 'Makanan Sehat Bergizi', rate: 0, icon: 'restaurant', color: 'bg-indigo-500', desc: 'Makan buah, sayur, sarapan sehat' },
      { id: 5, name: 'Gemar Membaca Literasi', rate: 0, icon: 'menu_book', color: 'bg-purple-500', desc: 'Membaca buku non-pelajaran 15-20 menit' },
      { id: 6, name: 'Membantu & Berperilaku Santun', rate: 0, icon: 'volunteer_activism', color: 'bg-pink-500', desc: 'Membantu ortu, sopan santun (Sipakatau)' },
      { id: 7, name: 'Tidur Tepat Waktu', rate: 0, icon: 'bedtime', color: 'bg-amber-500', desc: 'Tidur malam maksimal pukul 21:00/21:30 WITA' },
    ];

    const totalStudents = muridList.length;
    if (totalStudents > 0) {
      stats.forEach(s => {
        let doneCount = 0;
        muridList.forEach(m => {
          if (m.habits[s.id as 1|2|3|4|5|6|7]) {
            doneCount++;
          }
        });
        s.rate = Math.round((doneCount / totalStudents) * 100);
      });
    }

    return stats;
  };

  const habitStats = getHabitStats();

  // Helper 1: Dynamic teacher stage info helper
  const getTeacherStageInfo = (t: TeacherRecord) => {
    const sess = sessionStates?.[t.id];
    const status = sess?.status || t.stage.toUpperCase();

    let text = t.stageBadgeText;
    let type = t.stageBadgeType; // 'tertiary' | 'error' | 'secondary' | 'neutral'

    if (['DRAFT', 'DIAJUKAN', 'DISETUJUI', 'TERJADWAL', 'PRA', 'OBSERVASI TERJADWAL'].includes(status) || status.startsWith('OBSERVASI TERJADWAL')) {
      text = status === 'TERJADWAL' || status === 'OBSERVASI TERJADWAL' ? 'Observasi Terjadwal' : 'Pra-Observasi';
      type = 'neutral';
    } else if (['DOKUMEN_DIUPLOAD', 'TELAAH', 'PERLU_PERBAIKAN', 'ANTREAN VERIFIKASI', 'PERLU PERBAIKAN MODUL'].includes(status) || status.startsWith('PERLU') || status.startsWith('ANTREAN')) {
      text = status === 'PERLU PERBAIKAN MODUL' ? 'Perlu Perbaikan Modul' : 'Antrean Verifikasi';
      type = status === 'PERLU PERBAIKAN MODUL' ? 'error' : 'secondary';
    } else if (['PERANGKAT_DINILAI', 'OBSERVASI', 'OBSERVASI_TERJADWAL'].includes(status)) {
      text = 'Observasi Kelas';
      type = 'secondary';
    } else if (['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'REFLEKSI', 'MENUNGGU REFLEKSI'].includes(status) || status.startsWith('MENUNGGU')) {
      text = 'Menunggu Refleksi 1:1';
      type = 'secondary';
    } else if (['SELESAI', 'TUNTAS', 'SIKLUS TUNTAS'].includes(status) || status.startsWith('SIKLUS')) {
      text = 'Siklus Tuntas & Arsip';
      type = 'tertiary';
    }

    return { text, type };
  };

  // Helper 2: Dynamic actions generator for table buttons
  const renderActions = (t: TeacherRecord) => {
    const sess = sessionStates?.[t.id];
    const status = sess?.status || t.stage.toUpperCase();

    if (['DOKUMEN_DIUPLOAD', 'TELAAH', 'PERLU_PERBAIKAN', 'ANTREAN VERIFIKASI', 'PERLU PERBAIKAN MODUL'].includes(status) || status.startsWith('PERLU') || status.startsWith('ANTREAN')) {
      return (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTeacherForObservation(t.id);
              onNavigate('observation_form');
            }}
            className="px-3 py-1.5 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-slate-800 font-semibold text-xs transition-all shadow-xs"
          >
            Telaah RPP
          </button>
          <button
            type="button"
            onClick={() => triggerToast(`Riwayat catatan telaah untuk ${t.name} ditampilkan`)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            title="Riwayat Catatan"
          >
            <span className="material-symbols-outlined text-base">history_edu</span>
          </button>
        </>
      );
    }

    if (['PERANGKAT_DINILAI', 'OBSERVASI', 'OBSERVASI_TERJADWAL', 'TERJADWAL', 'OBSERVASI TERJADWAL'].includes(status)) {
      return (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTeacherForObservation(t.id);
              onNavigate('observation_form');
            }}
            className="px-3 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-xs transition-all shadow-xs"
          >
            Mulai Observasi
          </button>
          <button
            type="button"
            onClick={() => triggerToast(`Membuka folder RPP ${t.name}`)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            title="Lihat RPP"
          >
            <span className="material-symbols-outlined text-base">folder_open</span>
          </button>
        </>
      );
    }

    if (['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'REFLEKSI', 'MENUNGGU REFLEKSI'].includes(status) || status.startsWith('MENUNGGU')) {
      return (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTeacherForObservation(t.id);
              onNavigate('teacher_report');
            }}
            className="px-3 py-1.5 rounded-lg bg-[#4b41e1] hover:bg-[#645efb] text-white font-semibold text-xs transition-all shadow-xs"
          >
            Sesi Refleksi
          </button>
          <button
            type="button"
            onClick={() => triggerToast(`Mencetak lembar berita acara supervisi untuk ${t.name}...`)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            title="Cetak Berita Acara"
          >
            <span className="material-symbols-outlined text-base">print</span>
          </button>
        </>
      );
    }

    if (['SELESAI', 'TUNTAS', 'SIKLUS TUNTAS'].includes(status) || status.startsWith('SIKLUS')) {
      return (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTeacherForObservation(t.id);
              onNavigate('teacher_report');
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
          >
            Lihat Rapor
          </button>
          <button
            type="button"
            onClick={() => triggerToast(`Berita acara resmi ${t.name} terverifikasi dinas`)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            title="Verifikasi Resmi"
          >
            <span className="material-symbols-outlined text-base text-[#006947]">verified</span>
          </button>
        </>
      );
    }

    // Default Fallback
    return (
      <>
        <button
          type="button"
          onClick={() => {
            onSelectTeacherForObservation(t.id);
            onNavigate('observation_form');
          }}
          className="px-3 py-1.5 rounded-lg bg-[#dce9ff] hover:bg-[#d3e4fe] text-slate-800 font-semibold text-xs transition-all"
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
    );
  };

  // Helper 3: Dynamic actions generator for Section 2 queue cards
  const getPendingActions = () => {
    const actions: Array<{
      teacher: TeacherRecord;
      type: 'telaah' | 'observasi' | 'refleksi';
      title: string;
      desc: string;
      badgeText: string;
      badgeBg: string;
      badgeTextCol: string;
      btnText: string;
    }> = [];

    teacherList.forEach(t => {
      const sess = sessionStates?.[t.id];
      const status = sess?.status || t.stage.toUpperCase();

      if (['DOKUMEN_DIUPLOAD', 'TELAAH', 'PERLU_PERBAIKAN', 'ANTREAN VERIFIKASI', 'PERLU PERBAIKAN MODUL'].includes(status) || status.startsWith('PERLU') || status.startsWith('ANTREAN')) {
        actions.push({
          teacher: t,
          type: 'telaah',
          title: `Telaah Modul Ajar: ${t.subject}`,
          desc: status === 'PERLU PERBAIKAN MODUL' ? 'Modul ajar perlu direvisi oleh guru sebelum divalidasi ulang.' : 'Modul ajar telah diunggah oleh pendidik. Sila lakukan telaah instrumen kelengkapan & aspek telaah.',
          badgeText: status === 'PERLU PERBAIKAN MODUL' ? 'Perlu Revisi' : 'Butuh Telaah',
          badgeBg: status === 'PERLU PERBAIKAN MODUL' ? 'bg-[#ffdad6]' : 'bg-[#e2dfff]',
          badgeTextCol: status === 'PERLU PERBAIKAN MODUL' ? 'text-[#93000a]' : 'text-[#3323cc]',
          btnText: 'Mulai Telaah Modul',
        });
      } else if (['TERJADWAL', 'observasi', 'OBSERVASI TERJADWAL', 'PERANGKAT_DINILAI'].includes(status)) {
        actions.push({
          teacher: t,
          type: 'observasi',
          title: `Observasi Kelas: ${t.subject}`,
          desc: `Fokus: ${t.focusSupervision}. ${t.focusSupervisionDesc || 'Lakukan pengamatan proses KBM secara langsung di kelas.'}`,
          badgeText: 'Jadwal Aktif',
          badgeBg: 'bg-[#6ffbbe]',
          badgeTextCol: 'text-[#002113]',
          btnText: 'Mulai Observasi',
        });
      } else if (['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'refleksi', 'MENUNGGU REFLEKSI'].includes(status)) {
        actions.push({
          teacher: t,
          type: 'refleksi',
          title: `Dialog Refleksi: ${t.subject}`,
          desc: 'Lakukan bimbingan pasca-observasi klinis 1-on-1 guna menyepakati komitmen tindak lanjut pengembangan.',
          badgeText: 'Butuh Dialog',
          badgeBg: 'bg-amber-100',
          badgeTextCol: 'text-amber-800',
          btnText: 'Sesi Refleksi 1:1',
        });
      }
    });

    return actions;
  };

  const pendingActions = getPendingActions();

  // Helper 4: Dynamic policy advisory based on lowest student habit adherence
  const sortedHabits = [...habitStats].sort((a, b) => a.rate - b.rate);
  const lowestHabit = sortedHabits[0];
  const highestHabit = sortedHabits[sortedHabits.length - 1];

  const getPolicyAdvisory = (habitId: number) => {
    switch (habitId) {
      case 1:
        return 'Kampanye Disiplin Pagi Ceria: Sekolah disarankan bekerja sama dengan Komite & Paguyuban Kelas untuk memantau bangun pagi mandiri, melatih tanggung jawab siswa merapikan tempat tidur secara konsisten.';
      case 2:
        return 'Pendidikan Karakter Berbasis Spiritual: Optimalkan kegiatan ibadah bersama, seperti pembiasaan shalat dhuha berjamaah di musholla sekolah, serta pengisian buku bimbingan ibadah harian.';
      case 3:
        return 'Program Senam Sehat Bersama: Mengingat aktivitas olahraga harian tergolong paling rendah, disarankan menyelenggarakan gerakan senam ceria gembira bersama guru dan seluruh murid setiap Selasa & Kamis pagi sebelum KBM.';
      case 4:
        return 'Kampanye Kantin Sehat Sekolah: Koordinasikan dengan pengelola kantin untuk membatasi penyediaan makanan instan berpemanis buatan dan edukasi membawa bekal bebuahan serta sayur sehat dari rumah.';
      case 5:
        return 'Gerakan Literasi 15 Menit: Optimalkan pojok baca kelas dengan menyuplai buku cerita rakyat/lokal baru, serta tantangan membaca senyap 15-20 menit setiap hari sebelum bel masuk sekolah berdering.';
      case 6:
        return 'Pembiasaan Adab Sipakatau: Integrasikan penanaman falsafah kesantunan Bugis-Makassar (Sipakatau, Sipakalebbi, Sipakainge) dalam tata krama sosial murid saat berinteraksi dengan guru dan sesama teman.';
      case 7:
        return 'Sosialisasi Digital Hygiene Curfew: Bersama komite sekolah, sampaikan himbauan kepada orang tua murid agar mematikan atau mengunci akses gawai anak pukul 20:30 WITA guna memastikan anak tidur nyenyak sebelum pukul 21:00 WITA.';
      default:
        return 'Berikan apresiasi berkala pada guru kelas yang berhasil memimpin pembiasaan karakter unggul secara inklusif.';
    }
  };

  const dynamicPolicyAdvisory = getPolicyAdvisory(lowestHabit.id);

  // Dynamic KPIs
  const kpiJadwalHariIni = teacherList.filter(t => {
    const s = sessionStates?.[t.id]?.status || t.stage;
    return ['DISETUJUI', 'TERJADWAL', 'observasi'].includes(s);
  }).length;

  const kpiMenungguTelaah = teacherList.filter(t => {
    const s = sessionStates?.[t.id]?.status || t.stage;
    return ['DOKUMEN_DIUPLOAD', 'telaah'].includes(s);
  }).length;

  const kpiSedangBerjalan = teacherList.filter(t => {
    const s = sessionStates?.[t.id]?.status || t.stage;
    return ['PERANGKAT_DINILAI'].includes(s);
  }).length;

  const kpiMenungguRefleksi = teacherList.filter(t => {
    const s = sessionStates?.[t.id]?.status || t.stage;
    return ['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'refleksi'].includes(s);
  }).length;

  const kpiTuntasCount = teacherList.filter(t => {
    const s = sessionStates?.[t.id]?.status || t.stage;
    return ['SELESAI', 'tuntas'].includes(s);
  }).length;

  const kpiCapaianPersen = Math.round((kpiTuntasCount / Math.max(teacherList.length, 1)) * 100);

  const filteredTeachers = teacherList.filter((t) => {
    const matchFase = selectedFase === 'all' || t.fase === selectedFase;
    
    let matchStage = true;
    if (selectedStage !== 'all') {
      const sess = sessionStates?.[t.id];
      const status = sess?.status || t.stage.toUpperCase();
      
      if (selectedStage === 'pra') {
        matchStage = ['DRAFT', 'DIAJUKAN', 'DISETUJUI', 'TERJADWAL', 'PRA', 'OBSERVASI TERJADWAL'].includes(status) || status.startsWith('OBSERVASI TERJADWAL');
      } else if (selectedStage === 'telaah') {
        matchStage = ['DOKUMEN_DIUPLOAD', 'TELAAH', 'PERLU_PERBAIKAN', 'ANTREAN VERIFIKASI', 'PERLU PERBAIKAN MODUL'].includes(status) || status.startsWith('PERLU') || status.startsWith('ANTREAN');
      } else if (selectedStage === 'observasi') {
        matchStage = ['PERANGKAT_DINILAI', 'OBSERVASI', 'OBSERVASI_TERJADWAL'].includes(status);
      } else if (selectedStage === 'refleksi') {
        matchStage = ['OBSERVASI_DILAKUKAN', 'REFLEKSI_GURU', 'REFLEKSI', 'MENUNGGU REFLEKSI'].includes(status) || status.startsWith('MENUNGGU');
      } else if (selectedStage === 'tuntas') {
        matchStage = ['SELESAI', 'TUNTAS', 'SIKLUS TUNTAS'].includes(status) || status.startsWith('SIKLUS');
      }
    }

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
            <span className="text-xs text-slate-600">Siklus Ganjil 2026/2027</span>
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
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Jadwal Sesi Aktif</span>
            <div className="w-8 h-8 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                co_present
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{kpiJadwalHariIni}</span>
            <span className="text-xs text-slate-500">Sesi Kelas</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6ffbbe] text-[#002113]">
              Terjadwal
            </span>
            <span className="text-[11px] text-slate-500">Fase A, B & C</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: `${(kpiJadwalHariIni / Math.max(teacherList.length, 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Antrean Telaah</span>
            <div className="w-8 h-8 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#4b41e1]">
              <span className="material-symbols-outlined text-base">menu_book</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{kpiMenungguTelaah}</span>
            <span className="text-xs text-slate-500">Modul Ajar</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-xs text-amber-600">hourglass_empty</span>
            <span className="text-[11px] text-amber-600 font-medium">Butuh Verifikasi</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: `${(kpiMenungguTelaah / Math.max(teacherList.length, 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Kelas Diobservasi</span>
            <div className="w-8 h-8 rounded-full bg-[#6ffbbe] flex items-center justify-center text-[#006947]">
              <span className="material-symbols-outlined text-base animate-pulse">live_tv</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{kpiSedangBerjalan}</span>
            <span className="text-xs text-slate-500">Kunjungan</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-[#00855b] animate-ping"></span>
            <span className="text-[11px] text-[#006947] font-semibold">Sesi Berlangsung</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#00855b] h-full rounded-full" style={{ width: `${(kpiSedangBerjalan / Math.max(teacherList.length, 1)) * 100}%` }}></div>
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
            <span className="text-2xl font-bold text-slate-900 tabular-nums">{kpiMenungguRefleksi}</span>
            <span className="text-xs text-slate-500">Pendidik</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-xs text-[#00685f]">schedule</span>
            <span className="text-[11px] text-slate-600">Proses Umpan Balik</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#6bd8cb] h-full rounded-full" style={{ width: `${(kpiMenungguRefleksi / Math.max(teacherList.length, 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* KPI 5: Annual Progress */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Capaian Semester</span>
            <div className="w-8 h-8 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-base">pie_chart</span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#00685f] tabular-nums">{kpiCapaianPersen}%</span>
            <span className="text-xs text-slate-500 font-medium">({kpiTuntasCount}/{teacherList.length} Guru)</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-slate-500">
            <span className="material-symbols-outlined text-xs text-[#006947]">trending_up</span>
            <span className="text-[11px] text-[#006947] font-medium">Selesai Tuntas</span>
          </div>
          <div className="w-full bg-[#eff4ff] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: `${kpiCapaianPersen}%` }}></div>
          </div>
        </div>
      </div>

      {/* Section 2: Antrean Tindakan Supervisi Hari Ini (Dynamic Queue) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#00685f] rounded-full"></div>
            <div>
              <h2 className="text-lg font-bold text-[#0b1c30]">Antrean Tindakan Supervisi Hari Ini</h2>
              <p className="text-xs text-slate-500">
                Langkah prioritas verifikasi modul ajar, kunjungan kelas live, atau dialog reflektif klinis berdasarkan status terbaru
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#eff4ff] text-teal-800 font-bold border border-teal-200/40">
            {pendingActions.length} Tindakan Menunggu Eksekusi
          </span>
        </div>

        {pendingActions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {pendingActions.slice(0, 3).map((act, idx) => (
              <div 
                key={act.teacher.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between relative group hover:shadow-md hover:border-[#00685f]/30 transition-all duration-300"
              >
                {/* Visual Top Highlight Line */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
                    act.type === 'telaah' ? 'bg-[#4b41e1]' : act.type === 'observasi' ? 'bg-[#00685f]' : 'bg-amber-500'
                  }`}
                ></div>

                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold ${act.badgeBg} ${act.badgeTextCol}`}>
                      {act.type === 'observasi' && <span className="w-1.5 h-1.5 rounded-full bg-[#00855b] animate-ping"></span>}
                      {act.badgeText}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                      Antrean #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {act.teacher.avatar ? (
                      <img
                        className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-slate-100"
                        alt={act.teacher.name}
                        src={act.teacher.avatar}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#00685f]/15 text-[#00685f] flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-[#00685f]/5">
                        {act.teacher.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{act.teacher.name}</h3>
                      <p className="text-[10px] text-slate-400">NIP. {act.teacher.nip}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-700 font-bold">
                          {act.teacher.rombel}
                        </span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] text-[#00685f] font-bold">{act.teacher.faseLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 space-y-1 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Topik Pembelajaran</span>
                      <span className="text-[9px] font-semibold text-slate-500">{act.teacher.subject}</span>
                    </div>
                    <p className="text-xs text-slate-900 font-bold leading-snug">{act.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed truncate-2-lines mt-1">
                      {act.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTeacherForObservation(act.teacher.id);
                      if (act.type === 'refleksi') {
                        onNavigate('teacher_report');
                      } else {
                        onNavigate('observation_form');
                      }
                    }}
                    className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all ${
                      act.type === 'observasi' 
                        ? 'bg-[#00685f] hover:bg-[#008378] text-white' 
                        : act.type === 'telaah' 
                        ? 'bg-[#4b41e1] hover:bg-[#645efb] text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                    <span>{act.btnText}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerToast(`Membuka berkas dokumen administrasi ${act.teacher.name}`)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200/60"
                    title="Lihat Berkas"
                  >
                    <span className="material-symbols-outlined text-base">description</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#6ffbbe]/15 border border-[#6ffbbe]/40 rounded-2xl p-6 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6ffbbe]/40 text-[#006947]">
              <span className="material-symbols-outlined text-2xl font-bold">verified_user</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Semua Tindakan Selesai Diperiksa!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Luar biasa! Seluruh tenaga pendidik UPT SPF SDN Percontohan PAM Kota Makassar berada dalam status aman. Tidak ada antrean tugas verifikasi atau observasi yang tersisa hari ini.
            </p>
          </div>
        )}
      </div>

      {/* Section 3: Dual-Visualization Dashboard (Supervisi & 7 KAIH) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Pipeline Supervisi 5 Tahap (Interactive Chart) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Fase & Tahapan</span>
              <h2 className="text-base font-extrabold text-[#0b1c30]">Perkembangan Siklus Supervisi Klinis</h2>
            </div>
            <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200/25">
              Klik tahapan untuk memfilter tabel
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <p className="text-xs font-bold text-slate-700">Rangkaian Alur Kemajuan Pendidik (Total {teacherList.length} Guru):</p>
            
            {/* Elegant SVG Connected Flow Graph */}
            <div className="relative py-2 px-1">
              {/* Connector Line */}
              <div className="absolute top-[32px] left-8 right-8 h-1 bg-slate-200 -z-0"></div>
              
              <div className="grid grid-cols-5 gap-1.5 relative z-10">
                {/* Step 1: Pra */}
                <button 
                  onClick={() => setSelectedStage(selectedStage === 'pra' ? 'all' : 'pra')}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    selectedStage === 'pra' 
                      ? 'bg-sky-500 text-white ring-4 ring-sky-500/25 scale-110' 
                      : 'bg-white hover:bg-sky-50 text-sky-500 border-2 border-sky-400'
                  }`}>
                    <span className="text-xs font-black">{dynamicCounts.pra}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2 text-center truncate w-full">1. Pra-Obs</span>
                  <span className="text-[9px] text-slate-400 font-medium">Persiapan</span>
                </button>

                {/* Step 2: Telaah */}
                <button 
                  onClick={() => setSelectedStage(selectedStage === 'telaah' ? 'all' : 'telaah')}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    selectedStage === 'telaah' 
                      ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/25 scale-110' 
                      : 'bg-white hover:bg-indigo-50 text-indigo-500 border-2 border-indigo-400'
                  }`}>
                    <span className="text-xs font-black">{dynamicCounts.telaah}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2 text-center truncate w-full">2. Telaah RPP</span>
                  <span className="text-[9px] text-slate-400 font-medium">Validasi</span>
                </button>

                {/* Step 3: Observasi */}
                <button 
                  onClick={() => setSelectedStage(selectedStage === 'observasi' ? 'all' : 'observasi')}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    selectedStage === 'observasi' 
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/25 scale-110' 
                      : 'bg-white hover:bg-rose-50 text-rose-500 border-2 border-rose-400'
                  }`}>
                    <span className="text-xs font-black">{dynamicCounts.observasi}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2 text-center truncate w-full">3. Observasi</span>
                  <span className="text-[9px] text-slate-400 font-medium">Kunjungan</span>
                </button>

                {/* Step 4: Refleksi */}
                <button 
                  onClick={() => setSelectedStage(selectedStage === 'refleksi' ? 'all' : 'refleksi')}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    selectedStage === 'refleksi' 
                      ? 'bg-amber-500 text-white ring-4 ring-amber-500/25 scale-110' 
                      : 'bg-white hover:bg-amber-50 text-amber-500 border-2 border-amber-400'
                  }`}>
                    <span className="text-xs font-black">{dynamicCounts.refleksi}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2 text-center truncate w-full">4. Dialog RTL</span>
                  <span className="text-[9px] text-slate-400 font-medium">Refleksi</span>
                </button>

                {/* Step 5: Tuntas */}
                <button 
                  onClick={() => setSelectedStage(selectedStage === 'tuntas' ? 'all' : 'tuntas')}
                  className="flex flex-col items-center group focus:outline-none"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    selectedStage === 'tuntas' 
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/25 scale-110' 
                      : 'bg-white hover:bg-emerald-50 text-emerald-500 border-2 border-emerald-400'
                  }`}>
                    <span className="text-xs font-black">{dynamicCounts.tuntas}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-2 text-center truncate w-full">5. Siklus Tuntas</span>
                  <span className="text-[9px] text-slate-400 font-medium">Arsip</span>
                </button>
              </div>
            </div>

            {/* Custom Multi-Segment Stacked Visual Bar */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-bold text-slate-500">Bobot Distribusi Tahapan Saat Ini:</span>
              <div className="h-4 w-full rounded-full bg-slate-200 flex overflow-hidden shadow-inner">
                <div 
                  style={{ width: `${Math.max(8, (dynamicCounts.pra / Math.max(teacherList.length, 1)) * 100)}%` }} 
                  className="bg-sky-500 hover:opacity-90 transition-all duration-300" 
                  title={`Pra-Observasi: ${dynamicCounts.pra} Guru`}
                ></div>
                <div 
                  style={{ width: `${Math.max(8, (dynamicCounts.telaah / Math.max(teacherList.length, 1)) * 100)}%` }} 
                  className="bg-indigo-500 hover:opacity-90 transition-all duration-300 border-l border-white" 
                  title={`Telaah Modul: ${dynamicCounts.telaah} Guru`}
                ></div>
                <div 
                  style={{ width: `${Math.max(8, (dynamicCounts.observasi / Math.max(teacherList.length, 1)) * 100)}%` }} 
                  className="bg-rose-500 hover:opacity-90 transition-all duration-300 border-l border-white" 
                  title={`Observasi Kelas: ${dynamicCounts.observasi} Guru`}
                ></div>
                <div 
                  style={{ width: `${Math.max(8, (dynamicCounts.refleksi / Math.max(teacherList.length, 1)) * 100)}%` }} 
                  className="bg-amber-500 hover:opacity-90 transition-all duration-300 border-l border-white" 
                  title={`Dialog Refleksi: ${dynamicCounts.refleksi} Guru`}
                ></div>
                <div 
                  style={{ width: `${Math.max(8, (dynamicCounts.tuntas / Math.max(teacherList.length, 1)) * 100)}%` }} 
                  className="bg-emerald-500 hover:opacity-90 transition-all duration-300 border-l border-white" 
                  title={`Siklus Tuntas: ${dynamicCounts.tuntas} Guru`}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-600 pl-1 leading-relaxed bg-[#eff4ff] p-3 rounded-2xl border border-slate-100 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-[#00685f] shrink-0 mt-0.5">info</span>
            <span>
              <strong>Siklus Supervisi Klinis SIPAKAINGE:</strong> Klik tombol bundar di atas untuk memfilter tabel guru berdasarkan tahapan tertentu. Semua data direkam secara real-time dan disinkronkan ke pusat kendali kepala sekolah.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Ketercapaian 7 KAIH Sekolah (SVG Chart & Policy Advisory) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block">Pemantauan Dapodik</span>
              <h2 className="text-base font-extrabold text-[#0b1c30]">Ketercapaian Pembiasaan 7 KAIH Murid</h2>
            </div>
            <button
              onClick={() => onNavigate('student_dashboard')}
              className="text-[11px] text-teal-800 font-bold hover:underline flex items-center gap-0.5 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/40"
            >
              <span>Detil Siswa</span>
              <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">Rerata Adherensi Harian Murid (Buku Pantau):</p>
              <span className="text-[10px] font-extrabold bg-[#6ffbbe]/30 text-[#006947] px-2 py-0.5 rounded-full">Sekolah: 87.5%</span>
            </div>
            
            {/* Custom SVG Rendered Bar Chart (High-Impact Visualization) */}
            <div className="w-full flex items-end justify-between h-[150px] pt-4 px-2 border-b border-slate-200 relative">
              {/* Horizontal Reference Lines */}
              <div className="absolute left-0 right-0 top-[25px] border-t border-slate-200/40 border-dashed pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-[65px] border-t border-slate-200/40 border-dashed pointer-events-none"></div>
              <div className="absolute left-0 right-0 top-[105px] border-t border-slate-200/40 border-dashed pointer-events-none"></div>

              {habitStats.map((h) => {
                // Calculate height proportionally up to 100% (map to max 120px)
                const barHeight = Math.round((h.rate / 100) * 110);
                return (
                  <div key={h.id} className="flex flex-col items-center flex-1 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-md w-28 text-center leading-snug">
                      {h.name}: {h.rate}% Adherensi
                    </div>

                    {/* SVG Rect Simulator */}
                    <div 
                      style={{ height: `${barHeight}px` }}
                      className={`w-5 sm:w-7 rounded-t-md transition-all duration-500 hover:opacity-80 shadow-sm relative overflow-hidden ${
                        h.rate >= 95 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : h.rate >= 85 ? 'bg-gradient-to-t from-teal-600 to-teal-400' : 'bg-gradient-to-t from-amber-500 to-amber-300'
                      }`}
                    >
                      {/* Interactive Light Glow */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* Habit Percentage Label */}
                    <span className="text-[10px] font-bold text-slate-800 mt-1.5 font-mono">{h.rate}%</span>
                    
                    {/* Icon Label */}
                    <span 
                      className="material-symbols-outlined text-xs text-slate-400 mt-1" 
                      title={h.name}
                    >
                      {h.icon}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Custom SVG Labels Key Legend */}
            <div className="grid grid-cols-7 gap-1 text-[8px] text-slate-400 font-bold text-center leading-tight">
              <span>H-1 (Alarm)</span>
              <span>H-2 (Ibadah)</span>
              <span>H-3 (Olahraga)</span>
              <span>H-4 (Makan)</span>
              <span>H-5 (Membaca)</span>
              <span>H-6 (Adab)</span>
              <span>H-7 (Tidur)</span>
            </div>
          </div>


        </div>

      </div>

      {/* Section 4: Daftar Guru dalam Siklus Supervisi (Dynamic Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#0b1c30]">Daftar Guru dalam Siklus Supervisi</h2>
            <p className="text-xs text-slate-500">
              Kelola status observasi, telaah rubrik instrumen, dan cetak berita acara resmi sekolah secara dinamis
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
              {filteredTeachers.map((t) => {
                const stageInfo = getTeacherStageInfo(t);
                return (
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
                          stageInfo.type === 'error'
                            ? 'text-[#ba1a1a]'
                            : stageInfo.type === 'tertiary'
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
                          stageInfo.type === 'tertiary'
                            ? 'bg-[#6ffbbe] text-[#002113]'
                            : stageInfo.type === 'error'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : stageInfo.type === 'secondary'
                            ? 'bg-[#e2dfff] text-[#3323cc]'
                            : 'bg-[#eff4ff] text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            stageInfo.type === 'tertiary'
                              ? 'bg-[#00855b]'
                              : stageInfo.type === 'error'
                              ? 'bg-[#ba1a1a]'
                              : stageInfo.type === 'secondary'
                              ? 'bg-[#4b41e1]'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        {stageInfo.text}
                      </span>
                    </td>

                    {/* Actions (Dynamic Router) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {renderActions(t)}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
      </div>
    </div>
  );
};
