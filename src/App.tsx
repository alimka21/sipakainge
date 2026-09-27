/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenId, UserRole } from './types';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';
import { BeritaAcaraModal, QuickRecordModal } from './components/Modals';

// Views
import { LandingPageView } from './views/LandingPageView';
import { LoginPortalView } from './views/LoginPortalView';
import { SupervisionDashboardView } from './views/SupervisionDashboardView';
import { TeacherSupervisionDashboardView } from './views/TeacherSupervisionDashboardView';
import { StudentProgressDashboardView } from './views/StudentProgressDashboardView';
import { UserManagementView } from './views/UserManagementView';
import { ObservationFormView } from './views/ObservationFormView';
import { FollowUpPlanView } from './views/FollowUpPlanView';
import { ParentDashboardView } from './views/ParentDashboardView';
import { ParentCalendarView } from './views/ParentCalendarView';
import { ParentPortfolioView } from './views/ParentPortfolioView';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('landing');
  const [userRole, setUserRole] = useState<UserRole>('kepala_sekolah');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBeritaAcaraOpen, setIsBeritaAcaraOpen] = useState<boolean>(false);
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        currentScreen !== 'follow_up_plan'
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
            <LandingPageView onNavigate={handleNavigate} />
          )}
          {currentScreen === 'student_dashboard' && (
            <StudentProgressDashboardView
              onNavigate={handleNavigate}
              onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
            />
          )}
          {currentScreen === 'teacher_dashboard' && (
            <TeacherSupervisionDashboardView
              onNavigate={handleNavigate}
              onOpenObservationForm={() => handleNavigate('observation_form')}
              onOpenFollowUp={() => handleNavigate('follow_up_plan')}
            />
          )}
          {currentScreen === 'login' && (
            <LoginPortalView
              onLogin={(role) => {
                setUserRole(role);
                if (role === 'orang_tua') {
                  handleNavigate('parent_dashboard');
                } else if (role === 'guru') {
                  handleNavigate('observation_form');
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
            />

            {/* Screen Router for Private Workspaces */}
            <main className="min-h-[calc(100vh-4rem)]">
              {/* 1. Ruang Kerja Supervisi Kepala Sekolah (Super Admin) */}
              {currentScreen === 'supervision_dashboard' && (
                <SupervisionDashboardView
                  onNavigate={handleNavigate}
                  onSelectTeacherForObservation={() => handleNavigate('observation_form')}
                  onOpenScheduleModal={() => {
                    showToast('Membuka dialog jadwal supervisi klinis...');
                  }}
                  searchQuery={searchQuery}
                />
              )}

              {/* 2. Manajemen Pengguna & Tim Observer (Super Admin = Kepala Sekolah) */}
              {currentScreen === 'user_management' && (
                <UserManagementView onNavigate={handleNavigate} />
              )}

              {/* 3. Formulir Observasi Kelas Live */}
              {currentScreen === 'observation_form' && (
                <ObservationFormView
                  onNavigate={handleNavigate}
                  onPreviewBeritaAcara={() => setIsBeritaAcaraOpen(true)}
                  onFinishObservation={() => {
                    showToast('Observasi berhasil diselesaikan & disimpan!');
                    handleNavigate('follow_up_plan');
                  }}
                />
              )}

              {/* 4. Rencana Tindak Lanjut (RTL) */}
              {currentScreen === 'follow_up_plan' && (
                <FollowUpPlanView
                  onNavigate={handleNavigate}
                  onDownloadReport={() => {
                    showToast('Mengunduh Laporan Rencana Tindak Lanjut PDF...');
                  }}
                />
              )}

              {/* 5. Portal Orang Tua (Buku Pantau Karakter 7 KAIH) */}
              {currentScreen === 'parent_dashboard' && (
                <ParentDashboardView
                  onNavigate={handleNavigate}
                  onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
                />
              )}

              {/* 6. Kalender 7 KAIH & Input Cepat */}
              {currentScreen === 'parent_calendar' && (
                <ParentCalendarView
                  onNavigate={handleNavigate}
                  onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
                />
              )}

              {/* 7. Portofolio Holistik Siswa */}
              {currentScreen === 'parent_portfolio' && (
                <ParentPortfolioView
                  onNavigate={handleNavigate}
                  onDownloadReport={() => {
                    showToast('Menyiapkan dan mengunduh Dokumen Portofolio Holistik...');
                  }}
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
          handleNavigate('follow_up_plan');
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
