import { MuridRecord, TeacherRecord } from '../types';
import { normalizeNip } from './csvImport';

/** Default password for a guru account that has no NIP (login uses a username instead). */
export const DEFAULT_NO_NIP_PASSWORD = '123456';
export const MIN_PASSWORD_LENGTH = 6;

// Titles that come before a name and shouldn't become the username
// ("Hj. Ratna Sari" → "ratna", not "hj").
const HONORIFICS = new Set([
  'ibu', 'bu', 'bapak', 'bpk', 'pak', 'hj', 'h', 'haji', 'hajjah', 'dra', 'drs', 'dr', 'ir', 'prof',
  'ust', 'ustadz', 'ustadzah', 'ustaz', 'ustazah', 'sdr', 'sdri',
]);

/** "Hj. Ratna Sari Dewi, S.Pd." → "ratna". Degrees after a comma and leading titles are ignored. */
export const usernameBase = (name: string): string => {
  const words = name.split(',')[0].trim().split(/\s+/);
  for (const w of words) {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean && !HONORIFICS.has(clean)) return clean;
  }
  return 'guru';
};

/** First free username for `name`: "ratna", then "ratna2", "ratna3", ... */
export const pickUsername = (name: string, taken: Set<string>): string => {
  const base = usernameBase(name);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}${n}`)) n++;
  return `${base}${n}`;
};

/**
 * Gives every guru without a NIP a username, keeping any that already have
 * one. Teachers are processed in id order (ids are time-based), so the older
 * "Ratna" keeps "ratna" and a newer one gets "ratna2".
 */
export const withUsernames = (teachers: TeacherRecord[]): TeacherRecord[] => {
  const taken = new Set(teachers.map((t) => t.username).filter(Boolean) as string[]);
  const assigned = new Map<string, string>();
  [...teachers]
    .filter((t) => !t.nip.trim() && !t.username)
    .sort((a, b) => a.id.localeCompare(b.id))
    .forEach((t) => {
      const u = pickUsername(t.name, taken);
      taken.add(u);
      assigned.set(t.id, u);
    });
  if (assigned.size === 0) return teachers;
  return teachers.map((t) => (assigned.has(t.id) ? { ...t, username: assigned.get(t.id) } : t));
};

/** What a guru types in the "akun" field: their NIP, or their username if they have no NIP. */
export const teacherLoginId = (t: TeacherRecord): string => (t.nip.trim() ? t.nip : t.username || '-');

/**
 * Finds a guru by login: a guru WITH a NIP logs in only with that NIP; the
 * username (case-insensitive) is only accepted for a guru without NIP. So a
 * guru who was given a NIP later can no longer use their old username.
 */
export const findTeacherByLogin = (teachers: TeacherRecord[], identifier: string): TeacherRecord | undefined => {
  const raw = identifier.replace(/\(.*\)/, '').trim();
  if (!raw) return undefined;
  const nip = normalizeNip(raw);
  const user = raw.toLowerCase();
  return teachers.find((t) =>
    t.nip.trim() ? normalizeNip(t.nip) === nip : !!t.username && t.username === user
  );
};

export const teacherDefaultPassword = (t: TeacherRecord): string =>
  t.nip.trim() ? normalizeNip(t.nip) : DEFAULT_NO_NIP_PASSWORD;

// ---------------------------------------------------------------------------
// Password hashing — salted SHA-256 via Web Crypto (built into every browser,
// no dependency). Stored as "<salt>$<hex>". Note this is still client-side
// auth: the anon key can read the table, so it keeps passwords from being
// stored or shown as plain text, but it is not a substitute for real
// server-side authentication (Supabase Auth).
// ---------------------------------------------------------------------------
const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

const sha256 = async (text: string) => toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));

export const hashPassword = async (password: string): Promise<string> => {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(8)).buffer);
  return `${salt}$${await sha256(`${salt}:${password}`)}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  return (await sha256(`${salt}:${password}`)) === hash;
};

/**
 * Checks a password against an account: the custom (hashed) password if the
 * user has set one, otherwise the default for that account type.
 * `normalize` is applied to both sides for the default (NIP/NISN) case.
 */
export const checkAccountPassword = async (
  password: string,
  passwordHash: string | undefined | null,
  defaultPassword: string,
  normalize: (s: string) => string = (s) => s
): Promise<boolean> => {
  if (passwordHash) return verifyPassword(password, passwordHash);
  return normalize(password) === normalize(defaultPassword);
};

// The "(Nama)" strip mirrors how the login identifier field is pre-filled
// ("NIP (Nama)"); it only applies when comparing against a default NIP/NISN,
// never to a custom password (which may legitimately contain parentheses).
export const normalizeIdNumber = (s: string) => normalizeNip(s.replace(/\(.*\)/, ''));

export const checkTeacherPassword = (t: TeacherRecord, password: string) =>
  checkAccountPassword(password, t.passwordHash, teacherDefaultPassword(t), normalizeIdNumber);

export const checkParentPassword = (m: MuridRecord, password: string) =>
  checkAccountPassword(password, m.parentPasswordHash, m.nisn, (s) => s.match(/\d+/)?.[0] ?? s.trim());
