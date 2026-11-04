import React, { useState } from 'react';
import { resolveRppFileUrl } from '../lib/supabase';

/**
 * Aksi untuk berkas RPP/Modul Ajar yang diunggah guru: Pratinjau (modal di
 * halaman ini), Buka di Tab Baru, dan Unduh. Dipakai Kepala Sekolah/pemeriksa
 * saat menelaah, dan guru untuk mengecek berkasnya sendiri.
 */

const isPdf = (name: string) => /\.pdf$/i.test(name);
const isWord = (name: string) => /\.docx?$/i.test(name);

/** URL untuk ditampilkan di browser. Word (.doc/.docx) tidak bisa dirender browser,
 *  jadi dibuka lewat Office Online viewer. */
function viewerUrl(url: string, name: string): string {
  if (isWord(name)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }
  return url;
}

export function canPreviewRpp(rppUrl?: string, rppFileName?: string): boolean {
  const url = resolveRppFileUrl(rppUrl);
  if (!url || !rppFileName) return false;
  return isPdf(rppFileName) || isWord(rppFileName);
}

export function openRppInNewTab(rppUrl?: string, rppFileName?: string): boolean {
  const url = resolveRppFileUrl(rppUrl);
  if (!url || !rppFileName) return false;
  window.open(viewerUrl(url, rppFileName), '_blank', 'noopener,noreferrer');
  return true;
}

export function downloadRpp(rppUrl?: string, rppFileName?: string): boolean {
  const url = resolveRppFileUrl(rppUrl);
  if (!url || !rppFileName) return false;
  const a = document.createElement('a');
  // Atribut `download` diabaikan untuk URL lintas domain; Supabase Storage
  // memaksa unduhan lewat parameter `?download=<nama>`.
  a.href = `${url}${url.includes('?') ? '&' : '?'}download=${encodeURIComponent(rppFileName)}`;
  a.download = rppFileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}

export const RPP_UNAVAILABLE_MESSAGE =
  'Berkas RPP ini tidak tersimpan di Storage (rpp_bucket), jadi isinya tidak bisa dibuka. Minta guru mengunggah ulang.';

interface RppFileActionsProps {
  rppUrl?: string;
  rppFileName?: string;
  /** Dipanggil saat berkas tidak bisa dibuka (mis. untuk toast). Default: alert. */
  onUnavailable?: (message: string) => void;
  className?: string;
}

const RppFileActions: React.FC<RppFileActionsProps> = ({ rppUrl, rppFileName, onUnavailable, className = '' }) => {
  const [showPreview, setShowPreview] = useState(false);
  if (!rppFileName) return null;

  const url = resolveRppFileUrl(rppUrl);
  const available = !!url;
  const previewable = canPreviewRpp(rppUrl, rppFileName);
  const notify = onUnavailable || ((m: string) => alert(m));

  const handlePreview = () => {
    if (!available) return notify(RPP_UNAVAILABLE_MESSAGE);
    if (!previewable) return notify('Pratinjau tidak tersedia untuk jenis berkas ini. Silakan unduh berkasnya.');
    setShowPreview(true);
  };
  const handleOpenTab = () => {
    if (!openRppInNewTab(rppUrl, rppFileName)) notify(RPP_UNAVAILABLE_MESSAGE);
  };
  const handleDownload = () => {
    if (!downloadRpp(rppUrl, rppFileName)) notify(RPP_UNAVAILABLE_MESSAGE);
  };

  const btn = 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <button type="button" onClick={handlePreview} className={`${btn} bg-teal-800 text-white hover:bg-teal-900 shadow-3xs`} title="Lihat isi berkas di halaman ini">
          <span className="material-symbols-outlined text-sm">visibility</span>
          <span>Pratinjau</span>
        </button>
        <button type="button" onClick={handleOpenTab} className={`${btn} border border-teal-800 text-teal-800 bg-white hover:bg-teal-50`} title="Buka berkas di tab browser baru">
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          <span>Buka di Tab Baru</span>
        </button>
        <button type="button" onClick={handleDownload} className={`${btn} border border-slate-300 text-slate-700 bg-white hover:bg-slate-50`} title="Unduh berkas">
          <span className="material-symbols-outlined text-sm">download</span>
          <span>Unduh</span>
        </button>
        {!available && (
          <span className="text-[10px] font-bold text-amber-700">Berkas belum tersimpan di Storage</span>
        )}
      </div>

      {showPreview && url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-teal-800">description</span>
                <p className="text-sm font-bold text-slate-900 truncate">{rppFileName}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={handleOpenTab} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Buka di Tab Baru">
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </button>
                <button type="button" onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Unduh">
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
                <button type="button" onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Tutup">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
            <iframe title={`Pratinjau ${rppFileName}`} src={viewerUrl(url, rppFileName)} className="flex-1 w-full bg-slate-100" />
          </div>
        </div>
      )}
    </>
  );
};

export default RppFileActions;
