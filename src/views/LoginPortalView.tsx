import React, { useState } from 'react';
import { ScreenId, UserRole } from '../types';
import { APP_ASSETS, PRINCIPAL_NAME, PRINCIPAL_NIP } from '../data/mockData';
import { SchoolLogo } from '../components/SchoolLogo';

interface LoginPortalViewProps {
  onLogin: (role: UserRole, identifier: string, password: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({ onLogin, onNavigate }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('kepala_sekolah');
  const [identifier, setIdentifier] = useState(`${PRINCIPAL_NIP} (${PRINCIPAL_NAME})`);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setPassword('');
    if (role === 'kepala_sekolah') {
      setIdentifier(`${PRINCIPAL_NIP} (${PRINCIPAL_NAME})`);
    } else {
      setIdentifier('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole, identifier, password);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Return to home button */}
      <button
        onClick={() => onNavigate('landing')}
        className="fixed top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold shadow-sm transition-all z-20"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        <span>Kembali ke Beranda</span>
      </button>

      {/* Main Split Container */}
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] border border-slate-200/80">
        {/* Left Column: Brand Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#004d46] via-[#00685f] to-[#003b35] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-[#89f5e7]/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold max-w-fit border border-white/15">
              <span className="material-symbols-outlined text-sm text-[#89f5e7]">verified</span>
              <span>Standar Kemendikdasmen RI</span>
            </div>

            <div>
              <span className="text-[11px] text-[#89f5e7] uppercase font-bold tracking-wider">
                UPT SPF SDN PERCONTOHAN PAM MAKASSAR
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 leading-snug">
                Sistem Terpadu Pemantauan Pembelajaran, Supervisi Guru & Pembiasaan Karakter Murid.
              </h1>
              <p className="text-xs text-white/80 mt-3 leading-relaxed">
                Platform tata kelola mutu sekolah holistik berbasis penguatan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) dan
                supervisi klinis pendidik.
              </p>
            </div>

            {/* 3 Metric Badges */}
            <div className="flex flex-col gap-2.5">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#89f5e7]">
                    <span className="material-symbols-outlined text-base">psychology</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block uppercase font-medium">Supervisi Klinis Pendidik</span>
                    <span className="text-base font-bold leading-tight">100% Terjadwal</span>
                  </div>
                </div>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-medium text-[#89f5e7]">
                  5 Tahap Siklus
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#89f5e7]">
                    <span className="material-symbols-outlined text-base">fact_check</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block uppercase font-medium">Keterisian Jurnal Harian</span>
                    <span className="text-base font-bold leading-tight">98.4%</span>
                  </div>
                </div>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-medium text-[#89f5e7]">
                  +3.2% Minggu Ini
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#89f5e7]">
                    <span className="material-symbols-outlined text-base">groups</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block uppercase font-medium">Karakter 7 KAIH</span>
                    <span className="text-xs font-semibold leading-tight block">Terpantau Realtime</span>
                  </div>
                </div>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-medium text-[#89f5e7]">
                  Validasi Wali
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 flex items-center gap-2 text-[11px] text-white/70">
            <span className="material-symbols-outlined text-sm text-[#89f5e7]">shield</span>
            <span>Enkripsi sertifikasi ISO/IEC 27001 Terlindungi</span>
          </div>
        </div>

        {/* Right Column: Login Card */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <SchoolLogo className="h-12 w-12 rounded-2xl bg-white shadow-xs p-0.5 border border-slate-200/80 shrink-0" />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Portal SIPAKAINGE Terpadu</h2>
                <p className="text-xs text-slate-500">SDN Percontohan PAM Makassar • Masuk Akun</p>
              </div>
            </div>

            {/* Role Tabs */}
            <div className="mb-6">
              <label className="block text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                PILIH PERAN MASUK
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('kepala_sekolah')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center ${
                    selectedRole === 'kepala_sekolah'
                      ? 'bg-white text-[#00685f] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kepala Sekolah
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('guru')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center ${
                    selectedRole === 'guru'
                      ? 'bg-white text-[#00685f] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Guru / Observer
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('orang_tua')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center ${
                    selectedRole === 'orang_tua'
                      ? 'bg-white text-[#00685f] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Orang Tua Murid
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {selectedRole === 'orang_tua' ? 'NISN Ananda' : selectedRole === 'guru' ? 'NIP Guru' : 'NIP / Email / Nama Pengguna'}
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">badge</span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={selectedRole === 'orang_tua' ? 'Contoh: 0148928371' : selectedRole === 'guru' ? 'NIP guru, contoh: 198705232010012015' : undefined}
                    inputMode={selectedRole === 'orang_tua' ? 'numeric' : undefined}
                    className="w-full bg-[#eff4ff]/70 border border-slate-200 pl-10 pr-3 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00685f] focus:bg-white transition-all"
                  />
                </div>
                {selectedRole === 'orang_tua' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Masukkan NISN putra/putri Anda. Satu akun orang tua hanya terhubung ke satu siswa.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                  <a href="#" className="text-xs text-[#00685f] font-semibold hover:underline">
                    Lupa kata sandi?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-lg">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      selectedRole === 'orang_tua'
                        ? 'Kata sandi = NISN Ananda'
                        : selectedRole === 'guru'
                        ? 'Kata sandi = NIP Anda'
                        : 'Kata sandi = NIP Kepala Sekolah'
                    }
                    className="w-full bg-[#eff4ff]/70 border border-slate-200 pl-10 pr-10 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00685f] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedRole === 'orang_tua'
                    ? 'Kata sandi default adalah NISN Ananda (sama seperti di atas).'
                    : 'Kata sandi default adalah NIP Anda (sama seperti di atas).'}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f]"
                  />
                  <span className="text-slate-600">Ingat saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00685f] hover:bg-[#008378] text-white py-3 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-1"
              >
                <span>Masuk ke Sistem</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>

              <div className="relative my-2 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold absolute">
                  ATAU MASUK MENGGUNAKAN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onLogin(selectedRole, identifier, identifier)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#00685f]">school</span>
                  <span>Akun Belajar.id</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLogin(selectedRole, identifier, identifier)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span className="font-bold text-red-500">G</span>
                  <span>Google SSO</span>
                </button>
              </div>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs text-slate-500">
            <span>
              Butuh bantuan akun?{' '}
              <a href="#" className="text-[#00685f] font-semibold hover:underline">
                Hubungi Admin Sekolah
              </a>
            </span>
            <span>© 2026 Portal SIPAKAINGE Terpadu</span>
          </div>
        </div>
      </div>
    </div>
  );
};
