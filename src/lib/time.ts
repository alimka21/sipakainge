import { useEffect, useState } from 'react';

// Indonesia Tengah (WITA) is UTC+8 — Asia/Makassar. Always format explicitly
// with this time zone instead of the browser/server's local zone, since a
// deployed app's server clock is rarely WITA.
const WITA_TIME_ZONE = 'Asia/Makassar';

// ---------------------------------------------------------------------------
// Server-time sync. The device clock (laptop/HP) can be wrong; the hosting
// server's (Vercel) clock is NTP-synced. `syncServerTime()` reads the HTTP
// `Date` header of a same-origin request (cross-origin `Date` isn't readable
// under CORS) and stores the offset; every formatter below goes through
// `now()`, which applies it. Until the first sync lands, `now()` = device time.
// ---------------------------------------------------------------------------
let serverOffsetMs = 0;
let timeSource: 'server' | 'perangkat' = 'perangkat';
const listeners = new Set<() => void>();

export const now = (): Date => new Date(Date.now() + serverOffsetMs);
export const getTimeSource = () => timeSource;

export async function syncServerTime(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return false;
  try {
    const t0 = Date.now();
    const res = await fetch(`${window.location.origin}/?_t=${t0}`, { method: 'HEAD', cache: 'no-store' });
    const t1 = Date.now();
    const header = res.headers.get('date');
    if (!header) return false;
    const serverMs = Date.parse(header);
    if (Number.isNaN(serverMs)) return false;
    // `Date` has 1-second resolution; assume it was stamped mid-round-trip.
    // Don't add the `Age` header: Vercel's edge stamps `Date` with the current
    // time even on a cache HIT (verified 2026-10-01 — Date matched real UTC
    // while Age was ~20000s), so adding Age would push the clock hours ahead.
    serverOffsetMs = serverMs + 500 - (t0 + t1) / 2;
    timeSource = 'server';
    listeners.forEach((fn) => fn());
    return true;
  } catch {
    return false;
  }
}

/** Re-renders the caller every `intervalMs` and right after a server-time sync. Returns the current corrected time. */
export function useNow(intervalMs = 30000): Date {
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    listeners.add(bump);
    const id = setInterval(bump, intervalMs);
    return () => {
      listeners.delete(bump);
      clearInterval(id);
    };
  }, [intervalMs]);
  return now();
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: WITA_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: WITA_TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: WITA_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** e.g. "Kamis, 1 Oktober 2026" */
export const formatWitaDate = (date: Date = now()): string => dateFormatter.format(date);

/** e.g. "1 Okt 2026" */
export const formatWitaShortDate = (date: Date = now()): string => shortDateFormatter.format(date);

/** e.g. "14:35 WITA" (colon-separated, matching the rest of the app's convention) */
export const formatWitaTime = (date: Date = now()): string => `${timeFormatter.format(date)} WITA`;

/** e.g. "Kamis, 1 Oktober 2026 • 14:35 WITA" */
export const formatWitaDateTime = (date: Date = now()): string =>
  `${formatWitaDate(date)} • ${formatWitaTime(date)}`;

/** Calendar parts as observed in WITA (month is 1-12, weekday 0=Minggu..6=Sabtu). */
export const witaParts = (date: Date = now()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: WITA_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: weekdays.indexOf(get('weekday')),
  };
};

/** ISO date (YYYY-MM-DD) as observed in WITA — for grouping/lookup keys like presensi/daily_habits. */
export const witaDateKey = (date: Date = now()): string => {
  const { year, month, day } = witaParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/** e.g. "Oktober 2026" */
export const formatWitaMonthYear = (date: Date = now()): string => {
  const { year, month } = witaParts(date);
  return `${BULAN[month - 1]} ${year}`;
};

/** Every day of the current WITA month, with the weekday each falls on. */
export const witaMonthDays = (date: Date = now()) => {
  const { year, month, day: today } = witaParts(date);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Day-of-week of the 1st, as a calendar date (time zone irrelevant here).
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return {
    year,
    month,
    today,
    daysInMonth,
    /** Leading blank cells for a Monday-first grid. */
    leadingBlanks: (firstWeekday + 6) % 7,
    labelFor: (d: number) => {
      const wd = (firstWeekday + d - 1) % 7;
      return `${HARI[wd]}, ${d} ${BULAN_PENDEK[month - 1]} ${year}`;
    },
  };
};

/**
 * Indonesian school year starts in July: Juli–Desember = Semester Ganjil of
 * TA <year>/<year+1>; Januari–Juni = Semester Genap of TA <year-1>/<year>.
 */
export const getAcademicPeriod = (date: Date = now()) => {
  const { year, month } = witaParts(date);
  const startYear = month >= 7 ? year : year - 1;
  const semester: 'Ganjil' | 'Genap' = month >= 7 ? 'Ganjil' : 'Genap';
  const tahunAjaran = `${startYear}/${startYear + 1}`;
  return { semester, tahunAjaran, startYear, label: `Semester ${semester} ${tahunAjaran}` };
};

/** The current semester plus the `count - 1` semesters before it, newest first. */
export const recentSemesters = (count = 3, date: Date = now()): string[] => {
  const { semester, startYear } = getAcademicPeriod(date);
  const out: string[] = [];
  let s = semester;
  let y = startYear;
  for (let i = 0; i < count; i++) {
    out.push(`Semester ${s} ${y}/${y + 1}`);
    if (s === 'Genap') s = 'Ganjil';
    else {
      s = 'Genap';
      y -= 1;
    }
  }
  return out;
};
