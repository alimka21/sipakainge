export type UserRole = 'kepala_sekolah' | 'guru' | 'orang_tua';

export type ScreenId =
  | 'landing'
  | 'login'
  | 'supervision_dashboard'
  | 'teacher_dashboard'
  | 'teacher_my_supervision'
  | 'student_dashboard'
  | 'observation_form'
  | 'follow_up_plan'
  | 'user_management'
  | 'class_habits_input'
  | 'parent_dashboard'
  | 'parent_calendar'
  | 'parent_portfolio';

export interface PrayerTimesChecklist {
  subuh: boolean;
  dzuhur: boolean;
  ashar: boolean;
  maghrib: boolean;
  isya: boolean;
  tadarus: boolean;
  dhuha: boolean;
  doaHarian: boolean;
}

export interface MuridRecord {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  rombel: string; // 'Kelas IV-A', 'Kelas V-B', 'Kelas III-A', 'Kelas I-B', 'Kelas VI-C'
  fase: 'fase-a' | 'fase-b' | 'fase-c';
  parentName: string;
  parentPhone: string;
  avatar?: string;
  wakeUpTime: string;
  bedTime: string;
  habits: Record<number, boolean>;
  prayers: PrayerTimesChecklist;
  notes?: string;
}

export interface TeacherRecord {
  id: string;
  name: string;
  nip: string;
  avatar: string;
  initials: string;
  rombel: string;
  fase: 'fase-a' | 'fase-b' | 'fase-c';
  faseLabel: string;
  subject: string;
  topic: string;
  targetSchedule: string;
  scheduleTime: string;
  focusSupervision: string;
  focusSupervisionDesc: string;
  stage: 'pra' | 'telaah' | 'observasi' | 'refleksi' | 'tuntas';
  stageBadgeText: string;
  stageBadgeType: 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral';
  score?: number;
  notes?: string;
  isObserver?: boolean;
  assignedObserverName?: string;
  assignedAt?: string;
}

export type SupervisionStatus =
  | 'DRAFT'
  | 'DIAJUKAN'
  | 'DISETUJUI'
  | 'TERJADWAL'
  | 'DOKUMEN_DIUPLOAD'
  | 'PERANGKAT_DINILAI'
  | 'OBSERVASI_DILAKUKAN'
  | 'HASIL_SUPERVISI_TERSEDIA'
  | 'REFLEKSI_GURU'
  | 'PENGUATAN_KEPALA_SEKOLAH'
  | 'TINDAK_LANJUT'
  | 'SELESAI';

export interface SupervisionSession {
  status: SupervisionStatus;
  mapel: string;
  kelas: string;
  topik: string;
  tujuan: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  supervisor: string;
  catatanAwal: string;
  rppFileName: string;
  rppFileSize: string;
  rppUploadDate: string;
  rppStatus: 'BELUM_DIPERIKSA' | 'DIPERIKSA' | 'PERLU_PERBAIKAN';
  scores17: Record<number, number>;
  comments17: Record<number, string>;
  aspectStatus14: Record<number, 'revisi' | 'tidak_revisi'>;
  aspectFeedback14: Record<number, string>;
  kelebihan15: string;
  kekurangan16: string;
  rekomendasi17: string;
  obsTimerSeconds: number;
  obsNotes: string;
  reflection1: string;
  reflection2: string;
  reflection3: string;
  reflection4: string;
  reflection5: string;
  reflection6: string;
  penguatanKS: string;
  catatanKhususKS: string;
  rekomendasiKS: string;
  tindakLanjutKS: 'TIDAK_ADA_TINDAK_LANJUT' | 'TINDAK_LANJUT_RINGAN' | 'PERLU_PENDAMPINGAN' | 'PERLU_SUPERVISI_LANJUTAN';
  scores22?: Record<number, number>;
  comments22?: Record<number, string>;
  apresiasiObs?: string;
  temuanObs?: string;
  kesimpulanObs?: 'Sangat Baik' | 'Baik' | 'Baik dengan Penguatan' | 'Memerlukan Pendampingan Intensif';
  komitmenGuruNew?: string;
}

export interface HabitItem {
  id: number;
  title: string;
  category: string;
  description: string;
  icon: string;
  status: 'Konsisten' | 'Sangat Konsisten' | 'Perlu Didorong' | 'Sangat Baik' | 'Pendampingan';
  statusColor: 'tertiary' | 'secondary' | 'primary';
  targetNote: string;
  complianceRate: number;
  timeValue?: string;
  subPrayers?: PrayerTimesChecklist;
}

export interface DayHabitLog {
  day: number;
  dateStr: string;
  status: 'lengkap' | 'sebagian' | 'mandiri_istimewa' | 'kosong' | 'hari_ini';
  habitsDone: number;
  totalHabits: number;
  wakeUpTime?: string;
  bedTime?: string;
  prayers?: PrayerTimesChecklist;
  notes?: string;
}

