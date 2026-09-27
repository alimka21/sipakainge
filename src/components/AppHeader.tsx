import React, { useState } from 'react';
import { UserRole, ScreenId } from '../types';
import { APP_ASSETS } from '../data/mockData';

interface AppHeaderProps {
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onNavigate: (screen: ScreenId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userRole,
  onSwitchRole,
  onNavigate,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-30 flex items-center justify-between px-4 sm:px-6 border-b border-slate-100 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-20' : 'left-72'
      }`}
    >
      {/* Left: Sidebar Toggle Button + School Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
        >
          <span className="material-symbols-outlined text-xl">
            {isSidebarCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff4ff] text-[#0b1c30]">
          <span className="material-symbols-outlined text-base text-[#00685f]">school</span>
          <span className="text-xs font-semibold text-[#00685f] truncate max-w-[220px] sm:max-w-none">
            UPT SPF SDN Percontohan PAM Makassar
          </span>
          <span className="text-slate-300 text-xs hidden md:inline">•</span>
          <span className="text-xs text-slate-500 font-medium hidden md:inline">
            Semester Ganjil TA 2025/2026
          </span>
        </div>

        <div className="hidden xl:flex items-center bg-[#f1f5f9] px-3 py-1.5 rounded-xl w-64 text-slate-500 border border-transparent focus-within:border-teal-600 focus-within:bg-white transition-all">
          <span className="material-symbols-outlined text-base mr-2 text-slate-400">search</span>
          <input
            type="text"
            placeholder="Cari guru, siswa, dokumen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-xs bg-transparent border-none outline-none w-full text-slate-800 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Role, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Toggle Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-bold text-xs hover:bg-teal-100 transition-colors border border-teal-200"
          >
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            <span className="hidden sm:inline">
              {userRole === 'kepala_sekolah'
                ? 'Super Admin (Kepala Sekolah)'
                : userRole === 'guru'
                ? 'Guru Kelas / Observer'
                : 'Orang Tua / Murid'}
            </span>
            <span className="sm:hidden">
              {userRole === 'kepala_sekolah' ? 'Super Admin' : userRole === 'guru' ? 'Guru' : 'Ortu'}
            </span>
            <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-10 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-fade-in">
              <div className="px-3 py-1 text-slate-400 uppercase font-bold text-[10px]">
                Ganti Peran Pengguna Aktif
              </div>

              {/* 1. Kepala Sekolah (Super Admin) */}
              <button
                onClick={() => {
                  onSwitchRole('kepala_sekolah');
                  onNavigate('supervision_dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition ${
                  userRole === 'kepala_sekolah' ? 'text-teal-800 font-bold bg-teal-50/60' : 'text-slate-700'
                }`}
              >
                <div className="flex flex-col">
                  <span>Kepala Sekolah (Super Admin)</span>
                  <span className="text-[10px] text-slate-400">Fahmawati, S.Pd. • NIP. 197305111995012002</span>
                </div>
                {userRole === 'kepala_sekolah' && (
                  <span className="material-symbols-outlined text-sm text-teal-700">check</span>
                )}
              </button>

              {/* 2. Guru Kelas / Observer */}
              <button
                onClick={() => {
                  onSwitchRole('guru');
                  onNavigate('teacher_dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition ${
                  userRole === 'guru' ? 'text-teal-800 font-bold bg-teal-50/60' : 'text-slate-700'
                }`}
              >
                <div className="flex flex-col">
                  <span>Guru Kelas / Observer</span>
                  <span className="text-[10px] text-slate-400">Ibu Siti Aminah, S.Pd. (Kelas IV-A)</span>
                </div>
                {userRole === 'guru' && (
                  <span className="material-symbols-outlined text-sm text-teal-700">check</span>
                )}
              </button>

              {/* 3. Orang Tua / Murid */}
              <button
                onClick={() => {
                  onSwitchRole('orang_tua');
                  onNavigate('student_dashboard');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition ${
                  userRole === 'orang_tua' ? 'text-teal-800 font-bold bg-teal-50/60' : 'text-slate-700'
                }`}
              >
                <div className="flex flex-col">
                  <span>Murid & Orang Tua</span>
                  <span className="text-[10px] text-slate-400">Ahmad Faris Al-Fatih / Ny. Rahma</span>
                </div>
                {userRole === 'orang_tua' && (
                  <span className="material-symbols-outlined text-sm text-teal-700">check</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Block */}
        <div className="flex items-center gap-2 pl-1">
          {userRole === 'kepala_sekolah' ? (
            <>
              <div className="text-right hidden md:block">
                <div className="text-xs text-slate-900 leading-tight font-bold">
                  Fahmawati, S.Pd.
                </div>
                <div className="text-[10px] text-slate-500">Kepala Sekolah (Super Admin)</div>
              </div>
              <img
                alt="Foto Profil Kepala Sekolah"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-teal-600/30 shadow-sm"
                src={APP_ASSETS.principalAvatar}
              />
            </>
          ) : userRole === 'guru' ? (
            <>
              <div className="text-right hidden md:block">
                <div className="text-xs text-slate-900 leading-tight font-bold">
                  Siti Aminah, S.Pd.
                </div>
                <div className="text-[10px] text-slate-500">Guru Kelas & Observer</div>
              </div>
              <img
                alt="Foto Profil Ibu Siti Aminah"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-teal-600/30 shadow-sm"
                src={APP_ASSETS.sitiAminahAvatar}
              />
            </>
          ) : (
            <>
              <div className="text-right hidden md:block">
                <div className="text-xs text-slate-900 leading-tight font-bold">
                  Ahmad Faris Al-Fatih
                </div>
                <div className="text-[10px] text-slate-500">Siswa Kelas IV-A</div>
              </div>
              <img
                alt="Foto Profil Ahmad Faris"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-teal-600/30 shadow-sm"
                src={APP_ASSETS.studentAhmad}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};
