import { HABIT_LIST } from '../data/mockData';

/** Kepatuhan satu kebiasaan: berapa hari dicentang dari hari yang punya jurnal. */
export interface HabitStat {
  done: number;
  days: number;
  /** 0–100, atau null bila belum ada satu hari pun yang tercatat. */
  pct: number | null;
}

/**
 * Hitung kepatuhan 7 KAIH dari jurnal harian murid (`daily_habits` /
 * `murid.habits` hari ini). Hari dihitung hanya bila jurnalnya diisi
 * (minimal satu kebiasaan dicentang) — hari tanpa isian tidak dianggap 0%,
 * karena itu berarti belum diisi, bukan tidak dilakukan.
 */
export function computeHabitStats(entries: Array<{ habits?: Record<number, boolean> } | undefined>) {
  const filled = entries.filter((e) => e && Object.values(e.habits || {}).some(Boolean));
  const days = filled.length;
  const perHabit: Record<number, HabitStat> = {};
  HABIT_LIST.forEach((h) => {
    const done = filled.filter((e) => e!.habits?.[h.id]).length;
    perHabit[h.id] = { done, days, pct: days ? Math.round((done / days) * 100) : null };
  });
  const overall = days
    ? Math.round(HABIT_LIST.reduce((sum, h) => sum + (perHabit[h.id].pct ?? 0), 0) / HABIT_LIST.length)
    : null;
  return { perHabit, days, overall };
}

export const habitStatusLabel = (pct: number | null): string =>
  pct === null ? 'Belum Ada Data' : pct >= 90 ? 'Sangat Konsisten' : pct >= 75 ? 'Konsisten' : pct >= 50 ? 'Perlu Didorong' : 'Pendampingan';
