// Indonesia Tengah (WITA) is UTC+8 — Asia/Makassar. Always format explicitly
// with this time zone instead of the browser/server's local zone, since a
// deployed app's server clock is rarely WITA.
const WITA_TIME_ZONE = 'Asia/Makassar';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: WITA_TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: WITA_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** e.g. "Kamis, 25 September 2026" */
export const formatWitaDate = (date: Date = new Date()): string => dateFormatter.format(date);

/** e.g. "14:35 WITA" (colon-separated, matching the rest of the app's convention) */
export const formatWitaTime = (date: Date = new Date()): string => `${timeFormatter.format(date)} WITA`;

/** e.g. "Kamis, 25 September 2026 • 14:35 WITA" */
export const formatWitaDateTime = (date: Date = new Date()): string =>
  `${formatWitaDate(date)} • ${formatWitaTime(date)}`;

/** ISO date (YYYY-MM-DD) as observed in WITA — for grouping/lookup keys like presensi/daily_habits. */
export const witaDateKey = (date: Date = new Date()): string => {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: WITA_TIME_ZONE }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};
