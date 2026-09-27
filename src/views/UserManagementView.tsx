import React, { useState, useEffect } from 'react';
import { ScreenId, TeacherRecord, MuridRecord, UserRole, RombelRecord } from '../types';
import { INITIAL_TEACHERS, INITIAL_MURID, INITIAL_ROMBEL } from '../data/mockData';
import {
  getCurrentSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
} from '../lib/supabase';
import supabaseSchemaSql from '../../supabase-schema.sql?raw';
import {
  GURU_TEMPLATE_HEADERS,
  MURID_TEMPLATE_HEADERS,
  buildCsv,
  downloadCsv,
  normalizeNip,
  parseCsv,
  validateGuruRows,
  validateMuridRows,
  type ImportError,
} from '../lib/csvImport';

interface UserManagementViewProps {
  onNavigate: (screen: ScreenId) => void;
  teachers?: TeacherRecord[];
  onUpdateTeachersList?: React.Dispatch<React.SetStateAction<TeacherRecord[]>>;
  muridList?: MuridRecord[];
  onUpdateMuridList?: React.Dispatch<React.SetStateAction<MuridRecord[]>>;
  userRole?: UserRole;
  principalPhotoUrl?: string;
  onUpdatePrincipalPhoto?: (url: string) => void;
  rombelList?: RombelRecord[];
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  onNavigate,
  teachers: initialTeachersProp,
  onUpdateTeachersList,
  muridList: initialMuridProp,
  onUpdateMuridList,
  userRole = 'kepala_sekolah',
  principalPhotoUrl,
  onUpdatePrincipalPhoto,
  rombelList = INITIAL_ROMBEL,
}) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'murid' | 'database' | 'profil'>('guru');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = () => {
    if (!photoPreview) {
      showToast('Pilih foto terlebih dahulu!');
      return;
    }
    if (onUpdatePrincipalPhoto) {
      onUpdatePrincipalPhoto(photoPreview);
    }
    showToast('✓ Foto profil Kepala Sekolah berhasil diperbarui!');
  };

  // CSV Import States
  const [isImportGuruOpen, setIsImportGuruOpen] = useState(false);
  const [isImportMuridOpen, setIsImportMuridOpen] = useState(false);
  const [parsedGuru, setParsedGuru] = useState<any[]>([]);
  const [parsedMurid, setParsedMurid] = useState<any[]>([]);

  // CSV templates use real class names so a filled-in template imports cleanly.
  const downloadTeacherTemplate = () => {
    const kelas = rombelList.map((r) => r.name);
    const content = buildCsv(GURU_TEMPLATE_HEADERS, [
      ['Ibu Nurhasanah, S.Pd.', '198705232010012015', kelas[0] ?? '', 'Bahasa Indonesia', 'TIDAK'],
      ['Bpk. Syahdan, S.Pd.', '198211052006041009', '', 'PJOK', 'YA'],
    ]);
    downloadCsv('template_import_guru_sipakainge.csv', content);
    showToast('Template CSV Guru berhasil diunduh!');
  };

  const downloadMuridTemplate = () => {
    const kelas = rombelList.map((r) => r.name);
    const content = buildCsv(MURID_TEMPLATE_HEADERS, [
      ['Ahmad Fauzi', '0149921021', '240915', 'L', kelas[0] ?? '', '2015-05-14', 'Jl. Perintis Kemerdekaan No. 10, Makassar', 'Bpk. Rahman & Ibu Salma', '081244556677'],
      ['Siti Humaira', '0159938192', '240916', 'P', kelas[1] ?? kelas[0] ?? '', '22/08/2015', 'BTN Hamzy Blok C2, Makassar', 'Ibu Hasnah', '081399881122'],
    ]);
    downloadCsv('template_import_murid_sipakainge.csv', content);
    showToast('Template CSV Murid berhasil diunduh!');
  };

  // Supabase Database Config State
  const initialConfig = getCurrentSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(initialConfig.key);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  // Teachers State
  const [localTeachersList, setLocalTeachersList] = useState<TeacherRecord[]>(
    initialTeachersProp || INITIAL_TEACHERS
  );
  const teachersList = initialTeachersProp || localTeachersList;
  const setTeachersList = (newVal: React.SetStateAction<TeacherRecord[]>) => {
    if (onUpdateTeachersList) {
      onUpdateTeachersList(newVal);
    }
    setLocalTeachersList(newVal);
  };
  const [filterTeacherRole, setFilterTeacherRole] = useState<'all' | 'observer' | 'reguler'>('all');
  const [filterTeacherRombel, setFilterTeacherRombel] = useState<string>('all');
  const [searchTeacher, setSearchTeacher] = useState('');

  // Murid State
  const [localMuridList, setLocalMuridList] = useState<MuridRecord[]>(
    initialMuridProp || INITIAL_MURID
  );
  const muridList = initialMuridProp || localMuridList;
  const setMuridList = (newVal: any) => {
    if (onUpdateMuridList) {
      onUpdateMuridList(newVal);
    }
    setLocalMuridList(newVal);
  };
  const [filterMuridRombel, setFilterMuridRombel] = useState<string>('all');
  const [searchMurid, setSearchMurid] = useState('');

  const guruCheck = validateGuruRows(
    parsedGuru,
    new Set(teachersList.map((t) => normalizeNip(t.nip))),
    rombelList
  );
  const muridCheck = validateMuridRows(parsedMurid, new Set(muridList.map((m) => m.nisn)), rombelList);

  const handleImportGuru = () => {
    const stamp = Date.now();
    const newTeachers: TeacherRecord[] = guruCheck.valid.map((g, index) => ({
      id: `t-import-${stamp}-${index}`,
      name: g.name,
      nip: g.nip,
      avatar: '',
      initials: g.name
        .replace(/^(Ibu|Bpk\.?|Bapak|Drs\.?|Dr\.?)\s+/i, '')
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      rombel: g.rombel,
      fase: g.fase,
      faseLabel: g.rombel ? (g.fase === 'fase-a' ? 'Fase A' : g.fase === 'fase-b' ? 'Fase B' : 'Fase C') : '',
      subject: g.subject,
      topic: '-',
      targetSchedule: 'Belum dijadwalkan',
      scheduleTime: '-',
      focusSupervision: '-',
      focusSupervisionDesc: '-',
      stage: 'pra',
      stageBadgeText: 'Belum Dijadwalkan',
      stageBadgeType: 'neutral',
      isObserver: g.isObserver,
    }));
    setTeachersList((prev) => [...prev, ...newTeachers]);
    setParsedGuru([]);
    setIsImportGuruOpen(false);
    showToast(`✓ ${newTeachers.length} data guru berhasil diimpor.`);
  };

  const handleImportMurid = () => {
    const stamp = Date.now();
    const newStudents: MuridRecord[] = muridCheck.valid.map((m, index) => ({
      id: `m-import-${stamp}-${index}`,
      name: m.name,
      nisn: m.nisn,
      nis: m.nis,
      gender: m.gender,
      rombel: m.rombel,
      fase: m.fase,
      parentName: m.parentName,
      parentPhone: m.parentPhone,
      tanggalLahir: m.tanggalLahir || undefined,
      alamat: m.alamat || undefined,
      wakeUpTime: '05:00',
      bedTime: '21:00',
      habits: {},
      prayers: {
        subuh: false,
        dzuhur: false,
        ashar: false,
        maghrib: false,
        isya: false,
        tadarus: false,
        dhuha: false,
        doaHarian: false,
      },
    }));
    setMuridList((prev: MuridRecord[]) => [...prev, ...newStudents]);
    setParsedMurid([]);
    setIsImportMuridOpen(false);
    showToast(`✓ ${newStudents.length} data murid berhasil diimpor.`);
  };

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
    teacherType: 'Guru Kelas' as 'Guru Kelas' | 'Guru Mata Pelajaran',
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
    tanggalLahir: '',
    alamat: '',
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

    const savedSubject = teacherForm.teacherType === 'Guru Kelas' ? 'Guru Kelas' : teacherForm.subject;

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
                subject: savedSubject,
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
        subject: savedSubject,
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
      teacherType: 'Guru Kelas',
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
      setMuridList((prev: MuridRecord[]) =>
        prev.map((m: MuridRecord) =>
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
                tanggalLahir: muridForm.tanggalLahir || m.tanggalLahir,
                alamat: muridForm.alamat || m.alamat,
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
        tanggalLahir: muridForm.tanggalLahir || undefined,
        alamat: muridForm.alamat || undefined,
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
      setMuridList((prev: MuridRecord[]) => [...prev, newMurid]);
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
      tanggalLahir: '',
      alamat: '',
    });
  };

  const handleDeleteMurid = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data murid ${name}?`)) {
      setMuridList((prev: MuridRecord[]) => prev.filter((m: MuridRecord) => m.id !== id));
      showToast(`Data murid ${name} berhasil dihapus.`);
    }
  };

  // SUPABASE CONFIG HANDLERS
  const handleTestSupabase = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    const result = await testSupabaseConnection();
    setIsTestingDb(false);
    setDbTestResult(result);
  };

  const handleSaveSupabase = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      showToast('Harap masukkan Supabase URL dan Anon Key!');
      return;
    }
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setIsConfigured(true);
    showToast('Konfigurasi Supabase berhasil disimpan!');
    handleTestSupabase();
  };

  const handleResetSupabase = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setIsConfigured(false);
    setDbTestResult(null);
    showToast('Konfigurasi Supabase direset ke default.');
  };

  const sqlSchemaScript = supabaseSchemaSql;

  const handleCopySqlScript = () => {
    navigator.clipboard.writeText(sqlSchemaScript);
    setIsCopiedSql(true);
    showToast('Script SQL Schema berhasil disalin ke clipboard!');
    setTimeout(() => setIsCopiedSql(false), 3000);
  };

  // FILTERED LISTS
  const filteredTeachers = teachersList.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      t.rombel.toLowerCase().includes(searchTeacher.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTeacherRole === 'observer' && !t.isObserver) return false;
    if (filterTeacherRole === 'reguler' && t.isObserver) return false;
    if (filterTeacherRombel !== 'all' && t.rombel !== filterTeacherRombel) return false;
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

  const rombelOptions = rombelList.map((r) => r.name);
  const faseOfRombel = (name: string) =>
    rombelList.find((r) => r.name === name)?.fase ?? 'fase-b';

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
              {principalPhotoUrl ? (
                <img
                  src={principalPhotoUrl}
                  alt="Kepala Sekolah"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-teal-400/30"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 text-teal-200 flex items-center justify-center font-bold text-2xl ring-4 ring-teal-400/30">
                  F
                </div>
              )}
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

        {/* Tab Switcher: Manajemen Guru vs Manajemen Murid vs Database Supabase */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guru')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
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
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'murid'
                ? 'border-teal-700 text-teal-900 bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg">groups</span>
            <span>Manajemen Data Murid ({totalMuridCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
              activeTab === 'database'
                ? 'border-emerald-700 text-emerald-950 bg-white rounded-t-2xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-emerald-600">database</span>
            <span>Database Supabase (PostgreSQL)</span>
            {isConfigured ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                Terkoneksi
              </span>
            ) : (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                Atur DB
              </span>
            )}
          </button>
          {userRole === 'kepala_sekolah' && (
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex items-center gap-2 px-6 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 ${
                activeTab === 'profil'
                  ? 'border-teal-700 text-teal-900 bg-white rounded-t-2xl shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg">account_circle</span>
              <span>Profil & Foto Kepala Sekolah</span>
            </button>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB: PROFIL & GANTI FOTO KEPALA SEKOLAH */}
        {/* ======================================================== */}
        {activeTab === 'profil' && userRole === 'kepala_sekolah' && (
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-5 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-700">photo_camera</span>
              Ganti Foto Profil Kepala Sekolah
            </h3>
            <p className="text-xs text-slate-500">
              Foto ini akan tampil di header aplikasi dan pada halaman depan (landing page) sekolah.
            </p>

            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                {photoPreview || principalPhotoUrl ? (
                  <img
                    src={photoPreview || principalPhotoUrl}
                    alt="Pratinjau Foto Kepala Sekolah"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-800 hover:file:bg-teal-100"
                />
                <button
                  onClick={handleSavePhoto}
                  disabled={!photoPreview}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Simpan Foto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: MANAJEMEN GURU */}
        {/* ======================================================== */}
        {activeTab === 'guru' && (
          <div className="space-y-6">
            {/* Filter & Action Bar */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex flex-wrap items-center justify-between gap-4">
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

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-full sm:w-64">
                    <div className="flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs border border-slate-200">
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
                    type="button"
                    onClick={downloadTeacherTemplate}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition shrink-0 shadow-xs"
                    title="Unduh template CSV untuk import data guru"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">download</span>
                    <span>Template Guru</span>
                  </button>

                  <button
                    onClick={() => setIsImportGuruOpen(!isImportGuruOpen)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-800 px-4 py-2 text-xs font-bold text-teal-800 bg-white hover:bg-teal-50 transition shrink-0 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
                    <span>Import CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingTeacher(null);
                      setTeacherForm({
                        name: '',
                        nip: '',
                        rombel: 'Kelas IV-A',
                        fase: 'fase-b',
                        subject: '',
                        isObserver: false,
                        teacherType: 'Guru Kelas',
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

              {/* Rombel Filter for Teachers too */}
              <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Filter Rombel Guru:
                </span>
                <button
                  onClick={() => setFilterTeacherRombel('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    filterTeacherRombel === 'all'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Kelas
                </button>
                {rombelOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterTeacherRombel(r)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      filterTeacherRombel === r
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r} ({teachersList.filter((t) => t.rombel === r).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Inline CSV Import Panel for Teachers */}
            {isImportGuruOpen && (
              <div className="p-5 rounded-3xl bg-teal-50/50 border border-teal-200/60 shadow-xs space-y-4 animate-scale-up">
                <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                  <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm font-bold">folder_zip</span>
                    <span>Import Tenaga Pendidik via CSV</span>
                  </h4>
                  <button
                    onClick={() => downloadTeacherTemplate()}
                    className="text-[11px] text-teal-800 font-bold hover:underline flex items-center gap-1 bg-white border border-teal-200 px-2.5 py-1 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-[10px] font-bold">download</span>
                    <span>Unduh Template CSV</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-dashed border-teal-200 bg-white rounded-2xl text-center space-y-2.5 flex flex-col justify-center items-center">
                    <span className="material-symbols-outlined text-teal-700 text-3xl">cloud_upload</span>
                    <p className="text-[11px] text-slate-500 font-bold">Unggah file CSV guru yang telah diisi sesuai template</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const text = evt.target?.result as string;
                            setParsedGuru(parseCsv(text));
                            e.target.value = '';
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="text-xs font-bold text-slate-600 cursor-pointer block border border-slate-200 rounded-xl p-1 bg-slate-50 max-w-full"
                    />
                  </div>

                  <ImportReview
                    entity="guru"
                    totalRows={parsedGuru.length}
                    validNames={guruCheck.valid.map((g) => `${g.name} — NIP ${g.nip}`)}
                    errors={guruCheck.errors}
                    onCancel={() => setParsedGuru([])}
                    onImport={handleImportGuru}
                  />
                </div>
              </div>
            )}

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
                      <th className="py-3 px-4">Status Guru</th>
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
                          {principalPhotoUrl ? (
                            <img
                              src={principalPhotoUrl}
                              alt="Kepala Sekolah"
                              className="h-10 w-10 rounded-xl object-cover ring-2 ring-teal-600/30"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs ring-2 ring-teal-600/30 shrink-0">
                              F
                            </div>
                          )}
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
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="font-bold text-[#00685f]">Kepala Sekolah</span>
                        <span className="block text-[10px] text-slate-400">Kepemimpinan Sekolah</span>
                      </td>
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
                            {teacher.rombel || 'Belum ditugaskan'}
                          </span>
                          <span className="block text-[10px] text-slate-400">{teacher.faseLabel}</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {(() => {
                            const isMapel = teacher.subject && !teacher.subject.toLowerCase().includes('guru kelas') && !teacher.subject.toLowerCase().includes('tematik') && !teacher.subject.toLowerCase().includes('multi mapel');
                            return (
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${isMapel ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                                  {isMapel ? 'Guru Mata Pelajaran' : 'Guru Kelas'}
                                </span>
                                {isMapel && (
                                  <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                                    Mapel: {teacher.subject}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

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
                                const isMapel = teacher.subject && !teacher.subject.toLowerCase().includes('guru kelas') && !teacher.subject.toLowerCase().includes('tematik');
                                setEditingTeacher(teacher);
                                setTeacherForm({
                                  name: teacher.name,
                                  nip: teacher.nip,
                                  rombel: teacher.rombel,
                                  fase: teacher.fase,
                                  subject: isMapel ? teacher.subject : '',
                                  isObserver: !!teacher.isObserver,
                                  teacherType: isMapel ? 'Guru Mata Pelajaran' : 'Guru Kelas',
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
                  type="button"
                  onClick={downloadMuridTemplate}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition shrink-0 shadow-xs"
                  title="Unduh template CSV untuk import data murid"
                >
                  <span className="material-symbols-outlined text-sm font-bold">download</span>
                  <span>Template Murid</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsImportMuridOpen(!isImportMuridOpen)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-800 px-4 py-2 text-xs font-bold text-teal-800 bg-white hover:bg-teal-50 transition shrink-0 shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
                  <span>Import CSV</span>
                </button>

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
                      tanggalLahir: '',
                      alamat: '',
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

            {/* Inline CSV Import Panel for Students (Murid) */}
            {isImportMuridOpen && (
              <div className="p-5 rounded-3xl bg-teal-50/50 border border-teal-200/60 shadow-xs space-y-4 animate-scale-up">
                <div className="flex items-center justify-between border-b border-teal-100 pb-2">
                  <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm font-bold">folder_zip</span>
                    <span>Import Data Peserta Didik via CSV</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => downloadMuridTemplate()}
                    className="text-[11px] text-teal-800 font-bold hover:underline flex items-center gap-1 bg-white border border-teal-200 px-2.5 py-1 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-[10px] font-bold">download</span>
                    <span>Unduh Template CSV Murid</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-dashed border-teal-200 bg-white rounded-2xl text-center space-y-2.5 flex flex-col justify-center items-center">
                    <span className="material-symbols-outlined text-teal-700 text-3xl">cloud_upload</span>
                    <p className="text-[11px] text-slate-500 font-bold">Unggah file CSV murid yang telah diisi sesuai template</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const text = evt.target?.result as string;
                            setParsedMurid(parseCsv(text));
                            e.target.value = '';
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="text-xs font-bold text-slate-600 cursor-pointer block border border-slate-200 rounded-xl p-1 bg-slate-50 max-w-full"
                    />
                  </div>

                  <ImportReview
                    entity="murid"
                    totalRows={parsedMurid.length}
                    validNames={muridCheck.valid.map((m) => `${m.name} — ${m.rombel}`)}
                    errors={muridCheck.errors}
                    onCancel={() => setParsedMurid([])}
                    onImport={handleImportMurid}
                  />
                </div>
              </div>
            )}

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
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shrink-0">
                                  <span
                                    className="material-symbols-outlined text-base"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                  >
                                    {murid.gender === 'L' ? 'boy' : 'girl'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{murid.name}</p>
                                <p className="text-[10px] text-slate-500">
                                  NISN: {murid.nisn} • NIS: {murid.nis}
                                </p>
                                {(murid.tanggalLahir || murid.alamat) && (
                                  <p className="text-[10px] text-slate-400">
                                    {murid.tanggalLahir && <>Lahir: {murid.tanggalLahir}</>}
                                    {murid.tanggalLahir && murid.alamat && ' • '}
                                    {murid.alamat && <>{murid.alamat}</>}
                                  </p>
                                )}
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
                                    tanggalLahir: murid.tanggalLahir || '',
                                    alamat: murid.alamat || '',
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

        {/* ======================================================== */}
        {/* TAB 3: PENGATURAN DATABASE SUPABASE (POSTGRESQL) */}
        {/* ======================================================== */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 sm:p-7 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 ring-2 ring-emerald-500/30 shrink-0">
                    <span className="material-symbols-outlined text-3xl">database</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">Supabase PostgreSQL Database</h2>
                      {isConfigured ? (
                        <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 flex items-center gap-1 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Terkoneksi
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 flex items-center gap-1 border border-amber-500/30">
                          Belum Dikonfigurasi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Penyimpanan persisten berbasis cloud untuk data Tenaga Pendidik, Murid, Catatan Harian 7 KAIH, dan Siklus Supervisi Klinis SIPAKAINGE SDN Percontohan PAM Makassar.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleTestSupabase}
                    disabled={isTestingDb}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/15"
                  >
                    <span className="material-symbols-outlined text-base">
                      {isTestingDb ? 'sync' : 'network_check'}
                    </span>
                    <span>{isTestingDb ? 'Menguji...' : 'Tes Koneksi'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Test Result Alert */}
            {dbTestResult && (
              <div
                className={`rounded-2xl p-4 text-xs font-semibold flex items-center gap-3 border ${
                  dbTestResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                <span className="material-symbols-outlined text-xl shrink-0">
                  {dbTestResult.success ? 'check_circle' : 'error'}
                </span>
                <div className="flex-1">{dbTestResult.message}</div>
              </div>
            )}

            {/* Form Input Kredensial Supabase */}
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-700">key</span>
                    Kredensial API Supabase (Project URL & Public Anon Key)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kredensial ini dapat diatur melalui variabel lingkungan <code>.env</code> atau langsung disimpan di browser ini.
                  </p>
                </div>
                {isConfigured && (
                  <button
                    onClick={handleResetSupabase}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Reset ke Default
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL):
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzprojectid.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Ditemukan di: Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Ditemukan di: Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API Keys &rarr; anon / public
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveSupabase}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Simpan & Verifikasi Koneksi</span>
                  </button>
                  <button
                    onClick={handleTestSupabase}
                    disabled={isTestingDb}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                  >
                    <span className="material-symbols-outlined text-base">network_check</span>
                    <span>Uji Status API</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Panduan 3 Langkah & Script SQL Schema */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Langkah Setup */}
              <div className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700">flag</span>
                  Panduan 3 Langkah Setup Supabase
                </h3>
                <ol className="space-y-3.5 text-xs text-slate-600 list-decimal pl-4 leading-relaxed">
                  <li>
                    <strong className="text-slate-900">Buat Akun & Proyek:</strong>
                    <p className="mt-0.5">
                      Buka{' '}
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-700 underline font-bold"
                      >
                        supabase.com
                      </a>{' '}
                      dan buat proyek baru (misal: <em>sipakainge-pam-makassar</em>).
                    </p>
                  </li>
                  <li>
                    <strong className="text-slate-900">Jalankan SQL Schema:</strong>
                    <p className="mt-0.5">
                      Buka menu <strong>SQL Editor</strong> di dashboard Supabase Anda, klik <strong>New Query</strong>, lalu salin dan jalankan script SQL di sebelah kanan.
                    </p>
                  </li>
                  <li>
                    <strong className="text-slate-900">Salin Kunci API:</strong>
                    <p className="mt-0.5">
                      Buka <strong>Project Settings &rarr; API</strong>, salin <strong>Project URL</strong> dan <strong>anon key</strong> ke form di atas atau file <code>.env</code>.
                    </p>
                  </li>
                </ol>
                <div className="rounded-2xl bg-teal-50/70 p-3.5 border border-teal-100 text-teal-900 text-[11px] leading-relaxed">
                  <strong>Tips Keamanan:</strong> Skema SIPAKAINGE telah dilengkapi kebijakan <em>Row Level Security (RLS)</em> sehingga aman digunakan untuk akses rekap publik dan manajemen otentikasi internal.
                </div>
              </div>

              {/* Script SQL Schema */}
              <div className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-700">code</span>
                        Script SQL Schema DDL & Seed Data
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Jalankan di Supabase SQL Editor (Tersedia juga di file <code>/supabase-schema.sql</code>)
                      </p>
                    </div>
                    <button
                      onClick={handleCopySqlScript}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition border border-emerald-200"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isCopiedSql ? 'check' : 'content_copy'}
                      </span>
                      <span>{isCopiedSql ? 'Tersalin!' : 'Salin Script SQL'}</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-4 font-mono text-[11px] text-emerald-300 max-h-80 overflow-y-auto leading-relaxed border border-slate-800">
                    <pre className="whitespace-pre">{sqlSchemaScript}</pre>
                  </div>
                </div>

                <div className="pt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Mencakup: guru, kelas, murid, 7 KAIH, presensi, nilai, portofolio, prestasi, supervisi, view laporan & RLS</span>
                  <button
                    onClick={handleCopySqlScript}
                    className="text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    Salin Script &rarr;
                  </button>
                </div>
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
                  <label className="font-bold text-slate-700 block mb-1">Status Guru:</label>
                  <select
                    value={teacherForm.teacherType}
                    onChange={(e) => {
                      const tType = e.target.value as 'Guru Kelas' | 'Guru Mata Pelajaran';
                      setTeacherForm({
                        ...teacherForm,
                        teacherType: tType,
                        subject: tType === 'Guru Kelas' ? 'Guru Kelas' : '',
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="Guru Kelas">Guru Kelas</option>
                    <option value="Guru Mata Pelajaran">Guru Mata Pelajaran</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wali Kelas / Rombel:</label>
                  <select
                    value={teacherForm.rombel}
                    onChange={(e) => {
                      const r = e.target.value;
                      const f = faseOfRombel(r);
                      setTeacherForm({ ...teacherForm, rombel: r, fase: f });
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="">Belum ditugaskan (bukan wali kelas)</option>
                    {rombelOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {teacherForm.teacherType === 'Guru Mata Pelajaran' && (
                <div className="animate-scale-up">
                  <label className="font-bold text-slate-700 block mb-1">Mata Pelajaran Yang Diampu:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PJOK, Pendidikan Agama Islam, Bahasa Inggris, dll."
                    value={teacherForm.subject === 'Guru Kelas' ? '' : teacherForm.subject}
                    onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Wajib menuliskan mata pelajaran khusus yang diampu di satuan pendidikan.</p>
                </div>
              )}

              {teacherForm.teacherType === 'Guru Kelas' && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700 block mb-0.5">Informasi Guru Kelas:</span>
                  Guru kelas bertanggung jawab mengampu ragam muatan pembelajaran tematik terpadu (Bahasa Indonesia, Matematika, Pancasila, IPAS, dll) di rombel terpilih.
                </div>
              )}

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
                      const f = faseOfRombel(r);
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
                  <label className="font-bold text-slate-700 block mb-1">Nomor Induk Murid (NIS):</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Lahir:</label>
                  <input
                    type="date"
                    value={muridForm.tanggalLahir}
                    onChange={(e) => setMuridForm({ ...muridForm, tanggalLahir: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat:</label>
                  <input
                    type="text"
                    placeholder="Jl. Perintis Kemerdekaan No. 10, Makassar"
                    value={muridForm.alamat}
                    onChange={(e) => setMuridForm({ ...muridForm, alamat: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
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

interface ImportReviewProps {
  entity: 'guru' | 'murid';
  totalRows: number;
  validNames: string[];
  errors: ImportError[];
  onCancel: () => void;
  onImport: () => void;
}

const ImportReview: React.FC<ImportReviewProps> = ({ entity, totalRows, validNames, errors, onCancel, onImport }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
    <h5 className="text-[11px] font-extrabold text-slate-800 uppercase">
      Tinjauan Data ({totalRows} baris)
    </h5>

    {totalRows === 0 ? (
      <p className="text-[11px] text-slate-400 italic text-center py-6 border border-slate-100 rounded-xl bg-slate-50/50">
        Belum ada file diunggah.
      </p>
    ) : (
      <>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">{validNames.length} siap diimpor</span>
          {errors.length > 0 && (
            <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5">{errors.length} ditolak</span>
          )}
        </div>

        <div className="max-h-32 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 text-[11px] bg-slate-50/50 p-2">
          {errors.map((err) => (
            <div key={`e-${err.line}`} className="py-1 text-rose-700">
              <strong>Baris {err.line}</strong> ({err.name}): {err.reason}
            </div>
          ))}
          {validNames.map((label, idx) => (
            <div key={`v-${idx}`} className="py-1 text-slate-700">
              ✓ {label}
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <p className="text-[10px] text-slate-500">
            Baris yang ditolak tidak akan diimpor. Perbaiki di file lalu unggah ulang.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-500 rounded-lg hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={validNames.length === 0}
            className="px-3.5 py-1.5 bg-teal-800 text-white rounded-xl text-[11px] font-bold hover:bg-teal-900 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Impor {validNames.length} Data {entity === 'guru' ? 'Guru' : 'Murid'}
          </button>
        </div>
      </>
    )}
  </div>
);
