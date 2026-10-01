import React from 'react';
import { ScreenId } from '../types';
import { APP_ASSETS } from '../data/mockData';
import { PublicNavbar } from '../components/PublicNavbar';
import { SchoolLogo } from '../components/SchoolLogo';
import { witaParts } from '../lib/time';

interface LandingPageViewProps {
  onNavigate: (screen: ScreenId) => void;
  principalPhotoUrl?: string;
  totalMurid?: number;
  totalGuru?: number;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigate,
  principalPhotoUrl,
  totalMurid = 0,
  totalGuru = 0,
}) => {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col">
      {/* Top Navigation Bar — Reusable Public Navbar */}
      <PublicNavbar currentScreen="landing" onNavigate={onNavigate} />

      {/* Main Content */}
      <main className="w-full pt-20 flex-1">
        {/* HERO SECTION */}
        <section id="beranda" className="relative w-full overflow-hidden bg-gradient-to-b from-[#eff4ff] via-[#f8f9ff] to-[#f8f9ff] py-16 lg:py-24">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#89f5e7]/30 blur-3xl"></div>
            <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-[#6ffbbe]/25 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Column */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-xs border border-slate-100 max-w-fit">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] animate-pulse"></span>
                  <span className="text-[11px] sm:text-xs text-[#00685f] font-bold uppercase tracking-wider">
                    UPT SPF SDN PERCONTOHAN PAM MAKASSAR • AKREDITASI A UNGGUL
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[40px] text-[#0b1c30] tracking-tight font-extrabold leading-tight">
                  Membangun Karakter Hebat & Kualitas Pembelajaran Berkelanjutan Bersama{' '}
                  <span className="text-[#00685f] underline decoration-[#00685f]/30 decoration-wavy">SIPAKAINGE</span>
                </h1>

                <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                  Ekosistem digital terpadu supervisi klinis reflektif tanpa penghakiman, pemantauan{' '}
                  <span className="font-semibold text-[#00685f]">7 Kebiasaan Anak Indonesia Hebat (7 KAIH)</span>, serta
                  orkestrasi kemitraan nyata antara pendidik, pengawas, dan orang tua murid.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => onNavigate('login')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00685f] text-white font-semibold shadow-md hover:bg-[#008378] hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    <span className="material-symbols-outlined text-[20px]">lock_open</span>
                    <span>Masuk Ruang Kerja Manajemen Data</span>
                  </button>
                  <a
                    href="#filosofi"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all shadow-sm border border-slate-200"
                  >
                    <span className="material-symbols-outlined text-[#00685f] text-[20px]">auto_stories</span>
                    <span>Pelajari Filosofi Kami</span>
                  </a>
                </div>

                {/* Quick Dashboard Access Bento: Rekap Murid vs Guru */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div
                    onClick={() => onNavigate('student_dashboard')}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#00685f] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-100">
                        <span className="material-symbols-outlined text-sm">diversity_1</span>
                        Dasbor Rekap Murid
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Harian & Bulanan
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-[#00685f] transition">
                      Rekapitulasi 7 KAIH Murid & Sholat
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Transparansi data 7 Kebiasaan Anak Indonesia Hebat (7 KAIH), centang (✓), 5 waktu sholat fardhu + ibadah lainnya, serta jam bangun & tidur.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-bold text-[#00685f] group-hover:translate-x-1 transition-transform">
                      <span>Buka Rekap 7 KAIH Murid</span>
                      <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </div>
                  </div>

                  <div
                    onClick={() => onNavigate('teacher_dashboard')}
                    className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#00685f] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-900 border border-indigo-100">
                        <span className="material-symbols-outlined text-sm">school</span>
                        Dasbor Rekap Guru
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        1x Per Semester
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-[#00685f] transition">
                      Rekapitulasi Supervisi Guru
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Transparansi siklus supervisi klinis semester guru: tabel 5 tahapan dengan tanda centang (✓), tanpa filter harian/bulanan.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-bold text-[#00685f] group-hover:translate-x-1 transition-transform">
                      <span>Buka Rekap Supervisi Guru</span>
                      <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                    </div>
                  </div>
                </div>

                {/* Micro Metric Proof Chips */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Kehadiran</span>
                    <span className="text-2xl font-bold text-[#00685f] tabular-nums">98.4%</span>
                    <span className="text-xs text-[#006947] font-medium">Konsistensi Tinggi</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">7 KAIH</span>
                    <span className="text-2xl font-bold text-[#006947] tabular-nums">92.8%</span>
                    <span className="text-xs text-[#006947] font-medium">+3.4% bulan ini</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-slate-100 flex flex-col">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Skor Refleksi</span>
                    <span className="text-2xl font-bold text-[#4b41e1] tabular-nums">
                      3.6<span className="text-xs text-slate-400 font-normal">/4.0</span>
                    </span>
                    <span className="text-xs text-[#4b41e1] font-medium">Skala Berkembang</span>
                  </div>
                </div>
              </div>

              {/* Leader Card & Visual Showcase */}
              <div className="lg:col-span-5 relative">
                <div className="relative bg-white rounded-2xl shadow-xl p-4 border border-slate-100 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00685f] via-[#006947] to-[#4b41e1]"></div>

                  <div className="relative w-full rounded-xl overflow-hidden aspect-square shadow-inner bg-slate-100">
                    <img
                      alt="Ibu Fahmawati, S.Pd."
                      className="w-full h-full object-cover"
                      src={principalPhotoUrl || APP_ASSETS.principalPhoto}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#00685f]/90 text-[11px] uppercase tracking-wider font-semibold mb-1">
                        Kepemimpinan Transformatif
                      </span>
                      <p className="text-lg font-bold leading-tight">Fahmawati, S.Pd.</p>
                      <p className="text-xs opacity-90">Kepala UPT SPF SDN Percontohan PAM Makassar</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-[#eff4ff] flex items-start gap-3">
                    <span
                      className="material-symbols-outlined text-[#00685f] text-2xl shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      format_quote
                    </span>
                    <div className="flex flex-col">
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        “Sipakainge, Sipakalebbi, Sipakatau. Supervisi bukanlah arena menghakimi kekurangan guru,
                        melainkan ruang mulia untuk bertumbuh bersama demi kebahagiaan belajar setiap anak kita.”
                      </p>
                      <span className="text-[11px] text-[#00685f] font-bold uppercase tracking-wider mt-2">
                        Falsafah Budaya Bugis-Makassar
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#006947]/10 flex items-center justify-center text-[#006947] shrink-0">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Model Percontohan</p>
                    <p className="text-[11px] text-slate-500">Dinas Pendidikan Kota Makassar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FILOSOFI KEARIFAN LOKAL */}
        <section id="filosofi" className="w-full py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff4ff] mb-2">
                <span className="material-symbols-outlined text-[#00685f] text-sm">account_balance</span>
                <span className="text-xs text-[#00685f] font-bold uppercase tracking-wider">Akar Kearifan Lokal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                Harmoni Nilai Budaya dalam Pendidikan Modern
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                SIPAKAINGE memadukan kearifan filosofis luhur suku Bugis-Makassar ke dalam kerangka Kurikulum Merdeka dan
                supervisi klinis abad ke-21.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* SIPAKAINGE */}
              <div className="p-6 rounded-2xl bg-[#eff4ff]/60 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#89f5e7] flex items-center justify-center text-[#005049] mb-4">
                    <span className="material-symbols-outlined text-2xl">notifications_active</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-bold text-[#0b1c30]">SIPAKAINGE</span>
                    <span className="px-2 py-0.5 rounded bg-[#00685f]/10 text-[#00685f] text-xs font-semibold">
                      Inti Platform
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#00685f] mb-2">
                    Saling Mengingatkan dalam Kebaikan & Kebenaran
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Supervisi dijalankan dengan semangat saling asah: mengingatkan komitmen pedagogik, refleksi target
                    pembelajaran, dan penuntun moralitas tanpa memojokkan guru.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <span className="material-symbols-outlined text-base text-[#00685f]">check_circle</span>
                  <span>Refleksi Berkesinambungan</span>
                </div>
              </div>

              {/* SIPAKALEBBI */}
              <div className="p-6 rounded-2xl bg-[#eff4ff]/60 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3323cc] mb-4">
                    <span className="material-symbols-outlined text-2xl">military_tech</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-bold text-[#0b1c30]">SIPAKALEBBI</span>
                    <span className="px-2 py-0.5 rounded bg-[#4b41e1]/10 text-[#4b41e1] text-xs font-semibold">
                      Respek Luhur
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#4b41e1] mb-2">
                    Saling Menghargai & Memuliakan Harkat Pendidik
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Menghargai setiap keunikan gaya mengajar guru, merayakan progres sekecil apa pun dari murid, serta
                    memuliakan profesi pendidik sebagai garda peradaban.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <span className="material-symbols-outlined text-base text-[#4b41e1]">check_circle</span>
                  <span>Apresiasi & Pengakuan Karya</span>
                </div>
              </div>

              {/* SIPAKATAU */}
              <div className="p-6 rounded-2xl bg-[#eff4ff]/60 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#6ffbbe] flex items-center justify-center text-[#002113] mb-4">
                    <span className="material-symbols-outlined text-2xl">diversity_3</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-bold text-[#0b1c30]">SIPAKATAU</span>
                    <span className="px-2 py-0.5 rounded bg-[#006947]/10 text-[#006947] text-xs font-semibold">
                      Humanisme
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#006947] mb-2">
                    Memanusiakan Manusia dalam Setiap Proses Belajar
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Melihat anak didik sebagai pribadi utuh dengan potensi unik, bukan angka semata. Membangun ruang
                    kelas yang ramah anak, aman emosional, dan inklusif.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-slate-600 text-xs font-medium">
                  <span className="material-symbols-outlined text-base text-[#006947]">check_circle</span>
                  <span>Pendekatan Holistik Murid</span>
                </div>
              </div>
            </div>

            {/* 3 Pilar Transformasi */}
            <div className="bg-[#eff4ff] rounded-3xl p-8 border border-slate-200/80">
              <div className="max-w-2xl mb-6">
                <span className="text-xs text-[#00685f] font-bold uppercase tracking-wider">Arsitektur Perubahan</span>
                <h3 className="text-xl font-bold text-[#0b1c30] tracking-tight mt-1">
                  Tiga Pilar Utama Sistem Transformasi
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#00685f] font-bold">
                    <span className="w-8 h-8 rounded-full bg-[#00685f]/10 flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span className="text-sm">Supervisi Klinis Kemitraan</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tiga tahapan terukur: Pra-Observasi dialogis, Pelaksanaan Observasi berfokus rubrik terbuka, dan
                    Pasca-Observasi refleksi mandiri terarah.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#006947] font-bold">
                    <span className="w-8 h-8 rounded-full bg-[#006947]/10 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span className="text-sm">7 Kebiasaan Anak Indonesia Hebat (7 KAIH)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pemantauan pembiasaan harian terstandar nasional untuk mengukuhkan fisik bugar, spiritual kokoh,
                    etika santun, dan daya nalar kritis peserta didik.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#4b41e1] font-bold">
                    <span className="w-8 h-8 rounded-full bg-[#4b41e1]/10 flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span className="text-sm">Sinergi Tri Sentra Pendidikan</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Menghubungkan orang tua, guru, dan lingkungan sosial dalam satu dasbor komunikatif 1-klik untuk
                    pemantauan karakter tanpa jeda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 KEBIASAAN ANAK INDONESIA HEBAT */}
        <section id="7-kebiasaan" className="w-full py-16 bg-[#eff4ff]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white max-w-fit mb-2 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006947]"></span>
                  <span className="text-xs text-[#006947] font-bold uppercase tracking-wider">
                    Karakter Unggul Anak Makassar
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                  7 Kebiasaan Anak Indonesia Hebat (7 KAIH)
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Bukan sekadar hafalan, melainkan pola hidup yang mengakar dalam rutinitas keseharian murid UPT SPF SDN
                  Percontohan PAM mulai dari fajar hingga beristirahat malam.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-4 max-w-sm">
                <div className="w-12 h-12 rounded-full bg-[#00685f]/10 flex items-center justify-center text-[#00685f] font-bold text-xl tabular-nums">
                  92.8%
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Rerata Kepatuhan Bulan Ini</span>
                  <span className="text-[11px] text-slate-500">Terverifikasi oleh {totalMurid} orang tua murid</span>
                </div>
              </div>
            </div>

            {/* 7 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                {
                  no: '01',
                  cat: 'KEDISIPLINAN',
                  title: 'Bangun Pagi',
                  desc: 'Menyiapkan hari dengan segar, mandiri menata kasur sebelum pukul 05.30.',
                  rate: '96% Tercapai',
                  icon: 'wb_sunny',
                },
                {
                  no: '02',
                  cat: 'SPIRITUAL',
                  title: 'Taat Beribadah',
                  desc: 'Menjalankan salat atau doa keagamaan masing-masing secara khusyuk.',
                  rate: '98% Tercapai',
                  icon: 'volunteer_activism',
                },
                {
                  no: '03',
                  cat: 'KESEHATAN',
                  title: 'Berolahraga',
                  desc: 'Aktivitas fisik teratur minimal 20 menit: senam, jalan cepat, atau bersepeda.',
                  rate: '89% Tercapai',
                  icon: 'directions_run',
                },
                {
                  no: '04',
                  cat: 'NUTRISI',
                  title: 'Makan Bergizi',
                  desc: 'Membawa bekal sehat, minim makanan instan pengawet, minum air cukup.',
                  rate: '91% Tercapai',
                  icon: 'restaurant',
                },
                {
                  no: '05',
                  cat: 'LITERASI',
                  title: 'Gemar Membaca',
                  desc: 'Membaca 15 menit buku non-pelajaran, merangkum intisari bacaan pojok buku.',
                  rate: '94% Tercapai',
                  icon: 'menu_book',
                },
                {
                  no: '06',
                  cat: 'SOSIAL',
                  title: 'Bantu Orang Tua',
                  desc: 'Ringan tangan menyapu, merapikan meja belajar, dan santun bertutur.',
                  rate: '93% Tercapai',
                  icon: 'handshake',
                },
                {
                  no: '07',
                  cat: 'ISTIRAHAT',
                  title: 'Istirahat Cukup',
                  desc: 'Tidur tidak larut malam (sebelum 21.00), bebas gawai 1 jam sebelum tidur.',
                  rate: '88% Tercapai',
                  icon: 'bedtime',
                },
              ].map((h) => (
                <div
                  key={h.no}
                  className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between hover:-translate-y-1 transition-transform"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00685f] mb-2">
                      <span className="material-symbols-outlined text-xl">{h.icon}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                      {h.no} • {h.cat}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{h.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-3 leading-relaxed">{h.desc}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-[#006947] font-semibold">{h.rate}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006947]"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ALUR SUPERVISI TIGA TAHAP */}
        <section id="alur-supervisi" className="w-full py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff4ff] mb-2">
                <span className="material-symbols-outlined text-[#00685f] text-sm">timeline</span>
                <span className="text-xs text-[#00685f] font-bold uppercase tracking-wider">Proses Humanis Terarah</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                Alur Supervisi Tiga Tahap Tanpa Ketegangan
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Mengubah paradigma lama inspeksi yang menegangkan menjadi kemitraan kolegial yang memberdayakan potensi
                guru secara berkesinambungan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage 1 */}
              <div className="bg-[#f8f9ff] rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold text-base">
                      1
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-slate-500 text-xs font-semibold border border-slate-200">
                      Tahap Awal
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b1c30] mb-2">Pra-Observasi Dialogis</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Pendidik dan observer berdiskusi menyepakati fokus target pembelajaran, indikator rubrik, serta
                    tantangan khusus peserta didik di kelas yang akan diobservasi.
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-slate-100 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 text-[#00685f] font-semibold mb-1">
                      <span className="material-symbols-outlined text-sm">forum</span>
                      <span>Kesepakatan Mandiri</span>
                    </div>
                    Bukan sidak mendadak; waktu & fokus ditentukan bersama secara transparan.
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-[#006947] text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">done_all</span>
                  <span>100% Modul Ajar Tervalidasi</span>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="bg-[#f8f9ff] rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold text-base">
                      2
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-slate-500 text-xs font-semibold border border-slate-200">
                      Tahap Pelaksanaan
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b1c30] mb-2">Pelaksanaan Observasi Terbuka</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Observer mencatat dinamika kelas secara objektif melalui rubrik digital SIPAKAINGE. Fokus pada
                    keterlibatan aktif peserta didik, bukan mencari kesalahan guru.
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-slate-100 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 text-[#00685f] font-semibold mb-1">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>Pengamatan Interaksi Murid</span>
                    </div>
                    Mencatat partisipasi murid, suasana emosi kelas, dan diferensiasi instruksi.
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-[#006947] text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">done_all</span>
                  <span>Pencatatan Instan di Tablet/Laptop</span>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="bg-[#f8f9ff] rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold text-base">
                      3
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white text-slate-500 text-xs font-semibold border border-slate-200">
                      Tahap Transformasi
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0b1c30] mb-2">Pasca-Observasi & Refleksi</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Guru diajak menemukan solusinya sendiri melalui dialog reflektif dan menyusun rencana aksi
                    peningkatan berbasis hasil supervisi.
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-slate-100 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 text-[#00685f] font-semibold mb-1">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      <span>Solusi Lahir dari Pendidik</span>
                    </div>
                    Menghargai wawasan guru untuk menumbuhkan rasa kepemilikan profesionalitas.
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-[#006947] text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">done_all</span>
                  <span>Laporan Hasil Supervisi Berkelanjutan</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS & TESTIMONIALS */}
        <section id="dampak" className="w-full py-16 bg-[#eff4ff]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            {/* Big Metrics Panel */}
            <div className="p-8 sm:p-12 rounded-3xl bg-[#00685f] text-white shadow-xl mb-16">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-4xl lg:text-5xl font-extrabold text-[#89f5e7] tabular-nums">{totalMurid}</span>
                  <span className="text-sm font-semibold mt-2">Peserta Didik Aktif</span>
                  <span className="text-xs text-white/80 mt-0.5">Terpantau kebiasaan karakternya</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl lg:text-5xl font-extrabold text-[#6ffbbe] tabular-nums">{totalGuru}</span>
                  <span className="text-sm font-semibold mt-2">Pendidik & Tendik</span>
                  <span className="text-xs text-white/80 mt-0.5">Bersertifikasi refleksi supervisi</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl lg:text-5xl font-extrabold text-[#89f5e7] tabular-nums">98.4%</span>
                  <span className="text-sm font-semibold mt-2">Rerata Kehadiran</span>
                  <span className="text-xs text-white/80 mt-0.5">Konsistensi pembiasaan sekolah</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl lg:text-5xl font-extrabold text-[#6ffbbe] tabular-nums">100%</span>
                  <span className="text-sm font-semibold mt-2">Sinergi Kolaboratif</span>
                  <span className="text-xs text-white/80 mt-0.5">Rumah, sekolah, & pemangku</span>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs text-[#00685f] font-bold uppercase tracking-wider">Suara Dari Lapangan</span>
              <h3 className="text-2xl font-bold text-[#0b1c30] tracking-tight mt-1">
                Apa Kata Mereka Tentang SIPAKAINGE?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-[#00685f] mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    “Dahulu supervisi terasa seperti ujian menegangkan. Bersama SIPAKAINGE, kepala sekolah bertindak
                    sebagai teman curhat profesional. Kami berdiskusi santai cara menangani murid yang lambat membaca
                    dengan penuh respek.”
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-[#00685f]/15 flex items-center justify-center font-bold text-xs text-[#00685f]">
                    SR
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Siti Rahmawati, S.Pd.</p>
                    <p className="text-[11px] text-slate-500">Wali Kelas IV SDN Percontohan PAM</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-[#00685f] mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    “SIPAKAINGE membuktikan kearifan lokal Makassar dapat menjadi pondasi digitalisasi pendidikan yang
                    beretika. Sistem ini layak direplikasi ke seluruh jenjang SD se-Kota Makassar.”
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-[#4b41e1]/15 flex items-center justify-center font-bold text-xs text-[#4b41e1]">
                    MS
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Drs. H. Muhammad Syafei, M.Si.</p>
                    <p className="text-[11px] text-slate-500">Pengawas Pembina Disdik Kota Makassar</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-[#00685f] mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    “Sebagai orang tua pekerja, memantau 7 kebiasaan anak sangat mudah. Cukup 1 menit malam hari sambil
                    ngobrol santai dengan anak, kita sudah mencatat habit positif yang terhubung langsung ke wali kelasnya.”
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-[#006947]/15 flex items-center justify-center font-bold text-xs text-[#006947]">
                    FA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Faisal Anshar, S.T.</p>
                    <p className="text-[11px] text-slate-500">Perwakilan Komite & Orang Tua Murid</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="w-full py-16 bg-gradient-to-r from-[#e5eeff] to-[#d3e4fe]">
          <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#00685f] text-white flex items-center justify-center mb-4 shadow-md">
              <span className="material-symbols-outlined text-3xl">rocket_launch</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight max-w-3xl leading-snug">
              Siap Berkolaborasi Mewujudkan Generasi Emas Makassar yang Berkarakter & Unggul?
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Masuk ke ekosistem SIPAKAINGE sekarang. Bersama kita bangun ruang kelas yang memanusiakan, memuliakan, dan
              senantiasa saling mengingatkan dalam kebaikan.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00685f] text-white font-semibold shadow-md hover:bg-[#008378] hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Akses Portal SIPAKAINGE Sekarang</span>
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-slate-500 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006947] text-base">lock</span>
                <span>Aman & Terintegrasi Dapodik</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006947] text-base">devices</span>
                <span>Ramah Semua Gawai</span>
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#eff4ff] text-[#0b1c30] border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <SchoolLogo className="h-11 w-11 rounded-full shadow-xs bg-white p-0.5 ring-1 ring-slate-200 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-[#00685f]">SIPAKAINGE</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    SDN Percontohan PAM Makassar
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                Sistem Terpadu Supervisi Pembelajaran Kolaboratif Berbasis Data, Asesmen, Refleksi, dan Transformasi
                Karakter Peserta Didik Unggul di Kota Makassar.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white max-w-fit shadow-xs border border-slate-100 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#00855b]"></span>
                <span className="text-[11px] text-[#006947] font-semibold">
                  Akreditasi A Unggul Kemendikdasmen
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-2">
              <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">Sekretariat & Lokasi</span>
              <div className="flex flex-col gap-1 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[#00685f] text-base mt-0.5">school</span>
                  <div>
                    <p className="font-semibold text-slate-900">UPT SPF SDN Percontohan PAM</p>
                    <p>Jl. Dr. Sam Ratulangi No. 1, Kel. Mangkura, Kec. Ujung Pandang</p>
                    <p>Kota Makassar, Sulawesi Selatan 90113</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="material-symbols-outlined text-[#00685f] text-sm">mail</span>
                  <span>sdnpercontohanpam@makassarkota.go.id</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#00685f] text-sm">call</span>
                  <span>(0411) 872391 / Layanan Terpadu</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-2">
              <span className="text-xs text-slate-900 font-bold uppercase tracking-wider">Akses Pendidik</span>
              <p className="text-xs text-slate-500">Masuk ke portal internal guru dan kepala sekolah.</p>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-all shadow-xs border border-slate-200 mt-1"
              >
                <span className="material-symbols-outlined text-sm text-[#00685f]">lock_open</span>
                <span>Masuk Portal</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {witaParts().year} UPT SPF SDN Percontohan PAM Kota Makassar. Hak Cipta Dilindungi Undang-Undang.</p>
            <p className="uppercase tracking-wider text-slate-400 text-[10px]">
              Dinas Pendidikan Kota Makassar • Gerakan Sipakatau, Sipakalebbi, Sipakainge
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
