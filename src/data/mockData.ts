import { TeacherRecord, HabitItem, MuridRecord, RombelRecord } from '../types';

export const APP_ASSETS = {
  logo: '/school_logo.svg',
  // Default principal photo shown until the Kepala Sekolah uploads their own via
  // "Profil & Foto Kepala Sekolah" (UserManagementView.tsx) — see App.tsx `principalPhoto` state.
  principalPhoto: 'https://lh3.googleusercontent.com/aida/AEtjO1UklTfGWNtEP7y35w9SEC_qhPmM2GY6gi2KtZIVmMfgt3R0mDdRTuX3UF3NObWCnUOXAhdfhOTeOHa2RByRewhyy6x32XI5_ywK86fmCh-aSvfPYnqQpgc-Rb6NBZqm-5xP4WU4wp5hghAEEyFtNVemogihS69vXboewTsf4zKpCrjlGUPeC29RQCVdl4ysa0_CYeOb5LGzjZRMtFoL-Coc7IKM85Fuwuc-xTKyh4reYNrD4ApB9NtLt6A',
};

// Kepala Sekolah is a singleton, not a row in INITIAL_TEACHERS — this is her
// login identity. Password-equals-NIP login (see LoginPortalView.tsx /
// App.tsx onLogin) checks against this constant.
export const PRINCIPAL_NAME = 'Fahmawati, S.Pd.';
export const PRINCIPAL_NIP = '197305111995012002';

export const INITIAL_TEACHERS: TeacherRecord[] = [];

export const INITIAL_ROMBEL: RombelRecord[] = [
  { id: 'r-1-1', name: 'Kelas 1.1', fase: 'fase-a', waliKelasId: null },
  { id: 'r-1-2', name: 'Kelas 1.2', fase: 'fase-a', waliKelasId: null },
  { id: 'r-1-3', name: 'Kelas 1.3', fase: 'fase-a', waliKelasId: null },
  { id: 'r-2-1', name: 'Kelas 2.1', fase: 'fase-a', waliKelasId: null },
  { id: 'r-2-2', name: 'Kelas 2.2', fase: 'fase-a', waliKelasId: null },
  { id: 'r-3-1', name: 'Kelas 3.1', fase: 'fase-b', waliKelasId: null },
  { id: 'r-3-2', name: 'Kelas 3.2', fase: 'fase-b', waliKelasId: null },
  { id: 'r-3-3', name: 'Kelas 3.3', fase: 'fase-b', waliKelasId: null },
  { id: 'r-4-1', name: 'Kelas 4.1', fase: 'fase-b', waliKelasId: null },
  { id: 'r-4-2', name: 'Kelas 4.2', fase: 'fase-b', waliKelasId: null },
  { id: 'r-4-3', name: 'Kelas 4.3', fase: 'fase-b', waliKelasId: null },
  { id: 'r-5-1', name: 'Kelas 5.1', fase: 'fase-c', waliKelasId: null },
  { id: 'r-5-2', name: 'Kelas 5.2', fase: 'fase-c', waliKelasId: null },
  { id: 'r-5-3', name: 'Kelas 5.3', fase: 'fase-c', waliKelasId: null },
  { id: 'r-6-1', name: 'Kelas 6.1', fase: 'fase-c', waliKelasId: null },
  { id: 'r-6-2', name: 'Kelas 6.2', fase: 'fase-c', waliKelasId: null },
];

export const HABIT_LIST: HabitItem[] = [
  {
    id: 1,
    title: '1. Bangun Pagi Mandiri',
    category: 'Kedisiplinan',
    description: 'Rata-rata bangun pukul 05.00 WITA. Bangun segar tanpa rewel, merapikan tempat tidur.',
    icon: 'alarm',
    status: 'Konsisten',
    statusColor: 'tertiary',
    targetNote: 'Target: Pukul 05.00 WITA',
    complianceRate: 96,
    timeValue: '05:00',
  },
  {
    id: 2,
    title: '2. Beribadah Sesuai Agama',
    category: 'Spiritual',
    description: '5 Waktu Sholat Wajib (Subuh, Dzuhur, Ashar, Maghrib, Isya) + Ibadah Lainnya (Tadarus, Dhuha, Doa).',
    icon: 'mosque',
    status: 'Sangat Konsisten',
    statusColor: 'tertiary',
    targetNote: '5 Waktu Terpenuhi + Mengaji',
    complianceRate: 98,
    subPrayers: {
      subuh: true,
      dzuhur: true,
      ashar: true,
      maghrib: true,
      isya: true,
      tadarus: true,
      dhuha: true,
      doaHarian: true,
    },
  },
  {
    id: 3,
    title: '3. Olahraga & Aktivitas',
    category: 'Kesehatan Fisik',
    description: 'Senam pagi, jalan sehat, atau olahraga permainan 30 menit sehari.',
    icon: 'directions_run',
    status: 'Perlu Didorong',
    statusColor: 'secondary',
    targetNote: 'Target: 3x/minggu',
    complianceRate: 75,
  },
  {
    id: 4,
    title: '4. Makanan Sehat Bergizi',
    category: 'Nutrisi',
    description: 'Rutin konsumsi sayur, buah, sarapan seimbang dan minum air putih 8 gelas.',
    icon: 'nutrition',
    status: 'Konsisten',
    statusColor: 'tertiary',
    targetNote: 'Menu Bervariasi & Bersih',
    complianceRate: 91,
  },
  {
    id: 5,
    title: '5. Gemar Membaca Literasi',
    category: 'Literasi & Karakter',
    description: 'Membaca buku cerita rakyat atau ensiklopedia minimal 15-25 menit/hari.',
    icon: 'menu_book',
    status: 'Sangat Baik',
    statusColor: 'tertiary',
    targetNote: '175 Menit Pekan Ini',
    complianceRate: 88,
  },
  {
    id: 6,
    title: '6. Membantu & Berperilaku Santun',
    category: 'Sosial & Etika',
    description: 'Menghormati orang tua/guru (Sipakatau), bertutur kata sopan dan suka menolong.',
    icon: 'volunteer_activism',
    status: 'Sangat Baik',
    statusColor: 'tertiary',
    targetNote: 'Pembiasaan Mandiri Berkelanjutan',
    complianceRate: 94,
  },
  {
    id: 7,
    title: '7. Tidur Tepat Waktu (≥ 8 Jam)',
    category: 'Istirahat & Kebugaran',
    description: 'Tidur malam maksimal pukul 21.00 WITA untuk regenerasi dan konsentrasi esok hari.',
    icon: 'bedtime',
    status: 'Pendampingan',
    statusColor: 'secondary',
    targetNote: 'Target: Pukul 21.00 WITA',
    complianceRate: 72,
    timeValue: '21:00',
  },
];

export const INITIAL_MURID: MuridRecord[] = [];
