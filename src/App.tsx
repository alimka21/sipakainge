/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ScreenId, UserRole, SupervisionSession, SupervisionStatus, MuridRecord } from './types';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';
import { BeritaAcaraModal, QuickRecordModal } from './components/Modals';
import { EmptyDataNotice } from './components/EmptyDataNotice';
import { getGuruClass, getVisibleMurid } from './lib/access';
import { normalizeNip } from './lib/csvImport';
import { syncServerTime } from './lib/time';
import { resolveNavigation, ROLE_HOME, PUBLIC_HOME, NavContext } from './lib/routes';
import {
  getTeachersData,
  getMuridData,
  getRombelData,
  getSchoolSettings,
  updatePrincipalAccount,
  upsertTeacher,
  upsertTeachers,
  upsertMurid,
  attachStudentRecords,
  syncMuridChanges,
  getSupervisionSessions,
  upsertSupervisionSession,
  isSupabaseConfigured,
  SupabaseWriteResult,
} from './lib/supabase';
import {
  withUsernames,
  findTeacherByLogin,
  checkTeacherPassword,
  checkParentPassword,
  checkAccountPassword,
  hashPassword,
  normalizeIdNumber,
  teacherLoginId,
  DEFAULT_NO_NIP_PASSWORD,
} from './lib/accounts';
import { INITIAL_TEACHERS, INITIAL_MURID, INITIAL_ROMBEL, APP_ASSETS, PRINCIPAL_NIP, PRINCIPAL_NAME, HABIT_LIST } from './data/mockData';

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
import { AccountSettingsView, AccountActionResult } from './views/AccountSettingsView';

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
  const [principalName, setPrincipalName] = useState<string>(PRINCIPAL_NAME);
  // null = Kepala Sekolah still uses the default password (her NIP).
  const [principalPasswordHash, setPrincipalPasswordHash] = useState<string | null>(null);
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
      const [remoteRombel, remoteTeachers, baseMurid, settings, remoteSessions] = await Promise.all([
        getRombelData(),
        getTeachersData(),
        getMuridData(),
        getSchoolSettings(),
        getSupervisionSessions(),
      ]);
      // Presensi, nilai, portofolio, prestasi, dan jurnal 7 KAIH hari ini.
      const remoteMurid = await attachStudentRecords(baseMurid);
      if (remoteSessions) setSessionStates((prev) => ({ ...remoteSessions, ...prev }));
      setRombelList(remoteRombel);
      // Guru without NIP log in with a username. Older rows (saved before
      // usernames existed) get one now and it's written back, so it stays
      // the same from then on.
      const teachersWithUsernames = withUsernames(remoteTeachers);
      setTeachersList(teachersWithUsernames);
      const newlyNamed = teachersWithUsernames.filter((t, i) => t.username !== remoteTeachers[i].username);
      if (newlyNamed.length > 0) upsertTeachers(newlyNamed);
      setMuridList(remoteMurid);
      if (settings?.photoUrl) setPrincipalPhoto(settings.photoUrl);
      if (settings?.principalName) setPrincipalName(settings.principalName);
      setPrincipalPasswordHash(settings?.principalPasswordHash ?? null);
    })();
  }, []);

  // ---------------------------------------------------------------------------
  // Penyimpanan permanen data yang diisi lewat layar input (7 KAIH, presensi,
  // nilai, portofolio, prestasi, input cepat orang tua, sesi supervisi).
  // Layar-layar itu cukup memanggil setter biasa; pembungkus di bawah ini
  // memperbarui state lalu menulis bagian yang berubah ke Supabase. Sebelum
  // ini, semua data tersebut hanya ada di memori browser dan hilang saat
  // halaman dimuat ulang.
  // ---------------------------------------------------------------------------
  const muridListRef = useRef(muridList);
  muridListRef.current = muridList;
  const reportSyncFailure = (what: string, message?: string) =>
    showToast(`⚠ ${what} belum tersimpan ke database: ${message || 'koneksi gagal'}. Coba simpan ulang.`);

  const updateMuridListAndSync: React.Dispatch<React.SetStateAction<MuridRecord[]>> = (action) => {
    const prev = muridListRef.current;
    const next = typeof action === 'function' ? action(prev) : action;
    if (next === prev) return;
    muridListRef.current = next;
    setMuridList(next);
    syncMuridChanges(prev, next).then((res) => {
      if (!res.success) reportSyncFailure('Data murid', res.message);
    });
  };

  const sessionStatesRef = useRef(sessionStates);
  sessionStatesRef.current = sessionStates;
  // Form supervisi menulis per ketikan — tunda penulisan ke DB sampai pengguna
  // berhenti mengetik sebentar, satu timer per guru.
  const sessionSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const scheduleSessionSave = (teacherId: string) => {
    clearTimeout(sessionSaveTimers.current[teacherId]);
    sessionSaveTimers.current[teacherId] = setTimeout(async () => {
      delete sessionSaveTimers.current[teacherId];
      const session = sessionStatesRef.current[teacherId];
      if (!session) return;
      const res = await upsertSupervisionSession(teacherId, session);
      if (!res.success) reportSyncFailure('Sesi supervisi', res.message);
    }, 800);
  };

  const updateSessionStatesAndSync: React.Dispatch<React.SetStateAction<Record<string, SupervisionSession>>> = (
    action
  ) => {
    const prev = sessionStatesRef.current;
    const next = typeof action === 'function' ? action(prev) : action;
    if (next === prev) return;
    sessionStatesRef.current = next;
    setSessionStates(next);
    Object.keys(next).forEach((teacherId) => {
      if (next[teacherId] !== prev[teacherId]) scheduleSessionSave(teacherId);
    });
  };

  // Simpan sesi yang masih menunggu kalau tab ditutup / dimuat ulang.
  useEffect(() => {
    const flush = () => {
      Object.keys(sessionSaveTimers.current).forEach((teacherId) => {
        clearTimeout(sessionSaveTimers.current[teacherId]);
        const session = sessionStatesRef.current[teacherId];
        if (session) upsertSupervisionSession(teacherId, session);
      });
      sessionSaveTimers.current = {};
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
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

  // ---------------------------------------------------------------------------
  // Pengaturan Akun — each logged-in account edits only its own name/password.
  // ---------------------------------------------------------------------------
  const describeSave = (remote: SupabaseWriteResult, what: string): AccountActionResult => {
    if (!isSupabaseConfigured()) {
      return { ok: true, message: `${what} berhasil disimpan (belum tersambung Supabase — hanya berlaku di sesi ini).` };
    }
    return remote.success
      ? { ok: true, message: `${what} berhasil disimpan.` }
      : { ok: false, message: `${what} gagal disimpan ke Supabase: ${remote.message}` };
  };

  const MIGRATION_NEEDED: AccountActionResult = {
    ok: false,
    message:
      'Kata sandi belum bisa disimpan: database belum diperbarui. Minta admin menjalankan ulang Script SQL terbaru (Manajemen Pengguna → Salin Script SQL) di Supabase.',
  };

  const makeInitials = (name: string) =>
    name
      .split(',')[0]
      .replace(/^(Ibu|Bpk\.?|Bapak|Drs\.?|Dra\.?|Dr\.?|Hj\.?)\s+/i, '')
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const handleSaveAccountName = async (name: string): Promise<AccountActionResult> => {
    if (userRole === 'kepala_sekolah') {
      setPrincipalName(name);
      return describeSave(await updatePrincipalAccount({ principalName: name }), 'Nama');
    }
    if (userRole === 'guru') {
      if (!loggedInGuru) return { ok: false, message: 'Akun guru tidak ditemukan.' };
      const updated = { ...loggedInGuru, name, initials: makeInitials(name) };
      setTeachersList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      return describeSave(await upsertTeacher(updated), 'Nama');
    }
    if (!parentChild) return { ok: false, message: 'Data Ananda tidak ditemukan.' };
    const updated = { ...parentChild, parentName: name };
    setMuridList((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    return describeSave(await upsertMurid(updated), 'Nama');
  };

  // Unlike the name, a new password is only applied locally once it's safely
  // stored — otherwise the user would be locked out after the next reload.
  const handleChangeAccountPassword = async (current: string, next: string): Promise<AccountActionResult> => {
    const wrong: AccountActionResult = { ok: false, message: 'Kata sandi lama salah.' };
    if (userRole === 'kepala_sekolah') {
      if (!(await checkAccountPassword(current, principalPasswordHash, PRINCIPAL_NIP, normalizeIdNumber))) return wrong;
      const hash = await hashPassword(next);
      const remote = await updatePrincipalAccount({ principalPasswordHash: hash });
      if (remote.accountColumnsMissing) return MIGRATION_NEEDED;
      const result = describeSave(remote, 'Kata sandi');
      if (result.ok) setPrincipalPasswordHash(hash);
      return result;
    }
    if (userRole === 'guru') {
      if (!loggedInGuru) return { ok: false, message: 'Akun guru tidak ditemukan.' };
      if (!(await checkTeacherPassword(loggedInGuru, current))) return wrong;
      const updated = { ...loggedInGuru, passwordHash: await hashPassword(next) };
      const remote = await upsertTeacher(updated);
      if (remote.accountColumnsMissing) return MIGRATION_NEEDED;
      const result = describeSave(remote, 'Kata sandi');
      if (result.ok) setTeachersList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      return result;
    }
    if (!parentChild) return { ok: false, message: 'Data Ananda tidak ditemukan.' };
    if (!(await checkParentPassword(parentChild, current))) return wrong;
    const updated = { ...parentChild, parentPasswordHash: await hashPassword(next) };
    const remote = await upsertMurid(updated);
    if (remote.accountColumnsMissing) return MIGRATION_NEEDED;
    const result = describeSave(remote, 'Kata sandi');
    if (result.ok) setMuridList((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    return result;
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
              principalName={principalName}
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
              principalName={principalName}
            />
          )}
          {currentScreen === 'login' && (
            <LoginPortalView
              principalName={principalName}
              onLogin={async (role, identifier, password) => {
                // Sets isLoggedIn + jumps straight to the role's home screen
                // rather than going through the guarded handleNavigate — the
                // role/identity state (setUserRole/setGuruId/setParentMuridId)
                // hasn't committed yet in this same synchronous call, so
                // resolveNavigation would still see the *previous* session
                // and could reject a perfectly valid first navigation.
                //
                // Default passwords (until the user changes it in Pengaturan
                // Akun): NIP for kepala_sekolah and guru with NIP, "123456"
                // for guru without NIP (who log in with their username), NISN
                // for orang tua. See src/lib/accounts.ts.
                if (role === 'orang_tua') {
                  const nisnMatch = identifier.match(/\d+/);
                  const foundMurid = nisnMatch
                    ? muridList.find((m) => m.nisn === nisnMatch[0])
                    : undefined;
                  if (!foundMurid) {
                    showToast('NISN tidak terdaftar. Hubungi wali kelas atau admin sekolah.');
                    return;
                  }
                  if (!(await checkParentPassword(foundMurid, password))) {
                    showToast(
                      foundMurid.parentPasswordHash
                        ? 'Kata sandi salah.'
                        : 'Kata sandi salah. Kata sandi bawaan orang tua adalah NISN Ananda.'
                    );
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
                  const foundGuru = findTeacherByLogin(teachersList, identifier);
                  if (!foundGuru) {
                    showToast('NIP / username tidak terdaftar. Hubungi Kepala Sekolah untuk didaftarkan.');
                    return;
                  }
                  if (!(await checkTeacherPassword(foundGuru, password))) {
                    showToast(
                      foundGuru.passwordHash
                        ? 'Kata sandi salah.'
                        : foundGuru.nip.trim()
                        ? 'Kata sandi salah. Kata sandi bawaan guru adalah NIP Anda sendiri.'
                        : `Kata sandi salah. Kata sandi bawaan guru tanpa NIP adalah ${DEFAULT_NO_NIP_PASSWORD}.`
                    );
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
                if (normalizeIdNumber(identifier) !== PRINCIPAL_NIP) {
                  showToast('NIP Kepala Sekolah tidak dikenali.');
                  return;
                }
                if (!(await checkAccountPassword(password, principalPasswordHash, PRINCIPAL_NIP, normalizeIdNumber))) {
                  showToast(
                    principalPasswordHash
                      ? 'Kata sandi salah.'
                      : 'Kata sandi salah. Kata sandi bawaan Kepala Sekolah adalah NIP Anda sendiri.'
                  );
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
                parentName={parentChild?.parentName}
                principalName={principalName}
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
                  onUpdateSessionStates={updateSessionStatesAndSync}
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
                  principalName={principalName}
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
                  onUpdateMuridList={updateMuridListAndSync}
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
                  onUpdateMuridList={updateMuridListAndSync}
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
                  onUpdateMuridList={updateMuridListAndSync}
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
                  onUpdateMuridList={updateMuridListAndSync}
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
                  onUpdateMuridList={updateMuridListAndSync}
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
                    onUpdateSessionStates={updateSessionStatesAndSync}
                    teacherList={teachersList}
                    muridList={muridList}
                    onUpdateMuridList={updateMuridListAndSync}
                    guruId={guruId}
                    principalName={principalName}
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
                  onUpdateSessionStates={updateSessionStatesAndSync}
                  selectedTeacherId={selectedTeacherId}
                  onSelectTeacherId={setSelectedTeacherId}
                  teacherList={teachersList}
                  principalName={principalName}
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
                  principalName={principalName}
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
                  onUpdateMuridList={updateMuridListAndSync}
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
                  principalName={principalName}
                />
              )}

              {/* 8. Pengaturan Akun (semua peran) */}
              {currentScreen === 'account_settings' &&
                (userRole === 'kepala_sekolah' ? (
                  <AccountSettingsView
                    userRole={userRole}
                    accountName={principalName}
                    nameLabel="Nama Lengkap Kepala Sekolah"
                    loginIdLabel="NIP"
                    loginId={PRINCIPAL_NIP}
                    usingDefaultPassword={!principalPasswordHash}
                    defaultPasswordHint="NIP Anda"
                    onSaveName={handleSaveAccountName}
                    onChangePassword={handleChangeAccountPassword}
                  />
                ) : userRole === 'guru' && loggedInGuru ? (
                  <AccountSettingsView
                    userRole={userRole}
                    accountName={loggedInGuru.name}
                    nameLabel="Nama Lengkap Guru"
                    loginIdLabel={loggedInGuru.nip.trim() ? 'NIP' : 'Username'}
                    loginId={teacherLoginId(loggedInGuru)}
                    usingDefaultPassword={!loggedInGuru.passwordHash}
                    defaultPasswordHint={loggedInGuru.nip.trim() ? 'NIP Anda' : DEFAULT_NO_NIP_PASSWORD}
                    onSaveName={handleSaveAccountName}
                    onChangePassword={handleChangeAccountPassword}
                  />
                ) : userRole === 'orang_tua' && parentChild ? (
                  <AccountSettingsView
                    userRole={userRole}
                    accountName={parentChild.parentName}
                    nameLabel="Nama Orang Tua / Wali"
                    loginIdLabel="NISN Ananda"
                    loginId={parentChild.nisn}
                    subtitle={`Orang tua dari ${parentChild.name} (${parentChild.rombel})`}
                    usingDefaultPassword={!parentChild.parentPasswordHash}
                    defaultPasswordHint="NISN Ananda"
                    onSaveName={handleSaveAccountName}
                    onChangePassword={handleChangeAccountPassword}
                  />
                ) : (
                  <EmptyDataNotice
                    title="Akun tidak ditemukan"
                    message="Pengaturan akun hanya tersedia setelah masuk dengan akun sendiri (bukan lewat pergantian peran)."
                    actionLabel="Masuk Ulang"
                    onAction={handleLogout}
                  />
                ))}
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
        principalName={principalName}
      />

      <QuickRecordModal
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        onSave={(entry) => {
          updateMuridListAndSync((prev) =>
            prev.map((m) =>
              m.id === entry.muridId
                ? ({
                    ...m,
                    habits: Object.fromEntries(HABIT_LIST.map((h) => [h.id, entry.habitIds.includes(h.id)])),
                    prayers: { ...m.prayers, ...entry.prayers },
                    wakeUpTime: entry.wakeTime,
                    bedTime: entry.bedTime,
                    homeNote: entry.note,
                    // Isian baru dari rumah perlu divalidasi ulang oleh wali kelas.
                    homeHabitsValidated: false,
                  } as MuridRecord)
                : m
            )
          );
          showToast(`✓ ${entry.habitIds.length} dari 7 pembiasaan hari ini disimpan.`);
        }}
        muridOptions={getVisibleMurid(userRole, muridList, rombelList, parentMuridId, guruId)}
      />
    </div>
  );
}
