import { RombelRecord } from '../types';

// Indonesian-locale Excel uses ";" as the list separator, so templates use it too.
// The parser accepts both ";" and ",".
const TEMPLATE_DELIMITER = ';';

export const GURU_TEMPLATE_HEADERS = ['Nama', 'NIP', 'Rombel', 'Mata Pelajaran', 'Observer'];
export const MURID_TEMPLATE_HEADERS = [
  'Nama', 'NISN', 'NIS', 'L/P', 'Rombel', 'Tanggal Lahir', 'Alamat', 'Nama Orang Tua', 'No HP Orang Tua',
];

const escapeCell = (value: string) =>
  /[";,\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export const buildCsv = (headers: string[], rows: string[][]): string =>
  [headers, ...rows].map((row) => row.map(escapeCell).join(TEMPLATE_DELIMITER)).join('\r\n');

export const downloadCsv = (filename: string, content: string) => {
  // BOM so Excel opens the file as UTF-8.
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** Quote-aware CSV parser. Returns one object per data row, keyed by header. */
export const parseCsv = (text: string): Record<string, string>[] => {
  const clean = text.replace(/^﻿/, '');
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && clean[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ''));
  if (nonEmpty.length <= 1) return [];
  const headers = nonEmpty[0].map((h) => h.trim());
  return nonEmpty.slice(1).map((values) =>
    Object.fromEntries(headers.map((h, idx) => [h, (values[idx] ?? '').trim()]))
  );
};

/** Case-insensitive column lookup with aliases (older template headers). */
const pick = (row: Record<string, string>, ...names: string[]) => {
  const wanted = names.map((n) => n.toLowerCase());
  const key = Object.keys(row).find((k) => wanted.includes(k.toLowerCase()));
  return key ? row[key].trim() : '';
};

/** Accepts YYYY-MM-DD, DD/MM/YYYY or DD-MM-YYYY. Returns YYYY-MM-DD, '' when empty, null when invalid. */
export const normalizeDate = (value: string): string | null => {
  if (!value) return '';
  let y: number, m: number, d: number;
  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const local = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (iso) [y, m, d] = [+iso[1], +iso[2], +iso[3]];
  else if (local) [d, m, y] = [+local[1], +local[2], +local[3]];
  else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

export interface ImportError {
  line: number; // line number in the spreadsheet (header = 1)
  name: string;
  reason: string;
}

export interface MuridImportRow {
  name: string;
  nisn: string;
  nis: string;
  gender: 'L' | 'P';
  rombel: string;
  fase: RombelRecord['fase'];
  tanggalLahir: string;
  alamat: string;
  parentName: string;
  parentPhone: string;
}

export const validateMuridRows = (
  rows: Record<string, string>[],
  existingNisn: Set<string>,
  rombelList: RombelRecord[]
) => {
  const valid: MuridImportRow[] = [];
  const errors: ImportError[] = [];
  const seen = new Set<string>();

  rows.forEach((row, idx) => {
    const line = idx + 2;
    const name = pick(row, 'Nama');
    const nisn = pick(row, 'NISN');
    const rombelName = pick(row, 'Rombel', 'Kelas');
    const genderRaw = pick(row, 'L/P', 'Jenis Kelamin').toUpperCase();
    const tanggalLahir = normalizeDate(pick(row, 'Tanggal Lahir'));
    const rombel = rombelList.find((r) => r.name.toLowerCase() === rombelName.toLowerCase());
    const fail = (reason: string) => errors.push({ line, name: name || '(tanpa nama)', reason });

    if (!name) return fail('Nama kosong');
    if (!nisn) return fail('NISN kosong');
    if (!/^\d+$/.test(nisn)) return fail(`NISN "${nisn}" harus berupa angka`);
    if (existingNisn.has(nisn)) return fail(`NISN ${nisn} sudah terdaftar`);
    if (seen.has(nisn)) return fail(`NISN ${nisn} muncul dua kali di file`);
    if (!rombel) return fail(rombelName ? `Kelas "${rombelName}" belum ada di Manajemen Kelas` : 'Rombel kosong');
    if (genderRaw && !['L', 'P'].includes(genderRaw[0])) return fail(`L/P harus diisi L atau P`);
    if (tanggalLahir === null) return fail('Tanggal Lahir tidak valid (gunakan 2015-05-14 atau 14/05/2015)');

    seen.add(nisn);
    valid.push({
      name,
      nisn,
      nis: pick(row, 'NIS'),
      gender: genderRaw.startsWith('P') ? 'P' : 'L',
      rombel: rombel.name,
      fase: rombel.fase,
      tanggalLahir,
      alamat: pick(row, 'Alamat'),
      parentName: pick(row, 'Nama Orang Tua'),
      parentPhone: pick(row, 'No HP Orang Tua'),
    });
  });

  return { valid, errors };
};

export const normalizeNip = (nip: string) => nip.replace(/\s+/g, '');

export interface GuruImportRow {
  name: string;
  nip: string;
  rombel: string; // '' = belum ditugaskan sebagai wali kelas
  fase: RombelRecord['fase'];
  subject: string;
  isObserver: boolean;
}

export const validateGuruRows = (
  rows: Record<string, string>[],
  existingNip: Set<string>,
  rombelList: RombelRecord[]
) => {
  const valid: GuruImportRow[] = [];
  const errors: ImportError[] = [];
  const seen = new Set<string>();

  rows.forEach((row, idx) => {
    const line = idx + 2;
    const name = pick(row, 'Nama');
    const nip = normalizeNip(pick(row, 'NIP'));
    const rombelName = pick(row, 'Rombel', 'Wali Kelas');
    const observerRaw = pick(row, 'Observer', 'Is Observer').toUpperCase();
    const rombel = rombelList.find((r) => r.name.toLowerCase() === rombelName.toLowerCase());
    const fail = (reason: string) => errors.push({ line, name: name || '(tanpa nama)', reason });

    if (!name) return fail('Nama kosong');
    if (!nip) return fail('NIP kosong');
    if (existingNip.has(nip)) return fail(`NIP ${nip} sudah terdaftar`);
    if (seen.has(nip)) return fail(`NIP ${nip} muncul dua kali di file`);
    if (rombelName && !rombel) return fail(`Kelas "${rombelName}" belum ada di Manajemen Kelas`);

    seen.add(nip);
    valid.push({
      name,
      nip,
      rombel: rombel?.name ?? '',
      fase: rombel?.fase ?? 'fase-a',
      subject: pick(row, 'Mata Pelajaran') || 'Guru Kelas',
      isObserver: ['YA', 'Y', 'TRUE', '1'].includes(observerRaw),
    });
  });

  return { valid, errors };
};
