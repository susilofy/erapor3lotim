import React from 'react';
import {
  LayoutDashboard,
  School,
  UserCheck,
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  FileSpreadsheet,
  Award,
  Sparkles,
  Trophy,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  Printer,
  Database,
  ChevronRight,
  PanelLeftClose,
  Laptop,
} from 'lucide-react';
import { ActiveTab, TeacherProfileMeta } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  semester: 1 | 2;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeProfile?: TeacherProfileMeta;
  onOpenProfileSwitcher?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  semester,
  isOpen,
  setIsOpen,
  activeProfile,
  onOpenProfileSwitcher,
}) => {
  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profil', label: 'Ganti Profil / Kelas', icon: Laptop, badge: '1-6 Guru' },
      ],
    },
    {
      title: 'DATA POKOK',
      items: [
        { id: 'sekolah', label: 'Data Sekolah', icon: School },
        { id: 'guru', label: 'Data Guru / Wali', icon: UserCheck },
        { id: 'kelas', label: 'Data Kelas', icon: GraduationCap },
        { id: 'siswa', label: 'Data Siswa', icon: Users },
      ],
    },
    {
      title: 'AKADEMIK & NILAI',
      items: [
        { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen },
        { id: 'lingkup_materi', label: 'Lingkup Materi', icon: Layers },
        { id: 'nilai', label: 'Nilai Sumatif', icon: FileSpreadsheet },
        { id: 'capaian', label: 'Capaian Kompetensi', icon: Award },
      ],
    },
    {
      title: 'PENGEMBANGAN SISWA',
      items: [
        { id: 'kokurikuler', label: 'Kokurikuler', icon: Sparkles },
        { id: 'ekstrakurikuler', label: 'Ekstrakurikuler', icon: Trophy },
        { id: 'absensi', label: 'Rekap Absensi', icon: CalendarCheck },
        { id: 'catatan', label: 'Catatan Wali Kelas', icon: MessageSquare },
        {
          id: 'status_siswa',
          label: 'Status Naik / Lulus',
          icon: TrendingUp,
          badge: semester === 2 ? 'Sem 2' : 'Opsional',
        },
      ],
    },
    {
      title: 'DOKUMEN & SISTEM',
      items: [
        { id: 'rekap_nilai', label: 'Rekap Nilai (Leger)', icon: FileSpreadsheet, isHighlight: true },
        { id: 'preview_rapor', label: 'Preview & Cetak PDF', icon: Printer },
        { id: 'database', label: 'Backup & Restore', icon: Database },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl print:hidden`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/30">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white">RAPOR SD</h1>
              <p className="text-xs text-blue-400 font-medium">Kurikulum Merdeka</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Sembunyikan Menu Bar"
            aria-label="Tutup Menu"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Active Profile Quick Card */}
        {activeProfile && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {activeProfile.nomor}
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold text-white truncate">
                  {activeProfile.kelas}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {activeProfile.namaGuru || 'Guru Kelas'}
                </div>
              </div>
            </div>
            {onOpenProfileSwitcher && (
              <button
                type="button"
                onClick={onOpenProfileSwitcher}
                className="px-2 py-1 text-[10px] font-bold rounded bg-blue-500/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-colors shrink-0"
                title="Ganti Profil Guru"
              >
                Ganti
              </button>
            )}
          </div>
        )}

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-btn-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id as ActiveTab);
                        if (window.innerWidth < 1024) {
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : item.isHighlight
                          ? 'text-amber-300 hover:bg-slate-800/80 hover:text-amber-200'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : item.isHighlight ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span>Versi 1.0 (A4 PDF)</span>
            <span className="px-2 py-0.5 rounded-sm bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-mono">
              Guru Kelas
            </span>
          </div>
          <div className="text-[10px] text-slate-500 pt-0.5">
            Developer: Susilo Fitri Yatmoko
          </div>
        </div>
      </aside>
    </>
  );
};
