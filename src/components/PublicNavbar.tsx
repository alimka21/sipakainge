import React, { useState } from 'react';
import { ScreenId } from '../types';

interface PublicNavbarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentScreen, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (target: ScreenId, hash?: string) => {
    setMobileMenuOpen(false);
    if (currentScreen !== target) {
      onNavigate(target);
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } else if (hash) {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-100">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Text Identity (Tanpa Logo sesuai arahan) */}
        <div
          onClick={() => handleNavClick('landing')}
          className="flex items-center cursor-pointer group"
        >
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#00685f] group-hover:text-[#008378] transition-colors">
              SIPAKAINGE
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              SDN Percontohan PAM Makassar
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links — Bersih & Tanpa Teks Publik */}
        <nav className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => handleNavClick('landing', '#beranda')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              currentScreen === 'landing'
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#00685f] hover:bg-[#eff4ff]'
            }`}
          >
            Beranda
          </button>

          <button
            onClick={() => handleNavClick('student_dashboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'student_dashboard'
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#00685f] hover:bg-[#eff4ff]'
            }`}
            title="Rekapan Pembiasaan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) Murid"
          >
            <span className="material-symbols-outlined text-base">diversity_1</span>
            <span>Rekap 7 KAIH (Murid)</span>
          </button>

          <button
            onClick={() => handleNavClick('teacher_dashboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'teacher_dashboard'
                ? 'bg-[#00685f] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#00685f] hover:bg-[#eff4ff]'
            }`}
            title="Rekapan Siklus Supervisi Klinis Guru (1 Semester 1 Kali)"
          >
            <span className="material-symbols-outlined text-base">school</span>
            <span>Rekap Supervisi (Guru)</span>
          </button>

          <button
            onClick={() => handleNavClick('landing', '#filosofi')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-[#00685f] hover:bg-[#eff4ff] rounded-lg transition-all"
          >
            Filosofi & Profil
          </button>

          <button
            onClick={() => handleNavClick('landing', '#alur-supervisi')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-[#00685f] hover:bg-[#eff4ff] rounded-lg transition-all"
          >
            Alur Supervisi
          </button>
        </nav>

        {/* Right Action: Masuk ke Ruang Kerja Manajemen Data */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#00685f] text-white hover:bg-[#008378] transition-all shadow-sm hover:shadow"
            title="Masuk ke Ruang Kerja Manajemen Data (Kepala Sekolah, Guru, Orang Tua)"
          >
            <span className="material-symbols-outlined text-base">lock_open</span>
            <span>Masuk Ruang Kerja</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Buka Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-lg animate-fade-in">
          <button
            onClick={() => handleNavClick('landing', '#beranda')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              currentScreen === 'landing' ? 'bg-[#00685f] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">home</span>
            Beranda
          </button>
          <button
            onClick={() => handleNavClick('student_dashboard')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              currentScreen === 'student_dashboard' ? 'bg-[#00685f] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">diversity_1</span>
            Rekap 7 KAIH (Murid)
          </button>
          <button
            onClick={() => handleNavClick('teacher_dashboard')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
              currentScreen === 'teacher_dashboard' ? 'bg-[#00685f] text-white' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">school</span>
            Rekap Supervisi (Guru)
          </button>
          <button
            onClick={() => handleNavClick('landing', '#filosofi')}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">auto_stories</span>
            Filosofi & Profil
          </button>
          <button
            onClick={() => handleNavClick('landing', '#alur-supervisi')}
            className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">route</span>
            Alur Supervisi
          </button>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('login');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-[#00685f] text-white flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">lock_open</span>
              Masuk Ruang Kerja Manajemen Data
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
