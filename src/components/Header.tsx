import React from 'react';
import {
  School,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Database,
  PanelLeftClose,
  PanelLeft,
  Users,
  ChevronDown,
} from 'lucide-react';
import { FullAppDatabase, ActiveTab } from '../types';

interface HeaderProps {
  db: FullAppDatabase;
  semester: 1 | 2;
  setSemester: (sem: 1 | 2) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  completenessPercent: number;
  onOpenProfileSwitcher: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  db,
  semester,
  setSemester,
  setActiveTab,
  onToggleSidebar,
  isSidebarOpen,
  completenessPercent,
  onOpenProfileSwitcher,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs print:hidden">
      {/* Left section: Hamburger & Class details */}
      <div className="flex items-center space-x-3">
        <button
          id="btn-toggle-menu"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center space-x-1.5 border border-slate-200"
          title={isSidebarOpen ? 'Sembunyikan Menu Bar' : 'Tampilkan Menu Bar'}
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5 text-slate-700" />
          ) : (
            <PanelLeft className="w-5 h-5 text-blue-600" />
          )}
          <span className="hidden sm:inline text-xs font-semibold text-slate-700">
            {isSidebarOpen ? 'Tutup Menu' : 'Menu Bar'}
          </span>
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="hidden sm:flex w-9 h-9 rounded-lg bg-blue-50 text-blue-700 items-center justify-center border border-blue-200 font-bold">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {db.school.namaSekolah || 'SD Negeri 3 Loloan Timur'}
              </h2>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {db.classInfo.namaKelas} • {db.classInfo.fase}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Wali Kelas: <span className="text-slate-700 font-medium">{db.teacher.namaGuru || 'Guru Kelas'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right section: Semester Toggle & Quick Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Tombol Ganti Profil / Kelas */}
        <button
          id="btn-header-switch-profile"
          onClick={onOpenProfileSwitcher}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:border-blue-400 transition-all cursor-pointer group"
          title="Ganti Profil Guru / Kelas (1 - 6 Guru)"
        >
          <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
            {db.classInfo.tingkat || 1}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[10px] text-blue-600 font-semibold leading-none">
              Profil Guru
            </div>
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {db.classInfo.namaKelas}
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-600 text-white group-hover:bg-blue-700 transition-colors">
            Ganti
          </span>
        </button>

        {/* Semester 1 / 2 Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            id="btn-semester-1"
            onClick={() => setSemester(1)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              semester === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semester 1
          </button>
          <button
            id="btn-semester-2"
            onClick={() => setSemester(2)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              semester === 2
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semester 2
          </button>
        </div>

        {/* Academic Year pill */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>TA: <strong className="text-slate-800">{db.classInfo.tahunAjaran}</strong></span>
        </div>

        {/* Completeness Badge */}
        <div
          onClick={() => setActiveTab('preview_rapor')}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs border cursor-pointer transition-colors bg-white hover:bg-slate-50"
          title="Klik untuk melihat pratinjau rapor dan kelengkapan"
        >
          {completenessPercent === 100 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">100% Siap Cetak</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-600">
                Kelengkapan: <strong className="text-amber-600">{completenessPercent}%</strong>
              </span>
            </>
          )}
        </div>

        {/* Primary Print / Preview Button */}
        <button
          id="header-btn-print"
          onClick={() => setActiveTab('preview_rapor')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          title="Buka Halaman Pratinjau & Cetak Rapor"
        >
          <Printer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cetak Rapor</span>
        </button>
      </div>
    </header>
  );
};
