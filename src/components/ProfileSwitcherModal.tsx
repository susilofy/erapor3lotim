import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Edit2,
  X,
  ShieldCheck,
  Laptop,
  Check,
  Download,
  RotateCcw,
  Sparkles,
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

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onRefreshData?: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
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
  const [switchSuccessId, setSwitchSuccessId] = useState<string | null>(null);
  const [resetConfirmId, setResetConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenEdit = (profile: TeacherProfileMeta, e: React.MouseEvent) => {
    e.stopPropagation();
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
    if (onRefreshData) onRefreshData();
  };

  const handleSelect = (profileId: string) => {
    if (profileId === activeProfileId) {
      onClose();
      return;
    }
    setSwitchSuccessId(profileId);
    setTimeout(() => {
      onSelectProfile(profileId);
      onClose();
    }, 450);
  };

  const handleExportProfile = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const db = loadDatabaseForProfile(profileId);
    exportDatabaseAsJson(db);
  };

  const handleResetProfile = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    resetProfileDatabase(profileId);
    setResetConfirmId(null);
    setProfiles(getProfilesList());
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
      bgLight: 'bg-blue-50/60 hover:bg-blue-50',
      border: 'border-blue-200',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/30',
      badge: 'bg-blue-600 text-white',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      accent: 'text-blue-600',
    },
    emerald: {
      bgLight: 'bg-emerald-50/60 hover:bg-emerald-50',
      border: 'border-emerald-200',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/30',
      badge: 'bg-emerald-600 text-white',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      accent: 'text-emerald-600',
    },
    amber: {
      bgLight: 'bg-amber-50/60 hover:bg-amber-50',
      border: 'border-amber-200',
      activeBorder: 'border-amber-600 ring-2 ring-amber-500/30',
      badge: 'bg-amber-600 text-white',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      accent: 'text-amber-600',
    },
    purple: {
      bgLight: 'bg-purple-50/60 hover:bg-purple-50',
      border: 'border-purple-200',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/30',
      badge: 'bg-purple-600 text-white',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      accent: 'text-purple-600',
    },
    rose: {
      bgLight: 'bg-rose-50/60 hover:bg-rose-50',
      border: 'border-rose-200',
      activeBorder: 'border-rose-600 ring-2 ring-rose-500/30',
      badge: 'bg-rose-600 text-white',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white',
      accent: 'text-rose-600',
    },
    indigo: {
      bgLight: 'bg-indigo-50/60 hover:bg-indigo-50',
      border: 'border-indigo-200',
      activeBorder: 'border-indigo-600 ring-2 ring-indigo-500/30',
      badge: 'bg-indigo-600 text-white',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      accent: 'text-indigo-600',
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Ganti Profil / Kelas</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Mode 1-6 Guru
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Pilih profil Anda. Satu laptop aman digunakan bergantian tanpa takut data tertukar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Jendela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="bg-blue-50/80 border-b border-blue-100 px-5 py-2.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Penyimpanan Terisolasi:</strong> Setiap slot kelas memiliki database siswa, nilai, dan capaian mandiri.
            </span>
          </div>
          <span className="text-[11px] text-blue-700 hidden sm:inline">
            SD Negeri 3 Loloan Timur
          </span>
        </div>

        {/* Profiles Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;
              const summary = getProfileSummary(profile.id);
              const color = colorVariants[profile.warnaTema] || colorVariants.blue;
              const isSwitching = switchSuccessId === profile.id;

              return (
                <div
                  key={profile.id}
                  onClick={() => handleSelect(profile.id)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? `${color.activeBorder} bg-white shadow-md`
                      : `${color.border} ${color.bgLight} hover:shadow-xs hover:border-slate-400`
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs ${color.badge}`}
                      >
                        {profile.nomor}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {summary.kelas || profile.kelas}
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-200/80 text-slate-700 font-medium">
                            {profile.fase}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                          {profile.namaProfil}
                        </p>
                      </div>
                    </div>

                    {/* Active Pill or Edit Button */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(profile, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        title="Edit Info Guru / Profil"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Teacher & Stats Details */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-[11px] text-slate-400">Guru Kelas:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                        {summary.namaGuru !== 'Belum diatur'
                          ? summary.namaGuru
                          : profile.namaGuru || '(Belum diisi)'}
                      </span>
                    </div>
                    {profile.nipGuru && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="text-slate-400">NIP:</span>
                        <span className="font-mono">{profile.nipGuru}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="text-slate-400">Data Siswa:</span>
                      <span className="font-bold text-slate-800">
                        {summary.studentCount > 0 ? (
                          <span className="inline-flex items-center text-emerald-600">
                            <Users className="w-3 h-3 mr-1" />
                            {summary.studentCount} Siswa
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum ada siswa</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-4 pt-2.5 flex items-center justify-between">
                    {isActive ? (
                      <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sedang Digunakan</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelect(profile.id)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md shadow-2xs transition-colors ${color.btn}`}
                      >
                        {isSwitching ? (
                          <>
                            <Check className="w-3.5 h-3.5 animate-spin" />
                            <span>Membuka...</span>
                          </>
                        ) : (
                          <>
                            <span>Pilih Kelas Ini</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}

                    {/* Quick export single profile backup */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => handleExportProfile(profile.id, e)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition-colors"
                        title="Download Cadangan JSON Khusus Profil Ini"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Guidance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Petunjuk Pemakaian Bersama (1 Komputer untuk 6 Guru):</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <strong>Saat Guru Kelas 1</strong> ingin menginput nilai: klik <strong>Profil 1 (Kelas I)</strong>.
              </li>
              <li>
                <strong>Saat Guru Kelas 4</strong> bergantian memakai laptop: klik <strong>Ganti Profil</strong> di pojok kanan atas, lalu pilih <strong>Profil 4 (Kelas IV)</strong>.
              </li>
              <li>
                Seluruh data (nama siswa, KKTP, capaian, dan nilai rapor) milik guru sebelumnya tersimpan aman dan tidak akan hilang atau tertimpa.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Total Slot Tersedia: 6 Guru Kelas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Form Edit Modal */}
      {editingProfile && (
        <div
          className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setEditingProfile(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-xl shadow-2xl p-5 border border-slate-200 space-y-4"
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
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Label / Nama Profil
                </label>
                <input
                  type="text"
                  required
                  value={editNamaProfil}
                  onChange={(e) => setEditNamaProfil(e.target.value)}
                  placeholder="Misal: Guru Kelas 1 atau Kelas 4 Pak Susilo"
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

              <div className="pt-2 flex justify-between items-center">
                {resetConfirmId === editingProfile.id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleResetProfile(editingProfile.id, e)}
                      className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                    >
                      Ya, Kosongkan!
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
                    title="Kosongkan data profil ini kembali ke awal"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data Profil</span>
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
                    <span>Simpan</span>
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
