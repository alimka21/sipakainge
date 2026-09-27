import React from 'react';
import { ScreenId, UserRole } from '../types';
import { APP_ASSETS } from '../data/mockData';

interface AppSidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentScreen,
  onNavigate,
  userRole,
  onSwitchRole,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Part: School Identity & Sidebar Toggle */}
      <div className="overflow-y-auto flex-1">
        {/* Header Branding in Sidebar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={APP_ASSETS.logo}
                alt="Logo Sekolah"
                className="h-8 w-8 object-contain shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-[#00685f] truncate">
                  RUANG KERJA
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  SDN Percontohan PAM
                </p>
              </div>
            </div>
          )}

          {/* Toggle Sidebar Button */}
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'Perbesar Sidebar' : 'Perkecil Sidebar'}
          >
            <span className="material-symbols-outlined text-lg">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Current User Role Identity Pill */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ruang Manajemen:
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  userRole === 'kepala_sekolah'
                    ? 'bg-emerald-100 text-emerald-800'
                    : userRole === 'guru'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {userRole === 'kepala_sekolah'
                  ? 'Kepala Sekolah (Super Admin)'
                  : userRole === 'guru'
                  ? 'Guru / Observer'
                  : 'Orang Tua Murid'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="px-3 py-3 space-y-4">
          {/* SECTION 1: RUANG KERJA MANAJEMEN DATA */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Ruang Kerja Manajemen
              </p>
            )}

            <div className="space-y-1">
              {/* Ruang Kerja Kepala Sekolah */}
              <button
                onClick={() => onNavigate('supervision_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  currentScreen === 'supervision_dashboard'
                    ? 'bg-[#00685f] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Ruang Kerja Supervisi Kepala Sekolah"
              >
                <span className="material-symbols-outlined text-lg shrink-0">admin_panel_settings</span>
                {!isCollapsed && <span>Ruang Supervisi KS</span>}
              </button>

              {/* Manajemen Observer (Khusus Super Admin = Kepala Sekolah) */}
              <button
                onClick={() => onNavigate('user_management')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  currentScreen === 'user_management'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Manajemen Pengguna & Tim Observer"
              >
                <span className="material-symbols-outlined text-lg shrink-0">manage_accounts</span>
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Tim Observer & Staf</span>
                    <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                      Admin
                    </span>
                  </div>
                )}
              </button>

              {/* Formulir Observasi Kelas Live */}
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

              {/* Rencana Tindak Lanjut (RTL) */}
              <button
                onClick={() => onNavigate('follow_up_plan')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  currentScreen === 'follow_up_plan'
                    ? 'bg-[#00685f] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Rencana Tindak Lanjut & Linimasa (RTL)"
              >
                <span className="material-symbols-outlined text-lg shrink-0">insights</span>
                {!isCollapsed && <span>Rencana Tindak Lanjut (RTL)</span>}
              </button>

              {/* Buku Pantau Karakter 7 KAIH (Orang Tua) */}
              <button
                onClick={() => onNavigate('parent_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  currentScreen === 'parent_dashboard'
                    ? 'bg-[#00685f] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Buku Pantau Karakter 7 KAIH Anak"
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
                title="Kalender Jurnal Karakter 7 KAIH"
              >
                <span className="material-symbols-outlined text-lg shrink-0">calendar_month</span>
                {!isCollapsed && <span>Kalender Jurnal 7 KAIH</span>}
              </button>

              {/* Portofolio & Profil Holistik */}
              <button
                onClick={() => onNavigate('parent_portfolio')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  currentScreen === 'parent_portfolio'
                    ? 'bg-[#00685f] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title="Portofolio & Capaian Holistik Siswa"
              >
                <span className="material-symbols-outlined text-lg shrink-0">badge</span>
                {!isCollapsed && <span>Portofolio & Profil Murid</span>}
              </button>
            </div>
          </div>

          {/* SECTION 2: REKAPITULASI DATA PUBLIK */}
          <div className="pt-2 border-t border-slate-100">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Rekapitulasi Publik
              </p>
            )}

            <div className="space-y-1">
              {/* Dasbor Publik 7 KAIH (Siswa) */}
              <button
                onClick={() => onNavigate('student_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left text-slate-600 hover:bg-teal-50 hover:text-[#00685f] ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Buka Dasbor Publik Rekap 7 KAIH (Siswa)"
              >
                <span className="material-symbols-outlined text-lg text-teal-700 shrink-0">diversity_1</span>
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Rekap Publik 7 KAIH</span>
                    <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                      Publik
                    </span>
                  </div>
                )}
              </button>

              {/* Dasbor Publik Supervisi (Guru) */}
              <button
                onClick={() => onNavigate('teacher_dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left text-slate-600 hover:bg-indigo-50 hover:text-indigo-800 ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Buka Dasbor Publik Rekap Supervisi (Guru)"
              >
                <span className="material-symbols-outlined text-lg text-indigo-700 shrink-0">school</span>
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Rekap Publik Supervisi</span>
                    <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                      1x/Sem
                    </span>
                  </div>
                )}
              </button>

              {/* Beranda Publik */}
              <button
                onClick={() => onNavigate('landing')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left text-slate-500 hover:bg-slate-100 hover:text-slate-800 ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Kembali ke Beranda Utama Sekolah"
              >
                <span className="material-symbols-outlined text-lg shrink-0">home</span>
                {!isCollapsed && <span>Beranda Utama</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile / Quick Role Switch */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-1">
              <img
                src={APP_ASSETS.principalPhoto}
                alt="Foto Profil"
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  Fahmawati, S.Pd.
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  NIP. 197305111995012002
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-[10px] font-bold text-teal-800">SIPAKAINGE v2.5</span>
              <button
                onClick={onToggleCollapse}
                className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
                title="Perkecil Tampilan Sidebar"
              >
                <span>Tutup</span>
                <span className="material-symbols-outlined text-xs">first_page</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={APP_ASSETS.principalPhoto}
              alt="Foto Profil"
              className="h-8 w-8 rounded-xl object-cover ring-1 ring-slate-200"
              title="Fahmawati, S.Pd. • NIP. 197305111995012002"
            />
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
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
