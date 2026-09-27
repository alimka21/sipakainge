import React from 'react';
import { ScreenId, UserRole } from '../types';
import { APP_ASSETS } from '../data/mockData';
import { SchoolLogo } from './SchoolLogo';

interface AppSidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  guruClass?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentScreen,
  onNavigate,
  userRole,
  isCollapsed,
  onToggleCollapse,
  guruClass,
}) => {
  const guruClassLabel = guruClass || 'Belum Ditugaskan';
  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="overflow-y-auto flex-1">
        {/* Header Branding in Sidebar */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between gap-2">
          {isCollapsed ? (
            <div className="mx-auto cursor-pointer" onClick={() => onNavigate('landing')}>
              <SchoolLogo className="h-8 w-8 rounded-full bg-white shadow-xs p-0.5 ring-1 ring-teal-600/30 shrink-0" />
            </div>
          ) : (
            <div
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
              onClick={() => onNavigate('landing')}
            >
              <SchoolLogo className="h-9 w-9 rounded-full bg-white shadow-xs p-0.5 ring-1 ring-teal-600/30 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-[#00685f] truncate">
                  SIPAKAINGE
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  SDN Percontohan PAM
                </p>
              </div>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
              title="Perkecil Sidebar"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
          )}
        </div>

        {/* Current User Role Identity Pill */}
        {!isCollapsed && (
          <div className="px-4 pt-3 pb-1">
            <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Hak Akses:
              </span>
              <span className="text-xs font-bold text-teal-800">
                {userRole === 'kepala_sekolah'
                  ? 'Kepala Sekolah (Admin)'
                  : userRole === 'guru'
                  ? 'Guru Kelas & Observer'
                  : 'Orang Tua Murid'}
              </span>
            </div>
          </div>
        )}

        {/* NAVIGATION MENUS BY ROLE */}
        <div className="px-3 py-3 space-y-4">
          {/* ======================================================== */}
          {/* A. MENU KEPALA SEKOLAH (SUPER ADMIN)                     */}
          {/* ======================================================== */}
          {userRole === 'kepala_sekolah' && (
            <div className="space-y-4">
              <div>
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Ruang Kerja Kepala Sekolah
                </p>
              )}

              <div className="space-y-1">
                {/* 1. Dashboard Kepala Sekolah */}
                <button
                  onClick={() => onNavigate('supervision_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'supervision_dashboard'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Dashboard Kepala Sekolah"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">dashboard</span>
                  {!isCollapsed && <span>Dashboard</span>}
                </button>

                {/* 2. Manajemen Pengguna (Guru & Murid) */}
                <button
                  onClick={() => onNavigate('user_management')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'user_management'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Manajemen Pengguna (Guru & Murid)"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">manage_accounts</span>
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Manajemen Pengguna</span>
                      <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                        Admin
                      </span>
                    </div>
                  )}
                </button>

                {/* 2b. Manajemen Kelas / Rombel */}
                <button
                  onClick={() => onNavigate('class_management')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'class_management'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Manajemen Kelas / Rombel & Wali Kelas"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">apartment</span>
                  {!isCollapsed && <span>Manajemen Kelas</span>}
                </button>

                {/* 3. Pantau Isian 7 KAIH Per Kelas */}
                <button
                  onClick={() => onNavigate('class_habits_input')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'class_habits_input'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Pantau & Verifikasi Isian 7 KAIH Per Kelas"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">fact_check</span>
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>Pantau 7 KAIH Kelas</span>
                      <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                        Semua Kelas
                      </span>
                    </div>
                  )}
                </button>

                {/* 4. Instrumen Observasi Kelas Live */}
                <button
                  onClick={() => onNavigate('observation_form')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'observation_form'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Instrumen Observasi Kelas Klinis Live"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">assignment</span>
                  {!isCollapsed && <span>Instrumen Observasi Kelas</span>}
                </button>



                {/* 6. Buku Pantau 7 KAIH */}
                <button
                  onClick={() => onNavigate('parent_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'parent_dashboard'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Buku Pantau Karakter 7 KAIH"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">family_restroom</span>
                  {!isCollapsed && <span>Buku Pantau 7 KAIH</span>}
                </button>

                {/* 7. Kalender Jurnal 7 KAIH */}
                <button
                  onClick={() => onNavigate('parent_calendar')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'parent_calendar'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Kalender Jurnal Karakter 7 KAIH"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">calendar_month</span>
                  {!isCollapsed && <span>Kalender Jurnal 7 KAIH</span>}
                </button>

                {/* 8. Portofolio & Profil Murid */}
                <button
                  onClick={() => onNavigate('parent_portfolio')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'parent_portfolio'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Portofolio & Profil Murid"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">badge</span>
                  {!isCollapsed && <span>Portofolio & Profil Murid</span>}
                </button>
              </div>
              </div>

              {/* Bagian: Data Individu Murid (Sidebar Khusus) */}
              <div className="pt-2 border-t border-slate-100">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Data Individu Murid
                  </p>
                )}

                <div className="space-y-1">
                  {/* Presensi Murid */}
                  <button
                    onClick={() => onNavigate('attendance_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'attendance_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Presensi Murid"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">event_available</span>
                    {!isCollapsed && <span>Presensi Murid</span>}
                  </button>

                  {/* Input Nilai Akademik Mapel */}
                  <button
                    onClick={() => onNavigate('academic_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'academic_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Input Nilai Akademik Mapel"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">auto_stories</span>
                    {!isCollapsed && <span>Nilai Akademik Mapel</span>}
                  </button>

                  {/* Karya & Portofolio Murid */}
                  <button
                    onClick={() => onNavigate('portfolio_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'portfolio_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Karya & Portofolio Murid"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">photo_library</span>
                    {!isCollapsed && <span>Karya & Portofolio Murid</span>}
                  </button>

                  {/* Prestasi & Apresiasi Murid */}
                  <button
                    onClick={() => onNavigate('award_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'award_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Prestasi & Apresiasi Murid"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">stars</span>
                    {!isCollapsed && <span>Prestasi & Apresiasi Murid</span>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* B. MENU GURU (WALI KELAS & OBSERVER)                     */}
          {/* ======================================================== */}
          {userRole === 'guru' && (
            <div className="space-y-4">
              {/* Bagian B1: Tugas Wali Kelas */}
              <div>
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Wali {guruClass || 'Kelas: Belum Ditugaskan'}
                  </p>
                )}

                <div className="space-y-1">
                  {/* Isian 7 KAIH Kelas IV-A */}
                  <button
                    onClick={() => onNavigate('class_habits_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'class_habits_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={`Isian 7 KAIH ${guruClassLabel}`}
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">fact_check</span>
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Isian 7 KAIH Kelas</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          {guruClassLabel}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Buku Pantau 7 KAIH Kelas IV-A */}
                  <button
                    onClick={() => onNavigate('parent_dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'parent_dashboard'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Buku Pantau Karakter Murid"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">family_restroom</span>
                    {!isCollapsed && <span>Buku Pantau 7 KAIH</span>}
                  </button>

                  {/* Kalender Jurnal Murid */}
                  <button
                    onClick={() => onNavigate('parent_calendar')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'parent_calendar'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Kalender Jurnal Karakter 7 KAIH"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">calendar_month</span>
                    {!isCollapsed && <span>Kalender Jurnal 7 KAIH</span>}
                  </button>

                  {/* Portofolio & Profil Murid */}
                  <button
                    onClick={() => onNavigate('parent_portfolio')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'parent_portfolio'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={`Portofolio & Capaian Murid ${guruClassLabel}`}
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">badge</span>
                    {!isCollapsed && <span>Portofolio & Profil Murid</span>}
                  </button>
                </div>
              </div>

              {/* Bagian: Data Individu Murid (Sidebar Khusus) */}
              <div className="pt-2 border-t border-slate-100">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Data Individu Murid
                  </p>
                )}

                <div className="space-y-1">
                  {/* Presensi Murid */}
                  <button
                    onClick={() => onNavigate('attendance_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'attendance_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Presensi Murid"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">event_available</span>
                    {!isCollapsed && <span>Presensi Murid</span>}
                  </button>

                  {/* Input Nilai Akademik Mapel */}
                  <button
                    onClick={() => onNavigate('academic_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'academic_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Input Nilai Akademik Mapel"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">auto_stories</span>
                    {!isCollapsed && <span>Nilai Akademik Mapel</span>}
                  </button>

                  {/* Karya & Portofolio Murid */}
                  <button
                    onClick={() => onNavigate('portfolio_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'portfolio_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Karya & Portofolio Murid"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">photo_library</span>
                    {!isCollapsed && <span>Karya & Portofolio Murid</span>}
                  </button>

                  {/* Prestasi & Apresiasi Murid */}
                  <button
                    onClick={() => onNavigate('award_input')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'award_input'
                        ? 'bg-[#00685f] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Prestasi & Apresiasi Murid"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">stars</span>
                    {!isCollapsed && <span>Prestasi & Apresiasi Murid</span>}
                  </button>
                </div>
              </div>

              {/* Bagian B2: Halaman Guru yang Diobservasi */}
              <div className="pt-2 border-t border-slate-100">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Supervisi Diri Sendiri
                  </p>
                )}

                <div className="space-y-1">
                  <button
                    onClick={() => onNavigate('teacher_my_supervision')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'teacher_my_supervision'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Dokumen & Status Supervisi Klinis Saya (Guru yang Diobservasi)"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">school</span>
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Supervisi Klinis Saya</span>
                        <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                          Diobservasi
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Bagian B3: Halaman Tugas Tambahan Observer (Menilai Guru Lain) */}
              <div className="pt-2 border-t border-slate-100">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Tugas Guru Observer
                  </p>
                )}

                <div className="space-y-1">
                  {/* Instrumen Observasi Guru */}
                  <button
                    onClick={() => onNavigate('observation_form')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      currentScreen === 'observation_form'
                        ? 'bg-indigo-700 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title="Instrumen Penilaian Observasi Guru Lain"
                  >
                    <span className="material-symbols-outlined text-lg shrink-0">assignment</span>
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Penilaian Observasi Guru</span>
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">
                          Observer
                        </span>
                      </div>
                    )}
                  </button>


                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* C. MENU ORANG TUA MURID                                  */}
          {/* ======================================================== */}
          {userRole === 'orang_tua' && (
            <div>
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Karakter 7 KAIH Ananda
                </p>
              )}

              <div className="space-y-1">
                {/* Buku Pantau Karakter 7 KAIH */}
                <button
                  onClick={() => onNavigate('parent_dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'parent_dashboard'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Buku Pantau Karakter 7 KAIH Ananda"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">family_restroom</span>
                  {!isCollapsed && <span>Buku Pantau 7 KAIH</span>}
                </button>

                {/* Kalender Jurnal 7 KAIH */}
                <button
                  onClick={() => onNavigate('parent_calendar')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'parent_calendar'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Kalender Jurnal Karakter Ananda"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">calendar_month</span>
                  {!isCollapsed && <span>Kalender Jurnal 7 KAIH</span>}
                </button>

                {/* Portofolio & Profil Murid */}
                <button
                  onClick={() => onNavigate('parent_portfolio')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    currentScreen === 'parent_portfolio'
                      ? 'bg-[#00685f] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title="Portofolio & Capaian Holistik Ananda"
                >
                  <span className="material-symbols-outlined text-lg shrink-0">badge</span>
                  {!isCollapsed && <span>Portofolio & Profil Murid</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER SIDEBAR (Bersih tanpa tombol keluar ganda, tombol keluar ada di Header atas kanan) */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        {!isCollapsed ? (
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-[10px] font-extrabold text-teal-800 tracking-wider">SIPAKAINGE</span>
            <button
              onClick={onToggleCollapse}
              className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
              title="Perkecil Tampilan Sidebar"
            >
              <span>Tutup</span>
              <span className="material-symbols-outlined text-xs">first_page</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200"
              title="Buka Sidebar"
            >
              <span className="material-symbols-outlined text-base">last_page</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
