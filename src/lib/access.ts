import { MuridRecord, RombelRecord, TeacherRecord, UserRole } from '../types';

/** The class the logged-in guru is wali kelas of (set in Manajemen Kelas). */
export const getGuruClass = (rombelList: RombelRecord[], guruId?: string): string | undefined =>
  guruId ? rombelList.find((r) => r.waliKelasId === guruId)?.name : undefined;

/**
 * Students a role may view: Kepala Sekolah sees everyone, a guru sees only
 * the class they are wali kelas of, an orang tua sees only their own child.
 */
export const getVisibleMurid = (
  userRole: UserRole | string,
  muridList: MuridRecord[],
  rombelList: RombelRecord[],
  parentMuridId?: string,
  guruId?: string
): MuridRecord[] => {
  if (userRole === 'kepala_sekolah') return muridList;
  if (userRole === 'guru') {
    const guruClass = getGuruClass(rombelList, guruId);
    return guruClass ? muridList.filter((m) => m.rombel === guruClass) : [];
  }
  return muridList.filter((m) => m.id === parentMuridId);
};

export const getWaliKelasName = (
  rombelName: string,
  rombelList: RombelRecord[],
  teacherList: TeacherRecord[]
): string => {
  const waliId = rombelList.find((r) => r.name === rombelName)?.waliKelasId;
  return teacherList.find((t) => t.id === waliId)?.name ?? 'Belum ditentukan';
};
