import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeacherRecord, MuridRecord, DayHabitLog } from '../types';
import { INITIAL_TEACHERS, INITIAL_MURID } from '../data/mockData';

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

/**
 * Data Access Layer (DAL) untuk Teachers
 */
export async function getTeachersData(): Promise<TeacherRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('teachers').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data as TeacherRecord[];
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_TEACHERS;
}

/**
 * Data Access Layer (DAL) untuk Murid
 */
export async function getMuridData(): Promise<MuridRecord[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('murid').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data as MuridRecord[];
      }
    } catch {
      // fallback
    }
  }
  return INITIAL_MURID;
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

