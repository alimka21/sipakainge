import { MuridRecord, RombelRecord, UserRole } from '../types';

// The demo guru account is always Ibu Siti Aminah (t-1).
export const DEMO_GURU_ID = 't-1';

export const getGuruClass = (rombelList: RombelRecord[]): string | undefined =>
  rombelList.find((r) => r.waliKelasId === DEMO_GURU_ID)?.name;

/**
 * Students a role may view: Kepala Sekolah sees everyone, a guru sees only
 * the class they are wali kelas of, an orang tua sees only their own child.
 */
export const getVisibleMurid = (
  userRole: UserRole | string,
  muridList: MuridRecord[],
  rombelList: RombelRecord[],
  parentMuridId?: string
): MuridRecord[] => {
  if (userRole === 'kepala_sekolah') return muridList;
  if (userRole === 'guru') {
    const guruClass = getGuruClass(rombelList);
    return guruClass ? muridList.filter((m) => m.rombel === guruClass) : [];
  }
  return muridList.filter((m) => m.id === parentMuridId);
};
