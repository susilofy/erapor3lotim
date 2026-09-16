import React, { useState } from 'react';
import { UserCheck, Check, Upload, Trash2 } from 'lucide-react';
import { TeacherInfo } from '../types';

interface TeacherDataViewProps {
  teacher: TeacherInfo;
  onUpdate: (updated: TeacherInfo) => void;
}

export const TeacherDataView: React.FC<TeacherDataViewProps> = ({ teacher, onUpdate }) => {
  const [formData, setFormData] = useState<TeacherInfo>(teacher);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData((prev) => ({ ...prev, tandaTanganGuru: ev.target?.result as string }));
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <span>Data Guru / Wali Kelas</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data profil guru kelas aktif yang bertanda tangan pada rapor peserta didik.
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Data guru tersimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar Guru <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="namaGuru"
                required
                value={formData.namaGuru}
                onChange={handleChange}
                placeholder="Contoh: Siti Rahmawati, S.Pd."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nip"
                required
                value={formData.nip}
                onChange={handleChange}
                placeholder="Contoh: 19850214 200902 2 004"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                NUPTK (Jika Ada)
              </label>
              <input
                type="text"
                name="nuptk"
                value={formData.nuptk}
                onChange={handleChange}
                placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                placeholder="Contoh: Guru Kelas VI"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kelas yang Diampu
              </label>
              <input
                type="text"
                name="kelasDiampu"
                value={formData.kelasDiampu}
                onChange={handleChange}
                placeholder="Contoh: VI (Enam)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tahun Ajaran Aktif
              </label>
              <input
                type="text"
                name="tahunAjaran"
                value={formData.tahunAjaran}
                onChange={handleChange}
                placeholder="Contoh: 2026/2027"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Digital Signature Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Gambar Tanda Tangan Digital (Opsional)
              </h2>
              <p className="text-[11px] text-slate-500">
                Jika diunggah, tanda tangan ini dapat ditampilkan di lembar rapor. Jika tidak, tanda tangan dicetak kosong untuk ditandatangani manual.
              </p>
            </div>
            {formData.tandaTanganGuru && (
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, tandaTanganGuru: undefined }))}
                className="text-red-600 hover:text-red-800 text-xs flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Tanda Tangan</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <div className="w-36 h-20 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
              {formData.tandaTanganGuru ? (
                <img
                  src={formData.tandaTanganGuru}
                  alt="Tanda Tangan Guru"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-slate-400 text-center px-2">
                  Tanda Tangan Kosong (Manual)
                </span>
              )}
            </div>

            <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-300">
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah Gambar TTD</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleSignatureUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            id="btn-save-teacher"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan Data Guru</span>
          </button>
        </div>
      </form>
    </div>
  );
};
