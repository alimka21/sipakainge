/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ScreenId, UserRole, SupervisionSession, SupervisionStatus } from './types';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';
import { BeritaAcaraModal, QuickRecordModal } from './components/Modals';
import { EmptyDataNotice } from './components/EmptyDataNotice';
import { getGuruClass, getVisibleMurid } from './lib/access';
import { normalizeNip } from './lib/csvImport';
import { getTeachersData, getMuridData, getRombelData, getPrincipalPhoto, isSupabaseConfigured } from './lib/supabase';
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
  const [isBeritaAcaraOpen, setIsBeritaAcaraOpen] = useState<boolean>(false);
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [muridList, setMuridList] = useState(INITIAL_MURID);
  const [teachersList, setTeachersList] = useState(INITIAL_TEACHERS);
  const [rombelList, setRombelList] = useState(INITIAL_ROMBEL);
  const [principalPhoto, setPrincipalPhoto] = useState<string>(APP_ASSETS.principalPhoto);
  const [parentMuridId, setParentMuridId] = useState<string>('');
  const [guruId, setGuruId] = useState<string>('');
  const loggedInGuru = teachersList.find((t) => t.id === guruId);
  const parentChild = muridList.find((m) => m.id === parentMuridId);

  // Lifted global supervision workflow states mapped to Teacher IDs
  const [sessionStates, setSessionStates] = useState<Record<string, SupervisionSession>>({});

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Muat data guru, murid, dan kelas dari Supabase saat aplikasi dibuka —
  // tanpa ini, layar selalu mulai kosong (state React tidak persisten across
  // reload) walaupun datanya sudah tersimpan di database.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    (async () => {
      const [remoteRombel, remoteTeachers, remoteMurid, remotePrincipalPhoto] = await Promise.all([
        getRombelData(),
        getTeachersData(),
        getMuridData(),
        getPrincipalPhoto(),
      ]);
      setRombelList(remoteRombel);
      setTeachersList(remoteTeachers);
      setMuridList(remoteMurid);
      if (remotePrincipalPhoto) setPrincipalPhoto(remotePrincipalPhoto);
    })();
  }, []);

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
            <LandingPageView
              onNavigate={handleNavigate}
              principalPhotoUrl={principalPhoto}
              totalMurid={muridList.length}
              totalGuru={teachersList.length}
            />
          )}
          {currentScreen === 'student_dashboard' &&
            (muridList.length > 0 ? (
              <StudentProgressDashboardView
                onNavigate={handleNavigate}
                onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
                rombelList={rombelList}
                muridList={muridList}
              />
            ) : (
              <div className="pt-16">
                <EmptyDataNotice
                  title="Belum ada data murid"
                  message="Data murid belum diisi oleh sekolah."
                  actionLabel="Kembali ke Beranda"
                  onAction={() => handleNavigate('landing')}
                />
              </div>
            ))}
          {currentScreen === 'teacher_dashboard' && (
            <TeacherSupervisionDashboardView
              onNavigate={handleNavigate}
              onOpenObservationForm={() => handleNavigate('observation_form')}
              onOpenReport={() => handleNavigate('teacher_report')}
              sessionStates={sessionStates}
              teacherList={teachersList}
            />
          )}
          {currentScreen === 'login' && (
            <LoginPortalView
              onLogin={(role, identifier) => {
                if (role === 'orang_tua') {
                  const nisnMatch = identifier.match(/\d+/);
                  const foundMurid = nisnMatch
                    ? muridList.find((m) => m.nisn === nisnMatch[0])
                    : undefined;
                  if (!foundMurid) {
                    showToast('NISN tidak terdaftar. Hubungi wali kelas atau admin sekolah.');
                    return;
                  }
                  setUserRole(role);
                  setParentMuridId(foundMurid.id);
                  handleNavigate('parent_dashboard');
                  return;
                }
                if (role === 'guru') {
                  const nip = normalizeNip(identifier.replace(/\(.*\)/, ''));
                  const foundGuru = teachersList.find((t) => normalizeNip(t.nip) === nip);
                  if (!foundGuru) {
                    showToast('NIP tidak terdaftar. Hubungi Kepala Sekolah untuk didaftarkan.');
                    return;
                  }
                  setUserRole(role);
                  setGuruId(foundGuru.id);
                  handleNavigate('class_habits_input');
                  return;
                }
                setUserRole(role);
                handleNavigate('supervision_dashboard');
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
            guruClass={getGuruClass(rombelList, guruId)}
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
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              principalPhotoUrl={principalPhoto}
              guruName={loggedInGuru?.name}
              childName={parentChild?.name}
              childClass={parentChild?.rombel}
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
                  sessionStates={sessionStates}
                  onUpdateSessionStates={setSessionStates}
                  teacherList={teachersList}
                  muridList={muridList}
                />
              )}

              {/* 2. Manajemen Pengguna & Tim Observer (Super Admin = Kepala Sekolah) */}
              {currentScreen === 'user_management' && (
                <UserManagementView
                  onNavigate={handleNavigate}
                  teachers={teachersList}
                  onUpdateTeachersList={setTeachersList}
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
                  guruId={guruId}
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
                  guruId={guruId}
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
                  guruId={guruId}
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
                  guruId={guruId}
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
                  guruId={guruId}
                  lockedTab="attendance"
                />
              )}

              {/* 2c. Supervisi Klinis Saya (Halaman Guru yang Diobservasi) */}
              {currentScreen === 'teacher_my_supervision' &&
                (teachersList.length > 0 ? (
                  <TeacherSelfSupervisionView
                    onNavigate={handleNavigate}
                    sessionStates={sessionStates}
                    onUpdateSessionStates={setSessionStates}
                    teacherList={teachersList}
                    muridList={muridList}
                    onUpdateMuridList={setMuridList}
                    guruId={guruId}
                  />
                ) : (
                  <EmptyDataNotice
                  title="Belum ada data guru"
                  message="Tambahkan atau impor data guru di Manajemen Pengguna terlebih dahulu."
                  actionLabel={userRole === 'kepala_sekolah' ? 'Buka Manajemen Pengguna' : undefined}
                  onAction={() => handleNavigate('user_management')}
                />
                ))}

              {/* 3. Formulir Observasi Kelas Live */}
              {currentScreen === 'observation_form' && teachersList.length === 0 && (
                <EmptyDataNotice
                  title="Belum ada data guru"
                  message="Tambahkan atau impor data guru di Manajemen Pengguna terlebih dahulu."
                  actionLabel={userRole === 'kepala_sekolah' ? 'Buka Manajemen Pengguna' : undefined}
                  onAction={() => handleNavigate('user_management')}
                />
              )}
              {currentScreen === 'observation_form' && teachersList.length > 0 && (
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
                  teacherList={teachersList}
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
                  guruId={guruId}
                  teacherList={teachersList}
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
                  guruId={guruId}
                  teacherList={teachersList}
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
                  guruId={guruId}
                  teacherList={teachersList}
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
        teacher={teachersList.find((t) => t.id === selectedTeacherId) ?? teachersList[0]}
        session={sessionStates[selectedTeacherId || teachersList[0]?.id]}
      />

      <QuickRecordModal
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        onSave={(count) => {
          showToast(`Berhasil menyimpan ${count} pembiasaan hari ini ke Dapodik!`);
        }}
        muridOptions={getVisibleMurid(userRole, muridList, rombelList, parentMuridId, guruId)}
      />
    </div>
  );
}
