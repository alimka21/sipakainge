import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeacherRecord, MuridRecord, DayHabitLog, RombelRecord, PrayerTimesChecklist, SupervisionSession } from '../types';
import { INITIAL_TEACHERS, INITIAL_MURID, INITIAL_ROMBEL } from '../data/mockData';
import { formatWitaDate, formatWitaDateTime, formatWitaShortDate, getAcademicPeriod, now, witaDateKey } from './time';

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
    nip: row.nip || '',
    username: row.username ?? undefined,
    passwordHash: row.password_hash ?? undefined,
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
    username: t.username ?? null,
    password_hash: t.passwordHash ?? null,
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
    parentPasswordHash: row.parent_password_hash ?? undefined,
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
    parent_password_hash: m.parentPasswordHash ?? null,
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

export type SupabaseWriteResult = {
  success: boolean;
  message?: string;
  /** Saved, but without username/password columns — the DB hasn't run the latest supabase-schema.sql yet. */
  accountColumnsMissing?: boolean;
};

// Account columns added 2026-10-01. Until the school re-runs supabase-schema.sql,
// PostgREST rejects any write that mentions them ("Could not find the
// 'password_hash' column ... in the schema cache"); retrying without them
// keeps ordinary guru/murid saves working in the meantime.
const ACCOUNT_COLUMNS = ['username', 'password_hash', 'parent_password_hash'];
const isMissingAccountColumn = (message: string) =>
  /schema cache|column/i.test(message) && ACCOUNT_COLUMNS.some((c) => message.includes(c));
const stripAccountColumns = (row: Record<string, unknown>) => {
  const copy = { ...row };
  ACCOUNT_COLUMNS.forEach((c) => delete copy[c]);
  return copy;
};

async function upsertWithAccountFallback(table: string, rows: Record<string, unknown>[]): Promise<SupabaseWriteResult> {
  if (!supabase) return { success: true };
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (!error) return { success: true };
  if (!isMissingAccountColumn(error.message)) return { success: false, message: error.message };
  const retry = await supabase.from(table).upsert(rows.map(stripAccountColumns), { onConflict: 'id' });
  return retry.error ? { success: false, message: retry.error.message } : { success: true, accountColumnsMissing: true };
}

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
    return await upsertWithAccountFallback('teachers', teachers.map(teacherRecordToRow));
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
    return await upsertWithAccountFallback('murid', murid.map(muridRecordToRow));
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
 * Pengaturan akun Kepala Sekolah dari `school_settings` (satu-satunya baris,
 * id = 1): foto, nama, dan hash kata sandi. `select('*')` supaya tetap jalan
 * di DB yang belum punya kolom `principal_password_hash`. Null = belum ada /
 * belum dikonfigurasi, pemanggil memakai nilai bawaan.
 */
export async function getSchoolSettings(): Promise<{
  photoUrl: string | null;
  principalName: string | null;
  principalPasswordHash: string | null;
} | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase.from('school_settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) return null;
    return {
      photoUrl: data.principal_photo_url || null,
      principalName: data.principal_name || null,
      principalPasswordHash: data.principal_password_hash || null,
    };
  } catch {
    return null;
  }
}

/** Simpan nama dan/atau hash kata sandi Kepala Sekolah (baris id = 1). */
export async function updatePrincipalAccount(fields: {
  principalName?: string;
  principalPasswordHash?: string | null;
}): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  const row: Record<string, unknown> = {};
  if (fields.principalName !== undefined) row.principal_name = fields.principalName;
  if (fields.principalPasswordHash !== undefined) row.principal_password_hash = fields.principalPasswordHash;
  try {
    const { error } = await supabase.from('school_settings').update(row).eq('id', 1);
    if (!error) return { success: true };
    if (/principal_password_hash/.test(error.message)) {
      return { success: false, accountColumnsMissing: true, message: error.message };
    }
    return { success: false, message: error.message };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
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
          updated_at: now().toISOString(),
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

/** URL Storage RPP sesi ini, atau '' bila berkasnya tidak pernah sampai ke Storage. */
export function resolveRppFileUrl(rppUrl?: string): string {
  return rppUrl && /^https?:\/\//.test(rppUrl) && !rppUrl.includes('mock-supabase-storage.local') ? rppUrl : '';
}

/**
 * Mengunggah dokumen RPP/Modul Ajar ke Supabase Storage (`rpp_bucket`).
 * Satu berkas per guru per semester (`<teacherId>/<semester>.<ext>`): unggah
 * ulang MENIMPA berkas lama, bukan menambah berkas baru. URL diberi `?v=` agar
 * browser/CDN tidak menampilkan versi lama.
 * Gagal (success: false) bila Storage belum diatur atau unggahan ditolak —
 * jangan pernah melaporkan "berhasil" untuk berkas yang tidak tersimpan,
 * karena Kepala Sekolah lalu melihat nama berkas tanpa isi.
 */
export async function uploadRPPDocument(file: File, teacherId: string): Promise<{
  success: boolean;
  url?: string;
  name: string;
  size: string;
  date: string;
  message?: string;
}> {
  const dateStr = formatWitaShortDate();
  const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  const base = { name: file.name, size: sizeStr, date: dateStr };

  if (!isSupabaseConfigured() || !supabase) {
    return { ...base, success: false, message: '❌ Berkas tidak terunggah: koneksi database/Storage belum diatur.' };
  }
  const ext = (file.name.match(/\.(pdf|docx?)$/i)?.[1] || 'pdf').toLowerCase();
  const folder = `${teacherId}/${currentSupervisionSemester().replace(/[^A-Za-z0-9]+/g, '_')}`;
  const path = `${folder}.${ext}`;
  try {
    const { error } = await supabase.storage
      .from('rpp_bucket')
      .upload(path, file, { cacheControl: '60', upsert: true, contentType: file.type || undefined });
    if (error) {
      console.warn('Storage upload error:', error);
      return { ...base, success: false, message: `❌ Berkas tidak terunggah: ${error.message}` };
    }
    // Berkas lama dengan ekstensi lain (mis. dulu .docx, sekarang .pdf). Butuh
    // policy DELETE rpp_bucket_hapus; kalau belum ada, berkas lama hanya tertinggal.
    const stale = ['pdf', 'doc', 'docx'].filter((e) => e !== ext).map((e) => `${folder}.${e}`);
    supabase.storage.from('rpp_bucket').remove(stale).then(({ error: rmError }) => {
      if (rmError) console.warn('Hapus RPP lama gagal:', rmError.message);
    });
    const { data: publicUrlData } = supabase.storage.from('rpp_bucket').getPublicUrl(path);
    return { ...base, success: true, url: `${publicUrlData.publicUrl}?v=${Date.now()}` };
  } catch (err: any) {
    return { ...base, success: false, message: `❌ Berkas tidak terunggah: ${err?.message || 'koneksi gagal'}` };
  }
}


// ==============================================================================
// DATA HARIAN MURID — 7 KAIH, presensi, nilai, portofolio, prestasi
// Di aplikasi data ini menempel ad hoc di objek murid (`(m as any).attendance`
// dst., lihat CLAUDE.md); di database masing-masing punya tabel sendiri.
// `syncMuridChanges(prev, next)` membandingkan dua versi daftar murid dan hanya
// menulis yang berubah, jadi view cukup memanggil onUpdateMuridList seperti biasa.
// ==============================================================================

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** ID untuk catatan baru (presensi/nilai/portofolio/prestasi) — kolom `id` di DB bertipe UUID. */
export function newRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const PRESTASI_TINGKAT = ['Kelas', 'Sekolah', 'Kecamatan', 'Kota', 'Provinsi', 'Nasional'];
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
// 'YYYY-MM-DD' dibaca sebagai siang WITA supaya tanggalnya tidak bergeser saat diformat.
const dateFromKey = (key: string) => new Date(`${key}T12:00:00+08:00`);

/** Ambil semua baris (PostgREST membatasi 1000 baris per permintaan). */
async function selectAll(table: string, build?: (q: any) => any): Promise<any[]> {
  if (!supabase) return [];
  const PAGE = 1000;
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from(table).select('*');
    if (build) q = build(q);
    const { data, error } = await q.order('created_at', { ascending: true }).range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data || []));
    if (!data || data.length < PAGE) return rows;
  }
}

/**
 * Muat catatan harian semua murid dari Supabase dan tempelkan ke objek murid
 * (bentuk yang sama seperti yang dibuat ClassHabitsInputView). Kalau gagal,
 * daftar murid dikembalikan apa adanya.
 */
export async function attachStudentRecords(murid: MuridRecord[]): Promise<MuridRecord[]> {
  if (!isSupabaseConfigured() || !supabase || murid.length === 0) return murid;
  try {
    const { startYear } = getAcademicPeriod();
    const today = witaDateKey();
    const [presensi, nilai, portofolio, prestasi, harian] = await Promise.all([
      selectAll('presensi', (q) => q.gte('tanggal', `${startYear}-07-01`)),
      selectAll('nilai_akademik'),
      selectAll('portofolio'),
      selectAll('prestasi'),
      selectAll('daily_habits', (q) => q.eq('date', today)),
    ]);
    const byMurid = (rows: any[]) => {
      const map = new Map<string, any[]>();
      rows.forEach((r) => map.set(r.murid_id, [...(map.get(r.murid_id) || []), r]));
      return map;
    };
    const presensiBy = byMurid(presensi);
    const nilaiBy = byMurid(nilai);
    const portoBy = byMurid(portofolio);
    const prestasiBy = byMurid(prestasi);
    const harianBy = byMurid(harian);

    return murid.map((m) => {
      const extra: Record<string, unknown> = {};
      const att = presensiBy.get(m.id);
      if (att) {
        extra.attendance = [...att]
          .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))
          .map((r) => ({
            id: r.id,
            dateKey: r.tanggal,
            date: formatWitaDateTime(new Date(r.created_at)),
            status: r.status,
            note: r.keterangan || '',
          }));
      }
      const tasks = nilaiBy.get(m.id);
      if (tasks) {
        const academics: Record<string, any> = {};
        tasks.forEach((r) => {
          const subj = academics[r.mapel] || { subject: r.mapel, score: 0, tasks: [] };
          subj.tasks.push({ taskId: r.id, taskName: r.nama_tugas, score: Number(r.nilai) });
          subj.score = Math.round(subj.tasks.reduce((s: number, t: any) => s + t.score, 0) / subj.tasks.length);
          academics[r.mapel] = subj;
        });
        extra.academics = academics;
      }
      const porto = portoBy.get(m.id);
      if (porto) {
        extra.portfolios = porto.map((r) => ({
          id: r.id,
          title: r.judul,
          category: r.kategori,
          date: formatWitaDate(dateFromKey(r.tanggal)),
          dateKey: r.tanggal,
          description: r.deskripsi,
          feedback: r.umpan_balik_guru || '',
        }));
      }
      const awards = prestasiBy.get(m.id);
      if (awards) {
        extra.achievements = awards.map((r) => ({
          id: r.id,
          title: r.judul,
          category: r.tingkat,
          date: formatWitaDate(dateFromKey(r.tanggal)),
          dateKey: r.tanggal,
          description: r.deskripsi,
        }));
      }
      const day = harianBy.get(m.id)?.[0];
      if (day) {
        extra.homeHabitsValidated = !!day.divalidasi;
        extra.homeHabitsValidatedAt = day.divalidasi_pada ? formatWitaDateTime(new Date(day.divalidasi_pada)) : undefined;
        extra.homeNote = day.notes || '';
      }
      return Object.keys(extra).length ? ({ ...m, ...extra } as MuridRecord) : m;
    });
  } catch (err) {
    console.warn('attachStudentRecords:', err instanceof Error ? err.message : err);
    return murid;
  }
}

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Item di `next` yang baru atau berubah dibanding `prev` (dicocokkan per `key`). */
function changedItems(prev: any[] = [], next: any[] = [], key: string): any[] {
  const old = new Map(prev.map((x) => [x?.[key], x]));
  return next.filter((x) => !old.has(x?.[key]) || !sameJson(old.get(x?.[key]), x));
}

const flattenTasks = (academics: Record<string, any> = {}) =>
  Object.entries(academics).flatMap(([key, subj]) =>
    (subj?.tasks || []).map((t: any) => ({ ...t, mapel: subj?.subject || key }))
  );

const toDateKey = (item: any) => (item?.dateKey && DATE_KEY_RE.test(item.dateKey) ? item.dateKey : witaDateKey());
const uuidOrNew = (id: unknown) => (typeof id === 'string' && UUID_RE.test(id) ? id : newRecordId());

/**
 * Tulis ke Supabase semua perubahan data murid antara `prev` dan `next`:
 * baris murid (7 KAIH saat ini, jam bangun/tidur, catatan), jurnal hari ini
 * (`daily_habits`, termasuk validasi wali kelas), presensi, nilai, portofolio,
 * dan prestasi. Hanya murid yang objeknya berubah yang diperiksa.
 */
export async function syncMuridChanges(prev: MuridRecord[], next: MuridRecord[]): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  const before = new Map(prev.map((m) => [m.id, m]));
  const changed = next.filter((m) => before.has(m.id) && before.get(m.id) !== m);
  if (changed.length === 0) return { success: true };

  const coreRows: MuridRecord[] = [];
  const dailyRows: Record<string, unknown>[] = [];
  const presensiRows: Record<string, unknown>[] = [];
  const nilaiRows: Record<string, unknown>[] = [];
  const portoRows: Record<string, unknown>[] = [];
  const prestasiRows: Record<string, unknown>[] = [];
  const today = witaDateKey();

  changed.forEach((m) => {
    const o = before.get(m.id)! as any;
    const n = m as any;
    const coreChanged = !sameJson(muridRecordToRow(o), muridRecordToRow(m));
    if (coreChanged) coreRows.push(m);

    const validationChanged = !!o.homeHabitsValidated !== !!n.homeHabitsValidated;
    if (coreChanged || validationChanged || (o.homeNote || '') !== (n.homeNote || '')) {
      const row: Record<string, unknown> = {
        murid_id: m.id,
        date: today,
        wake_up_time: m.wakeUpTime,
        bed_time: m.bedTime,
        habits: m.habits || {},
        prayers: m.prayers || {},
        notes: n.homeNote || null,
        updated_at: now().toISOString(),
      };
      if (validationChanged) {
        row.divalidasi = !!n.homeHabitsValidated;
        row.divalidasi_pada = n.homeHabitsValidated ? now().toISOString() : null;
      }
      dailyRows.push(row);
    }

    changedItems(o.attendance, n.attendance, 'id').forEach((a) =>
      presensiRows.push({ murid_id: m.id, tanggal: toDateKey(a), status: a.status, keterangan: a.note || null })
    );
    changedItems(flattenTasks(o.academics), flattenTasks(n.academics), 'taskId').forEach((t) =>
      nilaiRows.push({ id: uuidOrNew(t.taskId), murid_id: m.id, mapel: t.mapel, nama_tugas: t.taskName, nilai: Number(t.score) })
    );
    changedItems(o.portfolios, n.portfolios, 'id').forEach((p) =>
      portoRows.push({
        id: uuidOrNew(p.id),
        murid_id: m.id,
        judul: p.title,
        kategori: p.category || 'Lainnya',
        tanggal: toDateKey(p),
        deskripsi: p.description || '-',
        umpan_balik_guru: p.feedback || null,
      })
    );
    changedItems(o.achievements, n.achievements, 'id').forEach((a) =>
      prestasiRows.push({
        id: uuidOrNew(a.id),
        murid_id: m.id,
        judul: a.title,
        tingkat: PRESTASI_TINGKAT.includes(a.category) ? a.category : 'Sekolah',
        tanggal: toDateKey(a),
        deskripsi: a.description || '-',
      })
    );
  });

  const errors: string[] = [];
  const run = async (label: string, write: () => PromiseLike<{ error: { message: string } | null }>) => {
    try {
      const { error } = await write();
      if (error) errors.push(`${label}: ${error.message}`);
    } catch (err) {
      errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Baris murid dulu — tabel lain punya FK ke murid.id.
  if (coreRows.length) {
    const res = await upsertMuridList(coreRows);
    if (!res.success) errors.push(`murid: ${res.message}`);
  }
  const db = supabase;
  await Promise.all([
    dailyRows.length && run('jurnal 7 KAIH', () => db.from('daily_habits').upsert(dailyRows, { onConflict: 'murid_id,date' })),
    presensiRows.length && run('presensi', () => db.from('presensi').upsert(presensiRows, { onConflict: 'murid_id,tanggal' })),
    nilaiRows.length && run('nilai', () => db.from('nilai_akademik').upsert(nilaiRows, { onConflict: 'id' })),
    portoRows.length && run('portofolio', () => db.from('portofolio').upsert(portoRows, { onConflict: 'id' })),
    prestasiRows.length && run('prestasi', () => db.from('prestasi').upsert(prestasiRows, { onConflict: 'id' })),
  ]);

  return errors.length ? { success: false, message: errors.join('; ') } : { success: true };
}

// ==============================================================================
// SESI SUPERVISI — satu baris per guru per semester (teacher_id + semester unik)
// ==============================================================================

/** Nilai kolom `supervision_sessions.semester`, mis. 'Ganjil 2026/2027'. */
export const currentSupervisionSemester = () => {
  const { semester, tahunAjaran } = getAcademicPeriod();
  return `${semester} ${tahunAjaran}`;
};

const KESIMPULAN = ['Sangat Baik', 'Baik', 'Baik dengan Penguatan', 'Memerlukan Pendampingan Intensif'];

function sessionToRow(teacherId: string, s: SupervisionSession) {
  return {
    teacher_id: teacherId,
    semester: currentSupervisionSemester(),
    status: s.status,
    mapel: s.mapel || null,
    kelas: s.kelas || null,
    topik: s.topik || null,
    tujuan: s.tujuan || null,
    tanggal: s.tanggal && DATE_KEY_RE.test(s.tanggal) ? s.tanggal : null,
    jam: s.jam || null,
    lokasi: s.lokasi || null,
    supervisor: s.supervisor || null,
    catatan_awal: s.catatanAwal || null,
    rpp_file_name: s.rppFileName || null,
    rpp_file_size: s.rppFileSize || null,
    rpp_upload_date: s.rppUploadDate || null,
    rpp_url: s.rppUrl || null,
    rpp_status: s.rppStatus || 'BELUM_DIPERIKSA',
    scores17: s.scores17 || {},
    comments17: s.comments17 || {},
    aspect_status14: s.aspectStatus14 || {},
    aspect_feedback14: s.aspectFeedback14 || {},
    kelebihan15: s.kelebihan15 || null,
    kekurangan16: s.kekurangan16 || null,
    rekomendasi17: s.rekomendasi17 || null,
    obs_timer_seconds: Math.round(s.obsTimerSeconds || 0),
    obs_notes: s.obsNotes || null,
    reflection1: s.reflection1 || null,
    reflection2: s.reflection2 || null,
    reflection3: s.reflection3 || null,
    reflection4: s.reflection4 || null,
    reflection5: s.reflection5 || null,
    reflection6: s.reflection6 || null,
    penguatan_ks: s.penguatanKS || null,
    catatan_khusus_ks: s.catatanKhususKS || null,
    rekomendasi_ks: s.rekomendasiKS || null,
    tindak_lanjut_ks: s.tindakLanjutKS || 'TIDAK_ADA_TINDAK_LANJUT',
    scores22: s.scores22 || {},
    comments22: s.comments22 || {},
    apresiasi_obs: s.apresiasiObs || null,
    temuan_obs: s.temuanObs || null,
    kesimpulan_obs: s.kesimpulanObs && KESIMPULAN.includes(s.kesimpulanObs) ? s.kesimpulanObs : null,
    komitmen_guru: s.komitmenGuruNew || null,
  };
}

function rowToSession(r: any): SupervisionSession {
  return {
    status: r.status,
    mapel: r.mapel || '',
    kelas: r.kelas || '',
    topik: r.topik || '',
    tujuan: r.tujuan || '',
    tanggal: r.tanggal || '',
    jam: r.jam || '',
    lokasi: r.lokasi || '',
    supervisor: r.supervisor || '',
    catatanAwal: r.catatan_awal || '',
    rppFileName: r.rpp_file_name || '',
    rppFileSize: r.rpp_file_size || '',
    rppUploadDate: r.rpp_upload_date || '',
    ...(r.rpp_url ? { rppUrl: r.rpp_url } : {}),
    rppStatus: r.rpp_status || 'BELUM_DIPERIKSA',
    scores17: r.scores17 || {},
    comments17: r.comments17 || {},
    aspectStatus14: r.aspect_status14 || {},
    aspectFeedback14: r.aspect_feedback14 || {},
    kelebihan15: r.kelebihan15 || '',
    kekurangan16: r.kekurangan16 || '',
    rekomendasi17: r.rekomendasi17 || '',
    obsTimerSeconds: r.obs_timer_seconds || 0,
    obsNotes: r.obs_notes || '',
    reflection1: r.reflection1 || '',
    reflection2: r.reflection2 || '',
    reflection3: r.reflection3 || '',
    reflection4: r.reflection4 || '',
    reflection5: r.reflection5 || '',
    reflection6: r.reflection6 || '',
    penguatanKS: r.penguatan_ks || '',
    catatanKhususKS: r.catatan_khusus_ks || '',
    rekomendasiKS: r.rekomendasi_ks || '',
    tindakLanjutKS: r.tindak_lanjut_ks || 'TIDAK_ADA_TINDAK_LANJUT',
    scores22: r.scores22 || {},
    comments22: r.comments22 || {},
    apresiasiObs: r.apresiasi_obs || '',
    temuanObs: r.temuan_obs || '',
    ...(r.kesimpulan_obs ? { kesimpulanObs: r.kesimpulan_obs } : {}),
    komitmenGuruNew: r.komitmen_guru || '',
  } as SupervisionSession;
}

/** Sesi supervisi semester berjalan, dikelompokkan per teacher_id. */
export async function getSupervisionSessions(): Promise<Record<string, SupervisionSession> | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const rows = await selectAll('supervision_sessions', (q) => q.eq('semester', currentSupervisionSemester()));
    return Object.fromEntries(rows.map((r) => [r.teacher_id, rowToSession(r)]));
  } catch (err) {
    console.warn('getSupervisionSessions:', err instanceof Error ? err.message : err);
    return null;
  }
}

/** Kolom DB untuk tiap field SupervisionSession (lihat sessionToRow). */
const SESSION_FIELD_COLUMN: Partial<Record<keyof SupervisionSession, string>> = {
  status: 'status', mapel: 'mapel', kelas: 'kelas', topik: 'topik', tujuan: 'tujuan',
  tanggal: 'tanggal', jam: 'jam', lokasi: 'lokasi', supervisor: 'supervisor', catatanAwal: 'catatan_awal',
  rppFileName: 'rpp_file_name', rppFileSize: 'rpp_file_size', rppUploadDate: 'rpp_upload_date',
  rppUrl: 'rpp_url', rppStatus: 'rpp_status',
  scores17: 'scores17', comments17: 'comments17', aspectStatus14: 'aspect_status14',
  aspectFeedback14: 'aspect_feedback14', kelebihan15: 'kelebihan15', kekurangan16: 'kekurangan16',
  rekomendasi17: 'rekomendasi17', obsTimerSeconds: 'obs_timer_seconds', obsNotes: 'obs_notes',
  reflection1: 'reflection1', reflection2: 'reflection2', reflection3: 'reflection3',
  reflection4: 'reflection4', reflection5: 'reflection5', reflection6: 'reflection6',
  penguatanKS: 'penguatan_ks', catatanKhususKS: 'catatan_khusus_ks', rekomendasiKS: 'rekomendasi_ks',
  tindakLanjutKS: 'tindak_lanjut_ks', scores22: 'scores22', comments22: 'comments22',
  apresiasiObs: 'apresiasi_obs', temuanObs: 'temuan_obs', kesimpulanObs: 'kesimpulan_obs',
  komitmenGuruNew: 'komitmen_guru',
};

/**
 * Simpan sesi supervisi. Dengan `fields`, hanya kolom field tersebut yang
 * ditulis — wajib dipakai dari layar input. Menulis seluruh baris membuat
 * perangkat yang memuat sesi lebih dulu (mis. HP guru saat mengisi refleksi)
 * menimpa nilai yang diisi Kepala Sekolah di perangkat lain dengan salinan
 * lamanya (kasus nilai observasi hilang, 2026-11-04).
 */
export async function upsertSupervisionSession(
  teacherId: string,
  session: SupervisionSession,
  fields?: (keyof SupervisionSession)[]
): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  const full = sessionToRow(teacherId, session) as Record<string, unknown>;
  let row = full;
  if (fields) {
    row = { teacher_id: full.teacher_id, semester: full.semester };
    fields.forEach((f) => {
      const col = SESSION_FIELD_COLUMN[f];
      if (col) row[col] = full[col];
    });
  }
  try {
    const { error } = await supabase
      .from('supervision_sessions')
      .upsert(row, { onConflict: 'teacher_id,semester' });
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}

// ==============================================================================
// RIWAYAT JURNAL 7 KAIH PER HARI (Kalender orang tua)
// ==============================================================================

export interface DailyHabitEntry {
  habits: Record<number, boolean>;
  prayers: Partial<PrayerTimesChecklist>;
  wakeUpTime: string;
  bedTime: string;
  notes: string;
}

/** Jurnal harian satu murid antara dua tanggal 'YYYY-MM-DD' (inklusif), per tanggal. */
export async function getDailyHabitLogs(
  muridId: string,
  fromKey: string,
  toKey: string
): Promise<Record<string, DailyHabitEntry>> {
  if (!isSupabaseConfigured() || !supabase) return {};
  try {
    const rows = await selectAll('daily_habits', (q) =>
      q.eq('murid_id', muridId).gte('date', fromKey).lte('date', toKey)
    );
    return Object.fromEntries(
      rows.map((r) => [
        r.date,
        {
          habits: r.habits || {},
          prayers: r.prayers || {},
          wakeUpTime: r.wake_up_time || '05:00',
          bedTime: r.bed_time || '21:00',
          notes: r.notes || '',
        },
      ])
    );
  } catch (err) {
    console.warn('getDailyHabitLogs:', err instanceof Error ? err.message : err);
    return {};
  }
}

/** Simpan jurnal satu hari (dipakai untuk hari lampau; hari ini lewat syncMuridChanges). */
export async function saveDailyHabitLog(muridId: string, dateKey: string, entry: DailyHabitEntry): Promise<SupabaseWriteResult> {
  if (!isSupabaseConfigured() || !supabase) return { success: true };
  try {
    const { error } = await supabase.from('daily_habits').upsert(
      {
        murid_id: muridId,
        date: dateKey,
        habits: entry.habits,
        prayers: entry.prayers,
        wake_up_time: entry.wakeUpTime,
        bed_time: entry.bedTime,
        notes: entry.notes || null,
        // Isian orang tua yang berubah perlu divalidasi ulang wali kelas.
        divalidasi: false,
        divalidasi_pada: null,
        updated_at: now().toISOString(),
      },
      { onConflict: 'murid_id,date' }
    );
    return error ? { success: false, message: error.message } : { success: true };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : String(err) };
  }
}
