import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Edit2,
  ShieldCheck,
  Laptop,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  BookOpen,
  Plus,
} from 'lucide-react';
import { TeacherProfileMeta, FullAppDatabase } from '../types';
import {
  getProfilesList,
  getProfileSummary,
  updateProfileMeta,
  resetProfileDatabase,
  exportDatabaseAsJson,
  loadDatabaseForProfile,
} from '../utils/profileStorage';

interface ProfileManagementViewProps {
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onRefreshData?: () => void;
}

export const ProfileManagementView: React.FC<ProfileManagementViewProps> = ({
  activeProfileId,
  onSelectProfile,
  onRefreshData,
}) => {
  const [profiles, setProfiles] = useState<TeacherProfileMeta[]>(() => getProfilesList());
  const [editingProfile, setEditingProfile] = useState<TeacherProfileMeta | null>(null);
  const [editNamaProfil, setEditNamaProfil] = useState('');
  const [editNamaGuru, setEditNamaGuru] = useState('');
  const [editNipGuru, setEditNipGuru] = useState('');
  const [editKelas, setEditKelas] = useState('');
  const [resetConfirmId, setResetConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenEdit = (profile: TeacherProfileMeta) => {
    setEditingProfile(profile);
    setEditNamaProfil(profile.namaProfil);
    setEditNamaGuru(profile.namaGuru);
    setEditNipGuru(profile.nipGuru);
    setEditKelas(profile.kelas);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const updated = updateProfileMeta(editingProfile.id, {
      namaProfil: editNamaProfil.trim() || editingProfile.namaProfil,
      namaGuru: editNamaGuru.trim(),
      nipGuru: editNipGuru.trim(),
      kelas: editKelas.trim() || editingProfile.kelas,
    });
    setProfiles(updated);
    setEditingProfile(null);
    showNotification(`Informasi ${editingProfile.namaProfil} berhasil diperbarui!`);
    if (onRefreshData) onRefreshData();
  };

  const handleSelect = (profileId: string) => {
    if (profileId === activeProfileId) return;
    onSelectProfile(profileId);
    showNotification('Berhasil beralih ke profil kelas terpilih!');
  };

  const handleExportProfile = (profileId: string) => {
    const db = loadDatabaseForProfile(profileId);
    exportDatabaseAsJson(db);
    showNotification('File cadangan JSON profil berhasil diunduh.');
  };

  const handleResetProfile = (profileId: string) => {
    resetProfileDatabase(profileId);
    setResetConfirmId(null);
    setProfiles(getProfilesList());
    showNotification('Data kelas pada profil berhasil dikosongkan.');
    if (profileId === activeProfileId && onRefreshData) {
      onRefreshData();
    }
  };

  const colorVariants: Record<
    string,
    {
      bgLight: string;
      border: string;
      activeBorder: string;
      badge: string;
      btn: string;
      accent: string;
    }
  > = {
    blue: {
      bgLight: 'bg-blue-50/50',
      border: 'border-blue-200',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/20 shadow-md',
      badge: 'bg-blue-600 text-white',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      accent: 'text-blue-600',
    },
    emerald: {
      bgLight: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md',
      badge: 'bg-emerald-600 text-white',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accent: 'text-emerald-600',
    },
    amber: {
      bgLight: 'bg-amber-50/50',
      border: 'border-amber-200',
      activeBorder: 'border-amber-600 ring-2 ring-amber-500/20 shadow-md',
      badge: 'bg-amber-600 text-white',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      accent: 'text-amber-600',
    },
    purple: {
      bgLight: 'bg-purple-50/50',
      border: 'border-purple-200',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/20 shadow-md',
      badge: 'bg-purple-600 text-white',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      accent: 'text-purple-600',
    },
    rose: {
      bgLight: 'bg-rose-50/50',
      border: 'border-rose-200',
      activeBorder: 'border-rose-600 ring-2 ring-rose-500/20 shadow-md',
      badge: 'bg-rose-600 text-white',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      accent: 'text-rose-600',
    },
    indigo: {
      bgLight: 'bg-indigo-50/50',
      border: 'border-indigo-200',
      activeBorder: 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md',
      badge: 'bg-indigo-600 text-white',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      accent: 'text-indigo-600',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Manajemen Profil Guru & Kelas (1 - 6 Guru)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Aktif
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Solusi satu laptop bersama untuk seluruh guru kelas (Kelas 1 s.d. 6) di SD Negeri 3 Loloan Timur.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs text-slate-200">
              Profil Aktif: <strong className="text-white font-bold">{profiles.find(p => p.id === activeProfileId)?.kelas || 'Kelas'}</strong>
            </div>
          </div>
        </div>

        {/* Security & Isolation Pill */}
        <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Garansi Keamanan Data:</strong> Database siswa, nilai sumatif, dan capaian kompetensi tersimpan 100% mandiri pada masing-masing slot profil.
            </span>
          </div>
          <span className="text-[11px] text-blue-300">
            Developer: Susilo Fitri Yatmoko
          </span>
        </div>
      </div>

      {/* Grid of 6 Teacher Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;
          const summary = getProfileSummary(profile.id);
          const color = colorVariants[profile.warnaTema] || colorVariants.blue;

          return (
            <div
              key={profile.id}
              className={`rounded-xl border p-5 transition-all flex flex-col justify-between ${
                isActive
                  ? `${color.activeBorder} bg-white shadow-md`
                  : `${color.border} ${color.bgLight} hover:bg-white hover:shadow-xs`
              }`}
            >
              <div>
                {/* Header Profile Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${color.badge}`}
                    >
                      {profile.nomor}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-base text-slate-900 leading-tight">
                          {summary.kelas || profile.kelas}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {profile.fase}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {profile.namaProfil}
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(profile)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Ubah nama guru / kelas"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Details */}
                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Guru / Wali Kelas:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[180px]">
                      {summary.namaGuru !== 'Belum diatur'
                        ? summary.namaGuru
                        : profile.namaGuru || '(Belum diatur)'}
                    </span>
                  </div>
                  {profile.nipGuru && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">NIP:</span>
                      <span className="font-mono text-slate-600">{profile.nipGuru}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Data Siswa:</span>
                    <span className="font-bold text-slate-800">
                      {summary.studentCount > 0 ? (
                        <span className="inline-flex items-center text-emerald-600 font-semibold">
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {summary.studentCount} Siswa
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">0 Siswa</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Terakhir Disimpan:</span>
                    <span>{summary.savedAt}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {isActive ? (
                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sedang Digunakan</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelect(profile.id)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all ${color.btn}`}
                  >
                    <span>Buka Kelas Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleExportProfile(profile.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download Cadangan Data (JSON) Profil Ini"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Cara Kerja Fitur Multi-Profil (1 Komputer untuk 6 Guru):</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="font-bold text-slate-800">1. Bebas Ganti Kelas Kapan Saja</div>
            <p>
              Cukup klik <strong>"Buka Kelas Ini"</strong> pada profil kelas Anda. Seluruh menu (siswa, KKTP, nilai, rapor) otomatis menyesuaikan.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="font-bold text-slate-800">2. Tidak Tertukar & Otomatis Tersimpan</div>
            <p>
              Nilai yang diinput oleh Guru Kelas 1 tidak akan tercampur dengan Guru Kelas 4. Data langsung tersimpan di komputer.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="font-bold text-slate-800">3. Cadangan JSON Mandiri</div>
            <p>
              Masing-masing guru dapat men-download cadangan data rapor kelasnya sendiri untuk disimpan di flashdisk atau Google Drive.
            </p>
          </div>
        </div>
      </div>

      {/* Form Edit Modal */}
      {editingProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingProfile(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Ubah Informasi Profil {editingProfile.nomor}</span>
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama / Label Profil
                </label>
                <input
                  type="text"
                  required
                  value={editNamaProfil}
                  onChange={(e) => setEditNamaProfil(e.target.value)}
                  placeholder="Misal: Guru Kelas 1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  value={editKelas}
                  onChange={(e) => setEditKelas(e.target.value)}
                  placeholder="Misal: Kelas I, Kelas IV, atau Kelas 4A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Guru / Wali Kelas
                </label>
                <input
                  type="text"
                  value={editNamaGuru}
                  onChange={(e) => setEditNamaGuru(e.target.value)}
                  placeholder="Nama Lengkap dengan Gelar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Guru (Opsional)
                </label>
                <input
                  type="text"
                  value={editNipGuru}
                  onChange={(e) => setEditNipGuru(e.target.value)}
                  placeholder="19880521 201101 1 010 atau -"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-between items-center border-t">
                {resetConfirmId === editingProfile.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleResetProfile(editingProfile.id)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                    >
                      Ya, Reset!
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetConfirmId(null)}
                      className="px-2 py-1 text-slate-500 hover:text-slate-700"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetConfirmId(editingProfile.id)}
                    className="text-red-500 hover:text-red-700 text-[11px] flex items-center space-x-1"
                    title="Kosongkan data pada profil ini"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                )}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center space-x-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
