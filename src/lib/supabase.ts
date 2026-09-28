import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeacherRecord, MuridRecord, DayHabitLog, RombelRecord, PrayerTimesChecklist } from '../types';
import { INITIAL_TEACHERS, INITIAL_MURID, INITIAL_ROMBEL } from '../data/mockData';

// Ambil URL & Key dari Vite Environment Variables atau LocalStorage (setting fleksibel)
const getSupabaseEnv = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('sipakainge_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('sipakainge_supabase_anon_key') || '' : '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey,
  };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseEnv();

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseEnv();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-id') &&
    !key.includes('your-anon-public-key')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Tes koneksi ke instance Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    return {
      success: false,
      message: 'Supabase URL atau Anon Key belum diatur di .env atau Pengaturan Database.',
    };
  }

  try {
    const client = createClient(url, key);
    // Cek query sederhana
    const { error } = await client.from('teachers').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Jika tabel belum dibuat tapi koneksi API berhasil
      if (error.message.includes('relation "teachers" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Terhubung ke Supabase! (Catatan: Tabel belum dibuat, silakan jalankan SQL Schema).',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Koneksi ke database Supabase berhasil dan siap digunakan!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Gagal menghubungi Supabase: ${msg}` };
  }
}

/**
 * Simpan konfigurasi manual Supabase di runtime
 */
export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sipakainge_supabase_url', url.trim());
    localStorage.setItem('sipakainge_supabase_anon_key', anonKey.trim());
  }
}

/**
 * Hapus konfigurasi Supabase dari localStorage
 */
export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sipakainge_supabase_url');
    localStorage.removeItem('sipakainge_supabase_anon_key');
  }
}

export function getCurrentSupabaseConfig() {
  return getSupabaseEnv();
}

// ==============================================================================
// PEMETAAN BARIS DATABASE (snake_case) <-> MODEL APLIKASI (camelCase)
// Tabel `teachers`/`murid`/`rombel` di Supabase memakai snake_case; tipe
// TeacherRecord/MuridRecord/RombelRecord di aplikasi memakai camelCase.
// Jangan pernah `data as TeacherRecord[]` langsung dari Supabase — field-nya
// tidak akan pernah cocok (mis. `is_observer` vs `isObserver`).
// ==============================================================================

const DEFAULT_PRAYERS: PrayerTimesChecklist = {
  subuh: false,
  dzuhur: false,
  ashar: false,
  maghrib: false,
  isya: false,
  tadarus: false,
  dhuha: false,
  doaHarian: false,
};

function teacherRowToRecord(row: any): TeacherRecord {
  return {
    id: row.id,
    name: row.name,
    nip: row.nip,
    avatar: row.avatar || '',
    initials: row.initials || '',
    rombel: row.rombel || '',
    fase: row.fase || 'fase-a',
    faseLabel: row.fase_label || '',
    subject: row.subject || '',
    topic: row.topic || '',
    targetSchedule: row.target_schedule || '',
    scheduleTime: row.schedule_time || '',
    focusSupervision: row.focus_supervision || '',
    focusSupervisionDesc: row.focus_supervision_desc || '',
    stage: row.stage || 'pra',
    stageBadgeText: row.stage_badge_text || '',
    stageBadgeType: row.stage_badge_type || 'neutral',
    score: row.score ?? undefined,
    notes: row.notes ?? undefined,
    isObserver: row.is_observer ?? false,
    assignedObserverName: row.assigned_observer_name ?? undefined,
    assignedAt: row.assigned_at ?? undefined,
  };
}

function teacherRecordToRow(t: TeacherRecord) {
  return {
    id: t.id,
    nip: t.nip,
    name: t.name,
    role: 'Guru Kelas',
    rombel: t.rombel || null,
    subject: t.subject || null,
    avatar: t.avatar || null,
    is_observer: !!t.isObserver,
    initials: t.initials || null,
    fase: t.fase || null,
    fase_label: t.faseLabel || null,
    topic: t.topic || null,
    target_schedule: t.targetSchedule || null,
    schedule_time: t.scheduleTime || null,
    focus_supervision: t.focusSupervision || null,
    focus_supervision_desc: t.focusSupervisionDesc || null,
    stage: t.stage || null,
    stage_badge_text: t.stageBadgeText || null,
    stage_badge_type: t.stageBadgeType || null,
    score: t.score ?? null,
    notes: t.notes ?? null,
    assigned_observer_name: t.assignedObserverName ?? null,
    assigned_at: t.assignedAt ?? null,
  };
}

function muridRowToRecord(row: any): MuridRecord {
  return {
    id: row.id,
    nisn: row.nisn,
    nis: row.nis,
    name: row.name,
    gender: row.gender,
    rombel: row.rombel,
    fase: row.fase || 'fase-a',
    parentName: row.parent_name || '',
    parentPhone: row.parent_phone || '',
    tanggalLahir: row.tanggal_lahir ?? undefined,
    alamat: row.alamat ?? undefined,
    avatar: row.avatar || undefined,
    wakeUpTime: row.wake_up_time || '05:00',
    bedTime: row.bed_time || '21:00',
    habits: row.habits || {},
    prayers: row.prayers || DEFAULT_PRAYERS,
    notes: row.notes ?? undefined,
  };
}

function muridRecordToRow(m: MuridRecord) {
  return {
    id: m.id,
    nisn: m.nisn,
    nis: m.nis,
    name: m.name,
    rombel: m.rombel,
    gender: m.gender,
    parent_name: m.parentName || null,
    parent_phone: m.parentPhone || null,
    wake_up_time: m.wakeUpTime || '05:00',
    bed_time: m.bedTime || '21:00',
    fase: m.fase || null,
    tanggal_lahir: m.tanggalLahir || null,
    alamat: m.alamat || null,
    avatar: m.avatar || null,
    habits: m.habits || {},
    prayers: m.prayers || DEFAULT_PRAYERS,
    notes: m.notes || null,
  };
}

function rombelRowToRecord(row: any): RombelRecord {
  return {
    id: row.id,
    name: row.name,
    fase: row.fase || 'fase-a',
    waliKelasId: row.wali_kelas_id ?? null,
  };
}

function rombelRecordToRow(r: RombelRecord) {
  return {
    id: r.id,
    name: r.name,
    fase: r.fase,
    wali_kelas_id: r.waliKelasId,
  };
}

export type SupabaseWriteResult = { success: boolean; message?: string };

/**
 * Data Access Layer (DAL) untuk Teachers
 */
export async function getTeachersData(): Promise<TeacherRecord[]> {
  if (!isSupabaseConfigured() || !supabase) return INITIAL_TEACHERS;
  try {
    const { data, error } = await supabase.from('teachers').select('*').order('name');
    if (error) {
      console.warn('getTeachersData:', error.message);
      return INITIAL_TEACHERS;
    }
    return (data || []).map(teacherRowToRecord);
  } catch {
    return INITIAL_TEACHERS;
  }
}

/**
 * Data Access Layer (DAL) untuk Murid
 */
export async function getMuridData(): Promise<MuridRecord[]> {
  if (!isSupabaseConfigured() || !supabase) return INITIAL_MURID;
  try {
    const { data, error } = await supabase.from('murid').select('*').order('name');
    if (error) {
      console.warn('getMuridData:', error.message);
      return INITIAL_MURID;
    }
    return (data || []).map(muridRowToRecord);
  } catch {
    return INITIAL_MURID;
  }
}

/**
 * Data Access Layer (DAL) untuk Rombel / Kelas
 */
export async function getRombelData(): Promise<RombelRecord[]> {
  if (!isSupabaseConfigured() || !supabase) return INITIAL_ROMBEL;
  try {
    const { data, error } = await supabase.from('rombel').select('*').order('name');
    if (error) {
      console.warn('getRombelData:', error.message);
      return INITIAL_ROMBEL;
    }
    return (data || []).map(rombelRowToRecord);
  } catch {
    return INITIAL_ROMBEL;
  }
}

/**
 * Simpan (tambah/edit) satu atau banyak guru ke Supabase. No-op (dianggap
 * berhasil) jika Supabase belum dikonfigurasi, supaya aplikasi tetap bisa
 * dipakai tanpa database — data tetap tersimpan di state lokal seperti biasa.
 */
export async function upsertTeachers(teachers: TeacherRecord[]): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { error } = await supabase.from('teachers').upsert(teachers.map(teacherRecordToRow), { onConflict: 'id' });
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function upsertTeacher(teacher: TeacherRecord): Promise<SupabaseWriteResult> {
  return upsertTeachers([teacher]);
}

export async function deleteTeacherRemote(id: string): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Simpan (tambah/edit) satu atau banyak murid ke Supabase. Sama seperti
 * upsertTeachers — no-op jika belum terkoneksi.
 */
export async function upsertMuridList(murid: MuridRecord[]): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { error } = await supabase.from('murid').upsert(murid.map(muridRecordToRow), { onConflict: 'id' });
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function upsertMurid(murid: MuridRecord): Promise<SupabaseWriteResult> {
  return upsertMuridList([murid]);
}

export async function deleteMuridRemote(id: string): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { error } = await supabase.from('murid').delete().eq('id', id);
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Simpan (tambah/edit) satu rombel/kelas ke Supabase.
 */
export async function upsertRombel(rombel: RombelRecord): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { error } = await supabase.from('rombel').upsert(rombelRecordToRow(rombel), { onConflict: 'id' });
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteRombelRemote(id: string): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { error } = await supabase.from('rombel').delete().eq('id', id);
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Ambil foto profil Kepala Sekolah yang tersimpan (kolom
 * `school_settings.principal_photo_url`, satu-satunya baris, id = 1).
 * Mengembalikan null jika belum ada / belum dikonfigurasi, supaya pemanggil
 * bisa jatuh kembali ke foto bawaan (APP_ASSETS.principalPhoto).
 */
export async function getPrincipalPhoto(): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('school_settings')
      .select('principal_photo_url')
      .eq('id', 1)
      .maybeSingle();
    if (error || !data) return null;
    return data.principal_photo_url || null;
  } catch {
    return null;
  }
}

/**
 * Simpan foto profil Kepala Sekolah. Baris `school_settings` (id = 1) sudah
 * diisi oleh seed di supabase-schema.sql, jadi ini biasanya UPDATE murni;
 * upsert dipakai sebagai jaga-jaga kalau baris itu belum ada sama sekali.
 */
export async function updatePrincipalPhoto(photoUrl: string): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { data, error } = await supabase
      .from('school_settings')
      .update({ principal_photo_url: photoUrl })
      .eq('id', 1)
      .select('id');
    if (error) return { success: false, message: error.message };
    if (!data || data.length === 0) {
      const { error: upsertError } = await supabase
        .from('school_settings')
        .upsert({ id: 1, principal_name: 'Kepala Sekolah', principal_photo_url: photoUrl }, { onConflict: 'id' });
      if (upsertError) return { success: false, message: upsertError.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Data Access Layer (DAL) untuk Simpan Kebiasaan 7 KAIH
 */
export async function recordDailyHabit(
  muridId: string,
  date: string,
  logData: Partial<DayHabitLog> & { habits?: Record<number, boolean> }
): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('daily_habits').upsert(
        {
          murid_id: muridId,
          date,
          wake_up_time: logData.wakeUpTime,
          bed_time: logData.bedTime,
          habits: logData.habits || {},
          prayers: logData.prayers || {},
          notes: logData.notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'murid_id,date' }
      );
      return !error;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Mengunggah dokumen RPP/Modul Ajar ke Supabase Storage (atau simulasi jika belum dikonfigurasi)
 */
export async function uploadRPPDocument(file: File): Promise<{
  success: boolean;
  url?: string;
  name: string;
  size: string;
  date: string;
  message?: string;
}> {
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  if (isSupabaseConfigured() && supabase) {
    try {
      const fileName = `rpp_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('rpp_bucket')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn('Storage upload error, trying mock fallback:', error);
        return {
          success: true,
          url: `https://mock-supabase-storage.local/rpp/${fileName}`,
          name: file.name,
          size: sizeStr,
          date: dateStr,
          message: 'Terkoneksi Supabase, mengunggah dengan simulasi (pastikan storage bucket "rpp_bucket" telah dibuat di Supabase).'
        };
      }

      const { data: publicUrlData } = supabase.storage.from('rpp_bucket').getPublicUrl(fileName);
      return {
        success: true,
        url: publicUrlData.publicUrl,
        name: file.name,
        size: sizeStr,
        date: dateStr,
      };
    } catch (err: any) {
      return {
        success: true,
        url: '',
        name: file.name,
        size: sizeStr,
        date: dateStr,
        message: err.message || 'Error occurred during upload.'
      };
    }
  }

  return {
    success: true,
    url: '',
    name: file.name,
    size: sizeStr,
    date: dateStr,
    message: 'Simulasi unggah berhasil (Koneksi Supabase belum diatur).'
  };
}

