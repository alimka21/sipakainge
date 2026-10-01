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
import { syncServerTime } from './lib/time';
import { resolveNavigation, ROLE_HOME, PUBLIC_HOME, NavContext } from './lib/routes';
import { getTeachersData, getMuridData, getRombelData, getPrincipalPhoto, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_TEACHERS, INITIAL_MURID, INITIAL_ROMBEL, APP_ASSETS, PRINCIPAL_NIP } from './data/mockData';

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const loggedInGuru = teachersList.find((t) => t.id === guruId);
  const parentChild = muridList.find((m) => m.id === parentMuridId);

  // Single source of truth for "who can be on which screen" — see src/lib/routes.ts.
  const navContext: NavContext = {
    isLoggedIn,
    userRole,
    hasGuruClass: !!getGuruClass(rombelList, guruId),
    hasParentChild: muridList.some((m) => m.id === parentMuridId),
  };

  // Lifted global supervision workflow states mapped to Teacher IDs
  const [sessionStates, setSessionStates] = useState<Record<string, SupervisionSession>>({});

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Samakan jam aplikasi dengan jam server (bukan jam perangkat), ulangi tiap 10 menit.
  useEffect(() => {
    syncServerTime();
    const id = setInterval(syncServerTime, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

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

  /**
   * The only place `currentScreen` should be set from outside this function
   * (aside from login/logout/role-switch, which have their own well-defined
   * destinations below). Runs every navigation attempt through the central
   * route table so a screen can never be reached by a role it doesn't belong
   * to, no matter which button or callback tried to get there.
   */
  const handleNavigate = (screen: ScreenId) => {
    const result = resolveNavigation(screen, navContext);
    if (result.blockedMessage) showToast(result.blockedMessage);
    setCurrentScreen(result.screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Dev/demo role switcher (header dropdown) — this app has no real
   * multi-account auth, so "switching role" is how every role's private
   * workspace gets previewed. It's treated as equivalent to being logged in
   * as that role: if the screen you're currently on is still valid for the
   * new role (per the same route table `handleNavigate` uses), stay there;
   * otherwise land on that role's home screen.
   */
  const handleRoleChange = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    const stillValid = resolveNavigation(currentScreen, { ...navContext, userRole: role, isLoggedIn: true }).screen === currentScreen;
    if (!stillValid) {
      setCurrentScreen(ROLE_HOME[role]);
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

  /** Clears the active session and returns to the public landing page. */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setGuruId('');
    setParentMuridId('');
    setCurrentScreen(PUBLIC_HOME);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              onLogin={(role, identifier, password) => {
                // Sets isLoggedIn + jumps straight to the role's home screen
                // rather than going through the guarded handleNavigate — the
                // role/identity state (setUserRole/setGuruId/setParentMuridId)
                // hasn't committed yet in this same synchronous call, so
                // resolveNavigation would still see the *previous* session
                // and could reject a perfectly valid first navigation.
                //
                // Login scheme: password = the same ID number as the
                // identifier (NIP for kepala_sekolah/guru, NISN for orang
                // tua). Not real security (there's no backend auth), but it
                // means a blank/wrong password is rejected instead of
                // silently accepted like before.
                if (role === 'orang_tua') {
                  const nisnMatch = identifier.match(/\d+/);
                  const foundMurid = nisnMatch
                    ? muridList.find((m) => m.nisn === nisnMatch[0])
                    : undefined;
                  if (!foundMurid) {
                    showToast('NISN tidak terdaftar. Hubungi wali kelas atau admin sekolah.');
                    return;
                  }
                  const passwordNisn = password.match(/\d+/)?.[0];
                  if (passwordNisn !== foundMurid.nisn) {
                    showToast('Kata sandi salah. Kata sandi orang tua adalah NISN Ananda.');
                    return;
                  }
                  setUserRole(role);
                  setParentMuridId(foundMurid.id);
                  setIsLoggedIn(true);
                  setCurrentScreen(ROLE_HOME.orang_tua);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                if (role === 'guru') {
                  const nip = normalizeNip(identifier.replace(/\(.*\)/, ''));
                  const foundGuru = teachersList.find((t) => normalizeNip(t.nip) === nip);
                  if (!foundGuru) {
                    showToast('NIP tidak terdaftar. Hubungi Kepala Sekolah untuk didaftarkan.');
                    return;
                  }
                  if (normalizeNip(password.replace(/\(.*\)/, '')) !== normalizeNip(foundGuru.nip)) {
                    showToast('Kata sandi salah. Kata sandi guru adalah NIP Anda sendiri.');
                    return;
                  }
                  setUserRole(role);
                  setGuruId(foundGuru.id);
                  setIsLoggedIn(true);
                  setCurrentScreen(ROLE_HOME.guru);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                // Kepala Sekolah — singleton account, checked against PRINCIPAL_NIP
                // rather than a list (she isn't a row in teachersList).
                const ksNip = normalizeNip(identifier.replace(/\(.*\)/, ''));
                if (ksNip !== PRINCIPAL_NIP) {
                  showToast('NIP Kepala Sekolah tidak dikenali.');
                  return;
                }
                if (normalizeNip(password.replace(/\(.*\)/, '')) !== PRINCIPAL_NIP) {
                  showToast('Kata sandi salah. Kata sandi Kepala Sekolah adalah NIP Anda sendiri.');
                  return;
                }
                setUserRole(role);
                setIsLoggedIn(true);
                setCurrentScreen(ROLE_HOME.kepala_sekolah);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigate={handleNavigate}
            />
          )}
        </div>
      ) : (
        // Private Data Management Layout with Collapsible Sidebar & Header
        <div className="flex min-h-screen pt-16 print:pt-0">
          {/* Collapsible Sidebar — hidden entirely when printing a report */}
          <div className="print:hidden">
            <AppSidebar
              currentScreen={currentScreen}
              onNavigate={handleNavigate}
              userRole={userRole}
              onSwitchRole={handleRoleChange}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              guruClass={getGuruClass(rombelList, guruId)}
            />
          </div>

          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 print:pl-0 ${
              isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
            }`}
          >
            {/* Top Navigation Header with Toggle — hidden when printing */}
            <div className="print:hidden">
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
                onLogout={handleLogout}
              />
            </div>

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
                  onDownloadReport={() => window.print()}
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
