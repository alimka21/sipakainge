# SIPAKAINGE — Architecture Notes

Read this before exploring the codebase again. It exists so Claude doesn't
re-derive the same structure via grep/agents every session. Update it
whenever you learn something new or change a pattern described here.

## Stack (do not change without explicit user request)
- Vite + React + TypeScript SPA. **No router library.**
- Tailwind CSS (utility classes only, no CSS modules).
- No charting library installed. Any charts must be hand-built inline SVG.
- `npm install` may need `--legacy-peer-deps` (vite 8 / esbuild peer conflict
  pre-existing in this repo, unrelated to app code).

## Routing pattern
- `src/types/index.ts` — `ScreenId` union is the full list of "routes".
- `src/App.tsx` — holds `currentScreen: ScreenId` state (via `useState`) and
  `handleNavigate(screen)` (sets state + scrolls to top). Every screen is
  rendered with `{currentScreen === 'xxx' && <XView ... />}` blocks.
- To add a new page: add an id to `ScreenId`, add a render block in
  `App.tsx`, add a button in `AppSidebar.tsx` calling
  `onNavigate('xxx')`.
- View components generally accept `onNavigate`, plus whichever lifted
  state/setters they need (e.g. `muridList` + `onUpdateMuridList`). Most
  accept these as **optional** props and fall back to local state/mock data
  if not provided (see `UserManagementView.tsx` pattern:
  `const muridList = initialMuridProp || localMuridList;`).

## Sidebar (`src/components/AppSidebar.tsx`)
- Single file, no config/data file — plain JSX per role, gated by
  `userRole === 'kepala_sekolah' | 'guru' | 'orang_tua'`.
- Each role's menu is grouped into `<div>` sections with a small uppercase
  label (`text-[10px] font-extrabold uppercase ... text-slate-400`) and a
  `space-y-1` list of buttons. Sections are separated with
  `pt-2 border-t border-slate-100`.
- Button style convention: active state `bg-[#00685f] text-white shadow-sm`,
  inactive `text-slate-600 hover:bg-slate-100`. Icons are Material Symbols
  (`<span className="material-symbols-outlined">icon_name</span>`).
- "Data Individu Murid" section (added by us) lives in both
  `kepala_sekolah` and `guru` blocks: Presensi Murid, Nilai Akademik Mapel,
  Karya & Portofolio Murid, Prestasi & Apresiasi Murid.

## Data model (`src/types/index.ts`, `src/data/mockData.ts`)
- No backend — everything is mock data (`INITIAL_MURID`, `INITIAL_TEACHERS`
  in `mockData.ts`) lifted into `App.tsx` state and passed down.
- `MuridRecord` — one student. `rombel: string` (e.g. `'Kelas IV-A'`) is a
  **free-text field, not a foreign key** — there is no separate class/rombel
  entity anywhere in the app as of this writing.
- `TeacherRecord` — one teacher, also has its own free-text `rombel` field.
  "Ibu Siti Aminah is wali kelas of Kelas IV-A" is only true by convention/
  matching strings + source comments — nothing enforces or centralizes it.
- `SupervisionSession` — one CURRENT session per teacher
  (`sessionStates: Record<teacherId, SupervisionSession>` in `App.tsx`).
  **There is no historical/multi-session array** — only the latest session
  is kept per teacher. Key scoring fields: `scores17`, `scores22` (main
  classroom-observation scores, set in `ObservationFormView.tsx`),
  `kesimpulanObs` (categorical verdict), `tindakLanjutKS`.
- `(murid as any).academics / .portfolios / .achievements / .attendance` —
  these are NOT in the `MuridRecord` type; the existing code (and our new
  attendance feature) just casts to `any` and stores ad hoc arrays/objects.
  Follow this existing convention for similar per-student ad hoc data unless
  a field is central enough to deserve a real type addition.

## Photos/avatars
- `APP_ASSETS` in `mockData.ts` holds all external image URLs
  (`lh3.googleusercontent.com`) plus one local `/school_logo.svg`.
- `SchoolLogo.tsx` is a pure inline SVG component (not a photo) — unrelated
  to the "remove photos" work.
- Principal photo appears in TWO separate hardcoded constants:
  `APP_ASSETS.principalPhoto` (landing page, `ParentDashboardView`) and
  `APP_ASSETS.principalAvatar` (header, `UserManagementView` thumbnails) —
  these should be unified behind one editable state if/when principal photo
  upload is implemented.
- Every other photo (teachers, students, decorative) is scattered across
  `AppHeader.tsx`, `ClassHabitsInputView.tsx`, `TeacherSelfSupervisionView.tsx`,
  `TeacherSupervisionDashboardView.tsx`, `SupervisionDashboardView.tsx`,
  `UserManagementView.tsx`, `ParentCalendarView.tsx`, `ParentPortfolioView.tsx`,
  `FollowUpPlanView.tsx` — all via `.avatar` field or an `APP_ASSETS.xxx`
  constant with an initials/emoji fallback already in most places.

## `ClassHabitsInputView.tsx` (7 KAIH input/monitoring)
- Central multi-purpose screen. Accepts `lockedTab?: WorkspaceTab` — when
  set, hides the internal tab switcher and opens directly on that tab
  (`habits | academics | portfolios | awards | attendance`). Used to power
  the separate sidebar menu items (each is this same component with a
  different `lockedTab`, routed via distinct `ScreenId`s:
  `class_habits_input` (habits only), `academic_input`, `portfolio_input`,
  `award_input`, `attendance_input`).
- "Langkah 1: Pilih Kelas & Murid" — reusable select-class-then-select-
  student pattern (dropdowns for `kepala_sekolah`, clickable card grid for
  `guru`, filtered to `currentTeacher.assignedClass`). This is the pattern
  to copy whenever a new "pick a student first" screen is needed.
- Section A (Wewenang Guru) = school-hours prayer toggles, saves instantly
  on click. Section B (Wewenang Orang Tua) = home habits, with a
  "Validasi Wali Kelas" button (`handleValidateHomeHabits`). As of the last
  audit, `isValidatedByGuru` was **dead state** — set but never used to gate
  or visually distinguish anything. (Check git log / this file's changelog
  section below for whether this has since been fixed.)

## `FollowUpPlanView.tsx` (Tindak Lanjut)
- Reached via `onNavigate('follow_up_plan')` from `SupervisionDashboardView`,
  `TeacherSupervisionDashboardView` (via `onOpenFollowUp`), and after
  finishing an observation (`ObservationFormView` → `App.tsx:452`), plus a
  `BeritaAcaraModal` confirm callback (`App.tsx:515`).
- Mostly static/hardcoded markup (growth timeline percentages, agreement
  cards) — does NOT read live `scores22`/`kesimpulanObs` data despite being
  conceptually "tindak lanjut" for a teacher's supervision result.
- `tindakLanjutKS` the FIELD (set in `ObservationFormView.tsx` step 7,
  displayed in `TeacherSelfSupervisionView.tsx`) is separate from this VIEW
  and should be kept even if the view is deleted — it's just a supervision
  status field, not exclusive to the follow-up-plan page.

## Supervision scoring data available for a "per-teacher report"
- `scores22` (classroom observation, 22 items) — set in
  `ObservationFormView.tsx`, read/averaged in
  `TeacherSupervisionDashboardView.tsx` (~line 64-77, `obsAvg` computation,
  falls back to hardcoded per-teacher numbers when no live session exists).
- `kesimpulanObs` — categorical verdict per session.
- Only ONE session per teacher is retained (no time series) — a "report"
  page can show the latest session's breakdown/chart, not a trend over
  time, unless we add a historical array (bigger change, ask before doing).

## Class list (rombel) — single source
- `rombelList` state in `App.tsx` is the only class list. Every class dropdown
  (`UserManagementView` teacher+murid forms, `ClassHabitsInputView`,
  `ParentCalendarView`, `ParentPortfolioView`, `StudentProgressDashboardView`)
  takes it as a `rombelList` prop (default `INITIAL_ROMBEL`). Never hardcode
  `<option value="Kelas I-B">` lists again — new classes from Manajemen Kelas
  wouldn't show up.
- Fase for a class comes from the rombel record (`faseOfRombel` in
  UserManagementView), not from string-matching the class name.
- `ClassManagementView`: rename moves students (`onUpdateMuridList`, since
  murid.rombel is the class *name*); delete is blocked while the class has
  students; duplicate names rejected. Mirrors the DB rules
  (`murid_rombel_fkey` ON UPDATE CASCADE / ON DELETE RESTRICT, unique name).
- The demo guru account is always `t-1` (Ibu Siti Aminah). Her class is
  `rombelList.find(r => r.waliKelasId === 't-1')?.name`, so reassigning her in
  Manajemen Kelas changes what the guru sees. Sidebar labels in
  `AppSidebar.tsx` still say "Kelas IV-A" statically.

## Who can see which students — `src/lib/access.ts`
- `getVisibleMurid(role, muridList, rombelList, parentMuridId)` is the ONE rule:
  kepala_sekolah = all students; guru = only the class where
  `waliKelasId === 't-1'` (`getGuruClass`); orang_tua = only `parentMuridId`.
- Used by `ParentDashboardView` (Buku Pantau), `ParentCalendarView`,
  `ParentPortfolioView`. `ClassHabitsInputView` (and the 4 Data Individu
  screens) use `getGuruClass` and never fall back to a student outside the
  guru's class. Any new student-picking screen must go through this helper.
- Before 2026-09-28, Buku Pantau showed guru every student in the school, and
  the calendar read static `INITIAL_MURID` instead of live `muridList`.

## Supabase
- `supabase-schema.sql` (repo root) is the single source of truth for the DB
  schema. `UserManagementView.tsx`'s "Salin Script SQL" button imports it via
  `import ... from '../../supabase-schema.sql?raw'` — never paste a copy of
  the SQL into a component again.
- The script is idempotent and upgrades DBs that ran the pre-2026-09-28 schema
  (`ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`, constraints added in a
  `DO` block after seeding). Seeds use `ON CONFLICT DO NOTHING`. Tested with
  PGlite against fresh DB, legacy DB, and legacy DB + the optional cleanup.
- Tables: school_settings (1 row, principal photo), teachers, rombel (unique
  wali_kelas_id), murid (unique nisn, FK rombel→rombel.name ON UPDATE CASCADE
  ON DELETE RESTRICT), daily_habits (+ divalidasi columns), presensi,
  nilai_akademik, portofolio, prestasi, supervision_sessions (unique
  teacher_id+semester). Views: v_rekap_nilai_akademik, v_rekap_presensi,
  v_laporan_supervisi (security_invoker). Storage bucket rpp_bucket.
- Columns are snake_case; TS types are camelCase. Nothing maps between them
  yet — `getTeachersData`/`getMuridData` cast `select('*')` straight to the TS
  types, which would be wrong. Needs a mapper when the app is wired to the DB.
- **The app does not read/write these tables yet.** Only `testSupabaseConnection`
  (reads `teachers.id`) and `uploadRPPDocument` (storage) are called.
  `recordDailyHabit`, `getTeachersData`, `getMuridData` exist but have no
  callers. All screens still run on mock data from `mockData.ts`/`App.tsx`.
- RLS policy `sipakainge_dev_akses_penuh` gives anon full read/write on every
  table because the app has no Supabase Auth. Development only — murid holds
  children's NISN, birth date, address, parent phone.

## Working notes / decisions log
- 2026-09-28 (session 1): Added standalone sidebar menus (Presensi, Nilai
  Akademik, Karya & Portofolio, Prestasi) reusing `ClassHabitsInputView`
  with `lockedTab`, instead of duplicating the component 4x. Fixed
  portfolio badge box (`ParentPortfolioView.tsx`) from fixed `w-10` to
  `min-w-10 px-2` so "94.6%"/"100%" don't overflow.
- 2026-09-28 (session 2), five changes in one pass:
  1. **7 KAIH validation is now real, not dead state.** `isValidatedByGuru`
     (was a component-local boolean, always `true`, never read) replaced
     with `(murid as any).homeHabitsValidated: boolean` persisted on the
     student record via the same updater pattern as academics/portfolios.
     `handleValidateHomeHabits` in `ClassHabitsInputView.tsx` now toggles it
     and Section B's whole card changes color (amber = "Menunggu Validasi",
     emerald = "Tervalidasi & Tersimpan") with an explanatory banner when
     unvalidated. This does NOT block editing — it's a visibility signal,
     not a hard gate.
  2. **Class management is new** (`RombelRecord` type in `types/index.ts`,
     `INITIAL_ROMBEL` in `mockData.ts`, `ClassManagementView.tsx`, route
     `class_management`). Before this, "class" was just a free-text string
     with no entity — see the data-model section above, now outdated on
     that specific point. `App.tsx` already had a dead `teachersList` state
     (declared, never passed anywhere) — it's now actually wired, passed to
     `ClassManagementView` for the wali-kelas dropdown.
  3. **Photos removed except the principal's.** `APP_ASSETS` in
     `mockData.ts` now only has `logo` and `principalPhoto` — every other
     stock photo constant (`sitiAminahAvatar`, `studentAhmad`,
     `motherAvatar`, `artPosterWater`, etc.) was deleted along with all
     their usages, replaced by the initials/emoji fallback branches most
     components already had (`teacher.avatar ? <img> : <initials>`). Where
     no fallback branch existed, one was added. The principal's photo is
     now a single piece of lifted state, `principalPhoto` in `App.tsx`,
     defaulting to `APP_ASSETS.principalPhoto`, threaded as
     `principalPhotoUrl` prop into `AppHeader`, `LandingPageView`,
     `ParentDashboardView`, and `UserManagementView`. Only
     `userRole === 'kepala_sekolah'` sees an upload form for it (new
     "Profil & Foto Kepala Sekolah" tab in `UserManagementView.tsx`, reads
     a local file via `FileReader` → data URL → `onUpdatePrincipalPhoto`).
     Changing it updates the header avatar AND the landing page hero photo
     immediately since both read the same state.
  4. **`FollowUpPlanView.tsx` is deleted.** The `follow_up_plan` ScreenId
     was renamed to `teacher_report`, all `onNavigate('follow_up_plan')`
     call sites repointed (in `App.tsx`, `SupervisionDashboardView.tsx`,
     the `BeritaAcaraModal` confirm handler), and cosmetic "Rencana Tindak
     Lanjut (RTL)" labels in `TeacherSupervisionDashboardView.tsx` and
     `LandingPageView.tsx` renamed to "Laporan Hasil Supervisi" for
     consistency. The `tindakLanjutKS` FIELD and the step-7 UI that sets it
     in `ObservationFormView.tsx` were deliberately KEPT — only the
     dedicated follow-up-plan page was removed, not the underlying
     supervision-status field, per the architecture note above.
  5. **New report page**: `TeacherSupervisionReportView.tsx`, at route
     `teacher_report`. Picks a teacher, reads that teacher's single
     `sessionStates[teacherId]` entry (still only one session per teacher —
     no history/trend view yet, see caveat above), and shows: a donut chart
     (hand-rolled inline SVG, `stroke-dasharray`/`stroke-dashoffset`, no
     library) for the overall `scores22` average, a per-aspect bar chart
     (also inline SVG) for all `scores22` entries, a small progress bar for
     `scores17`, and text cards for `apresiasiObs`/`temuanObs`/
     `komitmenGuruNew`/`tindakLanjutKS`. No charting library was added —
     stack must stay unchanged, so charts are plain SVG.
  - Verification: `npm install --legacy-peer-deps` (pre-existing vite/esbuild
    peer conflict, unrelated to app code) + `npx tsc --noEmit` (clean) +
    `npm run build` (clean) after every batch of edits. `package-lock.json`
    and `dist/` were deleted afterward since they aren't meant to be
    committed here (weren't in the repo before).
- 2026-09-28 (session 3), five smaller cleanups:
  1. `MuridRecord` gained `tanggalLahir?: string` and `alamat?: string`
     (`types/index.ts`). Captured in the add/edit murid form in
     `UserManagementView.tsx` (`muridForm` state + the two new inputs after
     the parent-contact field), shown as extra subtext under NISN/NIS in
     the murid table row, and shown in the student identity card in
     `ClassHabitsInputView.tsx` ("Langkah 2: Identitas Murid Terpilih").
     Both fields are optional and only render when present — no other
     screen was touched.
  2. Replaced every emoji avatar fallback (👦/👧/👩) with a real
     `material-symbols-outlined` icon (`boy`/`girl`/`woman`, FILL variant)
     on a `bg-gradient-to-br from-teal-500 to-emerald-600` circle — spans
     `AppHeader.tsx`, `ParentDashboardView.tsx`, `ParentCalendarView.tsx`,
     `ParentPortfolioView.tsx`, `ClassHabitsInputView.tsx`,
     `UserManagementView.tsx`. Teacher initials-in-a-circle avatars
     (`teacher.initials`, e.g. "SA") were deliberately left as-is across
     all files that use them — that's already a legitimate, informative
     avatar pattern, not the thing the emoji complaint was about.
  3. Removed the redundant "Akses Kepala Sekolah / Guru & Observer / Orang
     Tua & Murid" pill (with `shield_person` icon) from `AppHeader.tsx` —
     the same role info is already shown in the sidebar's "Hak Akses" pill
     (`AppSidebar.tsx`), so this was pure duplication in every page header.
  4. Removed the non-functional "Filter Periode / Rombel" button from
     `SupervisionDashboardView.tsx` (Ruang Supervisi KS) — it only ever
     fired a toast, no real filtering logic existed behind it.
  5. Removed the "Bagaimana Orang Tua Memverifikasi? ... Buka Kalender
     Pembiasaan" promo block from `LandingPageView.tsx`'s habits section.
- 2026-09-28 (session 4), three more fixes:
  1. Removed the "Unduh Buku Panduan Supervisi (PDF)" button on the landing
     page CTA section (`LandingPageView.tsx`) — it just navigated to
     `supervision_dashboard`, mislabeled as a PDF download, no real file.
  2. Fixed the "Model Percontohan / Dinas Pendidikan Kota Makassar" badge
     on the landing page overlapping the quote box text below it. It used
     to be `absolute -bottom-4 -left-4` (decorative overlap by design) but
     overlapped real content at that corner. Changed to a normal
     `mt-4` flow element instead of `absolute` positioning — simplest fix
     that fully eliminates any overlap risk rather than tuning offsets.
  3. **Parent (orang_tua) accounts are now locked to exactly one student.**
     Previously `ParentDashboardView.tsx` showed a dropdown of the ENTIRE
     `muridList` to every role including orang_tua (a real bug — a parent
     could browse any student's data). `ParentCalendarView.tsx` and
     `ParentPortfolioView.tsx` already hid the selector for non-KS/guru
     roles and hardcoded `'m-4a-1'` — that hardcoding is now replaced by a
     real `parentMuridId` prop threaded from `App.tsx`.
     - `LoginPortalView.tsx`: the identifier field is now labeled "NISN
       Ananda" when the `orang_tua` role tab is selected, and `onLogin` now
       passes `(role, identifier)` instead of just `(role)`.
     - `App.tsx`: new `parentMuridId` state (default `'m-4a-1'`). On login
       as `orang_tua`, it regexes the first number out of the identifier,
       looks it up against `muridList` by `nisn`, and sets `parentMuridId`
       to the matching student's id (falls back to `'m-4a-1'` if no match
       — this is a mock app with no real auth/backend, so there's no
       "invalid NISN" error state, just a graceful fallback). This prop is
       passed to `ParentDashboardView`, `ParentCalendarView`, and
       `ParentPortfolioView`.
     - `ParentDashboardView.tsx`: the "Langkah 1: Pilih Peserta Didik"
       section (with the all-students dropdown) is now wrapped in
       `{!isOrangTua && (...)}` — orang_tua never sees it, and
       `selectedMuridId` initializes straight from `parentMuridId` instead
       of empty string. Kepala Sekolah / Guru behavior is unchanged (still
       browse/pick any student — that wasn't part of this request).
     - Caveat: guru's dropdown across all three parent-facing views still
       is not filtered to their own assigned class (pre-existing gap, not
       part of this request — only the orang_tua constraint was asked
       for).
