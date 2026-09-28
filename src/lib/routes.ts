import { ScreenId, UserRole } from '../types';

/**
 * Central route table. This is the single source of truth for "who can be
 * on which screen" — before this module existed, access control was 100%
 * implicit: `AppSidebar.tsx` simply didn't render a button for a role, but
 * nothing stopped that screen from rendering if `currentScreen` reached it
 * any other way (a stray `onNavigate` call, a copy-pasted button, a future
 * screen added without a sidebar entry). `resolveNavigation` below is the
 * one place that decides whether a navigation attempt is honored.
 */

export interface NavContext {
  isLoggedIn: boolean;
  userRole: UserRole;
  /** Guru is assigned as wali kelas of some class (Manajemen Kelas). */
  hasGuruClass: boolean;
  /** orang_tua's `parentMuridId` resolves to a real student. */
  hasParentChild: boolean;
}

type Role = UserRole | 'public';

interface RouteDef {
  /** 'any' = reachable whether logged in or not, and by every role. */
  allowedRoles: Role[] | 'any';
  /** Extra check beyond role (e.g. "guru must have a class"). */
  guard?: (ctx: NavContext) => boolean;
  guardMessage?: string;
}

/** Where a role lands after login, and where a blocked navigation falls back to. */
export const ROLE_HOME: Record<UserRole, ScreenId> = {
  kepala_sekolah: 'supervision_dashboard',
  guru: 'class_habits_input',
  orang_tua: 'parent_dashboard',
};

export const PUBLIC_HOME: ScreenId = 'landing';

const requiresGuruClass: Pick<RouteDef, 'guard' | 'guardMessage'> = {
  guard: (ctx) => ctx.userRole !== 'guru' || ctx.hasGuruClass,
  guardMessage: 'Anda belum ditugaskan sebagai wali kelas. Hubungi Kepala Sekolah di Manajemen Kelas.',
};

const requiresParentChild: Pick<RouteDef, 'guard' | 'guardMessage'> = {
  guard: (ctx) => ctx.userRole !== 'orang_tua' || ctx.hasParentChild,
  guardMessage: 'Akun ini belum terhubung ke data siswa. Hubungi admin sekolah.',
};

export const ROUTES: Record<ScreenId, RouteDef> = {
  // Public — reachable with or without a session, before or after login.
  landing: { allowedRoles: 'any' },
  login: { allowedRoles: 'any' },
  student_dashboard: { allowedRoles: 'any' }, // public demo/marketing view
  teacher_dashboard: { allowedRoles: 'any' }, // public demo/marketing view

  // Kepala Sekolah only
  supervision_dashboard: { allowedRoles: ['kepala_sekolah'] },
  user_management: { allowedRoles: ['kepala_sekolah'] },
  class_management: { allowedRoles: ['kepala_sekolah'] },

  // Kepala Sekolah + Guru (shared supervision workflow)
  observation_form: { allowedRoles: ['kepala_sekolah', 'guru'] },
  teacher_report: { allowedRoles: ['kepala_sekolah', 'guru'] },

  // Guru only
  teacher_my_supervision: { allowedRoles: ['guru'] },

  // Kepala Sekolah + Guru — data-entry screens scoped to a class; a guru
  // with no class assigned yet has nothing to enter data for.
  class_habits_input: { allowedRoles: ['kepala_sekolah', 'guru'], ...requiresGuruClass },
  academic_input: { allowedRoles: ['kepala_sekolah', 'guru'], ...requiresGuruClass },
  portfolio_input: { allowedRoles: ['kepala_sekolah', 'guru'], ...requiresGuruClass },
  award_input: { allowedRoles: ['kepala_sekolah', 'guru'], ...requiresGuruClass },
  attendance_input: { allowedRoles: ['kepala_sekolah', 'guru'], ...requiresGuruClass },

  // All three roles — Kepala Sekolah/Guru monitor any student, orang tua
  // only ever sees their own child (enforced separately by getVisibleMurid,
  // this guard only blocks an orang_tua account with no linked child at all).
  parent_dashboard: { allowedRoles: ['kepala_sekolah', 'guru', 'orang_tua'], ...requiresParentChild },
  parent_calendar: { allowedRoles: ['kepala_sekolah', 'guru', 'orang_tua'], ...requiresParentChild },
  parent_portfolio: { allowedRoles: ['kepala_sekolah', 'guru', 'orang_tua'], ...requiresParentChild },
};

export interface NavResult {
  screen: ScreenId;
  /** Present when the requested screen was denied and `screen` is the fallback instead. */
  blockedMessage?: string;
}

/**
 * Decide whether a navigation attempt to `target` is allowed for `ctx`. Not
 * allowed -> redirected to the role's home (or the public landing page if
 * not logged in), with a human-readable reason for a toast.
 */
export function resolveNavigation(target: ScreenId, ctx: NavContext): NavResult {
  const route = ROUTES[target];
  if (!route) return { screen: target }; // unknown id — TS prevents this in practice

  const role: Role = ctx.isLoggedIn ? ctx.userRole : 'public';
  const roleAllowed = route.allowedRoles === 'any' || route.allowedRoles.includes(role);
  const fallback = ctx.isLoggedIn ? ROLE_HOME[ctx.userRole] : PUBLIC_HOME;

  if (!roleAllowed) {
    return { screen: fallback, blockedMessage: 'Anda tidak memiliki akses ke halaman tersebut.' };
  }
  if (route.guard && !route.guard(ctx)) {
    return { screen: fallback, blockedMessage: route.guardMessage ?? 'Anda belum bisa mengakses halaman ini.' };
  }
  return { screen: target };
}
