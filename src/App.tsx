/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenId, UserRole, SupervisionSession, SupervisionStatus } from './types';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';
import { BeritaAcaraModal, QuickRecordModal } from './components/Modals';
import { INITIAL_TEACHERS, INITIAL_MURID, INITIAL_ROMBEL, APP_ASSETS } from './data/mockData';

// Views
import { LandingPageView } from './views/LandingPageView';
import { LoginPortalView } from './views/LoginPortalView';
import { SupervisionDashboardView } from './views/SupervisionDashboardView';
import { TeacherSupervisionDashboardView } from './views/TeacherSupervisionDashboardView';
import { StudentProgressDashboardView } from './views/StudentProgressDashboardView';
import { UserManagementView } from './views/UserManagementView';
import { ClassHabitsInputView } from './views/ClassHabitsInputView';
import { ClassManagementView } from './views/ClassManagementView';
import { ObservationFormView } from './views/ObservationFormView';
import { TeacherSupervisionReportView } from './views/TeacherSupervisionReportView';
import { ParentDashboardView } from './views/ParentDashboardView';
import { ParentCalendarView } from './views/ParentCalendarView';
import { ParentPortfolioView } from './views/ParentPortfolioView';
import { TeacherSelfSupervisionView } from './views/TeacherSelfSupervisionView';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('landing');
  const [userRole, setUserRole] = useState<UserRole>('kepala_sekolah');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBeritaAcaraOpen, setIsBeritaAcaraOpen] = useState<boolean>(false);
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('t-1');
  const [muridList, setMuridList] = useState(INITIAL_MURID);
  const [teachersList, setTeachersList] = useState(INITIAL_TEACHERS);
  const [rombelList, setRombelList] = useState(INITIAL_ROMBEL);
  const [principalPhoto, setPrincipalPhoto] = useState<string>(APP_ASSETS.principalPhoto);
  const [parentMuridId, setParentMuridId] = useState<string>('m-4a-1');

  // Lifted global supervision workflow states mapped to Teacher IDs
  const [sessionStates, setSessionStates] = useState<Record<string, SupervisionSession>>({
    't-1': {
      status: 'DOKUMEN_DIUPLOAD',
      mapel: 'IPAS (Sains & Lingkungan)',
      kelas: 'Kelas IV-A',
      topik: 'Ekosistem & Fotosintesis Tumbuhan',
      tujuan: '1. Mengidentifikasi rantai makanan. 2. Membuktikan pelepasan oksigen dalam fotosintesis.',
      tanggal: '2026-10-01',
      jam: '08:00 - 09:30',
      lokasi: 'Ruang Kelas IV-A',
      supervisor: 'Fahmawati, S.Pd. (Kepala Sekolah)',
      catatanAwal: 'Mohon masukan untuk instrumen pancingan bernalar kritis kelompok.',
      rppFileName: 'Modul_Ajar_IPAS_FaseB_Siti_Aminah.pdf',
      rppFileSize: '2.4 MB',
      rppUploadDate: '24 Sep 2026',
      rppStatus: 'BELUM_DIPERIKSA',
      scores17: { 1: 2, 2: 2, 3: 1, 4: 1, 5: 2 },
      comments17: {},
      aspectStatus14: {},
      aspectFeedback14: {},
      kelebihan15: '',
      kekurangan16: '',
      rekomendasi17: '',
      obsTimerSeconds: 0,
      obsNotes: '',
      reflection1: '', reflection2: '', reflection3: '', reflection4: '', reflection5: '', reflection6: '',
      penguatanKS: '', catatanKhususKS: '', rekomendasiKS: '',
      tindakLanjutKS: 'TIDAK_ADA_TINDAK_LANJUT',
      scores22: {},
      comments22: {},
      apresiasiObs: '',
      temuanObs: '',
      kesimpulanObs: 'Baik',
      komitmenGuruNew: '',
    },
    't-2': {
      status: 'DIAJUKAN',
      mapel: 'Matematika Operasional',
      kelas: 'Kelas V-B',
      topik: 'Operasi Pecahan & Desimal',
      tujuan: 'Murid mampu mengoperasikan penjumlahan pecahan berpenyebut tidak sama.',
      tanggal: '2026-10-05',
      jam: '10:00 - 11:30',
      lokasi: 'Ruang Kelas V-B',
      supervisor: 'Ibu Siti Aminah, S.Pd. (Guru Observer)',
      catatanAwal: 'Menggunakan visualizer digital interaktif.',
      rppFileName: '', rppFileSize: '', rppUploadDate: '', rppStatus: 'BELUM_DIPERIKSA',
      scores17: {}, comments17: {}, aspectStatus14: {}, aspectFeedback14: {},
      kelebihan15: '', kekurangan16: '', rekomendasi17: '',
      obsTimerSeconds: 0, obsNotes: '',
      reflection1: '', reflection2: '', reflection3: '', reflection4: '', reflection5: '', reflection6: '',
      penguatanKS: '', catatanKhususKS: '', rekomendasiKS: '',
      tindakLanjutKS: 'TIDAK_ADA_TINDAK_LANJUT',
      scores22: {},
      comments22: {},
      apresiasiObs: '',
      temuanObs: '',
      kesimpulanObs: 'Baik',
      komitmenGuruNew: '',
    },
    't-3': {
      status: 'OBSERVASI_DILAKUKAN',
      mapel: 'Pendidikan Pancasila',
      kelas: 'Kelas VI-C',
      topik: 'Budaya Musyawarah & Gotong Royong',
      tujuan: 'Murid mampu mempraktikkan musyawarah dalam mufakat di kelas secara terbimbing.',
      tanggal: '2026-09-25',
      jam: '09:00 - 10:30',
      lokasi: 'Ruang Kelas VI-C',
      supervisor: 'Fahmawati, S.Pd. (Kepala Sekolah)',
      catatanAwal: 'Diferensiasi proses pembelajaran musyawarah.',
      rppFileName: 'Modul_Ajar_Pancasila_VI_C_Ruslan.pdf',
      rppFileSize: '1.8 MB',
      rppUploadDate: '21 Sep 2026',
      rppStatus: 'DIPERIKSA',
      scores17: { 1: 2, 2: 2, 3: 2, 4: 1, 5: 2, 6: 2, 7: 2, 8: 2, 9: 1, 10: 2, 11: 2, 12: 2, 13: 1, 14: 2, 15: 2, 16: 2, 17: 1 },
      comments17: { 1: 'Sesuai BSKAP terbaru', 4: 'Prota perlu sedikit dirapikan' },
      aspectStatus14: { 1: 'tidak_revisi', 2: 'tidak_revisi', 3: 'tidak_revisi', 4: 'tidak_revisi', 5: 'tidak_revisi', 6: 'tidak_revisi', 7: 'tidak_revisi', 8: 'tidak_revisi', 9: 'tidak_revisi', 10: 'tidak_revisi', 11: 'tidak_revisi', 12: 'tidak_revisi', 13: 'tidak_revisi', 14: 'tidak_revisi' },
      aspectFeedback14: { 1: 'Sangat baik', 7: 'Langkah mengonstruksi pemahaman kontekstual sangat bagus.' },
      kelebihan15: 'RPP sangat lengkap dan terstruktur rapi.',
      kekurangan16: 'Waktu presentasi perlu sedikit diketatkan.',
      rekomendasi17: 'Pertahankan metode diskusi interaktif.',
      obsTimerSeconds: 4522,
      obsNotes: 'Pembelajaran bermula pukul 09.00 tepat. Murid berdiskusi aktif dalam 5 kelompok heterogen untuk merumuskan resolusi konflik mading kelas. Guru berkeliling memberikan umpan balik asertif.',
      reflection1: '', reflection2: '', reflection3: '', reflection4: '', reflection5: '', reflection6: '',
      penguatanKS: '', catatanKhususKS: '', rekomendasiKS: '',
      tindakLanjutKS: 'TIDAK_ADA_TINDAK_LANJUT',
      scores22: { 1: 3, 2: 3, 3: 2, 4: 2, 5: 3, 6: 2, 7: 3, 8: 3, 9: 2, 10: 2, 11: 3, 12: 3, 13: 3, 14: 2, 15: 3, 16: 2, 17: 3, 18: 3, 19: 2, 20: 3, 21: 3, 22: 3 },
      comments22: { 1: 'Suasana sangat positif', 10: 'Media digital dapat dieksplorasi lebih lanjut' },
      apresiasiObs: 'Apresiasi yang tinggi atas keaktifan murid berdiskusi secara demokratis.',
      temuanObs: 'Beberapa kelompok murid membutuhkan bimbingan teknis penggunaan Chromebook.',
      kesimpulanObs: 'Baik dengan Penguatan',
      komitmenGuruNew: 'Mengoptimalkan bimbingan pemanfaatan media digital di sesi berikutnya.',
    },
    't-4': {
      status: 'REFLEKSI_GURU',
      mapel: 'Bahasa Indonesia',
      kelas: 'Kelas III-A',
      topik: 'Teks Deskripsi Lingkungan',
      tujuan: 'Murid terampil menulis deskripsi singkat tentang taman sekolah.',
      tanggal: '2026-09-22',
      jam: '08:00 - 09:30',
      lokasi: 'Taman Sekolah & Ruang Kelas III-A',
      supervisor: 'Fahmawati, S.Pd. (Kepala Sekolah)',
      catatanAwal: 'Melibatkan aktivitas fisik di luar kelas.',
      rppFileName: 'RPP_BIndo_III_A_Aisyah.pdf',
      rppFileSize: '1.2 MB',
      rppUploadDate: '18 Sep 2026',
      rppStatus: 'DIPERIKSA',
      scores17: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 1, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 1, 16: 2, 17: 2 },
      comments17: {},
      aspectStatus14: { 1: 'tidak_revisi', 2: 'tidak_revisi', 3: 'tidak_revisi', 4: 'tidak_revisi', 5: 'tidak_revisi', 6: 'tidak_revisi', 7: 'tidak_revisi', 8: 'tidak_revisi', 9: 'tidak_revisi', 10: 'tidak_revisi', 11: 'tidak_revisi', 12: 'tidak_revisi', 13: 'tidak_revisi', 14: 'tidak_revisi' },
      aspectFeedback14: {},
      kelebihan15: 'Luar biasa dalam mengintegrasikan lingkungan hidup.',
      kekurangan16: 'Instrumen diagnostik masih awal.',
      rekomendasi17: 'Cocok ditiru oleh pararel pendidik.',
      obsTimerSeconds: 5400,
      obsNotes: 'Sesi outdoor di taman sangat rapi. Murid tertib mencatat kosakata panca indera.',
      reflection1: 'Sangat terbantu melihat kegembiraan murid menulis puisi taman.',
      reflection2: 'Aktivitas eksplorasi panca indera di luar kelas.',
      reflection3: 'Manajemen transisi dari luar kelas ke dalam kelas agar tidak gaduh.',
      reflection4: 'Murid Fase B membutuhkan waktu 5-7 menit untuk duduk tenang kembali.',
      reflection5: 'Memberi komando tepuk konsentrasi sebelum kaki melangkah masuk kelas.',
      reflection6: 'Pendampingan sesama guru kelas III untuk menyusun ice breaking.',
      penguatanKS: '', catatanKhususKS: '', rekomendasiKS: '',
      tindakLanjutKS: 'TIDAK_ADA_TINDAK_LANJUT',
      scores22: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 2, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 2, 17: 3, 18: 3, 19: 3, 20: 3, 21: 2, 22: 3 },
      comments22: {},
      apresiasiObs: 'Sangat baik dalam mengaitkan materi alam dengan minat baca siswa.',
      temuanObs: 'Manajemen transisi dari luar kelas ke dalam kelas memakan waktu agak lama.',
      kesimpulanObs: 'Baik dengan Penguatan',
      komitmenGuruNew: 'Melakukan ice breaking relaksasi saat masuk kembali ke kelas.',
    },
    't-5': {
      status: 'SELESAI',
      mapel: 'Pendidikan Karakter & Numerasi Awal',
      kelas: 'Kelas I-B',
      topik: '7 Kebiasaan Anak Indonesia Hebat (7 KAIH) & Berhitung Ceria',
      tujuan: "Integrasi habit tracker 'Gemar Membaca' dan kedisiplinan pagi.",
      tanggal: '2026-09-14',
      jam: '08:00 - 09:15',
      lokasi: 'Ruang Kelas I-B',
      supervisor: 'Fahmawati, S.Pd. (Kepala Sekolah)',
      catatanAwal: 'Materi pembiasaan karakter 7 KAIH.',
      rppFileName: 'Modul_Ajar_Karakter_FaseA_Maria.pdf',
      rppFileSize: '1.9 MB',
      rppUploadDate: '10 Sep 2026',
      rppStatus: 'DIPERIKSA',
      scores17: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2 },
      comments17: {},
      aspectStatus14: { 1: 'tidak_revisi', 2: 'tidak_revisi', 3: 'tidak_revisi' },
      aspectFeedback14: {},
      kelebihan15: 'Kemandirian awal Fase A sangat membanggakan.',
      kekurangan16: 'Tidak ada.',
      rekomendasi17: 'Diseminasi ke tingkat paralel guru.',
      obsTimerSeconds: 4500,
      obsNotes: 'Pola tidur dan nutrisi buah/sayur sangat baik dan konsisten diintegrasikan.',
      reflection1: 'Murid sangat bersemangat bernyanyi lagu karakter.',
      reflection2: 'Pembiasaan membaca mandiri.',
      reflection3: 'Manajemen antrean cuci tangan.',
      reflection4: 'Murid masih suka berebut sabun cuci tangan.',
      reflection5: 'Membuat jadwal giliran piket cuci tangan.',
      reflection6: 'Penyediaan botol sabun cair ekstra.',
      penguatanKS: 'Guru mendemonstrasikan kesabaran yang luar biasa dalam mendampingi murid kelas 1.',
      catatanKhususKS: 'Manajemen kebersihan cuci tangan sudah rapi.',
      rekomendasiKS: 'Sangat baik untuk dibagikan di KKG.',
      tindakLanjutKS: 'TIDAK_ADA_TINDAK_LANJUT',
      scores22: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3, 21: 3, 22: 3 },
      comments22: {},
      apresiasiObs: 'Sempurna dalam penguatan pembiasaan 7 KAIH.',
      temuanObs: 'Tidak ada kendala berarti.',
      kesimpulanObs: 'Sangat Baik',
      komitmenGuruNew: 'Konsisten melakukan habit tracking bersama orang tua murid.',
    }
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    if (role === 'orang_tua') {
      if (
        currentScreen !== 'student_dashboard' &&
        currentScreen !== 'parent_dashboard' &&
        currentScreen !== 'parent_calendar' &&
        currentScreen !== 'parent_portfolio'
      ) {
        setCurrentScreen('student_dashboard');
      }
    } else if (role === 'guru') {
      if (
        currentScreen !== 'teacher_dashboard' &&
        currentScreen !== 'observation_form' &&
        currentScreen !== 'teacher_report'
      ) {
        setCurrentScreen('teacher_dashboard');
      }
    } else {
      if (
        currentScreen === 'parent_dashboard' ||
        currentScreen === 'parent_calendar' ||
        currentScreen === 'parent_portfolio' ||
        currentScreen === 'student_dashboard'
      ) {
        setCurrentScreen('supervision_dashboard');
      }
    }
    showToast(
      `Beralih peran ke: ${
        role === 'kepala_sekolah'
          ? 'Kepala Sekolah (Super Admin & Observer)'
          : role === 'guru'
          ? 'Guru Kelas / Observer'
          : 'Orang Tua / Murid'
      }`
    );
  };

  const isPublicStandaloneView =
    currentScreen === 'landing' ||
    currentScreen === 'login' ||
    currentScreen === 'student_dashboard' ||
    currentScreen === 'teacher_dashboard';

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 antialiased font-sans selection:bg-teal-500 selection:text-white">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl shadow-slate-900/40 ring-1 ring-white/10 animate-fade-in">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
            <span className="material-symbols-outlined text-base">check_circle</span>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {isPublicStandaloneView ? (
        // Dedicated Public Standalone Views (No private sidebar)
        <div>
          {currentScreen === 'landing' && (
            <LandingPageView onNavigate={handleNavigate} principalPhotoUrl={principalPhoto} />
          )}
          {currentScreen === 'student_dashboard' && (
            <StudentProgressDashboardView
              onNavigate={handleNavigate}
              onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
              rombelList={rombelList}
            />
          )}
          {currentScreen === 'teacher_dashboard' && (
            <TeacherSupervisionDashboardView
              onNavigate={handleNavigate}
              onOpenObservationForm={() => handleNavigate('observation_form')}
              onOpenReport={() => handleNavigate('teacher_report')}
              sessionStates={sessionStates}
            />
          )}
          {currentScreen === 'login' && (
            <LoginPortalView
              onLogin={(role, identifier) => {
                setUserRole(role);
                if (role === 'orang_tua') {
                  const nisnMatch = identifier.match(/\d+/);
                  const foundMurid = nisnMatch
                    ? muridList.find((m) => m.nisn === nisnMatch[0])
                    : undefined;
                  setParentMuridId(foundMurid?.id || 'm-4a-1');
                  handleNavigate('parent_dashboard');
                } else if (role === 'guru') {
                  handleNavigate('class_habits_input');
                } else {
                  handleNavigate('supervision_dashboard');
                }
              }}
              onNavigate={handleNavigate}
            />
          )}
        </div>
      ) : (
        // Private Data Management Layout with Collapsible Sidebar & Header
        <div className="flex min-h-screen pt-16">
          {/* Collapsible Sidebar */}
          <AppSidebar
            currentScreen={currentScreen}
            onNavigate={handleNavigate}
            userRole={userRole}
            onSwitchRole={handleRoleChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 ${
              isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
            }`}
          >
            {/* Top Navigation Header with Toggle */}
            <AppHeader
              userRole={userRole}
              onSwitchRole={handleRoleChange}
              onNavigate={handleNavigate}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              principalPhotoUrl={principalPhoto}
            />

            {/* Screen Router for Private Workspaces */}
            <main className="min-h-[calc(100vh-4rem)]">
              {/* 1. Ruang Kerja Supervisi Kepala Sekolah (Super Admin) */}
              {currentScreen === 'supervision_dashboard' && (
                <SupervisionDashboardView
                  onNavigate={handleNavigate}
                  onSelectTeacherForObservation={(id) => {
                    setSelectedTeacherId(id);
                    handleNavigate('observation_form');
                  }}
                  searchQuery={searchQuery}
                  sessionStates={sessionStates}
                  onUpdateSessionStates={setSessionStates}
                />
              )}

              {/* 2. Manajemen Pengguna & Tim Observer (Super Admin = Kepala Sekolah) */}
              {currentScreen === 'user_management' && (
                <UserManagementView
                  onNavigate={handleNavigate}
                  muridList={muridList}
                  onUpdateMuridList={setMuridList}
                  userRole={userRole}
                  principalPhotoUrl={principalPhoto}
                  onUpdatePrincipalPhoto={setPrincipalPhoto}
                  rombelList={rombelList}
                />
              )}

              {/* 2a-1. Manajemen Kelas / Rombel (Kepala Sekolah) */}
              {currentScreen === 'class_management' && (
                <ClassManagementView
                  onNavigate={handleNavigate}
                  rombelList={rombelList}
                  onUpdateRombelList={setRombelList}
                  teacherList={teachersList}
                  muridList={muridList}
                  onUpdateMuridList={setMuridList}
                />
              )}

              {/* 2b. Isian 7 KAIH Per Murid (Wali Kelas) */}
              {currentScreen === 'class_habits_input' && (
                <ClassHabitsInputView
                  onNavigate={handleNavigate}
                  userRole={userRole}
                  muridList={muridList}
                  onUpdateMuridList={setMuridList}
                  rombelList={rombelList}
                  lockedTab="habits"
                />
              )}

              {/* 2b-1. Input Nilai Akademik Mapel (Sidebar Khusus) */}
              {currentScreen === 'academic_input' && (
                <ClassHabitsInputView
                  onNavigate={handleNavigate}
                  userRole={userRole}
                  muridList={muridList}
                  onUpdateMuridList={setMuridList}
                  rombelList={rombelList}
                  lockedTab="academics"
                />
              )}

              {/* 2b-2. Karya & Portofolio Murid (Sidebar Khusus) */}
              {currentScreen === 'portfolio_input' && (
                <ClassHabitsInputView
                  onNavigate={handleNavigate}
                  userRole={userRole}
                  muridList={muridList}
                  onUpdateMuridList={setMuridList}
                  rombelList={rombelList}
                  lockedTab="portfolios"
                />
              )}

              {/* 2b-3. Prestasi & Apresiasi Murid (Sidebar Khusus) */}
              {currentScreen === 'award_input' && (
                <ClassHabitsInputView
                  onNavigate={handleNavigate}
                  userRole={userRole}
                  muridList={muridList}
                  onUpdateMuridList={setMuridList}
                  rombelList={rombelList}
                  lockedTab="awards"
                />
              )}

              {/* 2b-4. Presensi Murid (Sidebar Khusus) */}
              {currentScreen === 'attendance_input' && (
                <ClassHabitsInputView
                  onNavigate={handleNavigate}
                  userRole={userRole}
                  muridList={muridList}
                  onUpdateMuridList={setMuridList}
                  rombelList={rombelList}
                  lockedTab="attendance"
                />
              )}

              {/* 2c. Supervisi Klinis Saya (Halaman Guru yang Diobservasi) */}
              {currentScreen === 'teacher_my_supervision' && (
                <TeacherSelfSupervisionView
                  onNavigate={handleNavigate}
                  sessionStates={sessionStates}
                  onUpdateSessionStates={setSessionStates}
                />
              )}

              {/* 3. Formulir Observasi Kelas Live */}
              {currentScreen === 'observation_form' && (
                <ObservationFormView
                  onNavigate={handleNavigate}
                  onPreviewBeritaAcara={() => setIsBeritaAcaraOpen(true)}
                  onFinishObservation={() => {
                    showToast('Observasi berhasil diselesaikan & disimpan!');
                    handleNavigate('teacher_report');
                  }}
                  userRole={userRole}
                  sessionStates={sessionStates}
                  onUpdateSessionStates={setSessionStates}
                  selectedTeacherId={selectedTeacherId}
                  onSelectTeacherId={setSelectedTeacherId}
                />
              )}

              {/* 4. Laporan Hasil Supervisi per Guru */}
              {currentScreen === 'teacher_report' && (
                <TeacherSupervisionReportView
                  onNavigate={handleNavigate}
                  teacherList={teachersList}
                  sessionStates={sessionStates}
                  selectedTeacherId={selectedTeacherId}
                  onSelectTeacherId={setSelectedTeacherId}
                />
              )}

              {/* 5. Portal Orang Tua (Buku Pantau Karakter 7 KAIH) */}
              {currentScreen === 'parent_dashboard' && (
                <ParentDashboardView
                  onNavigate={handleNavigate}
                  onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
                  userRole={userRole}
                  muridList={muridList}
                  principalPhotoUrl={principalPhoto}
                  parentMuridId={parentMuridId}
                  rombelList={rombelList}
                />
              )}

              {/* 6. Kalender 7 KAIH & Input Cepat */}
              {currentScreen === 'parent_calendar' && (
                <ParentCalendarView
                  onNavigate={handleNavigate}
                  onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
                  userRole={userRole}
                  muridList={muridList}
                  parentMuridId={parentMuridId}
                  rombelList={rombelList}
                />
              )}

              {/* 7. Portofolio Holistik Murid */}
              {currentScreen === 'parent_portfolio' && (
                <ParentPortfolioView
                  onNavigate={handleNavigate}
                  onDownloadReport={() => {
                    showToast('Menyiapkan dan mengunduh Dokumen Portofolio Holistik...');
                  }}
                  userRole={userRole}
                  muridList={muridList}
                  parentMuridId={parentMuridId}
                  rombelList={rombelList}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Interactive Modals */}
      <BeritaAcaraModal
        isOpen={isBeritaAcaraOpen}
        onClose={() => setIsBeritaAcaraOpen(false)}
        onConfirm={() => {
          showToast('Berita acara observasi berhasil ditandatangani secara digital!');
          handleNavigate('teacher_report');
        }}
      />

      <QuickRecordModal
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        onSave={(count) => {
          showToast(`Berhasil menyimpan ${count} pembiasaan hari ini ke Dapodik!`);
        }}
      />
    </div>
  );
}
