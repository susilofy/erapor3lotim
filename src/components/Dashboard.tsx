import React from 'react';
import {
  School,
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Award,
  Sparkles,
  Trophy,
  CalendarCheck,
  MessageSquare,
  Printer,
  Database,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { FullAppDatabase, ActiveTab } from '../types';
import { CompletenessReport } from '../utils/validationHelper';

interface DashboardProps {
  db: FullAppDatabase;
  semester: 1 | 2;
  setActiveTab: (tab: ActiveTab) => void;
  completeness: CompletenessReport;
}

export const Dashboard: React.FC<DashboardProps> = ({
  db,
  semester,
  setActiveTab,
  completeness,
}) => {
  const activeStudents = db.students.filter((s) => s.status === 'Aktif');
  const activeSubjects = db.subjects.filter((s) => s.isActive);

  const quickButtons = [
    { label: 'Kelola Siswa', tab: 'siswa' as ActiveTab, icon: Users, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
    { label: 'Input Nilai', tab: 'nilai' as ActiveTab, icon: FileSpreadsheet, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
    { label: 'Capaian Kompetensi', tab: 'capaian' as ActiveTab, icon: Award, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200' },
    { label: 'Kokurikuler', tab: 'kokurikuler' as ActiveTab, icon: Sparkles, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
    { label: 'Ekstrakurikuler', tab: 'ekstrakurikuler' as ActiveTab, icon: Trophy, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200' },
    { label: 'Absensi Siswa', tab: 'absensi' as ActiveTab, icon: CalendarCheck, color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-200' },
    { label: 'Catatan Guru', tab: 'catatan' as ActiveTab, icon: MessageSquare, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
    { label: 'Rekap Nilai (Leger)', tab: 'rekap_nilai' as ActiveTab, icon: FileSpreadsheet, color: 'bg-teal-50 text-teal-800 hover:bg-teal-100 border-teal-200' },
    { label: 'Preview & Cetak PDF', tab: 'preview_rapor' as ActiveTab, icon: Printer, color: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200' },
    { label: 'Backup & Restore', tab: 'database' as ActiveTab, icon: Database, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-blue-200 text-xs font-semibold mb-3 border border-white/10">
            <span>Kurikulum Merdeka SD</span>
            <span>•</span>
            <span>Tahun Ajaran {db.classInfo.tahunAjaran}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {db.teacher.namaGuru || 'Bapak/Ibu Guru'}!
          </h1>
          <p className="text-blue-100 text-sm mt-2 leading-relaxed">
            Aplikasi Pengolahan Rapor SD Negeri 3 Loloan Timur
            <span className="block mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-xs text-white text-xs font-semibold border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Developer: Susilo Fitri Yatmoko</span>
              </span>
            </span>
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('nilai')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Input Nilai Sekarang</span>
            </button>
            <button
              onClick={() => setActiveTab('preview_rapor')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-700/80 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg border border-blue-500/50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Lihat Preview Rapor</span>
            </button>
          </div>
        </div>

        {/* Decorative badge in background */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden md:block">
          <School className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: School */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Satuan Pendidikan</span>
            <School className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800 truncate" title={db.school.namaSekolah}>
              {db.school.namaSekolah || '-'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">NPSN: {db.school.npsn || '-'}</p>
          </div>
          <button
            onClick={() => setActiveTab('sekolah')}
            className="mt-3 text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Edit Data Sekolah</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 2: Class & Teacher */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Kelas & Wali Kelas</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800">
              {db.classInfo.namaKelas} ({db.classInfo.fase})
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate" title={db.teacher.namaGuru}>
              {db.teacher.namaGuru || '-'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('kelas')}
            className="mt-3 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Atur Kelas & Guru</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Students count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Jumlah Siswa</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-800">{activeStudents.length}</span>
              <span className="text-xs text-slate-500 font-medium">Siswa Aktif</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              L: {activeStudents.filter((s) => s.jenisKelamin === 'L').length} • P: {activeStudents.filter((s) => s.jenisKelamin === 'P').length}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('siswa')}
            className="mt-3 text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center space-x-1"
          >
            <span>Buka Data Siswa</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Subjects count & Period */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Mata Pelajaran & Semester</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-800">{activeSubjects.length}</span>
              <span className="text-xs text-slate-500 font-medium">Mapel Aktif</span>
            </div>
            <p className="text-xs text-amber-700 font-medium mt-0.5">
              Semester {semester} ({db.classInfo.tahunAjaran})
            </p>
          </div>
          <button
            onClick={() => setActiveTab('mapel')}
            className="mt-3 text-[11px] font-semibold text-amber-600 hover:text-amber-800 flex items-center space-x-1"
          >
            <span>Kelola Mapel & KKTP</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Completeness & Readiness Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-800">Status Kelengkapan Data Rapor</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  completeness.overallStatus === 'Siap Cetak'
                    ? 'bg-emerald-100 text-emerald-800'
                    : completeness.overallStatus === 'Lengkap'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {completeness.overallStatus} ({completeness.percent}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Periksa checklist indikator di bawah untuk memastikan rapor siswa siap diterbitkan.
            </p>
          </div>

          <div className="w-full sm:w-48">
            <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
              <span>Progress</span>
              <span>{completeness.completedCount} / {completeness.totalCount} Modul</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  completeness.percent === 100
                    ? 'bg-emerald-500'
                    : completeness.percent >= 80
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${completeness.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Indicators List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {completeness.items.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border flex items-start space-x-2.5 transition-colors ${
                item.isComplete
                  ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900'
                  : 'bg-amber-50/50 border-amber-200 text-amber-900'
              }`}
            >
              {item.isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{item.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase text-slate-500">
          Tombol Aksi Cepat
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                id={`quick-btn-${btn.tab}`}
                onClick={() => setActiveTab(btn.tab)}
                className={`p-3 rounded-xl border flex flex-col items-center text-center justify-center space-y-2 transition-all shadow-2xs hover:shadow-xs ${btn.color}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold leading-tight">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Teacher Workflow Guide (Alur Kerja Guru) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Panduan Alur Pengisian Rapor Guru Kelas</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
          {[
            { step: '1', title: 'Sekolah', tab: 'sekolah' as ActiveTab },
            { step: '2', title: 'Guru & Wali', tab: 'guru' as ActiveTab },
            { step: '3', title: 'Atur Kelas', tab: 'kelas' as ActiveTab },
            { step: '4', title: 'Data Siswa', tab: 'siswa' as ActiveTab },
            { step: '5', title: 'Mapel & KKTP', tab: 'mapel' as ActiveTab },
            { step: '6', title: 'Lingkup Materi', tab: 'lingkup_materi' as ActiveTab },
            { step: '7', title: 'Nilai Sumatif', tab: 'nilai' as ActiveTab },
            { step: '8', title: 'Capaian Otomatis', tab: 'capaian' as ActiveTab },
            { step: '9', title: 'Kokurikuler', tab: 'kokurikuler' as ActiveTab },
            { step: '10', title: 'Ekstrakurikuler', tab: 'ekstrakurikuler' as ActiveTab },
            { step: '11', title: 'Absensi Siswa', tab: 'absensi' as ActiveTab },
            { step: '12', title: 'Catatan Wali', tab: 'catatan' as ActiveTab },
            { step: '13', title: 'Status Naik/Lulus', tab: 'status_siswa' as ActiveTab },
            { step: '14', title: 'Preview A4', tab: 'preview_rapor' as ActiveTab },
            { step: '15', title: 'Cetak / PDF', tab: 'preview_rapor' as ActiveTab },
            { step: '16', title: 'Backup Data', tab: 'database' as ActiveTab },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(item.tab)}
              className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-colors flex flex-col items-center justify-center text-slate-700 hover:text-blue-800"
            >
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center mb-1">
                {item.step}
              </span>
              <span className="font-semibold text-[11px] truncate w-full">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
