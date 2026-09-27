export type UserRole = 'kepala_sekolah' | 'guru' | 'orang_tua';

export type ScreenId =
  | 'landing'
  | 'login'
  | 'supervision_dashboard'
  | 'teacher_dashboard'
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

