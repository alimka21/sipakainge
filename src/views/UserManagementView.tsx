import React, { useState } from 'react';
import { ScreenId, TeacherRecord, MuridRecord } from '../types';
import { APP_ASSETS, INITIAL_TEACHERS, INITIAL_MURID } from '../data/mockData';

interface UserManagementViewProps {
  onNavigate: (screen: ScreenId) => void;
  teachers?: TeacherRecord[];
  muridList?: MuridRecord[];
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  onNavigate,
  teachers: initialTeachersProp,
  muridList: initialMuridProp,
}) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'murid'>('guru');

  // Teachers State
  const [teachersList, setTeachersList] = useState<TeacherRecord[]>(
    initialTeachersProp || INITIAL_TEACHERS
  );
  const [filterTeacherRole, setFilterTeacherRole] = useState<'all' | 'observer' | 'reguler'>('all');
  const [searchTeacher, setSearchTeacher] = useState('');

  // Murid State
  const [muridList, setMuridList] = useState<MuridRecord[]>(
    initialMuridProp || INITIAL_MURID
  );
  const [filterMuridRombel, setFilterMuridRombel] = useState<string>('all');
  const [searchMurid, setSearchMurid] = useState('');

  // Modals state
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);

  const [isAddMuridOpen, setIsAddMuridOpen] = useState(false);
  const [editingMurid, setEditingMurid] = useState<MuridRecord | null>(null);

  // Form states for Teacher
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    nip: '',
    rombel: 'Kelas IV-A',
    fase: 'fase-b' as 'fase-a' | 'fase-b' | 'fase-c',
    subject: 'Guru Kelas / Tematik',
    isObserver: false,
  });

  // Form states for Murid
  const [muridForm, setMuridForm] = useState({
    name: '',
    nisn: '',
    nis: '',
    gender: 'L' as 'L' | 'P',
    rombel: 'Kelas IV-A',
    fase: 'fase-b' as 'fase-a' | 'fase-b' | 'fase-c',
    parentName: '',
    parentPhone: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // TEACHER CRUD HANDLERS
  const handleToggleObserver = (id: string) => {
    setTeachersList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.isObserver;
          showToast(
            `${t.name} ${
              nextState
                ? 'berhasil ditetapkan sebagai GURU OBSERVER oleh Super Admin (Kepala Sekolah)!'
                : 'telah dicabut dari peran Observer dan kembali menjadi Guru Reguler.'
            }`
          );
          return {
            ...t,
            isObserver: nextState,
            assignedAt: nextState ? '26 September 2026' : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.nip.trim()) {
      showToast('Harap isi Nama dan NIP Guru!');
      return;
    }

    if (editingTeacher) {
      setTeachersList((prev) =>
        prev.map((t) =>
          t.id === editingTeacher.id
            ? {
                ...t,
                name: teacherForm.name,
                nip: teacherForm.nip,
                rombel: teacherForm.rombel,
                fase: teacherForm.fase,
                subject: teacherForm.subject,
                isObserver: teacherForm.isObserver,
              }
            : t
        )
      );
      showToast(`Data guru ${teacherForm.name} berhasil diperbarui!`);
      setEditingTeacher(null);
    } else {
      const newTeacher: TeacherRecord = {
        id: `t-${Date.now()}`,
        name: teacherForm.name,
        nip: teacherForm.nip,
        avatar: '',
        initials: teacherForm.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        rombel: teacherForm.rombel,
        fase: teacherForm.fase,
        faseLabel:
          teacherForm.fase === 'fase-a'
            ? 'Fase A'
            : teacherForm.fase === 'fase-b'
            ? 'Fase B'
            : 'Fase C',
        subject: teacherForm.subject,
        topic: 'Tema Karakter & Supervisi Klinis',
        targetSchedule: 'Terjadwal',
        scheduleTime: '08:00 WITA',
        focusSupervision: 'Penguatan 7 KAIH & Diferensiasi',
        focusSupervisionDesc: 'Fokus pengamatan keterlibatan aktif murid.',
        stage: 'observasi',
        stageBadgeText: 'Observasi Terjadwal',
        stageBadgeType: 'tertiary',
        isObserver: teacherForm.isObserver,
        assignedObserverName: 'Fahmawati, S.Pd. (Kepala Sekolah)',
        assignedAt: teacherForm.isObserver ? '26 September 2026' : undefined,
      };
      setTeachersList((prev) => [...prev, newTeacher]);
      showToast(`Guru baru ${teacherForm.name} berhasil ditambahkan!`);
    }

    setIsAddTeacherOpen(false);
    setTeacherForm({
      name: '',
      nip: '',
      rombel: 'Kelas IV-A',
      fase: 'fase-b',
      subject: 'Guru Kelas / Tematik',
      isObserver: false,
    });
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data guru ${name}?`)) {
      setTeachersList((prev) => prev.filter((t) => t.id !== id));
      showToast(`Data guru ${name} berhasil dihapus.`);
    }
  };

  // MURID CRUD HANDLERS
  const handleSaveMurid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!muridForm.name.trim() || !muridForm.nisn.trim()) {
      showToast('Harap isi Nama Murid dan NISN!');
      return;
    }

    if (editingMurid) {
      setMuridList((prev) =>
        prev.map((m) =>
          m.id === editingMurid.id
            ? {
                ...m,
                name: muridForm.name,
                nisn: muridForm.nisn,
                nis: muridForm.nis || m.nis,
                gender: muridForm.gender,
                rombel: muridForm.rombel,
                fase: muridForm.fase,
                parentName: muridForm.parentName || m.parentName,
                parentPhone: muridForm.parentPhone || m.parentPhone,
              }
            : m
        )
      );
      showToast(`Data murid ${muridForm.name} berhasil diperbarui!`);
      setEditingMurid(null);
    } else {
      const newMurid: MuridRecord = {
        id: `m-${Date.now()}`,
        name: muridForm.name,
        nisn: muridForm.nisn,
        nis: muridForm.nis || `${Math.floor(100000 + Math.random() * 900000)}`,
        gender: muridForm.gender,
        rombel: muridForm.rombel,
        fase: muridForm.fase,
        parentName: muridForm.parentName || 'Orang Tua Murid',
        parentPhone: muridForm.parentPhone || '0812-xxxx-xxxx',
        wakeUpTime: '05:00',
        bedTime: '21:00',
        habits: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: false },
        prayers: {
          subuh: true,
          dzuhur: true,
          ashar: true,
          maghrib: true,
          isya: false,
          tadarus: true,
          dhuha: true,
          doaHarian: true,
        },
        notes: 'Murid baru terdaftar dalam sistem pemantauan 7 KAIH.',
      };
      setMuridList((prev) => [...prev, newMurid]);
      showToast(`Murid baru ${muridForm.name} berhasil ditambahkan ke ${muridForm.rombel}!`);
    }

    setIsAddMuridOpen(false);
    setMuridForm({
      name: '',
      nisn: '',
      nis: '',
      gender: 'L',
      rombel: 'Kelas IV-A',
      fase: 'fase-b',
      parentName: '',
      parentPhone: '',
    });
  };

  const handleDeleteMurid = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data murid ${name}?`)) {
      setMuridList((prev) => prev.filter((m) => m.id !== id));
      showToast(`Data murid ${name} berhasil dihapus.`);
    }
  };

  // FILTERED LISTS
  const filteredTeachers = teachersList.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.rombel.toLowerCase().includes(searchTeacher.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTeacherRole === 'observer') return t.isObserver;
    if (filterTeacherRole === 'reguler') return !t.isObserver;
    return true;
  });

  const filteredMurid = muridList.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchMurid.toLowerCase()) ||
      m.nisn.includes(searchMurid) ||
      m.parentName.toLowerCase().includes(searchMurid.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMuridRombel !== 'all' && m.rombel !== filterMuridRombel) return false;
    return true;
  });

  // Metrics
  const totalTeachers = teachersList.length;
  const activeTeacherObservers = teachersList.filter((t) => t.isObserver).length;
  const totalMuridCount = muridList.length;
  const maleMuridCount = muridList.filter((m) => m.gender === 'L').length;
  const femaleMuridCount = muridList.filter((m) => m.gender === 'P').length;

  const rombelOptions = ['Kelas I-B', 'Kelas III-A', 'Kelas IV-A', 'Kelas V-B', 'Kelas VI-C'];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-white shadow-2xl shadow-slate-900/30 ring-1 ring-white/10 animate-fade-in">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/20 text-teal-300">
            <span className="material-symbols-outlined text-base">verified_user</span>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Context Bar */}
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <button
              onClick={() => onNavigate('supervision_dashboard')}
              className="hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              Dashboard Supervisi
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[#00685f] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">manage_accounts</span>
              Manajemen Pengguna (Guru & Murid)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 ring-1 ring-purple-600/20">
              <span className="material-symbols-outlined text-sm">shield</span>
              Hak Akses Super Admin: Kepala Sekolah
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
        {/* Info Banner Super Admin (Kepala Sekolah) */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={APP_ASSETS.principalAvatar}
                alt="Kepala Sekolah"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-teal-400/30"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="rounded-full bg-teal-500/25 px-2.5 py-0.5 text-xs font-bold text-teal-300">
                    SUPER ADMIN
                  </span>
                  <span className="rounded-full bg-purple-500/25 px-2.5 py-0.5 text-xs font-bold text-purple-200">
                    Pimpinan Satuan Pendidikan
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif">Fahmawati, S.Pd.</h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  Kepala Sekolah • Penanggung Jawab Mutu, Manajemen Guru & Data Murid
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-center">
                <span className="text-[11px] text-teal-200">Total Tenaga Pendidik</span>
                <p className="text-2xl font-black text-white tabular-nums">{totalTeachers}</p>
                <span className="text-[10px] text-emerald-300">1 KS + {activeTeacherObservers} Observer</span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-center">
                <span className="text-[11px] text-teal-200">Total Murid Terdata</span>
                <p className="text-2xl font-black text-white tabular-nums">{totalMuridCount}</p>
                <span className="text-[10px] text-slate-300">{maleMuridCount} L • {femaleMuridCount} P</span>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-md text-center">
                <span className="text-[11px] text-teal-200">Rombel Aktif</span>
                <p className="text-2xl font-black text-white tabular-nums">{rombelOptions.length}</p>
                <span className="text-[10px] text-teal-200">Fase A, B, C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Manajemen Guru vs Manajemen Murid */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('guru')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              activeTab === 'guru'
                ? 'border-teal-700 text-teal-900 bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">school</span>
            <span>Manajemen Data Guru & Observer ({totalTeachers})</span>
          </button>
          <button
            onClick={() => setActiveTab('murid')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              activeTab === 'murid'
                ? 'border-teal-700 text-teal-900 bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">groups</span>
            <span>Manajemen Data Murid ({totalMuridCount})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MANAJEMEN GURU */}
        {/* ======================================================== */}
        {activeTab === 'guru' && (
          <div className="space-y-6">
            {/* Filter & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filter Peran:
                </span>
                <button
                  onClick={() => setFilterTeacherRole('all')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    filterTeacherRole === 'all'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Guru ({totalTeachers})
                </button>
                <button
                  onClick={() => setFilterTeacherRole('observer')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    filterTeacherRole === 'observer'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Guru Observer ({activeTeacherObservers})
                </button>
                <button
                  onClick={() => setFilterTeacherRole('reguler')}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    filterTeacherRole === 'reguler'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Guru Reguler ({totalTeachers - activeTeacherObservers})
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-full sm:w-64">
                  <div className="flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs">
                    <span className="material-symbols-outlined text-slate-400 mr-2 text-sm">search</span>
                    <input
                      type="text"
                      placeholder="Cari guru, NIP, rombel..."
                      value={searchTeacher}
                      onChange={(e) => setSearchTeacher(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingTeacher(null);
                    setTeacherForm({
                      name: '',
                      nip: '',
                      rombel: 'Kelas IV-A',
                      fase: 'fase-b',
                      subject: 'Guru Kelas / Tematik',
                      isObserver: false,
                    });
                    setIsAddTeacherOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Tambah Guru Baru</span>
                </button>
              </div>
            </div>

            {/* Table Guru */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-700">group</span>
                    Daftar Tenaga Pendidik & Penugasan Wali Kelas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelola data identitas guru, penugasan rombel wali kelas, dan penetapan status Observer
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 rounded-l-xl">Nama Guru & NIP</th>
                      <th className="py-3 px-4">Wali Kelas / Rombel</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      <th className="py-3 px-4">Status Observer</th>
                      <th className="py-3 px-4 text-center">Observer Aktif</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Kepala Sekolah */}
                    <tr className="bg-teal-50/40">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={APP_ASSETS.principalAvatar}
                            alt="Kepala Sekolah"
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-teal-600/30"
                          />
                          <div>
                            <p className="font-bold text-slate-900">Fahmawati, S.Pd.</p>
                            <p className="text-[10px] text-slate-500">NIP. 197305111995012002</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">Semua Rombel</span>
                        <span className="block text-[10px] text-slate-400">Kepala Satuan Pendidikan</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">Kepemimpinan Sekolah</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-bold text-teal-900 border border-teal-200">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          Super Admin & Observer Tetap
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-teal-800">Tetap</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">—</td>
                    </tr>

                    {/* Daftar Guru */}
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            {teacher.avatar ? (
                              <img
                                src={teacher.avatar}
                                alt={teacher.name}
                                className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 font-bold text-teal-800">
                                {teacher.initials}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{teacher.name}</p>
                              <p className="text-[10px] text-slate-500">NIP. {teacher.nip}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 inline-block px-2 py-0.5 rounded bg-slate-100 text-xs">
                            {teacher.rombel}
                          </span>
                          <span className="block text-[10px] text-slate-400">{teacher.faseLabel}</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">{teacher.subject}</td>

                        <td className="py-3.5 px-4">
                          {teacher.isObserver ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-800 border border-purple-200">
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              Observer Terpilih
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                              Guru Reguler
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleObserver(teacher.id)}
                            className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all mx-auto ${
                              teacher.isObserver
                                ? 'bg-purple-700 text-white'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {teacher.isObserver ? 'toggle_on' : 'toggle_off'}
                            </span>
                            <span>{teacher.isObserver ? 'Aktif' : 'Non-Aktif'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingTeacher(teacher);
                                setTeacherForm({
                                  name: teacher.name,
                                  nip: teacher.nip,
                                  rombel: teacher.rombel,
                                  fase: teacher.fase,
                                  subject: teacher.subject,
                                  isObserver: !!teacher.isObserver,
                                });
                                setIsAddTeacherOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-teal-700"
                              title="Edit Data Guru"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Hapus Data Guru"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MANAJEMEN MURID */}
        {/* ======================================================== */}
        {activeTab === 'murid' && (
          <div className="space-y-6">
            {/* Filter & Action Bar Murid */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filter Rombel:
                </span>
                <button
                  onClick={() => setFilterMuridRombel('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    filterMuridRombel === 'all'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kelas ({totalMuridCount})
                </button>
                {rombelOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterMuridRombel(r)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      filterMuridRombel === r
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r} ({muridList.filter((m) => m.rombel === r).length})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-full sm:w-64">
                  <div className="flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs">
                    <span className="material-symbols-outlined text-slate-400 mr-2 text-sm">search</span>
                    <input
                      type="text"
                      placeholder="Cari murid, NISN, orang tua..."
                      value={searchMurid}
                      onChange={(e) => setSearchMurid(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingMurid(null);
                    setMuridForm({
                      name: '',
                      nisn: '',
                      nis: '',
                      gender: 'L',
                      rombel: 'Kelas IV-A',
                      fase: 'fase-b',
                      parentName: '',
                      parentPhone: '',
                    });
                    setIsAddMuridOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Tambah Murid Baru</span>
                </button>
              </div>
            </div>

            {/* Table Murid */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-700">school</span>
                    Buku Induk & Manajemen Data Murid (Per Kelas)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Setiap murid terdaftar memiliki rekapan 7 KAIH dan ditangani oleh Wali Kelas masing-masing
                  </p>
                </div>

                <span className="rounded-xl bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  {filteredMurid.length} Murid Ditampilkan
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 rounded-l-xl">Nama Murid & NISN</th>
                      <th className="py-3 px-4">L/P</th>
                      <th className="py-3 px-4">Kelas & Wali Kelas Pengampu</th>
                      <th className="py-3 px-4">Orang Tua / Wali</th>
                      <th className="py-3 px-4 text-center">Status 7 KAIH Hari Ini</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Tindakan Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMurid.map((murid) => {
                      const doneHabits = Object.values(murid.habits).filter(Boolean).length;
                      const waliKelas =
                        teachersList.find((t) => t.rombel === murid.rombel)?.name || 'Wali Kelas Terdaftar';

                      return (
                        <tr key={murid.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              {murid.avatar ? (
                                <img
                                  src={murid.avatar}
                                  alt={murid.name}
                                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
                                />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-bold text-xs">
                                  {murid.gender === 'L' ? '👦' : '👧'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{murid.name}</p>
                                <p className="text-[10px] text-slate-500">
                                  NISN: {murid.nisn} • NIS: {murid.nis}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                murid.gender === 'L'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-pink-50 text-pink-700 border border-pink-200'
                              }`}
                            >
                              {murid.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-teal-900 block">{murid.rombel}</span>
                            <span className="text-[10px] text-slate-500">
                              Wali: {waliKelas}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-800">{murid.parentName}</p>
                            <p className="text-[10px] text-slate-500">{murid.parentPhone}</p>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                doneHabits >= 6
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doneHabits >= 4
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {doneHabits}/7 KAIH
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Bangun: {murid.wakeUpTime} • Tidur: {murid.bedTime}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingMurid(murid);
                                  setMuridForm({
                                    name: murid.name,
                                    nisn: murid.nisn,
                                    nis: murid.nis,
                                    gender: murid.gender,
                                    rombel: murid.rombel,
                                    fase: murid.fase,
                                    parentName: murid.parentName,
                                    parentPhone: murid.parentPhone,
                                  });
                                  setIsAddMuridOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-teal-700"
                                title="Edit Data Murid"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteMurid(murid.id, murid.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                title="Hapus Data Murid"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT GURU */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">person_add</span>
                {editingTeacher ? 'Edit Data Tenaga Pendidik' : 'Tambah Guru Baru'}
              </h3>
              <button
                onClick={() => setIsAddTeacherOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Siti Aminah, S.Pd."
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NIP (Nomor Induk Pegawai):</label>
                <input
                  type="text"
                  required
                  placeholder="19840212 200801 2 018"
                  value={teacherForm.nip}
                  onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wali Kelas / Rombel:</label>
                  <select
                    value={teacherForm.rombel}
                    onChange={(e) => {
                      const r = e.target.value;
                      const f =
                        r === 'Kelas I-B'
                          ? 'fase-a'
                          : r === 'Kelas III-A' || r === 'Kelas IV-A'
                          ? 'fase-b'
                          : 'fase-c';
                      setTeacherForm({ ...teacherForm, rombel: r, fase: f });
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    {rombelOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: IPAS / Guru Kelas"
                    value={teacherForm.subject}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-purple-50 p-3 rounded-xl border border-purple-200">
                  <input
                    type="checkbox"
                    checked={teacherForm.isObserver}
                    onChange={(e) =>
                      setTeacherForm({ ...teacherForm, isObserver: e.target.checked })
                    }
                    className="rounded text-purple-700 focus:ring-purple-600"
                  />
                  <span className="font-bold text-purple-900 text-xs">
                    Tetapkan Sebagai Guru Observer (Hak Melakukan Supervisi Klinis)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 shadow-sm"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT MURID */}
      {isAddMuridOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700">school</span>
                {editingMurid ? 'Edit Data Murid' : 'Tambah Murid Baru'}
              </h3>
              <button
                onClick={() => setIsAddMuridOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMurid} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Murid:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Faris Al-Fatih"
                  value={muridForm.name}
                  onChange={(e) => setMuridForm({ ...muridForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NISN (10 Digit):</label>
                  <input
                    type="text"
                    required
                    placeholder="0148928371"
                    value={muridForm.nisn}
                    onChange={(e) => setMuridForm({ ...muridForm, nisn: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin:</label>
                  <select
                    value={muridForm.gender}
                    onChange={(e) =>
                      setMuridForm({ ...muridForm, gender: e.target.value as 'L' | 'P' })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rombel / Kelas:</label>
                  <select
                    value={muridForm.rombel}
                    onChange={(e) => {
                      const r = e.target.value;
                      const f =
                        r === 'Kelas I-B'
                          ? 'fase-a'
                          : r === 'Kelas III-A' || r === 'Kelas IV-A'
                          ? 'fase-b'
                          : 'fase-c';
                      setMuridForm({ ...muridForm, rombel: r, fase: f });
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    {rombelOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Induk Siswa (NIS):</label>
                  <input
                    type="text"
                    placeholder="240801"
                    value={muridForm.nis}
                    onChange={(e) => setMuridForm({ ...muridForm, nis: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Orang Tua / Wali:</label>
                <input
                  type="text"
                  placeholder="Ibu Rahmawati & Bpk. Irwan"
                  value={muridForm.parentName}
                  onChange={(e) => setMuridForm({ ...muridForm, parentName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. Kontak / WhatsApp Orang Tua:</label>
                <input
                  type="text"
                  placeholder="0812-4291-8821"
                  value={muridForm.parentPhone}
                  onChange={(e) => setMuridForm({ ...muridForm, parentPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMuridOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 shadow-sm"
                >
                  Simpan Data Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
