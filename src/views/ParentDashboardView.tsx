import React, { useState } from 'react';
import { ScreenId } from '../types';
import { APP_ASSETS, HABIT_LIST } from '../data/mockData';

interface ParentDashboardViewProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenQuickRecord: () => void;
}

export const ParentDashboardView: React.FC<ParentDashboardViewProps> = ({
  onNavigate,
  onOpenQuickRecord,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<string[]>([
    'Alhamdulillah, terima kasih banyak Ibu Siti. Kami di rumah membiasakan membaca dongeng 20 menit sebelum tidur. Semoga terus termotivasi.',
  ]);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplies((prev) => [...prev, replyText.trim()]);
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <div className="w-full pb-16 font-['Plus_Jakarta_Sans',sans-serif] px-6 lg:px-10 py-6 space-y-8">
      {/* SECTION 1: Personal Welcome & Immediate Action Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00685f] via-[#008378] to-[#006947] p-6 sm:p-8 lg:p-10 shadow-md text-white">
        <div className="absolute -right-16 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-[#89f5e7]/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Identity & Greeting */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-2xl">
            <div className="relative shrink-0">
              <img
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md ring-4 ring-white/20"
                alt="Ibu Rahmawati & Ahmad Fauzan"
                src={APP_ASSETS.parentAndChild}
              />
              <span
                className="absolute bottom-0 right-0 w-6 h-6 bg-[#6ffbbe] text-[#002113] rounded-full flex items-center justify-center shadow-xs"
                title="Kemitraan Rumah Aktif"
              >
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                  spa
                </span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] text-[#89f5e7] uppercase font-bold tracking-wider">
                  Kemitraan Rumah & Sekolah
                </span>
                <span className="text-xs text-white/80">• Rabu, 24 September 2025</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Selamat Pagi, Ibu Rahmawati!
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
                Mari pantau benih kebiasaan baik dan keceriaan ananda{' '}
                <strong className="text-[#89f5e7] font-bold">Ahmad Fauzan</strong> (Kelas IV-A) hari ini dengan penuh
                kasih sayang.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">badge</span> NIS: 240801
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">school</span> Wali Kelas: Ibu Siti Aminah, S.Pd.
                </span>
              </div>
            </div>
          </div>

          {/* Right: Daily Quick Action Callout */}
          <div className="bg-white text-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col justify-between max-w-sm w-full shrink-0 border border-slate-100">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4b41e1] animate-ping"></span>
                <span className="text-xs uppercase tracking-wider text-[#4b41e1] font-bold">Agenda Mandiri Hari Ini</span>
              </div>
              <span className="bg-[#ffdad6] text-[#93000a] text-[10px] px-2 py-0.5 rounded-full font-bold">
                Belum Terisi
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Luangkan 1 menit bersama ananda untuk merefleksikan 7 kebiasaan sehat sebelum istirahat malam.
            </p>
            <button
              type="button"
              onClick={onOpenQuickRecord}
              className="w-full bg-[#00685f] hover:bg-[#008378] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <span className="material-symbols-outlined text-base">edit_calendar</span>
              <span>+ Catat 7 KAIH Hari Ini (1 Menit)</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Overview Metric Cards (Bento 3-Card Grid) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Kehadiran */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Kehadiran Sekolah</span>
              <span className="text-xs text-slate-500 mt-0.5">Semester Ganjil 2025/2026</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#006947]/10 text-[#006947] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">98.4%</span>
            <span className="text-xs text-[#006947] font-bold bg-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
              Sangat Rajin
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#00855b] h-full rounded-full" style={{ width: '98.4%' }}></div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1 text-[#006947] font-semibold">
                <span className="material-symbols-outlined text-xs">verified</span> Tepat Waktu & Konsisten
              </span>
              <span>0 Hari Alpa / Sakit 1</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Capaian Belajar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Rerata Perkembangan Belajar
              </span>
              <span className="text-xs text-slate-500 mt-0.5">Asesmen Formatif & Portofolio</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#e2dfff] text-[#4b41e1] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_stories
              </span>
            </div>
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">88.5</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className="text-xs text-[#00685f] font-bold bg-[#89f5e7]/40 px-2 py-0.5 rounded-full">
              +2.1 vs bln lalu
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: '88.5%' }}></div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-medium text-slate-700">Unggul di: IPAS & Literasi Baca</span>
              <span className="text-[#00685f] font-bold">Tercapai Optimal</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Konsistensi 7 Kebiasaan */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Konsistensi 7 KAIH</span>
              <span className="text-xs text-slate-500 mt-0.5">Pekan ke-4 September</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#89f5e7] text-[#005049] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tabular-nums">91%</span>
            <span className="text-xs text-[#006947] font-bold bg-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
              Tuntas Terverifikasi
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#00685f] h-full rounded-full" style={{ width: '91%' }}></div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Sinkronisasi Guru & Orang Tua</span>
              <span className="font-bold text-slate-900">32 / 35 Jurnal</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) Grid */}
      <section className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200/80 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00685f] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
              <h2 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                Pantauan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pendekatan pembiasaan positif tanpa pelabelan negatif. Menumbuhkan kesadaran diri ananda secara bertahap dan
              gembira.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#6ffbbe]/30 text-[#006947] px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#00855b]"></span> Terbiasa Baik (5)
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-[#e2dfff]/60 text-[#3323cc] px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#4b41e1]"></span> Perlu Didampingi (2)
            </span>
          </div>
        </div>

        {/* 7 Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {HABIT_LIST.map((h) => (
            <div
              key={h.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between hover:shadow-xs transition-all ${
                h.statusColor === 'secondary'
                  ? 'bg-white border-[#c3c0ff] relative overflow-hidden'
                  : 'bg-[#eff4ff] border-slate-200/70'
              }`}
            >
              {h.statusColor === 'secondary' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#4b41e1]"></div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      h.statusColor === 'secondary'
                        ? 'bg-[#e2dfff] text-[#3323cc]'
                        : 'bg-[#6ffbbe] text-[#002113]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{h.icon}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      h.statusColor === 'secondary'
                        ? 'bg-[#e2dfff] text-[#3323cc]'
                        : 'bg-[#6ffbbe] text-[#002113]'
                    }`}
                  >
                    {h.status}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900">{h.title}</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{h.description}</p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200/50 flex items-center justify-between">
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold ${
                    h.statusColor === 'secondary' ? 'text-[#4b41e1]' : 'text-[#006947]'
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>{h.targetNote}</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenQuickRecord}
                  className="text-slate-400 hover:text-[#00685f] p-1 rounded hover:bg-white transition-colors"
                  title="Catat atau beri tanggapan"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
            </div>
          ))}

          {/* 8th Box: Student Character Badge Widget */}
          <div className="bg-gradient-to-br from-[#008378] to-[#00685f] text-white p-5 rounded-2xl flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#89f5e7]">Karakter Profil</span>
                <span className="material-symbols-outlined text-[#89f5e7] text-lg">verified</span>
              </div>
              <h3 className="text-base font-bold mt-2">Karakter Gemilang</h3>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">
                Ahmad telah memperoleh lencana <strong className="text-[#89f5e7]">"Sahabat Buku & Santun"</strong> dari
                Ibu Guru pekan ini.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/20 flex items-center justify-between">
              <span className="text-[11px] text-white/70">SIPAKAINGE SDN PAM</span>
              <button
                type="button"
                onClick={() => onNavigate('parent_portfolio')}
                className="text-xs text-[#89f5e7] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Lihat Rapor</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5: Teacher Note & School Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Catatan Apresiasi & Dialog Guru (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00685f] text-2xl">forum</span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Catatan Apresiasi & Dialog Guru</h2>
                  <span className="text-[11px] text-slate-500">Kemitraan konstruktif demi potensi ananda</span>
                </div>
              </div>
              <span className="bg-[#eff4ff] text-slate-600 text-[11px] px-2.5 py-1 rounded-full font-medium">
                Hari Ini, 10.45 WITA
              </span>
            </div>

            {/* Teacher's Message Bubble */}
            <div className="bg-[#eff4ff] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 mt-4 border border-slate-200/60">
              <img
                className="w-12 h-12 rounded-full object-cover shadow-sm shrink-0 ring-2 ring-white"
                alt="Ibu Siti Aminah"
                src={APP_ASSETS.teacherBatikCasual}
              />
              <div className="flex flex-col flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">Ibu Siti Aminah, S.Pd.</span>
                  <span className="text-[10px] text-slate-500">Wali Kelas IV-A</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed italic">
                  "Tabe' Ibu Rahmawati, Ahmad hari ini sangat antusias dalam eksperimen kelompok magnet mata pelajaran
                  IPAS. Ananda percaya diri mempresentasikan hasil temuannya di depan teman-temannya. Pembiasaan gemar
                  membaca di rumah sangat terasa dampaknya terhadap kekayaan kosakata Ahmad di kelas. Mari kita terus
                  dampingi bersama!"
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="bg-white text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">science</span> Eksperimen IPAS
                  </span>
                  <span className="bg-white text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">record_voice_over</span> Percaya Diri
                  </span>
                </div>
              </div>
            </div>

            {/* Parent Replies List */}
            <div className="space-y-3 mt-4">
              {replies.map((rep, idx) => (
                <div key={idx} className="pl-4 sm:pl-10 flex gap-3">
                  <img
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    alt="Ibu Rahmawati"
                    src={APP_ASSETS.motherAvatar}
                  />
                  <div className="bg-slate-100 rounded-2xl p-3 flex-1 border border-slate-200/60">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-slate-900">Ibu Rahmawati (Orang Tua)</span>
                      <span>Kemarin, 19.30 WITA</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rep}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline reply form */}
            {showReplyForm && (
              <form onSubmit={handleSendReply} className="mt-4 pl-4 sm:pl-10 flex flex-col gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ketik balasan untuk Ibu Wali Kelas..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold"
                  >
                    Kirim Balasan
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">reply</span>
              <span>Balas Apresiasi Guru</span>
            </button>
            <button
              type="button"
              onClick={() => alert('Jadwal konsultasi singkat guru dapat diatur melalui menu kalender.')}
              className="bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">event</span>
              <span>Jadwalkan Diskusi Singkat</span>
            </button>
          </div>
        </div>

        {/* Agenda & Kegiatan Sekolah (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#00685f] text-2xl">campaign</span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Agenda & Kegiatan</h2>
                  <span className="text-[11px] text-slate-500">SDN Percontohan PAM Kota Makassar</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="bg-[#eff4ff] p-4 rounded-2xl flex items-start gap-3.5 border border-slate-200/60 hover:bg-[#e5eeff] transition-colors">
                <div className="bg-[#008378] text-white rounded-xl p-2 text-center shrink-0 w-12 shadow-xs">
                  <span className="block text-lg font-extrabold leading-none">25</span>
                  <span className="block text-[10px] uppercase font-semibold mt-0.5">Sep</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    Pentas Seni Literasi & Pekan Buah Sehat
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Ananda diharapkan membawa bekal buah favorit untuk dinikmati bersama teman kelas setelah pentas dongeng.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#00685f] font-semibold">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    <span>07.30 - 11.00 WITA • Lapangan Upacara</span>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-[#eff4ff] p-4 rounded-2xl flex items-start gap-3.5 border border-slate-200/60 hover:bg-[#e5eeff] transition-colors">
                <div className="bg-[#4b41e1] text-white rounded-xl p-2 text-center shrink-0 w-12 shadow-xs">
                  <span className="block text-lg font-extrabold leading-none">28</span>
                  <span className="block text-[10px] uppercase font-semibold mt-0.5">Sep</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    Pemeriksaan Kesehatan Berkala Puskesmas
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Pemeriksaan mata, gigi, dan status gizi anak sekolah oleh tim Puskesmas dampingan. Mohon pastikan sarapan.
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#4b41e1] font-semibold">
                    <span className="material-symbols-outlined text-xs">health_and_safety</span>
                    <span>Program Dampingan Sekolah</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('parent_calendar')}
              className="w-full sm:w-1/2 bg-[#eff4ff] hover:bg-[#dce9ff] text-slate-800 text-xs font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-[#00685f]">calendar_month</span>
              <span>Kalender Lengkap</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('parent_portfolio')}
              className="w-full sm:w-1/2 bg-[#00855b] hover:bg-[#006947] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Unduh Rapor Karakter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
