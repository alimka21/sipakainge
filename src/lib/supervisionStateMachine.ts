import { SupervisionSession, SupervisionStatus } from '../types';

/**
 * Every transition the app actually performs today, from a full audit
 * (2026-09-28) of every writer of `SupervisionSession.status` across
 * `ObservationFormView.tsx` (the KS-run "official" flow) and
 * `TeacherSelfSupervisionView.tsx` (the guru-facing/simulator flow — the two
 * views model the same enum with slightly different paths: the official flow
 * uses TERJADWAL where the simulator uses DISETUJUI for "schedule approved").
 * This table is a codification of existing behavior, not a redesign — every
 * edge below is exercised by some real button in the app; nothing here
 * should reject a transition either file already performs.
 */
export const SUPERVISION_TRANSITIONS: Record<SupervisionStatus, SupervisionStatus[]> = {
  DRAFT: ['DIAJUKAN'],
  DIAJUKAN: ['DRAFT', 'TERJADWAL', 'DISETUJUI'],
  DISETUJUI: ['DOKUMEN_DIUPLOAD'],
  TERJADWAL: ['DOKUMEN_DIUPLOAD'],
  DOKUMEN_DIUPLOAD: ['PERANGKAT_DINILAI'],
  PERANGKAT_DINILAI: ['OBSERVASI_DILAKUKAN'],
  OBSERVASI_DILAKUKAN: ['HASIL_SUPERVISI_TERSEDIA', 'REFLEKSI_GURU'],
  HASIL_SUPERVISI_TERSEDIA: ['REFLEKSI_GURU'],
  REFLEKSI_GURU: ['PENGUATAN_KEPALA_SEKOLAH', 'SELESAI'],
  PENGUATAN_KEPALA_SEKOLAH: ['TINDAK_LANJUT', 'SELESAI'],
  TINDAK_LANJUT: ['SELESAI'],
  SELESAI: [],
};

/**
 * `HASIL_SUPERVISI_TERSEDIA`, `PENGUATAN_KEPALA_SEKOLAH`, `TINDAK_LANJUT`
 * exist in the `SupervisionStatus` type and in read-side guard lists, but no
 * writer anywhere ever assigns them — they're currently unreachable. Kept in
 * the table (rather than deleted) so a future feature can start writing them
 * without needing to touch this file.
 */

export function canTransition(from: SupervisionStatus, to: SupervisionStatus): boolean {
  // Re-saving fields on the current stage (e.g. re-uploading a corrected RPP
  // before it's been reviewed) is always allowed — it isn't "progress", so it
  // isn't a transition the table needs to know about.
  if (from === to) return true;
  return SUPERVISION_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Toast-ready explanation for why a transition was blocked. */
export function describeBlockedTransition(from: SupervisionStatus, to: SupervisionStatus): string {
  return `Tidak bisa memindahkan status supervisi dari "${from}" ke "${to}" — tahap sebelumnya belum dilewati.`;
}

/**
 * Coarse stage bucket for dashboards that summarize a raw 12-value status
 * into a handful of badge colors. `SupervisionDashboardView.tsx` and
 * `TeacherSupervisionDashboardView.tsx` each currently hand-roll their own
 * version of this mapping (~12 separate copies between them, some comparing
 * against string literals that were never in the `SupervisionStatus` type to
 * begin with — see CLAUDE.md). New code should read from here; migrating the
 * existing call sites is a follow-up, not done in this pass.
 */
export type SupervisionStage = 'belum_mulai' | 'diajukan' | 'dijadwalkan' | 'diobservasi' | 'refleksi' | 'tuntas';

/**
 * Data-completeness gate for entering the Refleksi (self-reflection) stage.
 * Before this (2026-09-28), the 8-stage stepper in `ObservationFormView.tsx`
 * let anyone click straight to the Refleksi tab regardless of whether
 * Penilaian/Telaah Administrasi/Observasi had any real data — `canTransition`
 * above only checks the `status` enum, never the score fields themselves, and
 * the stepper's tab-click handler didn't call it at all. These three checks
 * are the field-completeness half of that gate: all 17 "Kelengkapan
 * Perangkat" items scored (`scores17`), all 14 "Telaah Mendalam" items
 * assessed (`aspectStatus14`), and all 22 classroom-observation indicators
 * scored (`scores22`) — counts match `DOKUMEN_KELENGKAPAN_ITEMS`,
 * `TELAAH_MENDALAM_ITEMS`, `OBSERVASI_MENDALAM_ITEMS` in
 * `ObservationFormView.tsx` (17/14/22 are baked into the field names
 * `scores17`/`aspectStatus14`/`scores22` themselves, not redefined here).
 */
export function isPenilaianComplete(session: SupervisionSession): boolean {
  return Object.keys(session.scores17 ?? {}).length >= 17;
}

export function isTelaahAdministrasiComplete(session: SupervisionSession): boolean {
  return Object.keys(session.aspectStatus14 ?? {}).length >= 14;
}

export function isObservasiComplete(session: SupervisionSession): boolean {
  return Object.keys(session.scores22 ?? {}).length >= 22;
}

/** All three prerequisite stages must be fully scored before Refleksi opens. */
export function canStartReflection(session: SupervisionSession): boolean {
  return isPenilaianComplete(session) && isTelaahAdministrasiComplete(session) && isObservasiComplete(session);
}

/** Toast/inline message listing which of the three prerequisite stages are still missing. */
export function describeMissingReflectionPrereqs(session: SupervisionSession): string {
  const missing: string[] = [];
  if (!isPenilaianComplete(session)) missing.push('Penilaian (Kelengkapan Perangkat)');
  if (!isTelaahAdministrasiComplete(session)) missing.push('Telaah Administrasi (Telaah Mendalam)');
  if (!isObservasiComplete(session)) missing.push('Observasi Kelas');
  return `Lengkapi dulu: ${missing.join(', ')} — sebelum bisa mengisi Refleksi.`;
}

export const STATUS_STAGE: Record<SupervisionStatus, SupervisionStage> = {
  DRAFT: 'belum_mulai',
  DIAJUKAN: 'diajukan',
  DISETUJUI: 'dijadwalkan',
  TERJADWAL: 'dijadwalkan',
  DOKUMEN_DIUPLOAD: 'dijadwalkan',
  PERANGKAT_DINILAI: 'dijadwalkan',
  OBSERVASI_DILAKUKAN: 'diobservasi',
  HASIL_SUPERVISI_TERSEDIA: 'diobservasi',
  REFLEKSI_GURU: 'refleksi',
  PENGUATAN_KEPALA_SEKOLAH: 'refleksi',
  TINDAK_LANJUT: 'refleksi',
  SELESAI: 'tuntas',
};
