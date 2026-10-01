import React, { useState } from 'react';
import { MuridRecord, SupervisionSession, TeacherRecord } from '../types';
import { HABIT_LIST } from '../data/mockData';
import { getAcademicPeriod } from '../lib/time';

interface BeritaAcaraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  teacher?: TeacherRecord;
  session?: SupervisionSession;
}

export const BeritaAcaraModal: React.FC<BeritaAcaraModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  teacher,
  session,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Berita Acara Observasi Pembelajaran
              </h3>
              <p className="text-xs text-slate-500">
                Siklus Terpadu Supervisi Akademik SIPAKAINGE {getAcademicPeriod().tahunAjaran}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Document Mock */}
        <div className="max-h-[70vh] overflow-y-auto p-6 text-xs text-slate-700 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="font-semibold text-slate-500">Satuan Pendidikan:</span>
              <span className="font-bold text-slate-900">UPT SPF SDN Percontohan PAM Makassar</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="font-semibold text-slate-500">Guru yang Diobservasi:</span>
              <span className="font-bold text-slate-900">{teacher ? `${teacher.name} (NIP. ${teacher.nip})` : '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="font-semibold text-slate-500">Mata Pelajaran & Kelas:</span>
              <span className="font-bold text-slate-900">{session?.mapel || teacher?.subject || '-'} — {session?.kelas || teacher?.rombel || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200/70 pb-2">
              <span className="font-semibold text-slate-500">Pengamat / Supervisor:</span>
              <span className="font-bold text-teal-800">Fahmawati, S.Pd. (Kepala Sekolah • NIP. 197305111995012002)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Waktu Pelaksanaan:</span>
              <span className="font-bold text-slate-900">
                {session?.tanggal || '-'}{session?.jam ? ` • ${session.jam}` : ''}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">Ringkasan Hasil Skor Rubrik Klinis:</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-xl bg-teal-50 p-2.5">
                <span className="text-teal-700 font-semibold block">Keteraturan Suasana Kelas:</span>
                <span className="text-sm font-bold text-teal-900">3.8 / 4.0 (Praktik Sangat Efektif)</span>
              </div>
              <div className="rounded-xl bg-emerald-50 p-2.5">
                <span className="text-emerald-700 font-semibold block">Diferensiasi Pembelajaran:</span>
                <span className="text-sm font-bold text-emerald-900">3.7 / 4.0 (Praktik Berkelanjutan)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200/70">
            <h5 className="font-bold text-amber-900 mb-1">Catatan Kemitraan (Sipakainge):</h5>
            <p className="text-amber-800 italic leading-relaxed">
              "Penyampaian tujuan pembelajaran sangat memantik antusiasme murid. Diferensiasi konten
              berjalan alami dan murid merasa aman berekspresi. Tindak lanjut fokus pada pendampingan
              asesmen teman sebaya."
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-slate-500 text-[11px]">
            <div>
              <p>Guru Yang Diobservasi</p>
              <div className="h-10 flex items-center font-serif italic text-teal-900 font-bold">
                ( {teacher?.name ?? '................'} )
              </div>
            </div>
            <div className="text-right">
              <p>Supervisor / Kepala Sekolah</p>
              <div className="h-10 flex items-center justify-end font-serif italic text-teal-900 font-bold">
                ( Fahmawati, S.Pd. )
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-teal-700/20 hover:bg-teal-800 transition"
          >
            <span className="material-symbols-outlined text-base">verified</span>
            Tandatangani & Finalisasi Siklus
          </button>
        </div>
      </div>
    </div>
  );
};

interface QuickRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (count: number) => void;
  muridOptions: MuridRecord[];
}

export const QuickRecordModal: React.FC<QuickRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  muridOptions,
}) => {
  const [selectedMuridId, setSelectedMuridId] = useState<string>('');
  const currentMurid = muridOptions.find((m) => m.id === selectedMuridId) ?? muridOptions[0];

  const [selectedHabits, setSelectedHabits] = useState<number[]>([1, 2, 4, 5, 6]);
  const [wakeTime, setWakeTime] = useState(currentMurid?.wakeUpTime || '05:00');
  const [bedTime, setBedTime] = useState(currentMurid?.bedTime || '21:00');
  const [prayers, setPrayers] = useState({
    subuh: true,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: false,
    tadarus: true,
    dhuha: true,
  });
  const [mood, setMood] = useState<'ceria' | 'semangat' | 'perlu_dukungan'>('ceria');
  const [quickNote, setQuickNote] = useState('');

  if (!isOpen) return null;

  if (!currentMurid) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-slate-200 space-y-3">
          <span className="material-symbols-outlined text-4xl text-slate-300">person_off</span>
          <h3 className="text-sm font-bold text-slate-900">Belum ada data murid</h3>
          <p className="text-xs text-slate-500">
            Tambahkan atau impor data murid di Manajemen Pengguna terlebih dahulu.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const handleSelectMurid = (id: string) => {
    setSelectedMuridId(id);
    const m = muridOptions.find((x) => x.id === id);
    if (m) {
      setWakeTime(m.wakeUpTime);
      setBedTime(m.bedTime);
    }
  };

  const toggle = (id: number) => {
    setSelectedHabits((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const togglePrayer = (pKey: keyof typeof prayers) => {
    setPrayers((prev) => ({ ...prev, [pKey]: !prev[pKey] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-teal-800 to-emerald-800 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
              <span className="material-symbols-outlined text-xl">bolt</span>
            </div>
            <div>
              <h3 className="text-base font-bold">1-Klik Input Pembiasaan Harian</h3>
              <p className="text-xs text-teal-100">
                Pencatatan 7 KAIH per murid untuk {currentMurid.name} ({currentMurid.rombel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4 text-xs">
          {/* Murid Selector (Wali Kelas) */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-800 text-lg">person</span>
              <span className="font-bold text-teal-950 text-xs">Pilih Murid:</span>
            </div>
            <select
              value={selectedMuridId}
              onChange={(e) => handleSelectMurid(e.target.value)}
              className="rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {muridOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (NISN: {m.nisn})
                </option>
              ))}
            </select>
          </div>

          {/* Input Waktu Bangun & Tidur */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-teal-50/60 p-3.5 border border-teal-100">
            <div>
              <label className="font-bold text-teal-950 block mb-1">
                #1 Jam Bangun Pagi:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="rounded-lg border border-teal-200 bg-white px-2 py-1 text-xs font-bold text-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <span className="text-[10px] text-teal-700">WITA</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-teal-950 block mb-1">
                #7 Jam Tidur Malam:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="rounded-lg border border-teal-200 bg-white px-2 py-1 text-xs font-bold text-teal-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <span className="text-[10px] text-teal-700">WITA</span>
              </div>
            </div>
          </div>

          {/* Rincian 5 Waktu Sholat Wajib + Ibadah Lainnya */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-teal-700">mosque</span>
                #2 Kebiasaan Beribadah (5 Waktu Sholat Wajib + Lainnya):
              </label>
              <span className="text-[10px] text-teal-700 font-bold">
                {Object.values(prayers).filter(Boolean).length}/7 Dikerjakan
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { k: 'subuh', label: 'Subuh (Rumah)' },
                { k: 'ashar', label: 'Ashar (Rumah)' },
                { k: 'maghrib', label: 'Maghrib (Rumah)' },
                { k: 'isya', label: 'Isya (Rumah)' },
              ].map((p) => {
                const active = prayers[p.k as keyof typeof prayers];
                return (
                  <button
                    key={p.k}
                    type="button"
                    onClick={() => togglePrayer(p.k as keyof typeof prayers)}
                    className={`rounded-lg py-1.5 text-center text-[11px] font-bold border transition ${
                      active
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {active ? `✓ ${p.label}` : p.label}
                  </button>
                );
              })}
            </div>

            {/* Ibadah Khusus Sekolah (Dhuha & Dhuhur) */}
            <div className="rounded-xl bg-teal-50/80 p-2.5 border border-teal-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-teal-900 tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-teal-700">school</span>
                  Ibadah di Sekolah (Wewenang Guru / Wali Kelas):
                </span>
                <span className="text-[9px] bg-teal-200 text-teal-900 font-bold px-1.5 py-0.2 rounded">
                  Dipantau Guru
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-white p-2 border border-teal-100">
                  <span className="text-[11px] font-bold text-slate-800">Shalat Dhuha</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    {prayers.dhuha ? '✓ Terisi Guru' : 'Belum'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-2 border border-teal-100">
                  <span className="text-[11px] font-bold text-slate-800">Shalat Dhuhur</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    {prayers.dzuhur ? '✓ Terisi Guru' : 'Belum'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => togglePrayer('tadarus')}
                className={`w-full flex items-center justify-between rounded-lg p-2 text-left border transition ${
                  prayers.tadarus
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <span>Tadarus Al-Qur'an / Mengaji (Di Rumah Bersama Orang Tua)</span>
                <span>{prayers.tadarus ? '✓ Terlaksana' : '—'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Centang 7 Kebiasaan Anak Indonesia Hebat (7 KAIH):
            </label>
            <div className="grid grid-cols-1 gap-2">
              {HABIT_LIST.map((h) => {
                const active = selectedHabits.includes(h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggle(h.id)}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-left transition-all ${
                      active
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold ${
                          active
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span className="text-xs">{h.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{h.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Suasana Hati & Kondisi Anak:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ceria', label: '😊 Sangat Ceria' },
                { id: 'semangat', label: '🔥 Semangat' },
                { id: 'perlu_dukungan', label: '💤 Santai' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id as any)}
                  className={`rounded-xl py-2 text-xs font-bold transition ${
                    mood === m.id
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catatan Singkat Harian:
            </label>
            <input
              type="text"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="Contoh: Mengaji surat pendek lancar, tidur tepat waktu..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <span className="text-xs font-semibold text-slate-500">
            {selectedHabits.length} dari 7 kebiasaan terpilih
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onSave(selectedHabits.length);
                onClose();
              }}
              className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-700/20 hover:bg-teal-800 transition"
            >
              Simpan & Sinkronkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
