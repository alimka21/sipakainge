import React, { useState } from 'react';
import { ScreenId, RombelRecord, TeacherRecord, MuridRecord } from '../types';
import { INITIAL_ROMBEL, INITIAL_TEACHERS, INITIAL_MURID } from '../data/mockData';
import { upsertRombel, deleteRombelRemote, isSupabaseConfigured } from '../lib/supabase';

interface ClassManagementViewProps {
  onNavigate: (screen: ScreenId) => void;
  rombelList?: RombelRecord[];
  onUpdateRombelList?: React.Dispatch<React.SetStateAction<RombelRecord[]>>;
  teacherList?: TeacherRecord[];
  muridList?: MuridRecord[];
  onUpdateMuridList?: React.Dispatch<React.SetStateAction<MuridRecord[]>>;
}

const FASE_OPTIONS: { value: RombelRecord['fase']; label: string }[] = [
  { value: 'fase-a', label: 'Fase A (Kelas I-II)' },
  { value: 'fase-b', label: 'Fase B (Kelas III-IV)' },
  { value: 'fase-c', label: 'Fase C (Kelas V-VI)' },
];

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  onNavigate,
  rombelList: propRombelList,
  onUpdateRombelList,
  teacherList: propTeacherList,
  muridList: propMuridList,
  onUpdateMuridList,
}) => {
  const [rombelData, setRombelData] = useState<RombelRecord[]>(propRombelList || INITIAL_ROMBEL);
  const teacherList = propTeacherList || INITIAL_TEACHERS;
  const muridList = propMuridList || INITIAL_MURID;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formName, setFormName] = useState('');
  const [formFase, setFormFase] = useState<RombelRecord['fase']>('fase-a');
  const [formWaliKelasId, setFormWaliKelasId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const updateRombel = (updater: (prev: RombelRecord[]) => RombelRecord[]) => {
    setRombelData(updater);
    if (onUpdateRombelList) onUpdateRombelList(updater);
  };

  const resetForm = () => {
    setFormName('');
    setFormFase('fase-a');
    setFormWaliKelasId('');
    setEditingId(null);
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const startEdit = (rombel: RombelRecord) => {
    setIsAdding(false);
    setEditingId(rombel.id);
    setFormName(rombel.name);
    setFormFase(rombel.fase);
    setFormWaliKelasId(rombel.waliKelasId || '');
  };

  const notifySync = (subject: string, action: string, remote: { success: boolean; message?: string }) => {
    if (!isSupabaseConfigured()) {
      showToast(`✓ ${subject} berhasil ${action} (belum tersambung Supabase — hanya tersimpan di sesi ini).`);
      return;
    }
    showToast(
      remote.success
        ? `✓ ${subject} berhasil ${action} & disimpan ke Supabase.`
        : `${subject} ${action} secara lokal, tapi GAGAL disimpan ke Supabase: ${remote.message}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      showToast('Nama kelas / rombel wajib diisi!');
      return;
    }
    if (rombelData.some((r) => r.id !== editingId && r.name.toLowerCase() === name.toLowerCase())) {
      showToast(`Kelas ${name} sudah ada. Gunakan nama lain.`);
      return;
    }

    let savedRombel: RombelRecord;
    const isEditing = !!editingId;

    if (editingId) {
      const oldName = rombelData.find((r) => r.id === editingId)?.name;
      savedRombel = { id: editingId, name, fase: formFase, waliKelasId: formWaliKelasId || null };
      updateRombel((prev) => prev.map((r) => (r.id === editingId ? savedRombel : r)));
      // Students reference their class by name, so a rename must move them too.
      // The DB does this automatically (murid.rombel -> rombel.name is ON UPDATE
      // CASCADE), so only the local React copy needs updating by hand here.
      if (oldName && oldName !== name && onUpdateMuridList) {
        onUpdateMuridList((prev) =>
          prev.map((m) => (m.rombel === oldName ? { ...m, rombel: name, fase: formFase } : m))
        );
      }
    } else {
      savedRombel = { id: `r-${Date.now()}`, name, fase: formFase, waliKelasId: formWaliKelasId || null };
      updateRombel((prev) => [...prev, savedRombel]);
    }
    resetForm();

    const remote = await upsertRombel(savedRombel);
    notifySync(`Kelas ${name}`, isEditing ? 'diperbarui' : 'ditambahkan', remote);
  };

  const handleDelete = async (rombel: RombelRecord) => {
    const jumlahMurid = countMuridByRombel(rombel.name);
    if (jumlahMurid > 0) {
      showToast(`Kelas ${rombel.name} masih memiliki ${jumlahMurid} murid. Pindahkan murid terlebih dahulu.`);
      return;
    }
    updateRombel((prev) => prev.filter((r) => r.id !== rombel.id));
    if (editingId === rombel.id) resetForm();
    const remote = await deleteRombelRemote(rombel.id);
    notifySync(`Kelas ${rombel.name}`, 'dihapus', remote);
  };

  const countMuridByRombel = (rombelName: string) => muridList.filter((m) => m.rombel === rombelName).length;

  const teacherName = (id: string | null) => {
    if (!id) return null;
    return teacherList.find((t) => t.id === id)?.name || null;
  };

  const teachersAlreadyAssigned = (excludeRombelId?: string) =>
    new Set(
      rombelData
        .filter((r) => r.id !== excludeRombelId && r.waliKelasId)
        .map((r) => r.waliKelasId as string)
    );

  const assignedElsewhere = teachersAlreadyAssigned(editingId || undefined);
  const availableTeacherCount = teacherList.filter(
    (t) => !assignedElsewhere.has(t.id) || t.id === formWaliKelasId
  ).length;

  // "Kelas <tingkat>.<rombel>" (the standard naming since 2026-09-28) sorts
  // naturally by tingkat then rombel number; anything else (a custom class
  // name) falls back to alphabetical and sorts after the numbered ones.
  const parseKelasOrder = (name: string): [number, number] | null => {
    const m = name.match(/^Kelas\s+(\d+)\.(\d+)$/i);
    if (!m) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10)];
  };

  const sortedRombel = [...rombelData].sort((a, b) => {
    const oa = parseKelasOrder(a.name);
    const ob = parseKelasOrder(b.name);
    if (oa && ob) return oa[0] - ob[0] || oa[1] - ob[1];
    if (oa) return -1;
    if (ob) return 1;
    return a.name.localeCompare(b.name, 'id');
  });

  const query = searchQuery.trim().toLowerCase();
  const visibleRombel = query
    ? sortedRombel.filter(
        (r) => r.name.toLowerCase().includes(query) || (teacherName(r.waliKelasId) || '').toLowerCase().includes(query)
      )
    : sortedRombel;

  const kelasTanpaWali = rombelData.filter((r) => !r.waliKelasId).length;
  const totalMuridTerdaftar = rombelData.reduce((sum, r) => sum + countMuridByRombel(r.name), 0);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 animate-fade-in">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
            <span className="material-symbols-outlined text-base">verified</span>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="text-slate-400">Ruang Kerja Kepala Sekolah</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-teal-800">Manajemen Kelas</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-6">
        {/* Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#6ffbbe] ring-2 ring-white/15 shrink-0">
              <span className="material-symbols-outlined text-2xl">apartment</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Manajemen Kelas / Rombel</h1>
              <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                Tambah, ubah, atau hapus rombongan belajar (rombel), serta tentukan wali kelas untuk masing-masing kelas.
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">school</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Kelas</p>
              <p className="text-lg font-extrabold text-slate-900">{rombelData.length}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${kelasTanpaWali > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <span className="material-symbols-outlined text-lg">{kelasTanpaWali > 0 ? 'warning' : 'check_circle'}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Kelas Tanpa Wali Kelas</p>
              <p className="text-lg font-extrabold text-slate-900">{kelasTanpaWali}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-lg">groups</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Murid Terdaftar</p>
              <p className="text-lg font-extrabold text-slate-900">{totalMuridTerdaftar}</p>
            </div>
          </div>
        </div>

        {/* Add button */}
        {!isAdding && !editingId && (
          <div className="flex justify-end">
            <button
              onClick={startAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Tambah Kelas Baru</span>
            </button>
          </div>
        )}

        {/* Form: Add / Edit */}
        {(isAdding || editingId) && (
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-700">
                {editingId ? 'edit' : 'add_circle'}
              </span>
              {editingId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kelas / Rombel:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas II-A"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fase:</label>
                <select
                  value={formFase}
                  onChange={(e) => setFormFase(e.target.value as RombelRecord['fase'])}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                >
                  {FASE_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Wali Kelas <span className="font-normal text-slate-400">(opsional)</span>:
                </label>
                <select
                  value={formWaliKelasId}
                  onChange={(e) => setFormWaliKelasId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white"
                >
                  <option value="">-- Belum Ditentukan --</option>
                  {teacherList.map((t) => {
                    const isTakenElsewhere = assignedElsewhere.has(t.id) && t.id !== formWaliKelasId;
                    return (
                      <option key={t.id} value={t.id} disabled={isTakenElsewhere}>
                        {t.name}
                        {isTakenElsewhere ? ' (sudah jadi wali kelas lain)' : ''}
                      </option>
                    );
                  })}
                </select>
                {availableTeacherCount === 0 && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    {teacherList.length === 0
                      ? 'Belum ada data guru.'
                      : 'Semua guru sudah menjadi wali kelas lain.'}{' '}
                    Kelas tetap bisa disimpan tanpa wali kelas, lalu diatur nanti lewat tombol Edit.
                  </p>
                )}
              </div>

              <div className="md:col-span-3 flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambah Kelas'}</span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Daftar Kelas / Rombel</span>
              <span className="rounded-full bg-teal-50 text-teal-800 px-3 py-1 text-xs font-bold">
                {rombelData.length} Kelas
              </span>
            </h3>
            <div className="relative sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kelas atau wali kelas..."
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          {rombelData.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-200 bg-slate-50 rounded-2xl text-slate-400 text-xs italic">
              Belum ada kelas/rombel yang ditambahkan. Klik "Tambah Kelas Baru" untuk memulai.
            </div>
          ) : visibleRombel.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-slate-200 bg-slate-50 rounded-2xl text-slate-400 text-xs italic">
              Tidak ada kelas atau wali kelas yang cocok dengan "{searchQuery}".
            </div>
          ) : (
            <div className="space-y-6">
              {FASE_OPTIONS.map((faseOpt) => {
                const group = visibleRombel.filter((r) => r.fase === faseOpt.value);
                if (group.length === 0) return null;
                return (
                  <div key={faseOpt.value} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                        {faseOpt.label}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold">({group.length} kelas)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.map((rombel) => {
                        const wali = teacherName(rombel.waliKelasId);
                        return (
                          <div
                            key={rombel.id}
                            className="rounded-2xl p-4 border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{rombel.name}</h4>
                              <span className="rounded-full bg-teal-100 text-teal-800 px-2.5 py-0.5 text-[10px] font-bold shrink-0">
                                {countMuridByRombel(rombel.name)} Murid
                              </span>
                            </div>

                            <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Wali Kelas</p>
                              {wali ? (
                                <p className="text-xs font-bold text-slate-800 mt-0.5">{wali}</p>
                              ) : (
                                <p className="text-xs font-semibold text-amber-600 mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">warning</span>
                                  Belum Ditentukan
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => startEdit(rombel)}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 transition"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(rombel)}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-[11px] font-bold hover:bg-red-50 transition"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Hapus
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
