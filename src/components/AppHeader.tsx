import React, { useState } from 'react';
import { UserRole, ScreenId } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface AppHeaderProps {
  userRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onNavigate: (screen: ScreenId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  principalPhotoUrl?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userRole,
  onSwitchRole,
  onNavigate,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed,
  onToggleSidebar,
  principalPhotoUrl,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <>
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
            <SchoolLogo className="h-6 w-6 rounded-full bg-white shadow-2xs shrink-0 ring-1 ring-teal-600/30" />
            <span className="text-xs font-semibold text-[#00685f] truncate max-w-[220px] sm:max-w-none">
              UPT SPF SDN Percontohan PAM Makassar
            </span>
            <span className="text-slate-300 text-xs hidden md:inline">•</span>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              Semester Ganjil TA 2026/2027
            </span>
          </div>

          <div className="hidden xl:flex items-center bg-[#f1f5f9] px-3 py-1.5 rounded-xl w-64 text-slate-500 border border-transparent focus-within:border-teal-600 focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-base mr-2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Cari guru, murid, dokumen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="text-xs bg-transparent border-none outline-none w-full text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right: Role, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3.5">

          {/* User Profile Block */}
          <div className="flex items-center gap-2 pl-1 border-r border-slate-100 pr-2 sm:pr-3">
            {userRole === 'kepala_sekolah' ? (
              <>
                <div className="text-right hidden md:block">
                  <div className="text-xs text-slate-900 leading-tight font-bold">
                    Fahmawati, S.Pd.
                  </div>
                  <div className="text-[10px] text-slate-500">Kepala Sekolah (Super Admin)</div>
                </div>
                {principalPhotoUrl ? (
                  <img
                    alt="Foto Profil Kepala Sekolah"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-teal-600/30 shadow-sm"
                    src={principalPhotoUrl}
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs ring-2 ring-teal-600/30 shrink-0">
                    F
                  </div>
                )}
              </>
            ) : userRole === 'guru' ? (
              <>
                <div className="text-right hidden md:block">
                  <div className="text-xs text-slate-900 leading-tight font-bold">
                    Siti Aminah, S.Pd.
                  </div>
                  <div className="text-[10px] text-slate-500">Guru Kelas & Observer</div>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs ring-2 ring-teal-600/30 shrink-0">
                  SA
                </div>
              </>
            ) : (
              <>
                <div className="text-right hidden md:block">
                  <div className="text-xs text-slate-900 leading-tight font-bold">
                    Ahmad Faris Al-Fatih
                  </div>
                  <div className="text-[10px] text-slate-500">Murid Kelas IV-A</div>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center ring-2 ring-teal-600/30 shrink-0">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    boy
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Red Logout Button with Confirmation Trigger */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition border border-rose-100 shrink-0 shadow-3xs"
            title="Keluar dari Ruang Kerja & Kembali ke Beranda"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* MODAL KONFIRMASI KELUAR */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">logout</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Keluar Akun</h3>
                <p className="text-xs text-slate-500">SIPAKAINGE SDN Percontohan PAM</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin keluar dari akun{' '}
              <strong className="text-slate-900">
                {userRole === 'kepala_sekolah'
                  ? 'Fahmawati, S.Pd. (Kepala Sekolah)'
                  : userRole === 'guru'
                  ? 'Siti Aminah, S.Pd. (Guru Kelas)'
                  : 'Ahmad Faris Al-Fatih (Orang Tua)'}
              </strong>{' '}
              dan kembali ke Beranda Utama?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  onNavigate('landing');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                <span>Ya, Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
