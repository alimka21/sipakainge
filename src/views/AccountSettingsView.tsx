import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';
import { MIN_PASSWORD_LENGTH } from '../lib/accounts';

export type AccountActionResult = { ok: boolean; message: string };

interface AccountSettingsViewProps {
  userRole: UserRole;
  /** Name shown for this account (KS/guru name, or the parent's name). */
  accountName: string;
  nameLabel: string;
  loginIdLabel: string;
  loginId: string;
  usingDefaultPassword: boolean;
  defaultPasswordHint: string;
  /** Extra line under the account card, e.g. which child a parent account belongs to. */
  subtitle?: string;
  onSaveName: (name: string) => Promise<AccountActionResult>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<AccountActionResult>;
}

const ROLE_LABEL: Record<UserRole, string> = {
  kepala_sekolah: 'Kepala Sekolah',
  guru: 'Guru',
  orang_tua: 'Orang Tua / Wali Murid',
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600/40';

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  userRole,
  accountName,
  nameLabel,
  loginIdLabel,
  loginId,
  usingDefaultPassword,
  defaultPasswordHint,
  subtitle,
  onSaveName,
  onChangePassword,
}) => {
  const [name, setName] = useState(accountName);
  const [savingName, setSavingName] = useState(false);
  const [nameResult, setNameResult] = useState<AccountActionResult | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordResult, setPasswordResult] = useState<AccountActionResult | null>(null);

  // Keep the field in sync if the account changes underneath (e.g. data reloads from Supabase).
  useEffect(() => setName(accountName), [accountName]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, ' ');
    if (trimmed.length < 3) {
      setNameResult({ ok: false, message: 'Nama minimal 3 karakter.' });
      return;
    }
    if (trimmed === accountName) {
      setNameResult({ ok: false, message: 'Nama tidak berubah.' });
      return;
    }
    setSavingName(true);
    setNameResult(await onSaveName(trimmed));
    setSavingName(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordResult({ ok: false, message: `Kata sandi baru minimal ${MIN_PASSWORD_LENGTH} karakter.` });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordResult({ ok: false, message: 'Konfirmasi kata sandi baru tidak sama.' });
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordResult({ ok: false, message: 'Kata sandi baru harus berbeda dari kata sandi lama.' });
      return;
    }
    setSavingPassword(true);
    const result = await onChangePassword(currentPassword, newPassword);
    setSavingPassword(false);
    setPasswordResult(result);
    if (result.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const ResultNote = ({ result }: { result: AccountActionResult | null }) =>
    result ? (
      <p
        className={`flex items-start gap-1.5 text-[11px] font-semibold ${
          result.ok ? 'text-emerald-700' : 'text-rose-700'
        }`}
      >
        <span className="material-symbols-outlined text-sm">{result.ok ? 'check_circle' : 'error'}</span>
        <span>{result.message}</span>
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
          <span className="text-slate-400">Akun Saya</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-teal-800">Pengaturan Akun</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 space-y-6">
        {/* Account summary */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#6ffbbe] ring-2 ring-white/15 shrink-0">
              <span className="material-symbols-outlined text-2xl">manage_accounts</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">{accountName || '-'}</h1>
              <p className="text-xs text-teal-100/90 mt-0.5">
                {ROLE_LABEL[userRole]}
                {subtitle ? ` • ${subtitle}` : ''}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white/10 px-4 py-2.5 border border-white/10">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-teal-200">
                {loginIdLabel} (untuk masuk)
              </span>
              <span className="font-bold font-mono">{loginId}</span>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2.5 border border-white/10">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-teal-200">Kata Sandi</span>
              <span className="font-bold">
                {usingDefaultPassword ? `Masih bawaan (${defaultPasswordHint})` : 'Sudah diganti'}
              </span>
            </div>
          </div>
        </div>

        {usingDefaultPassword && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-600 text-base">warning</span>
            <span>
              Akun Anda masih memakai kata sandi bawaan yang mudah ditebak. Segera ganti kata sandi di bawah ini.
            </span>
          </div>
        )}

        {/* Change name */}
        <form onSubmit={handleSaveName} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-700">badge</span>
            Ubah Nama
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameResult(null);
              }}
              className={inputClass}
              placeholder="Nama lengkap beserta gelar, mis. Ratna Sari Dewi, S.Pd."
            />
            {userRole === 'guru' && (
              <p className="mt-1 text-[11px] text-slate-400">
                Mengubah nama tidak mengubah {loginIdLabel.toLowerCase()} untuk masuk.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <ResultNote result={nameResult} />
            <button
              type="submit"
              disabled={savingName}
              className="sm:ml-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:bg-slate-300 text-white text-xs font-bold transition shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {savingName ? 'Menyimpan...' : 'Simpan Nama'}
            </button>
          </div>
        </form>

        {/* Change password */}
        <form
          onSubmit={handleChangePassword}
          className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-700">lock_reset</span>
              Ubah Kata Sandi
            </h3>
            <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-teal-700"
              />
              Tampilkan
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Lama</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordResult(null);
                }}
                className={inputClass}
                placeholder={usingDefaultPassword ? defaultPasswordHint : ''}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordResult(null);
                  }}
                  className={inputClass}
                  placeholder={`Minimal ${MIN_PASSWORD_LENGTH} karakter`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Kata Sandi Baru</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordResult(null);
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <ResultNote result={passwordResult} />
            <button
              type="submit"
              disabled={savingPassword}
              className="sm:ml-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:bg-slate-300 text-white text-xs font-bold transition shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">key</span>
              {savingPassword ? 'Menyimpan...' : 'Ganti Kata Sandi'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {userRole === 'kepala_sekolah'
              ? 'Lupa kata sandi Kepala Sekolah? Kosongkan kolom principal_password_hash di tabel school_settings Supabase untuk kembali ke kata sandi bawaan (NIP).'
              : 'Lupa kata sandi? Kepala Sekolah dapat mengembalikannya ke kata sandi bawaan dari menu Manajemen Pengguna.'}
          </p>
        </form>
      </div>
    </div>
  );
};
